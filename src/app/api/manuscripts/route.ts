import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const manuscripts = await prisma.manuscript.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(manuscripts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, jobType, conditions, requirements, appeal } = body;

  if (!title || !jobType) {
    return NextResponse.json(
      { error: "title と jobType は必須です" },
      { status: 400 }
    );
  }

  const manuscript = await prisma.manuscript.create({
    data: {
      title,
      jobType,
      conditions: conditions ?? "",
      requirements: requirements ?? "",
      appeal: appeal ?? "",
    },
  });

  return NextResponse.json(manuscript, { status: 201 });
}
