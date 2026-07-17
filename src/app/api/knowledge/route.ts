import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const knowledge = await prisma.knowledgeManuscript.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(knowledge);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: "title と content は必須です" },
      { status: 400 }
    );
  }

  const knowledge = await prisma.knowledgeManuscript.create({
    data: { title, content },
  });

  return NextResponse.json(knowledge, { status: 201 });
}
