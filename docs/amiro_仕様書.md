# 「好きな自分」を探すマッチングアプリ：Amiro 開発仕様書

## 1. プロダクトの思想（コア・コンセプト）

* **「理想の相手」ではなく「好きな自分」を探す**: 相手のスペックを審査するのではなく、AIという鏡を通じて見つけた **「この時の自分のことが好きだ」と思える波長** を基点にマッチングします。
* **3つの「窓口（分人）」**: ユーザーは一貫した性格を求められません。最大3つまで、異なる自分（分人）をマッチングの入り口としてストックできます。

---

## 2. 技術スタック（Tech Stack）

ハッカソンでの開発スピードと、2026年現在のAI・ベクトル検索の親和性を重視した構成です。

* **フロントエンド**: **Next.js** (最新のApp Router環境)
* **スタイリング**: **Tailwind CSS** (デザインの即時反映とレスポンシブ対応)
* **データベース**: **Supabase** (PostgreSQLのベクトル検索拡張機能を活用)
* **AIエンジン**: **Gemini 2.5 Flash** (高速な対話と、会話ログからの性格分析・推論)
* **グラフ描画**: **Recharts** (レーダーチャートをReactで簡単に実装)

---

## 3. データベース・ロジック： データの保存項目と構造

『Amiro』の心臓部は、各ユーザーが持つ「3つのスロット」にあります。ここには、単なる性格診断の結果ではなく、**「特定の関係性の中で立ち上がった分人」**の多面的なデータが保存されます。

### 3.1 保存されるデータ項目 (Data Schema)

各ユーザーのストレージには、以下の**2つの階層**でデータが永続化されます。

#### 1. ユーザー基本情報 (Metadata)

* **User ID**: システム上の識別子
* **Display Name**: アプリ内での名前
* **Avatar URL**: アイコン画像
* **Bio**: 自己紹介文（任意）

アカウント登録時に Supabase Auth Trigger で `profiles` 行を自動作成する。

#### 2. 分人スロット（最大3つ）

各スロットには、AIとの1回の対話から生成された **「セットデータ」** が格納されます。

| 項目名 | 内容 | 用途 |
| --- | --- | --- |
| **自己ベクトル ()** | 自身の性格数値 (Big5準拠の5次元) | 他者の「理想」との照合用 |
| **共鳴ベクトル ()** | その会話の鏡の Big5（フロントが生成したランダムな 5 次元。日付シードで同一日は同じ値）。マッチングでは「自分が求める理想」として検索に使う。 | 自身の「理想」として検索用 |
| **分人アイコン** | 分人アイコン画像のURL | 自身の分人の識別・愛着 |
| **分人要約文** | 会話から抽出された、その分人の特徴 | プロフィール画面での表示 |
| **タイムスタンプ** | データの作成日時 | 情報の鮮度管理 |

---

### 3.2 マッチングの計算アルゴリズム

マッチングは**相互共鳴**を採用する。自分→相手（自分の共鳴ベクトルと相手の自己ベクトルの類似度）と、相手→自分（相手の共鳴ベクトルと自分の自己ベクトルの類似度）の両方向を考慮し、両者が高い組み合わせを「響き合う」と判定する。

#### 【計算の仕組み】

ユーザーAとユーザーBの共鳴スコアは、全スロット組み合わせのうち、**自分→相手の類似度**と**相手→自分の類似度**の両方を満たすペアを探し、その両方向の類似度（例: 積や最小値）でスコア化する。片方向だけ高い場合はスコアを下げ、お互いが「好きな自分」でいられる組み合わせを優先する。

> **ロジックのポイント：**
> 自分の「理想」と相手の「現実」が一致し、かつ相手の「理想」と自分の「現実」も一致した時、**お互いが好きな自分でいられる**とシステムが判断する。

---

### 3.3 データの更新とライフサイクル

