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

  if (!manuscript.instruction.trim()) {
    return NextResponse.json(
      { error: "指示（instruction）が入力されていません" },
      { status: 400 }
    );
  }

  const knowledge = await prisma.knowledgeManuscript.findMany({
    orderBy: { createdAt: "desc" },
  });

  const referenceSection =
    knowledge.length > 0
      ? knowledge
          .map(
            (k, i) => `### 参考原稿${i + 1}: ${k.title}\n${k.content}`
          )
          .join("\n\n")
      : "(参考原稿はまだ登録されていません)";

  const prompt = `あなたは採用広告のプロのコピーライターです。過去に作成された求人原稿を参考資料として渡すので、その構成・トーン・文体の傾向を踏まえたうえで、新しい指示に沿った求人広告の原稿を作成してください。

# 参考資料（過去に作成した求人原稿）
${referenceSection}

# 新しい原稿のタイトル
${manuscript.title}

# 新しい原稿への指示
${manuscript.instruction}

参考資料の構成・見出しの付け方・言葉遣いの傾向を踏襲しつつ、指示の内容を反映した原稿を作成してください。
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
