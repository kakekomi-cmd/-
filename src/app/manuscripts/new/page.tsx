"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewManuscriptPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [jobType, setJobType] = useState("");
  const [conditions, setConditions] = useState("");
  const [requirements, setRequirements] = useState("");
  const [appeal, setAppeal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent, withAi: boolean) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/manuscripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, jobType, conditions, requirements, appeal }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "作成に失敗しました");
      }
      const manuscript = await res.json();

      if (withAi) {
        const genRes = await fetch(`/api/manuscripts/${manuscript.id}/generate`, {
          method: "POST",
        });
        if (!genRes.ok) {
          throw new Error("AI生成に失敗しました");
        }
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
      <h1 className="mt-4 mb-6 text-2xl font-bold">新規求人原稿の作成</h1>

      <form className="flex flex-col gap-5">
        <Field label="求人タイトル" required>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例）未経験歓迎！ホールスタッフ募集"
            required
          />
        </Field>

        <Field label="職種・仕事内容" required>
          <textarea
            className="input min-h-24"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            placeholder="例）飲食店でのホール接客業務全般"
            required
          />
        </Field>

        <Field label="給与・待遇・勤務条件">
          <textarea
            className="input min-h-24"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            placeholder="例）時給1,200円〜、週2日〜OK、交通費支給"
          />
        </Field>

        <Field label="応募資格・求める人物像">
          <textarea
            className="input min-h-24"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="例）未経験・学生歓迎、明るく元気な方"
          />
        </Field>

        <Field label="会社・職場の魅力（PRポイント）">
          <textarea
            className="input min-h-24"
            value={appeal}
            onChange={(e) => setAppeal(e.target.value)}
            placeholder="例）アットホームな職場、まかない付き"
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            disabled={submitting || !title || !jobType}
            onClick={(e) => handleSubmit(e, true)}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {submitting ? "作成中..." : "AIで下書きを生成して作成"}
          </button>
          <button
            type="button"
            disabled={submitting || !title || !jobType}
            onClick={(e) => handleSubmit(e, false)}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            {submitting ? "作成中..." : "空の原稿を作成"}
          </button>
        </div>
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
