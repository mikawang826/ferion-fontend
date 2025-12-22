import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProjectForEnterprise } from "@/lib/projects";
import { prisma } from "@/lib/prisma";
import { replaceBigIntWithNumber } from "@/lib/json";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const project = await getProjectForEnterprise(
      id,
      user.enterpriseId,
    );
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ project: replaceBigIntWithNumber(project) });
  } catch (error) {
    console.error("Get project error", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    
    // Verify project belongs to user's enterprise
    const project = await getProjectForEnterprise(
      id,
      user.enterpriseId,
    );
    
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete related records first to satisfy foreign key constraints.
    await prisma.$transaction([
      prisma.projectFile.deleteMany({ where: { projectId: id } }),
      prisma.projectToken.deleteMany({ where: { projectId: id } }),
      prisma.projectMilestone.deleteMany({ where: { projectId: id } }),
      prisma.invitationRecord.deleteMany({ where: { projectId: id } }),
      prisma.userProject.deleteMany({ where: { projectId: id } }),
      prisma.analyticsEvent.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
