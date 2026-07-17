"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ManuscriptModel } from "@/generated/prisma/models";
import { checkManuscript, RECOMMENDED_RANGE } from "@/lib/manuscriptCheck";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "下書き" },
  { value: "IN_REVIEW", label: "確認中" },
  { value: "COMPLETED", label: "完成" },
];

export default function ManuscriptEditor({
  manuscript,
}: {
  manuscript: ManuscriptModel;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(manuscript.title);
  const [status, setStatus] = useState(manuscript.status);
  const [instruction, setInstruction] = useState(manuscript.instruction);
  const [content, setContent] = useState(manuscript.content);

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const check = useMemo(() => checkManuscript(content), [content]);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/manuscripts/${manuscript.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, status, instruction, content }),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      setSavedAt(new Date());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    try {
      // 生成前に最新の入力内容を保存
      await fetch(`/api/manuscripts/${manuscript.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, instruction }),
      });
      const res = await fetch(`/api/manuscripts/${manuscript.id}/generate`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "AI生成に失敗しました");
      }
      const updated = await res.json();
      setContent(updated.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("この原稿を削除しますか？この操作は取り消せません。")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/manuscripts/${manuscript.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("削除に失敗しました");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setDeleting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-neutral-500 hover:underline">
          ← 一覧に戻る
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm text-red-600 hover:underline disabled:opacity-50"
        >
          {deleting ? "削除中..." : "この原稿を削除"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* 左: 入力項目 */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <input
              className="input flex-1 text-lg font-semibold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              className="input w-32"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <Field label="AIへの指示">
            <textarea
              className="input min-h-48"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="例）飲食店のホールスタッフ求人。時給1200円〜、未経験歓迎。"
            />
          </Field>

          <button
            onClick={handleGenerate}
            disabled={generating || !instruction.trim()}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            {generating ? "AI生成中..." : "AIで原稿を生成・再生成"}
          </button>
          <p className="text-xs text-neutral-500">
            <Link href="/knowledge" className="underline">
              ナレッジ管理
            </Link>
            に登録された過去原稿の構成・トーンを参考に生成します。
          </p>
        </div>

        {/* 右: 原稿本文 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">原稿本文</span>
            <span
              className={
                check.lengthStatus === "ok"
                  ? "text-sm text-green-600"
                  : "text-sm text-amber-600"
              }
            >
              {check.charCount}文字（目安 {RECOMMENDED_RANGE.min}〜
              {RECOMMENDED_RANGE.max}文字）
            </span>
          </div>
          <textarea
            className="input min-h-96 flex-1 font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="AIで生成するか、直接入力してください"
          />

          {check.missingSections.length > 0 && (
            <p className="text-sm text-amber-600">
              構成チェック: 「{check.missingSections.join("」「")}」に関する記載が見当たりません
            </p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {saving ? "保存中..." : "保存"}
            </button>
            {savedAt && (
              <span className="text-sm text-neutral-500">
                {savedAt.toLocaleTimeString("ja-JP")} に保存しました
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
