// components/layout/MatchingList.tsx
'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { MatchUser } from './MatchingContainer';
import { Big5Vector } from '@/lib/types';

const TRAIT_MAPPING = [
  { 
    key: 'e', label: '外向性', leftLabel: '内向', rightLabel: '外向',
    color: 'bg-orange-500 border-orange-600 dark:border-orange-400', barColor: 'bg-orange-100/50 dark:bg-orange-900/30' 
  },
  { 
    key: 'a', label: '協調性', leftLabel: '独立', rightLabel: '協調',
    color: 'bg-emerald-500 border-emerald-600 dark:border-emerald-400', barColor: 'bg-emerald-100/50 dark:bg-emerald-900/30' 
  },
  { 
    key: 'c', label: '勤勉性', leftLabel: '衝動', rightLabel: '計画',
    color: 'bg-blue-500 border-blue-600 dark:border-blue-400', barColor: 'bg-blue-100/50 dark:bg-blue-900/30' 
  },
  { 
    key: 'n', label: '情動性', leftLabel: '安定', rightLabel: '敏感',
    color: 'bg-rose-500 border-rose-600 dark:border-rose-400', barColor: 'bg-rose-100/50 dark:bg-rose-900/30' 
  },
  { 
    key: 'o', label: '創造性', leftLabel: '保守', rightLabel: '革新',
    color: 'bg-purple-500 border-purple-600 dark:border-purple-400', barColor: 'bg-purple-100/50 dark:bg-purple-900/30' 
  },
] as const;

interface MatchingListProps {
  matches: MatchUser[];
  currentSlotIndex: number;
}

export default function MatchingList({ matches, currentSlotIndex }: MatchingListProps) {
  
  if (matches.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50">
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">条件に合致するユーザーが見つかりませんでした。</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-2">別のベクトル要素を選択して再検索してみてください。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Link 
          key={match.id} 
          href={`/matching/${match.id}?slot=${currentSlotIndex}`}
          className="block flex flex-col xl:flex-row items-stretch gap-6 p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-rose-200 dark:hover:border-rose-900 transition-all cursor-pointer group"
        >
          {/* 左側: アイコンと名前 (w-64でMyProfileCardと統一) */}
          <div className="flex xl:flex-col items-center xl:justify-center gap-4 xl:w-64 xl:border-r xl:border-zinc-100 dark:xl:border-zinc-800 xl:pr-6 shrink-0">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 shadow-inner group-hover:scale-105 transition-transform group-hover:bg-rose-50 dark:group-hover:bg-rose-900/30 group-hover:text-rose-400 group-hover:border-rose-100 dark:group-hover:border-rose-800">
              <User strokeWidth={1.5} size={32} />
            </div>
            <div className="flex flex-col xl:items-center justify-center items-start min-w-0 flex-1 xl:flex-none xl:w-full text-left xl:text-center">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate w-full">{match.name}</h3>
              
              <div className="mt-2 bg-rose-50 dark:bg-rose-900/20 px-4 py-1.5 rounded-lg border border-rose-100/50 dark:border-rose-900/50 flex flex-col items-center min-w-[80px]">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider leading-none mb-1">共鳴スコア</span>
                <span className="text-2xl font-black text-rose-500 leading-none">
                  {match.resonanceScore}
                </span>
              </div>
            </div>
          </div>

          {/* 右側: ベクトル ＋ 要約文 */}
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              
              {/* 1. 自己ベクトル */}
              <div className="flex-1 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
                <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700 pb-2 mb-2 text-center tracking-wider">
                  自己ベクトル (現実)
                </p>
                <div className="space-y-3">
                  {TRAIT_MAPPING.map((trait) => {
                    const val = (match.selfVector[trait.key] ?? 0.5) * 100;
                    return (
                      <div key={`self-${trait.key}`} className="relative h-4">
                        <div className="relative flex justify-between items-end mb-1 px-1 h-3">
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">{trait.leftLabel}</span>
                          <span className="absolute left-1/2 -translate-x-1/2 bottom-0 text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                            {trait.label}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-medium">{trait.rightLabel}</span>
                        </div>

                        <div className={`h-2.5 w-full rounded-full relative ${trait.barColor}`}>
                           <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-zinc-300/40 dark:bg-zinc-600/40"></div>
                           {/* ドット強調: shadow-sm -> shadow-md, ring-2 ring-white dark:ring-zinc-900追加 */}
                           <div 
                             className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border shadow-md ring-2 ring-white dark:ring-zinc-800 ${trait.color}`}
                             style={{ left: `calc(${val}% - 6px)` }}
                           ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. 共鳴ベクトル */}
              <div className="flex-1 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
                <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700 pb-2 mb-2 text-center tracking-wider">
                  共鳴ベクトル (理想)
                </p>
                <div className="space-y-3">
                  {TRAIT_MAPPING.map((trait) => {
                    const val = (match.resonanceVector[trait.key] ?? 0.5) * 100;
                    return (
                      <div key={`res-${trait.key}`} className="relative h-4">
                        <div className="relative flex justify-between items-end mb-1 px-1 h-3">
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">{trait.leftLabel}</span>
                          <span className="absolute left-1/2 -translate-x-1/2 bottom-0 text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                            {trait.label}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-medium">{trait.rightLabel}</span>
                        </div>

                        <div className={`h-2.5 w-full rounded-full relative ${trait.barColor}`}>
                           <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-zinc-300/40 dark:bg-zinc-600/40"></div>
                           {/* ドット強調 */}
                           <div 
                             className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border shadow-md ring-2 ring-white dark:ring-zinc-800 ${trait.color}`}
                             style={{ left: `calc(${val}% - 6px)` }}
                           ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 mb-0.5">分人要約文</p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed line-clamp-2">
                {match.personaSummary}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}