1. **抽出と評価**: 会話終了後、AI がユーザーの Big5 推定（selfVector）と要約（personaSummary）を返す。理想ベクトル（resonanceVector）は会話開始時にフロントが生成したランダムな Big5（鏡の性格）をそのまま使う。ユーザーが「自己評価」を行い、保存を決定。
2. **スロットへの定着**: スロットが空いていれば即時保存。満杯の場合は、既存の3つのうち1つを選択して「上書き」。追加・上書き選択はこのレポート保存時のみ行い、プロフィール画面からは行わない。
3. **動的マッチング**: スロットが更新されるたびに、あなたの「共鳴スコア」が高い相手のリストがリアルタイムで再構成されます。

### 3.4 会話の流れ（AIチャット）

1. **シチュエーション**: バックエンドに保存したシチュエーションのリストから選択する。`GET /api/ai/situations` でその日用に 3 件を返す（日付をシードにし同一日は同じ 3 件）。
2. **鏡キャラの Big5**: フロントがランダムな Big5 ベクトルを生成する（その会話の「鏡」となる AI キャラクターの性格として使う）。日付（UTC）をシードにすると同一日は同じ 3 体になり、専用 API が不要で実装が簡潔になる。
3. **会話の開始**: 上記のシチュエーションと鏡の Big5 を**会話の初期入力**（システムプロンプトやコンテキスト）として AI に渡し、ユーザーとの対話を開始する。
4. **対話**: ユーザーがメッセージを送るたびに、フロントは AI（例: Gemini）を呼び出し、AI が鏡のキャラで返答を返す。**会話のやり取りそのものを AI が行う**（チャット API で 1 往復ごとに AI を呼び出す想定。例: 10 往復まで）。
5. **会話終了後**: AI が**ユーザーの Big5 推定**（selfVector）と**要約**（personaSummary）を返す。理想ベクトル（resonanceVector）は会話開始時にフロントが生成したランダムな Big5 をそのまま使う（選択した鏡の状態として保持）。フロントは `/api/ai/analyze` で selfVector と personaSummary を受け取り、resonanceVector と合わせて分人レポート画面に渡す。

---

## 4. ページ構成とユーザー体験（UX）

| ページ名 | 主な役割 | ポイント |
| --- | --- | --- |
| **ログイン / 新規登録** | サービスへの入り口 | 面倒な性格テストは不要。登録後は初回プロフィール設定へ。 |
| **プロフィール設定** | 名前・アイコン・自己紹介の入力 | 新規登録直後の初回に表示。名前・アバター・自己紹介を設定したらホームへ。既存ユーザーはプロフィール管理からも編集可能。 |
| **ホーム（AIガチャ）** | 今日向き合う「鏡」の選択 | 毎日 3 体の「鏡」を提示。各鏡は「バックエンドのリストから選んだシチュエーション」と「フロントが生成したランダムな Big5」（日付 UTC シードで同一日は同じ値）の組み合わせで決まる。占い感覚で選ばせる。 |
| **AI Mirror チャット** | 自分を引き出す対話 | 選んだ鏡のシチュエーション＋Big5 を渡し、**会話のやり取りそのものも AI が行う**（ユーザーが送信するたびに AI が鏡のキャラで返答。例: 10 往復）。終了後、AI がユーザーの Big5 推定と要約を返す。 |
| **分人レポート** | 分析結果の提示と保存 | 5角形グラフを表示。「この自分を愛する」なら保存ボタン。満杯なら上書きするスロットを選択したうえで保存。 |
| **プロフィール管理** | 3つの分人の管理 | 保存済みの自分を一覧表示する。スロットの追加・上書き選択はレポート保存時のみ行う。 |
| **共鳴マッチング** | 響き合う他者との遭遇 | 「あなたが好きな自分」に惹かれるユーザーをリスト化。 |
| **共鳴詳細** | 二人の関係性の可視化 | なぜこの二人だと「好きな自分」でいられるかをAIが解説。 |

---

## 5. API スキーマ

認証は Supabase Auth のセッション（JWT）を想定。必要に応じて `Authorization: Bearer <token>` を付与する。

### 5.1 データ型（共通）

