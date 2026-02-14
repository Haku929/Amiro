// components/layout/MatchingDetails.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Sparkles, Zap, ArrowLeftRight, Loader2 } from 'lucide-react';
import { Big5Vector } from '@/lib/types';
import { Big5Explanation } from '@/components/Big5Explanation';

const TRAIT_MAPPING = [
  {
    key: 'o',
    label: '開放性',
    leftLabel: '保守的',
    rightLabel: '開放的',
    darkColor: 'bg-purple-500 border-purple-600 dark:border-purple-400',
    lightColor: 'bg-purple-200 border-purple-300 dark:bg-purple-900/40 dark:border-purple-700',
    barColor: 'bg-purple-100/50 dark:bg-purple-900/30',
  },
  {
    key: 'c',
    label: '誠実性',
    leftLabel: '衝動的',
    rightLabel: '計画的',
    darkColor: 'bg-blue-500 border-blue-600 dark:border-blue-400',
    lightColor: 'bg-blue-200 border-blue-300 dark:bg-blue-900/40 dark:border-blue-700',
    barColor: 'bg-blue-100/50 dark:bg-blue-900/30',
  },
  {
    key: 'e',
    label: '外向性',
    leftLabel: '内向的',
    rightLabel: '外向的',
    darkColor: 'bg-orange-500 border-orange-600 dark:border-orange-400',
    lightColor: 'bg-orange-200 border-orange-300 dark:bg-orange-900/40 dark:border-orange-700',
    barColor: 'bg-orange-100/50 dark:bg-orange-900/30',
  },
  {
    key: 'a',
    label: '協調性',
    leftLabel: '独立的',
    rightLabel: '協調的',
    darkColor: 'bg-emerald-500 border-emerald-600 dark:border-emerald-400',
    lightColor: 'bg-emerald-200 border-emerald-300 dark:bg-emerald-900/40 dark:border-emerald-700',
    barColor: 'bg-emerald-100/50 dark:bg-emerald-900/30',
  },
  {
    key: 'n',
    label: '神経症傾向',
    leftLabel: '安定',
    rightLabel: '敏感',
    darkColor: 'bg-rose-500 border-rose-600 dark:border-rose-400',
    lightColor: 'bg-rose-200 border-rose-300 dark:bg-rose-900/40 dark:border-rose-700',
    barColor: 'bg-rose-100/50 dark:bg-rose-900/30',
  },
] as const;

export interface DetailUser {
  id: string;
  name: string;
  bio?: string | null;
  personaSummary: string;
  slotTitle?: string;
  slotIndex?: 1 | 2 | 3;
  selfVector: Big5Vector;
  resonanceVector?: Big5Vector;
}

interface MatchingDetailProps {
  me: DetailUser;
  target: DetailUser;
  resonanceScore: number;
}

