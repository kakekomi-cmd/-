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
  const { title, instruction } = body;

  if (!title || !instruction) {
    return NextResponse.json(
      { error: "title と instruction は必須です" },
      { status: 400 }
    );
  }

  const manuscript = await prisma.manuscript.create({
    data: { title, instruction },
  });

  return NextResponse.json(manuscript, { status: 201 });
}
