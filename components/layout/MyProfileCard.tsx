// components/MyProfileCard.tsx
'use client';

import { User } from 'lucide-react';

const VECTOR_TRAITS = ['神経症傾向', '誠実性', '外向性', '協調性', '開放性'];

export default function MyProfileCard() {
  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-zinc-100 border-2 border-white rounded-full flex items-center justify-center text-zinc-400 shadow-md mb-4 ring-4 ring-zinc-50">
          <User strokeWidth={1.5} size={48} />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">あなた</h2>
        <p className="text-sm font-medium text-zinc-500 mt-2 bg-zinc-100 px-3 py-1 rounded-full">
          選択中の分人：分人1
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 左: 自己ベクトル（控えめなグレー系） */}
        <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
          <p className="text-sm font-bold text-zinc-600 text-center border-b border-zinc-200 pb-2">自己ベクトル</p>
          <div className="space-y-2">
            {VECTOR_TRAITS.map(trait => (
              <div key={`my-self-${trait}`} className="flex justify-between items-center text-sm text-zinc-600 px-1">
                <span>{trait}</span>
                <span className="font-mono bg-zinc-200/50 px-2 py-0.5 rounded-md">50</span>
              </div>
            ))}
          </div>
        </div>

        {/* 右: 共鳴ベクトル（強調するローズ系に変更） */}
        <div className="space-y-3 bg-rose-50/50 p-4 rounded-2xl border border-rose-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-400 rounded-l-2xl"></div>
          <p className="text-sm font-bold text-rose-800 text-center border-b border-rose-200 pb-2">共鳴ベクトル</p>
          <div className="space-y-2">
            {VECTOR_TRAITS.map(trait => (
              <div key={`my-res-${trait}`} className="flex justify-between items-center text-sm text-rose-900 font-medium px-1">
                <span>{trait}</span>
                <span className="font-mono bg-rose-100/80 px-2 py-0.5 rounded-md">50</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
        <p className="text-xs font-semibold text-zinc-400 mb-2 text-center tracking-widest">分人要約文</p>
        <p className="text-sm text-zinc-700 leading-relaxed text-center">
          この分人は、相手の話を丁寧に聴き、共感を示す傾向が強く表れています。リラックスした関係性を築く際に活性化しやすいペルソナです。
        </p>
      </div>
    </div>
  );
}