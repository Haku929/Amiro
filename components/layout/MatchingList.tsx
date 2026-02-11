// components/MatchingList.tsx
'use client';

import { User } from 'lucide-react';

const VECTOR_TRAITS = ['神経症傾向', '誠実性', '外向性', '協調性', '開放性'];

const mockMatches = [
  { id: 'user_1', name: 'ミナト', resonanceScore: 92, resonanceVector: [45, 80, 60, 85, 70], selfVector: [50, 50, 50, 50, 50] },
  { id: 'user_2', name: 'ユイ', resonanceScore: 88, resonanceVector: [60, 75, 55, 90, 65], selfVector: [50, 50, 50, 50, 50] },
  { id: 'user_3', name: 'ケンジ', resonanceScore: 81, resonanceVector: [30, 60, 80, 70, 90], selfVector: [50, 50, 50, 50, 50] },
  { id: 'user_4', name: 'サクラ', resonanceScore: 76, resonanceVector: [70, 85, 40, 80, 60], selfVector: [50, 50, 50, 50, 50] },
  { id: 'user_5', name: 'リク', resonanceScore: 72, resonanceVector: [50, 60, 70, 80, 60], selfVector: [50, 50, 50, 50, 50] },
];

export default function MatchingList() {
  return (
    <div className="space-y-6">
      {mockMatches.map((match) => (
        <div 
          key={match.id} 
          // 右半分に配置されるため、xlサイズ以上で完全に横長になるように調整
          className="flex flex-col xl:flex-row items-stretch gap-5 p-5 border border-zinc-200 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          {/* 左側: アイコンと名前・スコア */}
          <div className="flex items-center gap-5 xl:w-48 xl:border-r xl:border-zinc-100 xl:pr-5 shrink-0">
            <div className="w-16 h-16 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 shadow-inner group-hover:scale-105 transition-transform">
              <User strokeWidth={1.5} size={32} />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-xl font-bold text-zinc-900">{match.name}</h3>
              <p className="text-sm font-bold text-rose-500 mt-1">
                共鳴度: {match.resonanceScore}%
              </p>
            </div>
          </div>

          {/* 右側: ベクトル表示エリア */}
          <div className="flex flex-1 flex-col sm:flex-row gap-4">
            
            {/* 共鳴ベクトル（強調表示） */}
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
                      {match.resonanceVector[idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 自己ベクトル（控えめ表示） */}
            <div className="flex-1 bg-zinc-50 rounded-2xl p-4 border border-zinc-100 opacity-90">
              <p className="text-xs font-bold text-zinc-500 border-b border-zinc-200 pb-2 mb-3 text-center tracking-wider">
                自己ベクトル
              </p>
              <div className="space-y-2">
                {VECTOR_TRAITS.map((trait, idx) => (
                  <div key={`self-${trait}`} className="flex justify-between items-center text-xs text-zinc-500 px-1">
                    <span>{trait}</span>
                    <span className="font-mono bg-zinc-200/50 px-2 py-0.5 rounded-md">
                      {match.selfVector[idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}