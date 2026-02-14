// app/(app)/page.tsx
"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// -----------------------------------------------------------------------------
// Helper: Seeded Random Generator (Linear Congruential Generator)
// -----------------------------------------------------------------------------
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // 0 から 1 の間の乱数を返す
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // min から max の間の乱数を返す
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

// 日付文字列 (YYYY-MM-DD) からシードを生成
function getSeedFromDate(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = Math.imul(31, h) + dateStr.charCodeAt(i);
    h = h >>> 0;
  }
  return h;
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
type Big5 = { o: number; c: number; e: number; a: number; n: number };

type AiCard = {
  id: string;
  name: string;
  description: string;
  icon: string;
  colorClass: string;
  situation: string;
  big5: Big5;
};

// -----------------------------------------------------------------------------
// Constants / Fallback Data
// -----------------------------------------------------------------------------
const FALLBACK_SITUATIONS = [
  "新たな挑戦への第一歩",
  "心安らぐ対話の時間",
  "論理の整理と深掘り",
];

const CARD_TEMPLATES = [
  {
    name: "鏡の分人 A",
    description: "あなたの隠れた一面を映し出す鏡。深層心理に問いかけます。",
    icon: "🔮",
    colorClass: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  },
  {
    name: "鏡の分人 B",
    description: "あなたの感情に寄り添う鏡。日々の機微をすくい上げます。",
    icon: "🌸",
    colorClass: "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800",
  },
  {
    name: "鏡の分人 C",
    description: "あなたの理性を磨く鏡。思考の枠組みを広げます。",
    icon: "💎",
    colorClass: "bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800",
  },
];

export default function HomePage() {
  const [cards, setCards] = useState<AiCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initGacha = async () => {
      try {
        // 1. 本日の日付(UTC)を取得してシードにする
        const now = new Date();
        const yyyy = now.getUTCFullYear();
        const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(now.getUTCDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const seed = getSeedFromDate(dateStr);
        const rng = new SeededRandom(seed);

        // 2. シチュエーションを取得 (API or Mock)
        let situations: string[] = [];
        try {
            // APIが503/500を返す可能性があるためtry-catch
            const res = await fetch(`/api/ai/situations?date=${dateStr}`);
            if (res.ok) {
                const data = await res.json();
                if (data.situations && Array.isArray(data.situations) && data.situations.length === 3) {
                    situations = data.situations;
                }
            }
        } catch (e) {
            console.warn("Failed to fetch situations via API, using fallback.", e);
        }

        // 失敗時や不足時はフォールバックを使用 (インデックスはランダムではなく固定またはシード依存でもよいが、簡易的に固定リストfallback)
        if (situations.length < 3) {
            const indices = [0, 1, 2].map(i => Math.floor(rng.range(0, FALLBACK_SITUATIONS.length)));
             // 重複排除ロジックは簡易版では省略、またはFALLBACK順に割り当て
            situations = FALLBACK_SITUATIONS.slice(0, 3);
        }

        // 3. 3枚のカードを生成
        const newCards: AiCard[] = situations.map((situation, i) => {
          const template = CARD_TEMPLATES[i % CARD_TEMPLATES.length];
          // ランダムなBig5を生成 (0.1 ~ 0.9)
          const big5: Big5 = {
            o: parseFloat(rng.range(0.1, 0.9).toFixed(2)),
            c: parseFloat(rng.range(0.1, 0.9).toFixed(2)),
            e: parseFloat(rng.range(0.1, 0.9).toFixed(2)),
            a: parseFloat(rng.range(0.1, 0.9).toFixed(2)),
            n: parseFloat(rng.range(0.1, 0.9).toFixed(2)),
          };

          return {
            id: `mirror-${i}`,
            name: template.name,
            description: template.description,
            icon: template.icon,
            colorClass: template.colorClass,
            situation: situation,
            big5: big5,
          };
        });

        setCards(newCards);
      } catch (err) {
        console.error("Gacha init failed", err);
      } finally {
        setLoading(false);
      }
    };

    initGacha();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 mt-4">
      
      {/* ページヘッダー部分 */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">今日の「鏡」を選ぶ</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
          話してみたいAIを選択してください。<br />対話を通じて、相手の性格に響き合うあなたの新しい「分人」を引き出します。
        </p>
      </div>

      {/* AIカード一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((ai) => {
          const query = new URLSearchParams({
             situation: ai.situation,
             s_o: ai.big5.o.toString(), // パラメータ名を仕様書に合わせて s_ (self?) いや、これは鏡の性格なので、r_ (resonance) ではなく、AIのパラメータとして渡す？
             // 前の実装では o, c, e, a, n だったが、Chatページでどう受け取っているか確認が必要。
             // 前の実装: page.tsx l.51-55: o, c, e, a, n
             // Chatページ l.38-42: searchParams.get("o") ...
             // なので o, c, e, a, n でOK。
             o: ai.big5.o.toString(),
             c: ai.big5.c.toString(),
             e: ai.big5.e.toString(),
             a: ai.big5.a.toString(),
             n: ai.big5.n.toString(),
          });
          
          return (
          <div 
            key={ai.id} 
            className="h-full border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col items-center text-center space-y-5"
          >
            {/* アイコン部分 */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl border ${ai.colorClass} transition-transform duration-300 hover:scale-110`}>
              {ai.icon}
            </div>
            
            {/* テキスト部分 */}
            <div className="flex-grow space-y-2">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{ai.name}</h2>
              <div className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded inline-block text-zinc-500 mb-2">
                 Situation: {ai.situation}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {ai.description}
              </p>
            </div>
            
            {/* アクションボタン */}
            <div className="w-full pt-2">
              <Link 
                href={`/chat?${query.toString()}`}
                className="inline-block w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
              >
                このAIと話す
              </Link>
            </div>
            
          </div>
        )})}
      </div>
      
    </div>
  );
}