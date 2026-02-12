/**
 * 会話ログから Big5（selfVector）と要約（personaSummary）を導くプロンプト
 * issue: ai_prompts（big5要約のプロンプトテンプレート）
 */

export type AnalyzeMessage = {
  role: "user" | "model";
  content: string;
};

/** 分析用の指示文（JSON のみ出力するよう明示） */
const ANALYZE_INSTRUCTION = `あなたは、会話履歴から話し手（ユーザー）の性格を分析する役割です。

## やること
- 会話履歴から、**ユーザー**（user）の発言や振る舞いをもとに、Big5 性格特性を推定する。
  - **o** (Openness: 開放性) 0〜1
  - **c** (Conscientiousness: 誠実性) 0〜1
  - **e** (Extraversion: 外向性) 0〜1
  - **a** (Agreeableness: 協調性) 0〜1
  - **n** (Neuroticism: 神経症傾向) 0〜1
- その会話で見えた「その人の顔」を、**一文・100字以内**で要約する（personaSummary）。

## 出力形式
以下の JSON のみを出力してください。説明・markdown・コードブロック・余計な文言は一切付けないでください。

{"selfVector":{"o":0.0,"c":0.0,"e":0.0,"a":0.0,"n":0.0},"personaSummary":""}`;

/**
 * 会話ログをプロンプト用のテキストに整形する
 */
function formatMessages(messages: AnalyzeMessage[]): string {
  return messages
    .map((m) => {
      const label = m.role === "user" ? "ユーザー" : "AI";
      return `【${label}】\n${m.content}`;
    })
    .join("\n\n");
}

/**
 * 会話ログを受け取り、分析用のプロンプト（ユーザー向けテキスト）を組み立てる
 */
export function buildAnalyzePrompt(messages: AnalyzeMessage[]): string {
  const conversation = formatMessages(messages);
  return `${ANALYZE_INSTRUCTION}

---

## 会話履歴

${conversation}

---

上記の会話から、ユーザーの selfVector と personaSummary を推定し、指定の JSON 形式のみを出力してください。`;
}