export default function MatchingDetail({ me, target, resonanceScore }: MatchingDetailProps) {
  const [isTargetView, setIsTargetView] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [contactIds, setContactIds] = useState<Set<string>>(new Set());
  const [addingContact, setAddingContact] = useState(false);

  const isTargetContact = contactIds.has(target.id);

  useEffect(() => {
    fetch('/api/contacts')
      .then((res) => (res.ok ? res.json() : []))
      .then((list: { userId: string }[]) => setContactIds(new Set(list.map((c) => c.userId))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Generate AI explanation on mount
    const fetchAiExplanation = async () => {
      try {
        setIsAiLoading(true);
        setAiError(null);

        // Construct a situation prompt for the AI
        const promptSituation = `
ユーザー「${me.name}」とユーザー「${target.name}」の共鳴マッチング結果についての分析をお願いします。
共鳴スコア: ${resonanceScore}点

【${me.name}の性格ベクトル】
${JSON.stringify(me.selfVector)}
【${me.name}の分人要約】
${me.personaSummary}

【${target.name}の性格ベクトル】
${JSON.stringify(target.selfVector)}
【${target.name}の分人要約】
${target.personaSummary}

あなたは「鏡」として、二人の相性や、お互いがどう作用しあうかについて、
客観的かつ少し神秘的な視点で150文字以内でコメントしてください。
二人の関係性が深まるようなアドバイスを含めてください。
`;

        const mirrorBig5: Big5Vector = { o: 0.5, c: 0.5, e: 0.5, a: 0.5, n: 0.5 }; // Balanced mirror

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: '二人の相性を教えてください' }],
            situation: promptSituation,
            mirrorBig5: mirrorBig5
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch AI explanation');

        const data = await response.json();
        setAiExplanation(data.content);

      } catch (err) {
        console.error(err);
        setAiError('AIの分析を生成できませんでした。');
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchAiExplanation();
  }, [me, target, resonanceScore]);

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 pb-20">
      
      {/* ヘッダー */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={`/matching?slot=${me.slotTitle?.replace('分人', '') || '1'}`} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft className="text-zinc-600 dark:text-zinc-400" size={24} />
          </Link>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">共鳴詳細</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 lg:p-10 space-y-12">

        {/* 1. ユーザー情報 & スコア */}
        <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6 md:gap-8">

          {/* 左：自分カード */}
          <div className="w-full md:flex-1 bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-zinc-600"></div>
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center shrink-0 border border-zinc-200 mb-4">
              <User className="text-zinc-400" size={40} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 truncate w-full">
              {me.name}
              <span className="text-sm font-normal text-zinc-500 ml-2">(あなた)</span>
            </h2>
            <p className="text-xs text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full mb-3 font-medium">{me.slotTitle}</p>
            {me.bio != null && me.bio !== '' && (
              <div className="w-full bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-left mb-3">
                <p className="text-xs font-medium text-zinc-500 mb-1">自己紹介</p>
                <p className="text-sm text-zinc-700 leading-relaxed line-clamp-3">{me.bio}</p>
              </div>
            )}
            <div className="w-full bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-left mt-auto">
              <p className="text-sm text-zinc-700 leading-relaxed line-clamp-4">{me.personaSummary}</p>
            </div>
            {me.slotIndex != null && (
              <Link
                href={`/profile/slot/${me.slotIndex}`}
                className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 underline"
              >
                自分の会話履歴を見る
              </Link>
            )}
          </div>

          {/* 中央：共鳴スコア */}
          <div className="shrink-0 flex flex-col items-center justify-center py-4 md:py-0">
            <div className="relative flex flex-col items-center justify-center w-40 h-40 md:w-48 md:h-48 bg-white dark:bg-zinc-900 rounded-full shadow-lg border-4 border-rose-100 dark:border-rose-900/50 ring-4 ring-rose-50/50 dark:ring-rose-900/20">
               <div className="absolute inset-0 bg-rose-50 dark:bg-rose-900/20 rounded-full opacity-30 animate-pulse"></div>
               <div className="relative z-10 flex flex-col items-center">
                  <Zap className="text-rose-500" size={32} fill="currentColor" />
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">共鳴スコア</span>
                  <span className="text-6xl md:text-7xl font-black text-rose-500 tracking-tighter leading-none mt-1">
                  {resonanceScore <= 1 ? Math.round(resonanceScore * 100) : Math.round(resonanceScore)}
                </span>
               </div>
            </div>
          </div>

          {/* 右：相手カード */}
          <div className="w-full md:flex-1 bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900 rounded-3xl p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
             <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/30 mb-4">
               <User className="text-rose-400" size={40} />
             </div>
             <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 truncate w-full">{target.name}</h2>
             <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-full mb-3 font-medium">共鳴マッチング対象</p>
             {target.bio != null && target.bio !== '' && (
               <div className="w-full bg-rose-50/30 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 text-left mb-3">
                 <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mb-1">自己紹介</p>
                 <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed line-clamp-3">{target.bio}</p>
               </div>
             )}
             <div className="w-full bg-rose-50/30 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 text-left mt-auto">
               <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed line-clamp-4">{target.personaSummary}</p>
             </div>
             {target.slotIndex != null && (
               <Link
                 href={`/profile/${encodeURIComponent(target.id)}/slot/${target.slotIndex}`}
                 className="mt-3 text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 underline"
               >
                 相手の会話履歴を見る
               </Link>
             )}
             <div className="mt-3 flex flex-col gap-2">
               {isTargetContact ? (
                 <Link
                   href={`/dm/${encodeURIComponent(target.id)}`}
                   className="inline-flex justify-center items-center px-4 py-2 rounded-lg text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 transition-colors"
                 >
                   チャットする
                 </Link>
               ) : (
                 <button
                   type="button"
                   disabled={addingContact}
                   onClick={async () => {
                     setAddingContact(true);
                     try {
                       const res = await fetch('/api/contacts', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ otherUserId: target.id }),
                       });
                       if (res.ok) {
                         setContactIds((prev) => new Set(prev).add(target.id));
                       }
                     } finally {
                       setAddingContact(false);
                     }
                   }}
                   className="inline-flex justify-center items-center px-4 py-2 rounded-lg text-sm font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200 hover:bg-rose-200 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                 >
                   {addingContact ? '追加中…' : 'チャット相手に追加'}
                 </button>
               )}
             </div>
          </div>

        </div>

        {/* 2. ベクトル比較チャート */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm relative transition-all duration-300">
          
          {/* 切り替えトグル */}
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={() => setIsTargetView(!isTargetView)}
              className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm font-bold px-4 py-2 rounded-full transition-colors border border-zinc-200 dark:border-zinc-700 shadow-sm"
            >
              <ArrowLeftRight size={16} />
              視点を切り替え
            </button>
          </div>

          {/* チャートタイトル & 凡例 */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center justify-center gap-2 mb-4">
              {isTargetView ? '相手の視点 (相手の理想 ⇄ あなたの現実)' : 'あなたの視点 (あなたの理想 ⇄ 相手の現実)'}
            </h3>
            
            <div className="flex flex-wrap items-center justify-center gap-6 bg-zinc-50 dark:bg-zinc-800 py-3 px-6 rounded-xl inline-flex border border-zinc-100 dark:border-zinc-700">
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded-full border-2 bg-blue-500 border-blue-600 dark:border-blue-400 shadow-sm" aria-hidden />
                 <span className="text-sm text-zinc-800 dark:text-zinc-200 font-bold">
                   {isTargetView ? 'あなたの現実 (自己ベクトル)' : 'あなたの理想 (共鳴ベクトル)'}
                 </span>
               </div>

               <span className="text-zinc-300 dark:text-zinc-600">|</span>

               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded-full border-2 bg-blue-200 dark:bg-blue-900/40 border-blue-500 dark:border-blue-400 shadow-sm" aria-hidden />
                 <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                   {isTargetView ? '相手の理想 (共鳴ベクトル)' : '相手の現実 (自己ベクトル)'}
                 </span>
               </div>
            </div>
            <div className="mt-4 flex justify-center">
              <Big5Explanation variant="compact" />
            </div>
          </div>

          {/* プロットエリア */}
          <div className="space-y-6 px-2 lg:px-12">
            {TRAIT_MAPPING.map((trait) => {
              // 値の決定ロジック
              // 濃い点 (solidVal) = 自分
              // 薄い点 (lightVal) = 相手
              let solidVal = 0; // 自分
              let lightVal = 0; // 相手

              if (!isTargetView) {
                // あなたの視点： 「あなたの理想(自分)」 vs 「相手の現実(相手)」
                solidVal = (me.resonanceVector?.[trait.key] ?? 0.5) * 100;
                lightVal = (target.selfVector[trait.key] ?? 0.5) * 100;
              } else {
                // 相手の視点： 「あなたの現実(自分)」 vs 「相手の理想(相手)」
                solidVal = (me.selfVector[trait.key] ?? 0.5) * 100;
                lightVal = (target.resonanceVector?.[trait.key] ?? 0.5) * 100;
              }

              return (
                <div key={trait.key} className="relative">
                  {/* ラベルエリア */}
                  <div className="relative flex justify-between items-end mb-1 px-1 h-6">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{trait.leftLabel}</span>
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-0 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                      {trait.label}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{trait.rightLabel}</span>
                  </div>

                  {/* 線分 */}
                  <div className={`h-3 w-full rounded-full relative ${trait.barColor}`}>
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-300/40 dark:bg-zinc-600/40 rounded-full"></div>

                    {/* プロット点A (薄い色 = 相手) ring追加 */}
                    <div 
                      className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 shadow-sm ring-2 ring-white/50 dark:ring-zinc-900/50 transition-all duration-700 ease-out z-10 ${trait.lightColor}`}
                      style={{ left: `calc(${lightVal}% - 8px)` }}
                    ></div>

                    {/* プロット点B (濃い色 = 自分) ring追加 */}
                    <div 
                      className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 shadow-md ring-2 ring-white dark:ring-zinc-800 transition-all duration-700 ease-out z-20 ${trait.darkColor}`}
                      style={{ left: `calc(${solidVal}% - 8px)` }}
                    ></div>

                    {/* 差分をつなぐ線 */}
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-zinc-400/30 dark:bg-zinc-400/20 z-0 transition-all duration-700"
                        style={{ 
                            left: `${Math.min(lightVal, solidVal)}%`,
                            width: `${Math.abs(lightVal - solidVal)}%`
                        }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. AI解説 */}
        <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/30 dark:via-zinc-900 dark:to-purple-950/30 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200">AI Relationship Analysis</h3>
          </div>

          {isAiLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl">
              <Loader2 className="animate-spin text-indigo-400 mb-2" size={32} />
              <p className="text-sm text-indigo-400 font-bold">AIが分析中...</p>
            </div>
          )}

          <div className="prose prose-zinc prose-base max-w-none">
            {aiError ? (
              <p className="text-red-400 text-sm p-4 bg-red-50 rounded-lg">{aiError}</p>
            ) : (
              aiExplanation.split('\n').map((line, i) => {
                if (line.startsWith('### ')) {
                  return <h4 key={i} className="text-base font-bold text-indigo-800 mt-6 mb-3">{line.replace('### ', '')}</h4>;
                }
                if (line.trim() === '') return null;
                return <p key={i} className="text-zinc-700 leading-relaxed mb-3 text-justify">{line}</p>;
              })
            )}
            {!aiError && !aiExplanation && !isAiLoading && (
              <p className="text-zinc-400 text-sm">データがありません</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
