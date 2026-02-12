// components/layout/MatchingList.tsx
'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { MatchUser } from './MatchingContainer';
import { Big5Vector } from '@/lib/types';

const VECTOR_TRAITS = ['神経症傾向', '誠実性', '外向性', '協調性', '開放性'] as const;
const VECTOR_KEYS: (keyof Big5Vector)[] = ['n', 'c', 'e', 'a', 'o'];

interface MatchingListProps {
  matches: MatchUser[];
  currentSlotIndex: number;
}

export default function MatchingList({ matches, currentSlotIndex }: MatchingListProps) {
  
  if (matches.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-zinc-300 rounded-3xl bg-zinc-50">
        <p className="text-zinc-500 font-medium">条件に合致するユーザーが見つかりませんでした。</p>
        <p className="text-zinc-400 text-sm mt-2">別のベクトル要素を選択して再検索してみてください。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {matches.map((match) => (
        <Link 
          key={match.id} 
          href={`/matching/${match.id}?slot=${currentSlotIndex}`}
          className="block flex flex-col xl:flex-row items-stretch gap-6 p-6 border border-zinc-200 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          {/* 左側: アイコンと名前・スコア */}
          <div className="flex items-center gap-5 xl:w-48 xl:border-r xl:border-zinc-100 xl:pr-6 shrink-0">
            <div className="w-16 h-16 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 shadow-inner group-hover:scale-105 transition-transform">
              <User strokeWidth={1.5} size={32} />
            </div>
            <div className="flex flex-col justify-center items-start">
              <h3 className="text-xl font-bold text-zinc-900 group-hover:text-rose-600 transition-colors">{match.name}</h3>
              
              {/* 【修正】共鳴スコアの表示デザイン変更 */}
              <div className="mt-2 bg-rose-50 px-4 py-1.5 rounded-xl border border-rose-100/50 flex flex-col items-center min-w-[80px]">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider leading-none mb-0.5">共鳴スコア</span>
                <span className="text-2xl font-black text-rose-500 leading-none">
                  {match.resonanceScore}
                </span>
              </div>

            </div>
          </div>

          {/* 右側: ベクトル ＋ 要約文 */}
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 共鳴ベクトル */}
              <div className="flex-1 bg-rose-50/50 rounded-2xl p-4 border border-rose-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-400 rounded-l-2xl"></div>
                <p className="text-sm font-bold text-rose-800 border-b border-rose-200 pb-2 mb-3 text-center tracking-wider">
                  共鳴ベクトル
                </p>
                <div className="space-y-2">
                  {VECTOR_TRAITS.map((trait, idx) => (
                    <div key={`res-${trait}`} className="flex justify-between items-center text-sm text-rose-900 font-medium px-1">
                      <span>{trait}</span>
                      <span className="font-mono bg-rose-100/80 px-2 py-0.5 rounded-md">
                        {Math.round((match.resonanceVector[VECTOR_KEYS[idx]] ?? 0.5) * 100)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 自己ベクトル */}
              <div className="flex-1 bg-zinc-50 rounded-2xl p-4 border border-zinc-100 opacity-90">
                <p className="text-xs font-bold text-zinc-500 border-b border-zinc-200 pb-2 mb-3 text-center tracking-wider">
                  自己ベクトル
                </p>
                <div className="space-y-2">
                  {VECTOR_TRAITS.map((trait, idx) => (
                    <div key={`self-${trait}`} className="flex justify-between items-center text-xs text-zinc-500 px-1">
                      <span>{trait}</span>
                      <span className="font-mono bg-zinc-200/50 px-2 py-0.5 rounded-md">
                        {Math.round((match.selfVector[VECTOR_KEYS[idx]] ?? 0.5) * 100)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 mt-2">
              <p className="text-xs font-semibold text-zinc-400 mb-1">分人要約文</p>
              <p className="text-sm text-zinc-700 leading-relaxed">
                {match.personaSummary}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}