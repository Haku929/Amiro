# Amiro（アミロ）

**「理想の相手」ではなく、「好きな自分でいられる相手」と出会う**マッチングアプリ。

AI との対話で引き出した「好きな自分（イロ）」を保存し、相互共鳴する相手をパレット検索で見つけます。

---

## ドキュメント

| ドキュメント | 内容 |
| --- | --- |
| [企画書](docs/amiro_企画書.md) | 課題・コンセプト・UX の流れ・技術選定の理由 |
| [仕様書](docs/amiro_仕様書.md) | データ構造・API スキーマ・ページ構成・TODO（優先度・分担案） |
| [Git 運用](docs/amiro_Git運用.md) | GitHub Issue・ブランチ・コミット・PR・コードレビューのルール |
| [ハッカソン評価と落とし穴](docs/amiro_ハッカソン評価と落とし穴.md) | 5日・5人体制の評価と注意点 |

---

## 技術スタック

| 役割 | 技術 |
| --- | --- |
| フロントエンド | Next.js（App Router）, Tailwind CSS |
| データベース・認証 | Supabase（PostgreSQL, Auth, pgvector） |
| AI | Gemini 1.5 Flash（対話・性格分析・共鳴解説） |
| グラフ | Recharts（Big5 レーダーチャート） |

---

## 予想されるディレクトリ構造

Next.js（App Router）を想定した構成です。プロジェクト作成後にこの形に揃えると、担当ごとに編集する場所が分かりやすくなります。

```text
amiro/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   ├── report/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── matching/
│   │   │   ├── page.tsx
│   │   │   └── [userId]/
│   │   │       └── page.tsx
│   │   └── ...
│   └── api/
│       ├── users/
│       │   └── me/
│       │       └── route.ts
│       ├── slots/
│       │   ├── route.ts
│       │   └── [slotIndex]/
│       │       └── route.ts
│       ├── matching/
│       │   ├── route.ts
│       │   └── explain/
│       │       └── route.ts
│       └── ai/
│           └── analyze/
│               └── route.ts
├── components/
│   ├── layout/
│   ├── ui/
│   └── chart/
├── lib/
│   ├── supabase/
│   ├── gemini.ts
│   ├── prompts/
│   └── types.ts
├── supabase/
│   └── migrations/
├── tests/
│   └── api/
│       ├── users/
│       │   └── me/
│       │       └── route.test.ts
│       ├── slots/
│       │   ├── route.test.ts
│       │   └── [slotIndex]/
│       │       └── route.test.ts
│       ├── matching/
│       │   ├── route.test.ts
│       │   └── explain/
│       │       └── route.test.ts
│       └── ai/
│           └── analyze/
│               └── route.test.ts
├── docs/
│   ├── amiro_企画書.md
│   ├── amiro_仕様書.md
│   ├── amiro_Git運用.md
│   └── amiro_ハッカソン評価と落とし穴.md
├── public/
├── .env.example
├── README.md
├── package.json
└── ...
```

* `(auth)` / `(app)` はルートグループ。`(app)` 配下は認証済みユーザー向けで、ここに共通レイアウト・認証ガードを置く。
* `app/api/` が Next.js の Route Handler（API の実装場所）。
* **`tests/api/`** に API の単体テストを置く。`app/api/` と同じパス構成にする（例: `app/api/users/me/route.ts` → `tests/api/users/me/route.test.ts`）。**各 API を実装したら、その API 用の単体テストを書き、同じ PR に含める。**
* DB のマイグレーションをリポジトリで管理する場合は `supabase/migrations/` に SQL を置く。
* `.env` はコミットしない。リポジトリに含めるのは `.env.example`（変数名のみ）だけ。実際の値は各自が `.env` に用意する。

---

## 各作業でどこに何を書くか

