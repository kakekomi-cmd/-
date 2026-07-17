import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "下書き",
  IN_REVIEW: "確認中",
  COMPLETED: "完成",
};

export default async function Home() {
  const manuscripts = await prisma.manuscript.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">求人原稿一覧</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/knowledge"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            ナレッジ管理
          </Link>
          <Link
            href="/manuscripts/new"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            + 新規作成
          </Link>
        </div>
      </div>

      {manuscripts.length === 0 ? (
        <p className="text-sm text-neutral-500">
          まだ原稿がありません。「新規作成」から求人原稿を作成しましょう。
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {manuscripts.map((m) => (
            <li key={m.id}>
              <Link
                href={`/manuscripts/${m.id}`}
                className="flex items-center justify-between gap-4 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{m.title}</p>
                  <p className="truncate text-sm text-neutral-500">
                    {m.instruction}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm text-neutral-500">
                  <span>{m.content.length}文字</span>
                  <span className="rounded-full border border-neutral-300 px-2 py-0.5 text-xs dark:border-neutral-700">
                    {STATUS_LABEL[m.status] ?? m.status}
                  </span>
                  <span>
                    {new Date(m.updatedAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
