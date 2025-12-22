import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProjectForEnterprise } from "@/lib/projects";
import { prisma } from "@/lib/prisma";
import { tokenSettingsSchema } from "@/lib/validators";
import { replaceBigIntWithNumber } from "@/lib/json";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const json = await req.json();
    const parsed = tokenSettingsSchema.safeParse(json);
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
    if (!project.assetValue) {
      return NextResponse.json(
        { error: "Asset value required to compute supply" },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const computedSupply = Math.floor(
      Number(project.assetValue) / Number(data.initialPrice),
    );
    if (!Number.isFinite(computedSupply) || computedSupply <= 0) {
      return NextResponse.json(
        { error: "Invalid supply calculation" },
        { status: 400 },
      );
    }

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: {
        tokenName: data.tokenName.trim(),
        tokenSymbol: data.tokenSymbol.trim(),
        totalSupply: computedSupply,
        tokenDecimals: 18,
        initialPrice: data.initialPrice,
        currentStep: project.currentStep < 5 ? 5 : project.currentStep,
        updatedBy: user.id,
      },
    });

    return NextResponse.json({
      project: replaceBigIntWithNumber(updated),
    });
  } catch (error) {
    console.error("Step4 save error", error);
    return NextResponse.json(
      { error: "Failed to save token settings" },
      { status: 500 },
    );
  }
}
