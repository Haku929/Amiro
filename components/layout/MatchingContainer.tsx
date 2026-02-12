// components/layout/MatchingContainer.tsx
'use client';

import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import MyProfileCard from '@/components/layout/MyProfileCard';
import MatchingList from '@/components/layout/MatchingList';
import { Slot, Big5Vector } from '@/lib/types'; // 本来は共通型定義からインポート

// ▼ 型定義の補完（lib/types.ts が読み込めない環境用にここでも定義しておきます）
type VectorKey = keyof Big5Vector;
const VECTOR_TRAITS = ['神経症傾向', '誠実性', '外向性', '協調性', '開放性'] as const;
const VECTOR_KEYS: VectorKey[] = ['n', 'c', 'e', 'a', 'o'];

// ▼ 相手ユーザーのデータ型定義
export interface MatchUser {
  id: string;
  name: string;
  personaSummary: string; // content -> personaSummary
  resonanceScore: number;
  resonanceVector: Big5Vector;
  selfVector: Big5Vector;
}

// ▼ モックデータ：仕様書のスキーマ（キャメルケース・オブジェクト形式）に準拠
const MOCK_SLOTS: Slot[] = [
  { 
    slotIndex: 1, 
    personaSummary: '週末用リラックス — 相手の話を丁寧に聴き、共感を示す傾向が強く表れています。', 
    personaIcon: '',
    selfVector: { n: 0.5, c: 0.5, e: 0.5, a: 0.5, o: 0.5 }, 
    resonanceVector: { n: 0.4, c: 0.6, e: 0.5, a: 0.8, o: 0.7 },
    createdAt: new Date().toISOString()
  },
  { 
    slotIndex: 2, 
    personaSummary: '仕事モード — 効率とロジックを重視し、知的な会話を好むペルソナです。', 
    personaIcon: '',
    selfVector: { n: 0.3, c: 0.8, e: 0.4, a: 0.4, o: 0.6 }, 
    resonanceVector: { n: 0.6, c: 0.7, e: 0.4, a: 0.6, o: 0.5 },
    createdAt: new Date().toISOString()
  },
  { 
    slotIndex: 3, 
    personaSummary: '趣味全開 — 新しいことへの好奇心が旺盛で、感情表現が豊かな状態です。', 
    personaIcon: '',
    selfVector: { n: 0.6, c: 0.4, e: 0.8, a: 0.6, o: 0.9 }, 
    resonanceVector: { n: 0.5, c: 0.5, e: 0.9, a: 0.7, o: 0.8 },
    createdAt: new Date().toISOString()
  },
];

const MOCK_MATCHES: Record<number, MatchUser[]> = {
  1: [
    { 
      id: 'u1', name: 'ミナト', resonanceScore: 92, 
      personaSummary: '穏やかで聞き上手な一面が強く出ています。休日は静かなカフェで読書を楽しむことが多いです。',
      resonanceVector: { n: 0.45, c: 0.8, e: 0.6, a: 0.85, o: 0.7 }, 
      selfVector: { n: 0.5, c: 0.5, e: 0.5, a: 0.5, o: 0.5 } 
    },
    { 
      id: 'u2', name: 'ユイ', resonanceScore: 88, 
      personaSummary: '相手の感情に寄り添う共感性の高さが特徴です。リラックスした雰囲気作りが得意です。',
      resonanceVector: { n: 0.6, c: 0.75, e: 0.55, a: 0.9, o: 0.65 }, 
      selfVector: { n: 0.4, c: 0.6, e: 0.5, a: 0.6, o: 0.5 } 
    },
    { 
      id: 'u3', name: 'ケンジ', resonanceScore: 81, 
      personaSummary: '趣味の話になると熱中するタイプですが、普段は協調性を大切にして周りに合わせます。',
      resonanceVector: { n: 0.3, c: 0.6, e: 0.8, a: 0.7, o: 0.9 }, 
      selfVector: { n: 0.6, c: 0.5, e: 0.8, a: 0.5, o: 0.7 } 
    },
  ],
  2: [
    { 
      id: 'u4', name: 'サクラ', resonanceScore: 95, 
      personaSummary: '論理的な思考を好み、物事の効率化について議論することに喜びを感じるペルソナです。',
      resonanceVector: { n: 0.85, c: 0.9, e: 0.3, a: 0.85, o: 0.6 }, 
      selfVector: { n: 0.5, c: 0.7, e: 0.4, a: 0.6, o: 0.6 } 
    },
    { 
      id: 'u5', name: 'リク', resonanceScore: 74, 
      personaSummary: '新しい技術やビジネスの話題に敏感で、常に自己研鑽を怠らない真面目な一面があります。',
      resonanceVector: { n: 0.55, c: 0.65, e: 0.6, a: 0.7, o: 0.55 }, 
      selfVector: { n: 0.5, c: 0.5, e: 0.6, a: 0.5, o: 0.5 } 
    },
  ],
  3: [
    { 
      id: 'u6', name: 'ハル', resonanceScore: 89, 
      personaSummary: 'アウトドアやスポーツを好み、常に新しい体験を求めて行動するアクティブな状態です。',
      resonanceVector: { n: 0.3, c: 0.4, e: 0.85, a: 0.75, o: 0.9 }, 
      selfVector: { n: 0.4, c: 0.8, e: 0.5, a: 0.6, o: 0.4 } 
    },
  ]
};

