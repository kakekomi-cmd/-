import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ManuscriptEditor from "./ManuscriptEditor";

export default async function ManuscriptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const manuscript = await prisma.manuscript.findUnique({ where: { id } });

  if (!manuscript) {
    notFound();
  }

  return <ManuscriptEditor manuscript={manuscript} />;
}
