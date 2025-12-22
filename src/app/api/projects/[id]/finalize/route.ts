import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureMilestones, getProjectForEnterprise } from "@/lib/projects";
import { prisma } from "@/lib/prisma";
import { replaceBigIntWithNumber } from "@/lib/json";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_req: NextRequest, { params }: Params) {
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

    const missing: string[] = [];
    if (!project.name) missing.push("Project name");
    if (!project.assetType) missing.push("Asset type");
    if (!project.walletAddress) missing.push("Wallet address");
    if (!project.network) missing.push("Blockchain network");
    if (!project.assetLocation) missing.push("Asset location");
    if (!project.assetDescription) missing.push("Asset description");
    if (!project.tokenName) missing.push("Token name");
    if (!project.tokenSymbol) missing.push("Token symbol");
    if (!project.totalSupply) missing.push("Total supply");
    if (project.tokenDecimals === null || project.tokenDecimals === undefined) {
      missing.push("Token decimals");
    }
    if (!project.initialPrice) missing.push("Initial price");
    if (!project.revenueMode) missing.push("Revenue mode");
    if (!project.annualReturn && project.annualReturn !== 0) {
      missing.push("Annual return");
    }
    if (!project.payoutFrequency) missing.push("Distribution frequency");
    if (!project.capitalProfile) missing.push("Capital profile");
    if (!project.distributionPolicy) missing.push("Distribution policy");

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", missing },
        { status: 400 },
      );
    }

    await ensureMilestones(project.id);

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: {
        status: "DRAFT",
        lifecycleStage: "CreatingCompleted",
        currentStep: 6,
        updatedBy: user.id,
      },
    });

    return NextResponse.json({
      project: replaceBigIntWithNumber(updated),
    });
  } catch (error) {
    console.error("Finalize error", error);
    return NextResponse.json(
      { error: "Failed to finalize project" },
      { status: 500 },
    );
  }
}