type FilterType = 'none' | 'self' | 'res';

export default function MatchingContainer() {
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number>(1);
  const [isSearching, setIsSearching] = useState(false);

  // 絞り込み用の状態管理
  const [filterInput, setFilterInput] = useState<{ type: FilterType, vectorKey: VectorKey }>({ type: 'none', vectorKey: 'n' });
  const [activeFilter, setActiveFilter] = useState<{ type: FilterType, vectorKey: VectorKey }>({ type: 'none', vectorKey: 'n' });

  // 分人切り替え時
  const handleSlotChange = (slotIndex: number) => {
    if (slotIndex === currentSlotIndex) return;

    setIsSearching(true);
    setCurrentSlotIndex(slotIndex);
    setActiveFilter({ type: 'none', vectorKey: 'n' }); // リセット
    setFilterInput({ type: 'none', vectorKey: 'n' });
    
    setTimeout(() => { setIsSearching(false); }, 600);
  };

  const handleApplyFilter = () => {
    setIsSearching(true);
    setActiveFilter(filterInput);
    setTimeout(() => { setIsSearching(false); }, 600);
  };

  const currentSlot = MOCK_SLOTS.find(s => s.slotIndex === currentSlotIndex) || MOCK_SLOTS[0];
  const baseMatches = MOCK_MATCHES[currentSlotIndex] || [];

  // ▼ フィルタリングロジック（オブジェクトのプロパティアクセスに変更）
  const filteredMatches = useMemo(() => {
    if (activeFilter.type === 'none') return baseMatches;

    const vKey = activeFilter.vectorKey;
    // 値は 0.0~1.0 なので、差分許容値を 0.3 (30%) 程度に設定
    const myVal = activeFilter.type === 'self' ? currentSlot.selfVector[vKey] : currentSlot.resonanceVector[vKey];

    return [...baseMatches]
      .filter(match => {
        const theirVal = activeFilter.type === 'self' ? match.selfVector[vKey] : match.resonanceVector[vKey];
        return Math.abs(myVal - theirVal) <= 0.3; 
      })
      .sort((a, b) => {
        const aVal = activeFilter.type === 'self' ? a.selfVector[vKey] : a.resonanceVector[vKey];
        const bVal = activeFilter.type === 'self' ? b.selfVector[vKey] : b.resonanceVector[vKey];
        return Math.abs(myVal - aVal) - Math.abs(myVal - bVal);
      });
  }, [baseMatches, activeFilter, currentSlot]);

  return (
    <div className="max-w-350 mx-auto flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
      
      {/* 左カラム */}
      <div className="w-full lg:w-5/12 xl:w-1/3 p-8 lg:p-12 xl:p-16 flex flex-col gap-8 shrink-0 lg:border-r lg:border-zinc-100 z-10">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight">共鳴マッチング</h1>
          <p className="text-zinc-500 mt-3 text-sm lg:text-base">あなたの現在の分人データと、共鳴スコアが高いユーザーを一覧表示しています。</p>
        </div>
        <MyProfileCard slots={MOCK_SLOTS} currentSlot={currentSlot} onSlotChange={handleSlotChange} />
      </div>

      {/* 右カラム */}
      <div className="w-full lg:w-7/12 xl:w-2/3 p-8 lg:p-12 xl:p-16 lg:overflow-y-auto lg:h-full pb-32 relative">
        
        {isSearching && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center pt-32 lg:pt-0">
            <div className="w-12 h-12 border-4 border-zinc-200 border-t-rose-500 rounded-full animate-spin mb-4 shadow-sm"></div>
            <p className="text-zinc-600 font-bold text-sm tracking-widest animate-pulse">共鳴ユーザーを再検索中...</p>
          </div>
        )}

        {/* フィルターバー */}
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-zinc-200 mb-8 flex flex-col xl:flex-row gap-4 xl:items-center shadow-sm relative z-10">
          <div className="text-sm font-bold text-zinc-700 flex items-center gap-2 shrink-0">
            <Filter size={18} className="text-zinc-400" />
            ベクトルで絞り込む
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <select 
              value={filterInput.type} 
              onChange={(e) => setFilterInput({ ...filterInput, type: e.target.value as FilterType })}
              className="flex-1 bg-zinc-50 border border-zinc-200 text-sm font-medium text-zinc-700 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="none">指定なし（全体スコア順）</option>
              <option value="self">自己ベクトルが近い人</option>
              <option value="res">共鳴ベクトルが近い人</option>
            </select>
            
            <select 
              value={filterInput.vectorKey} 
              onChange={(e) => setFilterInput({ ...filterInput, vectorKey: e.target.value as VectorKey })}
              disabled={filterInput.type === 'none'}
              className="flex-1 bg-zinc-50 border border-zinc-200 text-sm font-medium text-zinc-700 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50 disabled:bg-zinc-100"
            >
              {VECTOR_TRAITS.map((trait, idx) => (
                <option key={VECTOR_KEYS[idx]} value={VECTOR_KEYS[idx]}>{trait}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleApplyFilter}
            className="bg-zinc-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold w-full xl:w-auto hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            <Search size={16} />
            再検索
          </button>
        </div>

        <MatchingList matches={filteredMatches} />
      </div>
      
    </div>
  );
}