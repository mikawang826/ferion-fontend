import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectBasicsSchema } from "@/lib/validators";
import { replaceBigIntWithNumber } from "@/lib/json";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = projectBasicsSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const user = await getCurrentUser();
    const data = parsed.data;

    const existing = json.projectId
      ? await prisma.project.findFirst({
          where: { id: json.projectId, enterpriseId: user.enterpriseId },
        })
      : null;

    const project = existing
      ? await prisma.project.update({
          where: { id: existing.id },
          data: {
            name: data.projectName.trim(),
            assetType: data.assetType,
            description: data.projectDescription,
            acceptInstitutionalInvestors:
              data.acceptInstitutionalInvestors ?? false,
            currentStep:
              existing.currentStep < 2 ? 2 : existing.currentStep,
            updatedBy: user.id,
          },
        })
      : await prisma.project.create({
          data: {
            name: data.projectName.trim(),
            assetType: data.assetType,
            description: data.projectDescription,
            acceptInstitutionalInvestors:
              data.acceptInstitutionalInvestors ?? false,
            enterpriseId: user.enterpriseId,
            status: "DRAFT",
            lifecycleStage: "CreatingInProgress",
            currentStep: 2,
            createdBy: user.id,
            updatedBy: user.id,
          },
        });

    await prisma.userProject.upsert({
      where: {
        userId_projectId_role: {
          userId: user.id,
          projectId: project.id,
          role: "CREATOR",
        },
      },
      create: {
        userId: user.id,
        projectId: project.id,
        role: "CREATOR",
      },
      update: {},
    });

    return NextResponse.json({ project: replaceBigIntWithNumber(project) });
  } catch (error) {
    console.error("Step1 save error", error);
    return NextResponse.json(
      { error: "Failed to save project basics" },
      { status: 500 },
    );
  }
}
