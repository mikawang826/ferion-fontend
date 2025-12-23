import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isProjectRole } from "@/lib/projectRoles";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const invitation = await prisma.invitationRecord.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 },
      );
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Invitation already processed" },
        { status: 400 },
      );
    }

    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Invitation email does not match current user" },
        { status: 403 },
      );
    }

    if (invitation.project.enterpriseId !== user.enterpriseId) {
      return NextResponse.json(
        { error: "Invitation does not belong to your enterprise" },
        { status: 403 },
      );
    }

    if (!isProjectRole(invitation.role)) {
      return NextResponse.json(
        { error: "Invitation role is invalid" },
        { status: 400 },
      );
    }

    const updated = await prisma.invitationRecord.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED", acceptTime: new Date() },
    });

    await prisma.userProject.upsert({
      where: {
        userId_projectId_role: {
          userId: user.id,
          projectId: invitation.projectId,
          role: invitation.role,
        },
      },
      create: {
        userId: user.id,
        projectId: invitation.projectId,
        role: invitation.role,
      },
      update: {},
    });

    return NextResponse.json({ invitation: updated });
  } catch (error) {
    console.error("Accept invitation error", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 },
    );
  }
}
