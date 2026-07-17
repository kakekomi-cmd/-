"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { KnowledgeManuscriptModel } from "@/generated/prisma/models";

export default function KnowledgeManager({
  knowledge,
}: {
  knowledge: KnowledgeManuscriptModel[];
}) {
  const router = useRouter();

  const [singleTitle, setSingleTitle] = useState("");
  const [singleContent, setSingleContent] = useState("");
  const [singleSubmitting, setSingleSubmitting] = useState(false);

  const [bulkText, setBulkText] = useState("");
  const [delimiter, setDelimiter] = useState("---");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleSingleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSingleSubmitting(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: singleTitle, content: singleContent }),
      });
      if (!res.ok) throw new Error("登録に失敗しました");
      setSingleTitle("");
      setSingleContent("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setSingleSubmitting(false);
    }
  }

  async function handleBulkImport(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBulkResult(null);
    setBulkSubmitting(true);
    try {
      const res = await fetch("/api/knowledge/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: bulkText, delimiter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "インポートに失敗しました");
      setBulkResult(`${data.imported}件の原稿を登録しました`);
      setBulkText("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setBulkSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("このナレッジ原稿を削除しますか？")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除に失敗しました");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <Link href="/" className="text-sm text-neutral-500 hover:underline">
        ← 一覧に戻る
      </Link>
      <h1 className="mt-4 mb-2 text-2xl font-bold">ナレッジ管理</h1>
      <p className="mb-8 text-sm text-neutral-500">
        過去に作成した求人原稿を登録しておくと、新規原稿をAIで生成する際に構成・トーンの参考として使われます。
      </p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <section className="mb-10 rounded-md border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="mb-3 font-semibold">一括インポート（Notion等からまとめて貼り付け）</h2>
        <p className="mb-3 text-sm text-neutral-500">
          複数の原稿をひとつのテキストに貼り付け、区切り文字で分割して登録します。各原稿の1行目がタイトルとして扱われます。
        </p>
        <form onSubmit={handleBulkImport} className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm">
            区切り文字
            <input
              className="input w-24"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
            />
          </label>
          <textarea
            className="input min-h-48 font-mono text-sm"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={
              "求人タイトル1\n本文本文本文...\n\n---\n\n求人タイトル2\n本文本文本文..."
            }
          />
          {bulkResult && <p className="text-sm text-green-600">{bulkResult}</p>}
          <button
            type="submit"
            disabled={bulkSubmitting || !bulkText.trim()}
            className="w-fit rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {bulkSubmitting ? "インポート中..." : "一括インポート"}
          </button>
        </form>
      </section>

      <section className="mb-10 rounded-md border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="mb-3 font-semibold">1件ずつ登録</h2>
        <form onSubmit={handleSingleAdd} className="flex flex-col gap-3">
          <input
            className="input"
            value={singleTitle}
            onChange={(e) => setSingleTitle(e.target.value)}
            placeholder="求人タイトル"
          />
          <textarea
            className="input min-h-32"
            value={singleContent}
            onChange={(e) => setSingleContent(e.target.value)}
            placeholder="原稿本文"
          />
          <button
            type="submit"
            disabled={singleSubmitting || !singleTitle || !singleContent}
            className="w-fit rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            {singleSubmitting ? "登録中..." : "登録"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-semibold">
          登録済みナレッジ原稿（{knowledge.length}件）
        </h2>
        {knowledge.length === 0 ? (
          <p className="text-sm text-neutral-500">まだ登録されていません。</p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {knowledge.map((k) => (
              <li key={k.id} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{k.title}</p>
                  <p className="line-clamp-2 text-sm text-neutral-500">
                    {k.content}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(k.id)}
                  disabled={deletingId === k.id}
                  className="shrink-0 text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
