// components/layout/MatchingDetail.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft, User, Sparkles, Zap, Target, Search, HeartHandshake } from 'lucide-react';
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
    <div className="min-h-screen bg-zinc-50/50 pb-20">
      
      {/* ヘッダー */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={`/matching?slot=${me.slotTitle?.replace('分人', '') || '1'}`} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ArrowLeft className="text-zinc-600" size={20} />
          </Link>
          <h1 className="text-base font-bold text-zinc-900">共鳴詳細</h1>
        </div>
        <div className="flex items-center gap-2 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
           <Zap size={14} className="text-rose-500" fill="currentColor" />
           <span className="text-xs font-bold text-rose-500">Score {resonanceScore}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8">

        {/* 1. ユーザー基本情報（横並びカード） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 自分 */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-start gap-4 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-600"></div>
             <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center shrink-0 border border-zinc-200">
               <User className="text-zinc-400" size={24} />
             </div>
             <div className="flex-1 min-w-0">
               <div className="flex items-baseline justify-between mb-1">
                 <h2 className="text-lg font-bold text-zinc-900 truncate">{me.name}</h2>
                 <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full shrink-0">
                   {me.slotTitle}
                 </span>
               </div>
               <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                 <p className="text-[10px] font-bold text-zinc-400 mb-0.5">分人要約</p>
                 <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">{me.personaSummary}</p>
               </div>
             </div>
          </div>

          {/* 相手 */}
          <div className="bg-white border border-rose-200 rounded-2xl p-5 flex items-start gap-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-500"></div>
             <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center shrink-0 border border-rose-100">
               <User className="text-rose-400" size={24} />
             </div>
             <div className="flex-1 min-w-0">
               <div className="flex items-baseline justify-between mb-1">
                 <h2 className="text-lg font-bold text-zinc-900 truncate">{target.name}</h2>
                 <span className="text-[10px] bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full shrink-0">
                   Target
                 </span>
               </div>
               <div className="bg-rose-50/30 p-2.5 rounded-lg border border-rose-100">
                 <p className="text-[10px] font-bold text-rose-400 mb-0.5">分人要約</p>
                 <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">{target.personaSummary}</p>
               </div>
             </div>
          </div>
        </div>

        {/* 2. クロス分析チャート */}
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <HeartHandshake size={16} />
              Cross Analysis
            </h3>
          </div>

          {/* チャートA: あなたの理想 vs 相手の現実 */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm relative">
            <div className="absolute -top-3 left-6 bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-2">
              <Search size={12} />
              あなたの理想 ⇄ 相手の現実
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between px-2 text-[10px] font-bold text-zinc-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-indigo-400 rounded-full"></span>
                  あなたの共鳴 (理想)
                </span>
                <span className="flex items-center gap-1.5">
                  相手の自己 (現実)
                  <span className="w-3 h-3 bg-rose-500 rounded-full"></span>
                </span>
              </div>

              {VECTOR_TRAITS.map((trait, idx) => {
                // あなたの共鳴（理想）
                const myResVal = (me.resonanceVector?.[VECTOR_KEYS[idx]] ?? 0.5) * 100;
                // 相手の自己（現実）
                const targetSelfVal = (target.selfVector[VECTOR_KEYS[idx]] ?? 0.5) * 100;
                
                return (
                  <div key={`cross-A-${trait}`} className="flex items-center text-xs group hover:bg-zinc-50 rounded-lg p-1 transition-colors">
                    {/* 左：あなたの共鳴 (枠線や薄い色で「理想」を表現) */}
                    <div className="flex-1 flex justify-end items-center gap-2">
                      <span className="font-mono text-indigo-400 w-6 text-right">{Math.round(myResVal)}</span>
                      <div className="h-2.5 w-full flex justify-end relative max-w-[160px] bg-zinc-50 rounded-l-full overflow-hidden">
                        {/* 理想なので、少し透明度を入れるか、色を変える */}
                        <div className="h-full bg-indigo-400/70 rounded-l-full" style={{ width: `${myResVal}%` }}></div>
                      </div>
                    </div>
                    
                    {/* 中央ラベル */}
                    <div className="w-20 text-center font-bold text-zinc-700 shrink-0 text-[11px]">
                      {trait}
                    </div>
                    
                    {/* 右：相手の自己 (濃い色で「実体」を表現) */}
                    <div className="flex-1 flex justify-start items-center gap-2">
                      <div className="h-2.5 w-full relative max-w-[160px] bg-zinc-50 rounded-r-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-r-full" style={{ width: `${targetSelfVal}%` }}></div>
                      </div>
                      <span className="font-mono text-rose-500 w-6 text-left">{Math.round(targetSelfVal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-zinc-400 text-center mt-4">
              あなたが求めている性質（青）と、相手が実際に持っている性質（赤）の比較
            </p>
          </div>

          {/* チャートB: あなたの現実 vs 相手の理想 */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm relative">
            <div className="absolute -top-3 right-6 bg-orange-50 text-orange-700 px-4 py-1 rounded-full text-xs font-bold border border-orange-100 flex items-center gap-2">
              あなたの現実 ⇄ 相手の理想
              <Target size={12} />
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between px-2 text-[10px] font-bold text-zinc-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-zinc-600 rounded-full"></span>
                  あなたの自己 (現実)
                </span>
                <span className="flex items-center gap-1.5">
                  相手の共鳴 (理想)
                  <span className="w-3 h-3 border-2 border-orange-400 rounded-full"></span>
                </span>
              </div>

              {VECTOR_TRAITS.map((trait, idx) => {
                // あなたの自己（現実）
                const mySelfVal = (me.selfVector[VECTOR_KEYS[idx]] ?? 0.5) * 100;
                // 相手の共鳴（理想）
                const targetResVal = (target.resonanceVector?.[VECTOR_KEYS[idx]] ?? 0.5) * 100;
                
                return (
                  <div key={`cross-B-${trait}`} className="flex items-center text-xs group hover:bg-zinc-50 rounded-lg p-1 transition-colors">
                    {/* 左：あなたの自己 (濃い色で「実体」) */}
                    <div className="flex-1 flex justify-end items-center gap-2">
                      <span className="font-mono text-zinc-600 w-6 text-right">{Math.round(mySelfVal)}</span>
                      <div className="h-2.5 w-full flex justify-end relative max-w-[160px] bg-zinc-50 rounded-l-full overflow-hidden">
                        <div className="h-full bg-zinc-600 rounded-l-full" style={{ width: `${mySelfVal}%` }}></div>
                      </div>
                    </div>
                    
                    {/* 中央ラベル */}
                    <div className="w-20 text-center font-bold text-zinc-700 shrink-0 text-[11px]">
                      {trait}
                    </div>
                    
                    {/* 右：相手の共鳴 (薄い色・枠線的イメージで「理想」) */}
                    <div className="flex-1 flex justify-start items-center gap-2">
                      <div className="h-2.5 w-full relative max-w-[160px] bg-zinc-50 rounded-r-full overflow-hidden">
                        <div className="h-full bg-orange-400/70 rounded-r-full" style={{ width: `${targetResVal}%` }}></div>
                      </div>
                      <span className="font-mono text-orange-400 w-6 text-left">{Math.round(targetResVal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-zinc-400 text-center mt-4">
              あなたが実際に持っている性質（黒）と、相手が求めている性質（橙）の比較
            </p>
          </div>
        </div>

        {/* 3. AI解説 */}
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-indigo-600" />
            <h3 className="text-base font-bold text-indigo-900">AI Relationship Analysis</h3>
          </div>

          <div className="prose prose-zinc prose-sm max-w-none">
            {aiExplanation.split('\n').map((line, i) => {
              if (line.startsWith('### ')) {
                return <h4 key={i} className="text-sm font-bold text-indigo-800 mt-4 mb-2">{line.replace('### ', '')}</h4>;
              }
              if (line.trim() === '') return null;
              return <p key={i} className="text-zinc-700 leading-relaxed mb-2 text-justify">{line}</p>;
            })}
          </div>
        </div>

      </div>
    </div>
  );
}