import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const manuscript = await prisma.manuscript.findUnique({ where: { id } });

  if (!manuscript) {
    return NextResponse.json({ error: "原稿が見つかりません" }, { status: 404 });
  }

  return NextResponse.json(manuscript);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const { title, status, jobType, conditions, requirements, appeal, content } =
    body;

  try {
    const manuscript = await prisma.manuscript.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(status !== undefined && { status }),
        ...(jobType !== undefined && { jobType }),
        ...(conditions !== undefined && { conditions }),
        ...(requirements !== undefined && { requirements }),
        ...(appeal !== undefined && { appeal }),
        ...(content !== undefined && { content }),
      },
    });
    return NextResponse.json(manuscript);
  } catch {
    return NextResponse.json({ error: "原稿が見つかりません" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.manuscript.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "原稿が見つかりません" }, { status: 404 });
  }
}
