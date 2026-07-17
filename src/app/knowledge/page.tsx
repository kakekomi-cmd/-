import { prisma } from "@/lib/prisma";
import KnowledgeManager from "./KnowledgeManager";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const knowledge = await prisma.knowledgeManuscript.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <KnowledgeManager knowledge={knowledge} />;
}
