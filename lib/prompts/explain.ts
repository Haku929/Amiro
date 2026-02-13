/**
 * 共鳴詳細用「二人の関係性を解説」プロンプト
 * issue: [AI] 6. 共鳴詳細用プロンプト #55
 */

import type { Big5Vector } from "@/lib/types";

/** 解説に使うスロット情報（selfVector, resonanceVector, personaSummary のみ） */
export type SlotInfoForExplain = {
  selfVector: Big5Vector;
  resonanceVector: Big5Vector;
  personaSummary: string;
};

function formatBig5(v: Big5Vector): string {
  return `開放性=${v.o.toFixed(2)}, 誠実性=${v.c.toFixed(2)}, 外向性=${v.e.toFixed(2)}, 協調性=${v.a.toFixed(2)}, 神経症傾向=${v.n.toFixed(2)}`;
}

/**
 * 自分側・相手側のスロット情報から、共鳴解説用のプロンプト文を組み立てる
 */
export function buildExplainPrompt(
  selfSlot: SlotInfoForExplain,
  otherSlot: SlotInfoForExplain
): string {
  return `あなたは、マッチングアプリの「共鳴」をユーザーに説明する役割です。

## 入力：共鳴している二人のスロット情報

### 自分側（ユーザー）
- **自己ベクトル（今の自分）**: ${formatBig5(selfSlot.selfVector)}
- **共鳴ベクトル（求める相手）**: ${formatBig5(selfSlot.resonanceVector)}
- **分人要約**: ${selfSlot.personaSummary}

### 相手側
- **自己ベクトル**: ${formatBig5(otherSlot.selfVector)}
- **共鳴ベクトル**: ${formatBig5(otherSlot.resonanceVector)}
- **分人要約**: ${otherSlot.personaSummary}

---

上記の二人の「自己ベクトル」と「共鳴ベクトル」「分人要約」を踏まえ、**なぜこの二人だとお互い「好きな自分」でいられるか**を、ユーザー向けに **2〜3 文** でやさしく解説してください。専門用語は使わず、温かみのある文体にしてください。`;
}
