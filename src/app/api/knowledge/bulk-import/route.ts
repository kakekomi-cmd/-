import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_DELIMITER = "---";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { text, delimiter } = body as { text?: string; delimiter?: string };

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "text は必須です" }, { status: 400 });
  }

  const sep = delimiter && delimiter.trim() ? delimiter.trim() : DEFAULT_DELIMITER;

  const chunks = text
    .split(sep)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);

  if (chunks.length === 0) {
    return NextResponse.json(
      { error: "区切り文字で分割できる原稿が見つかりませんでした" },
      { status: 400 }
    );
  }

  const entries = chunks.map((chunk) => {
    const lines = chunk.split("\n");
    const title = lines[0].trim().slice(0, 200) || "無題の原稿";
    const content = lines.slice(1).join("\n").trim() || chunk;
    return { title, content };
  });

  await prisma.knowledgeManuscript.createMany({ data: entries });

  return NextResponse.json({ imported: entries.length }, { status: 201 });
}