| 型名 | 説明 |
| --- | --- |
| **UserId** | UUID（Supabase Auth の user.id） |
| **SlotIndex** | 1 | 2 | 3（分人スロット番号） |
| **Big5Vector** | `{ o: number, c: number, e: number, a: number, n: number }`（Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism。各 0〜1） |
| **Timestamp** | ISO 8601 文字列 |

### 5.2 ユーザー・プロフィール

| メソッド | パス | 説明 | リクエストボディ | レスポンス |
| --- | --- | --- | --- | --- |
| GET | `/api/users/me` | 自分のメタデータと分人スロット一覧取得 | なし | `UserProfile` |
| PATCH | `/api/users/me` | 表示名・アバターURL・自己紹介更新 | `{ displayName?: string, avatarUrl?: string | null, bio?: string | null }` | `UserProfile` |

**UserProfile**

```json
{
  "userId": "uuid",
  "displayName": "string",
  "avatarUrl": "string | null",
  "bio": "string | null",
  "slots": [
    {
      "slotIndex": 1,
      "selfVector": { "o": 0.8, "c": 0.5, "e": 0.6, "a": 0.7, "n": 0.3 },
      "resonanceVector": { "o": 0.7, "c": 0.6, "e": 0.5, "a": 0.8, "n": 0.2 },
      "personaIcon": "string（分人アイコン画像のURL）",
      "personaSummary": "string",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

`slots` は最大3件。未使用スロットは含めないか、`null` で表現する。

### 5.3 分人スロット

| メソッド | パス | 説明 | リクエストボディ | レスポンス |
| --- | --- | --- | --- | --- |
| POST | `/api/slots` | 新規スロット保存（会話レポートから） | `SaveSlotRequest` | `Slot` |
| PUT | `/api/slots/:slotIndex` | 既存スロット上書き | `SaveSlotRequest` | `Slot` |

**SaveSlotRequest**

```json
{
  "selfVector": { "o": 0.8, "c": 0.5, "e": 0.6, "a": 0.7, "n": 0.3 },
  "resonanceVector": { "o": 0.7, "c": 0.6, "e": 0.5, "a": 0.8, "n": 0.2 },
  "personaIcon": "string（分人アイコン画像のURL）",
  "personaSummary": "string"
}
```

**Slot**: 上記 `UserProfile.slots[]` の1要素と同じ形。

### 5.4 マッチング

| メソッド | パス | 説明 | クエリ | レスポンス |
| --- | --- | --- | --- | --- |
| GET | `/api/matching` | 共鳴スコアの高いユーザー一覧取得（スロットごとに個別取得） | `slot=N`（必須、1|2|3）。`limit=20`・`offset=0` は任意。 | `MatchingResult[]` |

`slot` なしまたは 1, 2, 3 以外のときは 400。RPC `get_matching_scores` には `slot_index_self`（1|2|3）を渡し、指定スロットでマッチした結果のみを DB から取得する。

**MatchingResult**

```json
{
  "userId": "uuid",
  "displayName": "string",
  "avatarUrl": "string | null",
  "bio": "string | null",
  "resonanceScore": 0.92,
  "matchedSlotIndexSelf": 2,
  "matchedSlotIndexOther": 1,
  "personaSummary": "string"
}
```

`resonanceScore` は 0〜1。相互共鳴スコア（自分→相手の類似度と相手→自分の類似度の両方を考慮した値。例: 両方向の最大類似度の積や最小値）。`matchedSlotIndexSelf` / `matchedSlotIndexOther` はそのスコアを実現したスロット番号。`bio` は相手の自己紹介文（profiles）、`personaSummary` は相手のそのスロットの分人要約文。

### 5.5 共鳴詳細（AI解説）

| メソッド | パス | 説明 | リクエストボディ | レスポンス |
| --- | --- | --- | --- | --- |
| POST | `/api/matching/explain` | 二人の関係性をAIが解説 | `{ otherUserId: "uuid" }` | `{ explanation: "string" }` |

**AI への入力**: 共鳴スコアを実現したスロットの組み合わせについて、**自分側**と**相手側**のそれぞれのスロット情報を取得し、次の 6 項目をプロンプトに含める。自分側：`selfVector`（自己ベクトル）、`resonanceVector`（共鳴ベクトル）、`personaSummary`（分人要約）。相手側：同様に `selfVector`、`resonanceVector`、`personaSummary`。どのスロットの組み合わせを使うかは、リクエストで `matchedSlotIndexSelf` / `matchedSlotIndexOther` を渡すか、API 内でマッチング結果を再取得して決める。AI はこれらを踏まえ「なぜこの二人だと好きな自分でいられるか」を解説文（`explanation`）で返す。

### 5.6 シチュエーション（リストから選択）

| メソッド | パス | 説明 | クエリ | レスポンス |
| --- | --- | --- | --- | --- |
| GET | `/api/ai/situations` | ホームの「今日の 3 体」用に、バックエンドに保存したシチュエーションリストから 3 件を選んで返す | `?date=YYYY-MM-DD`（省略時は当日 UTC） | `{ situations: string[] }`（長さ 3） |

**シチュエーションのリストはバックエンドに保存する**（DB や設定ファイルなど）。日付をシードにリストから 3 件を選択し、同一日は同じ 3 件が返る。フロントはホーム表示時に本 API を 1 回呼び、返った 3 件とフロントが生成した 3 本のランダム Big5 を組み合わせて 3 体の鏡を提示する。

### 5.7 AI チャット（会話のやり取り）

| メソッド | パス | 説明 | リクエストボディ | レスポンス |
| --- | --- | --- | --- | --- |
| POST | `/api/ai/chat` | 1 往復分の会話。ユーザー発言を受け取り、AI が鏡のキャラで返答を返す | `{ messages: { role: "user" \| "model", content: string }[], situation: string, mirrorBig5: Big5Vector }` など | `{ content: string }`（model の 1 発言） |

**会話そのものを AI が行う**。フロントはユーザーが送信するたびに本 API を呼び出し、これまでの `messages` とシチュエーション・鏡の Big5 を渡す。AI はそれらをシステムプロンプトに組み込み、鏡のキャラで 1 発言を返す。往復を重ねたのち、会話終了時に 5.8 の analyze を呼ぶ。

### 5.8 AI 分析（内部/サーバー側）

| メソッド | パス | 説明 | リクエストボディ | レスポンス |
| --- | --- | --- | --- | --- |
| POST | `/api/ai/analyze` | 会話ログからユーザーの Big5 推定と要約を返す | `{ messages: { role: "user" \| "model", content: string }[] }` | `{ selfVector: Big5Vector, personaSummary: string }` |

理想ベクトル（resonanceVector）は会話開始時にフロントが生成したランダムな Big5。フロントは選んだ鏡の resonanceVector と、本 API の selfVector・personaSummary を合わせて分人レポート画面に渡し、保存時に Slot として送る。

**実装時（型に従った返却のため）**: (1) プロバイダの構造化出力を使う（Gemini なら `responseMimeType: "application/json"` や JSON Schema 指定で出力形式を制約）。(2) プロンプトで「上記 JSON のみ出力。説明や markdown は付けない」と明示する。(3) サーバー側で AI の返却をパースし、スキーマ検証（Zod 等）で `{ selfVector: Big5Vector, personaSummary: string }` の形を確認してからレスポンスに載せる。検証失敗時はリトライまたは 500 を返す。

---

## 6. 実装 TODO リスト（タスク分担用）

共同開発をスムーズに進めるためのタスク分割案です。

### 5人での分担案（レイヤー分担 1+1+1+2）

| 担当 | 人数 | 担当者 | 主なタスク | 備考 |
| --- | --- | --- | --- | --- |
| **インフラ・DB** | 1人 | Sakimi-Yamashita | 本セクション「DB」の TODO すべて。Supabase 作成、profiles / slots、Auth Trigger、RLS、pgvector、共鳴スコア RPC。 | 初日にスキーマを確定し、他に共有。終わったら API の RPC 呼び出しなどを支援可能。 |
| **API** | 1人 | Haku929 | 本セクション「API」の TODO すべて。users/me（GET・PATCH）、slots（POST・PUT）、matching（GET）、matching/explain（POST）。 | DB のスキーマ・RPC のインターフェースに依存。初日に DB 担当と契約を合わせる。 |
| **AI・プロンプト** | 1人 | ayatakami | 本セクション「AI 連携」＋「AI・プロンプト」の TODO。Gemini クライアント、**シチュエーションリストから選択（`GET /api/ai/situations`、リストはバックエンドに保存）**・**会話 API（`POST /api/ai/chat`）**・分析（`POST /api/ai/analyze`）・共鳴解説のプロンプト。 | 他とほぼ独立。分析 API の入出力だけ仕様書と揃える。 |
| **フロント A** | 1人 | KukimiCan | UI 基盤、認証ページ、ホーム、チャット、分人レポート、チャート、フロー（ログイン〜レポート保存まで）。 | レポートは `/api/ai/analyze` と slots/users/me に依存。 |
| **フロント B** | 1人 | KFugaku | プロフィール管理、共鳴マッチング一覧、共鳴詳細、フロー（プロフィール・マッチング周り）。 | プロフィールは users/me と slots 系 API、マッチングは GET /api/matching に依存。 |

共通で決めること：レイアウト・共通コンポーネント・ルーティング規約は初日または早めに A/B で揃えると衝突が減る。

### ディレクトリと担当の対応（どこに何を書くか）

Next.js App Router を想定。詳細なディレクトリ構造は [README](../README.md) の「予想されるディレクトリ構造」「各作業でどこに何を書くか」を参照。

| 担当 | 主に編集する場所 |
| --- | --- |
| インフラ・DB | Supabase ダッシュボード、必要なら `supabase/migrations/` |
| API | `app/api/` 各ルートの `route.ts`。対応する単体テストは `tests/api/` に同じパスで置き、API 実装と同じ PR に含める。 |
| AI・プロンプト | `lib/gemini.ts`, `lib/prompts/`, `app/api/ai/situations/route.ts`, `app/api/ai/chat/route.ts`, `app/api/ai/analyze/route.ts` |
| フロント A | `app/(auth)/login/`, `app/(app)/layout.tsx`, `app/(app)/page.tsx`, `app/(app)/chat/`, `app/(app)/report/`, `components/layout/`, `components/chart/` |
| フロント B | `app/(app)/profile/`, `app/(app)/matching/`, `app/(app)/matching/[userId]/` |
| 共通 | `lib/supabase/`, `lib/types.ts`, `components/ui/` |

### 依存関係と優先度の考え方

| 優先度 | 意味 | 目安 |
| --- | --- | --- |
| **P0** | 他がこれに依存する。初日〜2日目に完了したい。 | 土台 |
| **P1** | コアループ（ログイン→チャット→レポート→保存→マッチング一覧）に必須。 | 本線 |
| **P2** | 余裕があれば。デモは P1 までで成立する。 | 拡張 |

**分野間の依存の流れ**

1. **DB** → すべての API と Auth Trigger が依存。Supabase 作成・テーブル・RLS を最優先。
2. **API** → DB と Supabase Auth に依存。`users/me` と `slots` が揃うとフロントのレポート・プロフィールが繋がる。
3. **AI 連携（分析）** → 他に依存しない。DB と並行可能。`/api/ai/analyze` はレポート画面が依存。
4. **UI 基盤・認証ページ** → Next.js と Supabase Auth のみ。DB の profiles は Auth Trigger で作成されるので、API 実装前でもログイン〜ホームまでは進められる。
5. **ホーム・チャット** → UI 基盤と「`GET /api/ai/situations`（シチュエーション 3 件）」「フロントのランダム Big5」に依存。**会話のやり取りは `POST /api/ai/chat` で AI が行う**。分析 API は会話終了時のみ。
6. **分人レポート・チャート・スロット保存** → `/api/ai/analyze` と `GET/POST /api/slots`・`GET /api/users/me` に依存。
7. **プロフィール** → `GET /api/users/me` と slots 系 API に依存。
8. **マッチング一覧** → `GET /api/matching` と共鳴スコア RPC に依存。
9. **共鳴詳細** → `POST /api/matching/explain` と解説プロンプトに依存。P2。

### 🛠 インフラ・バックエンド担当

#### DB

* **[P0]** Supabaseプロジェクト作成と接続情報の管理（環境変数）。
* **[P0]** `profiles` テーブル作成（user_id, display_name, avatar_url, bio）。Auth 登録時に自動作成する Trigger を用意。bio は任意（NULL 可）。
* **[P0]** `slots` テーブル作成（user_id, slot_index, self_vector, resonance_vector, persona_icon, persona_summary, created_at）。slot_index は 1〜3 の UNIQUE 制約。
* **[P0]** RLS（Row Level Security）ポリシー設定（自分の profiles / slots のみ読み書き可能、マッチングは他ユーザーのスロット読み取りのみ許可）。
* **[P1]** pgvector 拡張の有効化と、self_vector 用のベクトルインデックス（IVFFlat 等）作成（マッチング検索用）。
* **[P1]** 共鳴スコア計算用の RPC または SQL（相互共鳴：自分→相手・相手→自分の両方向の類似度を考慮）。

#### AI 連携

* **[P0]** Gemini API クライアントの初期化（APIキーは環境変数）。
* **[P1]** シチュエーションリストをバックエンドに保存する（DB または設定）。`GET /api/ai/situations` の実装（リストから日付シードで 3 件を選んで返す。同一日は同じ 3 件。AI は使わない）。
* **[P1]** フロントで鏡キャラ用のランダム Big5 を生成するロジック（日付 UTC をシードにすると同一日は同じ 3 体になり、専用 API が不要）。ホームの「今日の 3 体」はこの Big5 とシチュエーションの組み合わせで決まる。
* **[P1]** **会話そのものを AI が行う** `POST /api/ai/chat` の実装。リクエストに messages（履歴）・シチュエーション・鏡の Big5 を含め、AI が鏡のキャラで 1 発言を返す。1 往復ごとにフロントが本 API を呼ぶ。
* **[P1]** 会話開始時に入力する「シチュエーション＋鏡の Big5」をチャット用システムプロンプトに組み込む仕様。
* **[P1]** 会話終了後、会話ログからユーザーの Big5 推定（selfVector）と要約（personaSummary）を返すプロンプト・関数。
* **[P1]** `/api/ai/analyze` のルートハンドラ実装（会話配列を受け取り、selfVector と personaSummary を返す）。

#### API

* **[P0]** `GET /api/users/me` の実装（認証ユーザーの profiles + slots 取得）。依存: DB（profiles, slots）, Supabase Auth。
* **[P1]** `POST /api/slots` の実装（空きスロットがあれば保存、なければ 409）。依存: DB（slots）。
* **[P1]** `PUT /api/slots/:slotIndex` の実装（既存スロット上書き）。
* **[P1]** `GET /api/matching` の実装（limit/offset 対応、共鳴スコア降順）。依存: 共鳴スコア RPC。
* **[P1]** `PATCH /api/users/me` の実装（display_name, avatar_url, bio 更新）。
* **[P2]** `POST /api/matching/explain` の実装（他ユーザーIDを受け取り、AI解説文を返す）。

### 🎨 フロントエンド・デザイン担当

#### UI 基盤

* **[P0]** プロジェクトに shadcn/ui（または選定したUIライブラリ）を導入。
* **[P0]** 共通レイアウト（ヘッダー、ナビ、認証状態の表示）の実装。
* **[P0]** 認証ガード（未ログイン時はログイン/新規登録へリダイレクト）の実装。依存: Supabase Auth クライアント。

#### ページ別 UI

* **[P0]** ログイン / 新規登録ページのレイアウトと Supabase Auth 連携。
* **[P1]** プロフィール設定ページ（初回）：名前・アバター・自己紹介の入力。PATCH /api/users/me で保存。完了後ホームへ。依存: PATCH /api/users/me。
* **[P1]** ホーム（AIガチャ）ページ：3 体の鏡（シチュエーション＋ランダム Big5 の組み合わせ）のカード表示と選択遷移。依存: `GET /api/ai/situations`、フロントのランダム Big5、「今日の 3 体」ロジック。
* **[P1]** AI Mirror チャットページ：メッセージリスト、入力欄、往復制限の表示。ユーザー送信のたびに `/api/ai/chat` を呼び、**AI が返した発言**を表示する。依存: `/api/ai/chat`、選んだ鏡のシチュエーション＋Big5。
* **[P1]** 分人レポートページ：5角形グラフ表示エリア、保存ボタン、満杯時はスロットの上書き選択のUI。依存: `/api/ai/analyze`、チャート、`GET /api/users/me`、`POST /api/slots`、`PUT /api/slots/:slotIndex`。
* **[P1]** プロフィール管理ページ：3スロットの一覧表示。表示名・アバター・自己紹介の編集も可能（同上 API）。依存: `GET /api/users/me`、PATCH /api/users/me。
* **[P1]** 共鳴マッチングページ：マッチ一覧（アバター、名前、スコア）、クリックで詳細へ。依存: `GET /api/matching`。
* **[P2]** 共鳴詳細ページ：二人の関係性解説テキストの表示。依存: `POST /api/matching/explain`。

#### チャート

* **[P1]** Recharts を用いた5軸（Big5）レーダーチャートコンポーネントの実装。依存: Big5Vector の型・仕様（API スキーマで確定）。
* **[P1]** selfVector / resonanceVector の両方を同じチャートで区別表示（凡例・色分け）する仕様の実装。

#### フロー

* **[P0]** ログイン〜ホームへの遷移フロー（既存ユーザー）。新規登録〜プロフィール設定〜ホームの遷移フロー（初回のみ）。
* **[P1]** ホーム〜AI選択〜チャット〜レポート〜保存の一連フロー（保存後はプロフィールまたはホームへ）。
* **[P1]** レポート保存後（空きがあれば即時保存、満杯時は上書き選択）の再取得とプロフィール表示の更新。
* **[P1]** 共鳴マッチング一覧〜詳細〜（必要なら戻る）の遷移。詳細は P2 なら簡易表示でよい。

### 🧠 AI・プロンプト担当

* **[P1]** シチュエーションリストの初期データ作成とバックエンドでの保存。`GET /api/ai/situations` はリストから日付シードで 3 件を選択して返す。
* **[P1]** ホームで「今日の 3 体」を決めるロジック：フロントのランダム Big5 と上記シチュエーションの組み合わせ。日付（UTC）シードで同一日は同じ 3 体。選んだ鏡のシチュエーション＋Big5 は `/api/ai/chat` 呼び出し時に毎回渡し、**会話のやり取りを AI に担当させる**。
* **[P1]** 会話ログから selfVector と personaSummary を 1 回の AI 呼び出しでまとめて返すプロンプト・実装。**型に従った返却のため**: (1) プロバイダの構造化出力を使う（Gemini なら `responseMimeType: "application/json"` や JSON Schema で `{ selfVector: { o, c, e, a, n }, personaSummary: string }` を指定）。(2) プロンプトで「この JSON のみ出力。説明や markdown は付けない」と明示。(3) サーバー側でパース後にスキーマ検証（Zod 等）し、検証 OK のみレスポンスに載せる。失敗時はリトライまたは 500。resonanceVector はフロントのランダム Big5 をそのまま使うため会話から導かない。
* **[P1]** 分析結果の妥当性を確認するためのテスト会話パターンと期待値のメモ。
* **[P2]** 共鳴詳細用「二人の関係性を解説する」プロンプトの作成と `/api/matching/explain` との連携確認。

---

## 💡 開発メンバーへの一言

> 「このアプリで最も大切なのは、ユーザーが**『あ、この人といる時の自分なら、自分のことを好きになれそう』**と予感できる瞬間です。技術はそれを支えるための黒子として、スムーズな操作感と納得感のあるグラフ表示を目指しましょう。」
