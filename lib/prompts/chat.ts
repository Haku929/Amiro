/**
 * 鏡キャラで 1 発言を返すチャット用プロンプト
 * issue: [AI] 5. POST /api/ai/chat
 */

import type { Big5Vector } from "@/lib/types";

/**
 * Big5 の数値から、鏡の性格を短く説明する文を作る（プロンプト用）
 */
function describeBig5ForPrompt(big5: Big5Vector): string {
  const labels = [
    { key: "o" as const, name: "開放性", v: big5.o },
    { key: "c" as const, name: "誠実性", v: big5.c },
    { key: "e" as const, name: "外向性", v: big5.e },
    { key: "a" as const, name: "協調性", v: big5.a },
    { key: "n" as const, name: "神経症傾向", v: big5.n },
  ];
  const parts = labels.map(({ name, v }) => {
    if (v >= 0.7) return `${name}が高い`;
    if (v <= 0.3) return `${name}が低い`;
    return `${name}は中程度`;
  });
  return parts.join("。");
}

/**
 * チャット用のシステムプロンプトを組み立てる
 * シチュエーションと鏡の Big5 を組み込み、鏡のキャラで 1 発言だけ返すよう指示する
 */
export function buildChatSystemPrompt(
  situation: string,
  mirrorBig5: Big5Vector
): string {
  const personality = describeBig5ForPrompt(mirrorBig5);
  return `あなたは「鏡」の役割です。相手の話を引き出し、その人らしさが表れるように対話します。

## シチュエーション
${situation}

## あなた（鏡）の性格
${personality}

## ルール
- 上記の性格に沿って、自然に 1 発言だけ返してください。
- 長くならないように、1〜3 文程度にしてください。
- 相手の言葉を受け止めつつ、問いかけや共感で会話を続けられるようにしてください。`;
}
