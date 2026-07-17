# 求人原稿作成ツール

求人広告の原稿をAIで下書き生成し、編集・文字数構成チェック・複数原稿管理ができるツールです。

## 機能

- AIによる求人原稿の自動下書き生成（Claude API）
- エディタでの原稿執筆・編集・保存
- 文字数・構成チェック（推奨文字数、必須項目の記載漏れ検知）
- 複数原稿の一覧管理（ステータス: 下書き / 確認中 / 完成）

## セットアップ

```bash
npm install
```

`.env` に以下を設定してください。

```
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="sk-ant-..."
```

初回のみDBを作成します。

```bash
npx prisma migrate deploy
```

開発サーバーを起動します。

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) で確認できます。

## 技術構成

- Next.js (App Router) + TypeScript
- Prisma + SQLite
- Anthropic Claude API（求人原稿の下書き生成）
