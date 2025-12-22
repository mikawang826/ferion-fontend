import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getProjectForEnterprise } from "@/lib/projects";
import { prisma } from "@/lib/prisma";
import { replaceBigIntWithNumber } from "@/lib/json";

const tokenSchema = z.object({
  chain: z.string().min(1, "Chain is required"),
  symbol: z.string().min(1, "Symbol is required"),
  decimal: z.number().int().nonnegative(),
  contractAddress: z.string().min(1).optional(),
  totalSupply: z.number().int().nonnegative().optional(),
  NAV: z.number().int().nonnegative().optional(),
});

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

    const tokens = await prisma.projectToken.findMany({
      where: { projectId: project.id },
    });

    return NextResponse.json({ tokens: replaceBigIntWithNumber(tokens) });
  } catch (error) {
    console.error("List project tokens error", error);
    return NextResponse.json(
      { error: "Failed to fetch project tokens" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const json = await req.json();
    const parsed = tokenSchema.safeParse(json);

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

    const existing = await prisma.projectToken.findFirst({
      where: { projectId: project.id, symbol: parsed.data.symbol },
    });

    const token = existing
      ? await prisma.projectToken.update({
          where: { id: existing.id },
          data: parsed.data,
        })
      : await prisma.projectToken.create({
          data: {
            ...parsed.data,
            projectId: project.id,
          },
        });

    return NextResponse.json({ token: replaceBigIntWithNumber(token) });
  } catch (error) {
    console.error("Upsert project token error", error);
    return NextResponse.json(
      { error: "Failed to save project token" },
      { status: 500 },
    );
  }
}
