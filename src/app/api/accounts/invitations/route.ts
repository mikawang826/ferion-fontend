import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getProjectForEnterprise } from "@/lib/projects";
import { prisma } from "@/lib/prisma";
import { PROJECT_ROLE_CODES } from "@/lib/projectRoles";

const inviteSchema = z.object({
  projectId: z.string().min(1, "Project id is required"),
  email: z.string().email("Email is invalid"),
  role: z.enum(PROJECT_ROLE_CODES, {
    errorMap: () => ({
      message:
        "Role must be one of: CREATOR, LEGAL, ADMIN_OPS, AUDITOR.",
    }),
  }),
});

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 },
      );
    }

    const project = await getProjectForEnterprise(projectId, user.enterpriseId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const invitations = await prisma.invitationRecord.findMany({
      where: { projectId: project.id },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("List invitations error", error);
    return NextResponse.json(
      { error: "Failed to list invitations" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = inviteSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const user = await getCurrentUser();
    const { projectId, email, role } = parsed.data;
    const project = await getProjectForEnterprise(projectId, user.enterpriseId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const invitation = await prisma.invitationRecord.create({
      data: {
        projectId: project.id,
        email: email.toLowerCase(),
        role,
        status: "PENDING",
      },
    });

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error("Create invitation error", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 },
    );
  }
}
