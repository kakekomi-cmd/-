"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewManuscriptPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/manuscripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, instruction }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "作成に失敗しました");
      }
      const manuscript = await res.json();

      const genRes = await fetch(`/api/manuscripts/${manuscript.id}/generate`, {
        method: "POST",
      });
      if (!genRes.ok) {
        throw new Error("AI生成に失敗しました");
      }

      router.push(`/manuscripts/${manuscript.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Link href="/" className="text-sm text-neutral-500 hover:underline">
        ← 一覧に戻る
      </Link>
      <h1 className="mt-4 mb-2 text-2xl font-bold">新規求人原稿の作成</h1>
      <p className="mb-6 text-sm text-neutral-500">
        登録済みの
        <Link href="/knowledge" className="underline">
          ナレッジ原稿
        </Link>
        の構成・トーンを参考に、指示に沿った原稿をAIが作成します。
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="求人タイトル" required>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例）未経験歓迎！ホールスタッフ募集"
            required
          />
        </Field>

        <Field label="AIへの指示" required>
          <textarea
            className="input min-h-40"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="例）飲食店のホールスタッフ求人。時給1200円〜、週2日〜OK、未経験・学生歓迎。アットホームな職場が魅力。"
            required
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !title || !instruction}
          className="w-fit rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {submitting ? "AI生成中..." : "AIで原稿を生成"}
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