| 担当 | 主に触る場所 | 書く内容の例 |
| --- | --- | --- |
| **インフラ・DB** | Supabase ダッシュボード、必要なら `supabase/migrations/` | テーブル定義、Trigger、RLS、pgvector 設定、共鳴スコア用 RPC。接続情報は環境変数で共有。 |
| **API** | `app/api/` 各ルート、`tests/api/`（同上のパス） | 各 `route.ts` で GET/POST/PUT/DELETE を実装。**API を追加・変更したら、対応する単体テストを `tests/api/` に追加し、同じ PR に含める。** Supabase クライアントは `lib/supabase/` を利用。 |
| **AI・プロンプト** | `lib/gemini.ts`, `lib/prompts/`, `app/api/ai/analyze/route.ts` | Gemini クライアント、分析・日替わり・共鳴解説のプロンプト文、`/api/ai/analyze` のハンドラ。 |
| **フロント A** | `app/(auth)/login/`, `app/(app)/layout.tsx`, `app/(app)/page.tsx`, `app/(app)/chat/`, `app/(app)/report/`, `components/layout/`, `components/chart/` | ログイン画面、共通レイアウト・認証ガード、ホーム、チャット、イロレポート、レーダーチャート。 |
| **フロント B** | `app/(app)/profile/`, `app/(app)/matching/`, `app/(app)/matching/[userId]/` | プロフィール管理、マッチング一覧、共鳴詳細。 |
| **共通** | `lib/supabase/`, `lib/types.ts`, `components/ui/` | Supabase クライアント、型定義、shadcn 等の UI 部品。初日に担当間で役割を決めるとよい。 |

ページと URL の対応は [仕様書「4. ページ構成」](docs/amiro_仕様書.md) を、API のパス・入出力は [仕様書「5. API スキーマ」](docs/amiro_仕様書.md) を参照。

---

## セットアップ（開発時）

**前提**: Node.js 18+, npm または pnpm

1. リポジトリをクローンする。
2. 依存関係を入れる: `npm install` または `pnpm install`。
3. `.env.example` をコピーして `.env` を作成し、次を設定する:
   * Supabase の URL と anon key（必須）
   * `SUPABASE_SERVICE_ROLE_KEY`（任意。アカウント削除 API `DELETE /api/users/me` を使う場合に必要。Supabase ダッシュボード → Project Settings → API → **service_role** の値をコピー。サーバー専用のためクライアントに露出しないこと）
   * Gemini API キー
4. 開発サーバーを起動: `npm run dev` または `pnpm dev`。
5. ブラウザで `http://localhost:3000` を開く。

環境変数の実際の値はリポジトリにコミットしないこと。詳細は [Git 運用](docs/amiro_Git運用.md) の「環境変数ファイル」を参照。

---

## テストの実行

テストは**単体テスト**を基本とする。保管場所は `tests/api/`（[予想されるディレクトリ構造](#予想されるディレクトリ構造) を参照）。プロジェクトで選定したテストフレームワーク（Jest / Vitest 等）に応じて、次のスクリプトを `package.json` に用意する。

| コマンド | 説明 |
| --- | --- |
| `npm run test` / `pnpm test` | テストを 1 回だけ実行する。PR を出す前やマージ前に実行し、すべて通っていることを確認する。 |
| `npm run test:watch` / `pnpm test:watch` | 監視モードでテストを実行する。ファイルを保存するたびに該当テストが再実行される。開発中に利用する。 |

**実行例**

```bash
# 全テストを 1 回実行
pnpm test

# 監視モード（開発中）
pnpm test:watch
```

**特定のテストだけ実行する場合**は、フレームワークの指定方法に従う。例（Jest）: `pnpm test tests/api/users/me/route.test.ts`。Vitest の場合は `pnpm test tests/api/users/me` のようにパス指定できることが多い。詳細は採用したテストランナーのドキュメントを参照。

---

## 開発の進め方

* タスク・バグは **GitHub Issue** で起票する。
* **main** からブランチを切り、作業後に **PR** で取り込む。PR 本文に `Closes #番号` を書くと Issue が自動で閉じる。
* ブランチ名はケバブケース（例: `feature/tarou-db-schema`）。コミットは `prefix: 50文字以内の日本語`。
* PR を出したら担当者にコードレビューを依頼し、1 Approve でマージ可。

詳細は [Git 運用](docs/amiro_Git運用.md) を参照。
