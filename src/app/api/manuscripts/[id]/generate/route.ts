import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const manuscript = await prisma.manuscript.findUnique({ where: { id } });

  if (!manuscript) {
    return NextResponse.json({ error: "原稿が見つかりません" }, { status: 404 });
  }

  const prompt = `あなたは採用広告のプロのコピーライターです。以下の情報をもとに、求人広告の原稿を作成してください。

# 求人タイトル
${manuscript.title}

# 職種・仕事内容
${manuscript.jobType}

# 給与・待遇・勤務条件
${manuscript.conditions || "(未入力)"}

# 応募資格・求める人物像
${manuscript.requirements || "(未入力)"}

# 会社・職場の魅力（PRポイント）
${manuscript.appeal || "(未入力)"}

以下の見出しを使い、読み手の興味を引く自然な日本語で構成してください。
- 仕事内容
- 給与・待遇
- 応募資格
- 会社の魅力
本文のみを出力し、前置きや説明文は含めないでください。`;

  const response = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    output_config: { effort: "medium" },
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const generatedContent = textBlock?.type === "text" ? textBlock.text : "";

  const updated = await prisma.manuscript.update({
    where: { id },
    data: { content: generatedContent },
  });

  return NextResponse.json(updated);
}
