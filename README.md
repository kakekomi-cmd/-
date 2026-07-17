# 求人原稿作成ツール

過去に作成した求人原稿を「ナレッジ」として蓄積し、その構成・トーンを参考にしながら、
自由記述の指示からAIが新しい求人広告原稿を作成するツールです。

## 機能

- **ナレッジ管理**（`/knowledge`）: 過去原稿の登録（1件ずつ／Notion等からの一括貼り付けインポート）
- **AIによる原稿生成**: 登録済みナレッジ全件を参考資料としてAIに渡し、自由記述の指示に沿った原稿を生成（Claude API）
- エディタでの原稿執筆・編集・保存、指示を変えての再生成
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
