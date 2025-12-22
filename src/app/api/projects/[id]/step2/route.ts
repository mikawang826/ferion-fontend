import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProjectForEnterprise } from "@/lib/projects";
import { prisma } from "@/lib/prisma";
import { blockchainSchema } from "@/lib/validators";
import { replaceBigIntWithNumber } from "@/lib/json";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const json = await req.json();
    const parsed = blockchainSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const user = await getCurrentUser();
    const project = await getProjectForEnterprise(
      id,
      user.enterpriseId,
    );

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const data = parsed.data;
    const updated = await prisma.project.update({
      where: { id: project.id },
      data: {
        walletAddress: data.walletAddress.trim(),
        network: data.network,
        currentStep: project.currentStep < 3 ? 3 : project.currentStep,
        updatedBy: user.id,
      },
    });

    return NextResponse.json({
      project: replaceBigIntWithNumber(updated),
    });
  } catch (error) {
    console.error("Step2 save error", error);
    return NextResponse.json(
      { error: "Failed to save blockchain settings" },
      { status: 500 },
    );
  }
}
