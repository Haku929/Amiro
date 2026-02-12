// components/layout/MatchingDetail.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft, User, Sparkles, Zap } from 'lucide-react';
import { Big5Vector } from '@/lib/types';

const VECTOR_TRAITS = ['神経症傾向', '誠実性', '外向性', '協調性', '開放性'] as const;
const VECTOR_KEYS: (keyof Big5Vector)[] = ['n', 'c', 'e', 'a', 'o'];

export interface DetailUser {
  id: string;
  name: string;
  personaSummary: string;
  slotTitle?: string;
  selfVector: Big5Vector;
  resonanceVector?: Big5Vector;
}

interface MatchingDetailProps {
  me: DetailUser;
  target: DetailUser;
  resonanceScore: number;
  aiExplanation: string;
}

export default function MatchingDetail({ me, target, resonanceScore, aiExplanation }: MatchingDetailProps) {
  return (
    <div className="min-h-screen bg-white pb-20">
      
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex items-center gap-4">
        <Link href={`/matching?slot=${me.slotTitle?.replace('分人', '') || '1'}`} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <ArrowLeft className="text-zinc-600" size={24} />
        </Link>
        <h1 className="text-lg font-bold text-zinc-900">共鳴詳細</h1>
      </div>

      <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-12">

        <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-8">
          
          {/* 左：自分 */}
          <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-3xl p-6 flex flex-col items-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-400"></div>
            <div className="w-20 h-20 bg-white border-2 border-zinc-100 rounded-full flex items-center justify-center text-zinc-400 shadow-sm mb-3">
              <User strokeWidth={1.5} size={40} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">{me.name}</h2>
            
            <p className="text-xs text-zinc-500 bg-zinc-200/50 px-2 py-1 rounded-md mt-1 mb-6 text-center">
              選択中: {me.slotTitle || '分人'}
            </p>

            <div className="w-full grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <p className="text-xs font-bold text-center text-zinc-500 border-b border-zinc-200 pb-1">自己ベクトル</p>
                {VECTOR_TRAITS.map((trait, idx) => (
                  <div key={`me-self-${trait}`} className="flex justify-between text-[10px] text-zinc-600">
                    <span>{trait}</span>
                    <span className="font-mono bg-zinc-200 px-1.5 rounded">
                      {Math.round((me.selfVector[VECTOR_KEYS[idx]] ?? 0.5) * 100)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-center text-rose-500 border-b border-rose-200 pb-1">共鳴ベクトル</p>
                {VECTOR_TRAITS.map((trait, idx) => (
                  <div key={`me-res-${trait}`} className="flex justify-between text-[10px] text-zinc-600">
                    <span>{trait}</span>
                    <span className="font-mono bg-rose-100 px-1.5 rounded">
                      {Math.round((me.resonanceVector?.[VECTOR_KEYS[idx]] ?? 0.5) * 100)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full bg-white rounded-xl p-4 border border-zinc-200 mt-auto">
              <p className="text-[10px] font-bold text-zinc-400 mb-1">分人要約文</p>
              <p className="text-xs text-zinc-700 leading-relaxed">
                {me.personaSummary}
              </p>
            </div>
          </div>

          {/* 中央：共鳴スコア（修正箇所） */}
          <div className="flex flex-col justify-center items-center py-4 md:py-0 shrink-0 z-10">
            <div className="flex flex-col items-center justify-center w-32 h-32 md:w-40 md:h-40 bg-white border-4 border-rose-100 rounded-full shadow-lg ring-4 ring-rose-50/50 relative">
              <Zap className="text-rose-400 absolute top-4 opacity-20" size={80} fill="currentColor" />
              {/* Score -> 共鳴スコア */}
              <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1 relative z-10">共鳴スコア</p>
              {/* % を削除 */}
              <p className="text-5xl md:text-6xl font-black text-rose-500 relative z-10">
                {resonanceScore}
              </p>
            </div>
          </div>

          {/* 右：相手 */}
          <div className="flex-1 bg-rose-50/30 border border-rose-100 rounded-3xl p-6 flex flex-col items-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-400"></div>
            <div className="w-20 h-20 bg-white border-2 border-rose-100 rounded-full flex items-center justify-center text-rose-400 shadow-sm mb-3">
              <User strokeWidth={1.5} size={40} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">{target.name}</h2>
            <p className="text-xs text-rose-600/70 bg-rose-100/50 px-2 py-1 rounded-md mt-1 mb-6">
              共鳴マッチング対象
            </p>

            <div className="w-full grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <p className="text-xs font-bold text-center text-zinc-500 border-b border-zinc-200 pb-1">自己ベクトル</p>
                {VECTOR_TRAITS.map((trait, idx) => (
                  <div key={`target-self-${trait}`} className="flex justify-between text-[10px] text-zinc-600">
                    <span>{trait}</span>
                    <span className="font-mono bg-zinc-200/50 px-1.5 rounded">
                      {Math.round((target.selfVector[VECTOR_KEYS[idx]] ?? 0.5) * 100)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-center text-rose-800 border-b border-rose-200 pb-1">共鳴ベクトル</p>
                {VECTOR_TRAITS.map((trait, idx) => (
                  <div key={`target-res-${trait}`} className="flex justify-between text-[10px] text-zinc-600">
                    <span>{trait}</span>
                    <span className="font-mono bg-rose-200/80 px-1.5 rounded">
                      {Math.round((target.resonanceVector?.[VECTOR_KEYS[idx]] ?? 0.5) * 100)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full bg-white/80 rounded-xl p-4 border border-rose-100 mt-auto">
              <p className="text-[10px] font-bold text-rose-400 mb-1">分人要約文</p>
              <p className="text-xs text-zinc-700 leading-relaxed">
                {target.personaSummary}
              </p>
            </div>
          </div>
          
        </div>

        {/* AI解説 */}
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl p-8 border border-indigo-100 shadow-sm relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <h3 className="text-xl font-bold text-indigo-950">AI Relationship Analysis</h3>
          </div>

          <div className="prose prose-zinc prose-sm md:prose-base max-w-none">
            {aiExplanation.split('\n').map((line, i) => {
              if (line.startsWith('### ')) {
                return <h4 key={i} className="text-lg font-bold text-indigo-900 mt-6 mb-2">{line.replace('### ', '')}</h4>;
              }
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="text-zinc-700 leading-relaxed mb-2">{line}</p>;
            })}
          </div>
        </div>

      </div>
    </div>
  );
}