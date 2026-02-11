// components/layout/MatchingContainer.tsx
'use client';

import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import MyProfileCard from './MyProfileCard';
import MatchingList from './MatchingList';

const VECTOR_TRAITS = ['神経症傾向', '誠実性', '外向性', '協調性', '開放性'];

const MOCK_SLOTS = [
  { id: 1, title: '分人1', content: '相手の話を丁寧に聴き、共感を示す傾向が強く表れています。リラックスした関係性を築く際に活性化しやすいペルソナです。', selfVector: [50, 50, 50, 50, 50], resVector: [40, 60, 50, 80, 70] },
  { id: 2, title: '分人2', content: '効率とロジックを重視し、知的な会話を好むペルソナです。目的志向の強い相手と深い共鳴を起こしやすい状態です。', selfVector: [30, 80, 40, 40, 60], resVector: [60, 70, 40, 60, 50] },
  { id: 3, title: '分人3', content: '新しいことへの好奇心が旺盛で、感情表現が豊かな状態です。一緒にアクティビティを楽しめる相手を求めています。', selfVector: [60, 40, 80, 60, 90], resVector: [50, 50, 90, 70, 80] },
];

// ▼ 各ユーザーに content（分人要約文）を追加
const MOCK_MATCHES = {
  1: [
    { id: 'u1', name: 'ミナト', content: '穏やかで聞き上手な一面が強く出ています。休日は静かなカフェで読書を楽しむことが多いです。', resonanceScore: 92, resonanceVector: [45, 80, 60, 85, 70], selfVector: [50, 50, 50, 50, 50] },
    { id: 'u2', name: 'ユイ', content: '相手の感情に寄り添う共感性の高さが特徴です。リラックスした雰囲気作りが得意です。', resonanceScore: 88, resonanceVector: [60, 75, 55, 90, 65], selfVector: [40, 60, 50, 60, 50] },
    { id: 'u3', name: 'ケンジ', content: '趣味の話になると熱中するタイプですが、普段は協調性を大切にして周りに合わせます。', resonanceScore: 81, resonanceVector: [30, 60, 80, 70, 90], selfVector: [60, 50, 80, 50, 70] },
  ],
  2: [
    { id: 'u4', name: 'サクラ', content: '論理的な思考を好み、物事の効率化について議論することに喜びを感じるペルソナです。', resonanceScore: 95, resonanceVector: [85, 90, 30, 85, 60], selfVector: [50, 70, 40, 60, 60] },
    { id: 'u1', name: 'ミナト', content: '穏やかで聞き上手な一面が強く出ています。休日は静かなカフェで読書を楽しむことが多いです。', resonanceScore: 85, resonanceVector: [50, 85, 50, 80, 60], selfVector: [50, 50, 50, 50, 50] },
    { id: 'u5', name: 'リク', content: '新しい技術やビジネスの話題に敏感で、常に自己研鑽を怠らない真面目な一面があります。', resonanceScore: 74, resonanceVector: [55, 65, 60, 70, 55], selfVector: [50, 50, 60, 50, 50] },
  ],
  3: [
    { id: 'u3', name: 'ケンジ', content: '趣味の話になると熱中するタイプですが、普段は協調性を大切にして周りに合わせます。', resonanceScore: 96, resonanceVector: [20, 50, 90, 65, 95], selfVector: [60, 50, 80, 50, 70] },
    { id: 'u6', name: 'ハル', content: 'アウトドアやスポーツを好み、常に新しい体験を求めて行動するアクティブな状態です。', resonanceScore: 89, resonanceVector: [30, 40, 85, 75, 90], selfVector: [40, 80, 50, 60, 40] },
    { id: 'u2', name: 'ユイ', content: '相手の感情に寄り添う共感性の高さが特徴です。リラックスした雰囲気作りが得意です。', resonanceScore: 82, resonanceVector: [50, 60, 70, 80, 75], selfVector: [40, 60, 50, 60, 50] },
  ]
};

type FilterType = 'none' | 'self' | 'res';

export default function MatchingContainer() {
  const [currentSlotId, setCurrentSlotId] = useState<number>(1);
  const [isSearching, setIsSearching] = useState(false);

  // 絞り込み用の状態管理
  const [filterInput, setFilterInput] = useState<{ type: FilterType, traitIndex: number }>({ type: 'none', traitIndex: 0 });
  const [activeFilter, setActiveFilter] = useState<{ type: FilterType, traitIndex: number }>({ type: 'none', traitIndex: 0 });

  // 分人切り替え時
  const handleSlotChange = (slotId: number) => {
    if (slotId === currentSlotId) return;

    setIsSearching(true);
    setCurrentSlotId(slotId);
    setActiveFilter({ type: 'none', traitIndex: 0 }); // 分人が変わったらフィルターをリセット
    setFilterInput({ type: 'none', traitIndex: 0 });
    
    setTimeout(() => { setIsSearching(false); }, 600);
  };

  // 絞り込み実行時
  const handleApplyFilter = () => {
    setIsSearching(true);
    setActiveFilter(filterInput); // 入力状態を確定状態として適用
    setTimeout(() => { setIsSearching(false); }, 600);
  };

  const currentSlot = MOCK_SLOTS.find(s => s.id === currentSlotId) || MOCK_SLOTS[0];
  const baseMatches = MOCK_MATCHES[currentSlotId as keyof typeof MOCK_MATCHES] || [];

  // ▼ フィルター適用ロジック：選んだ項目の数値が「自分の数値と近い順」に並び替え、差が30以上の人は除外
  const filteredMatches = useMemo(() => {
    if (activeFilter.type === 'none') return baseMatches;

    const traitIdx = activeFilter.traitIndex;
    const myVal = activeFilter.type === 'self' ? currentSlot.selfVector[traitIdx] : currentSlot.resVector[traitIdx];

    // 差が近い順（絶対値が小さい順）に並べ替えつつ、極端に離れている人（差が30より上）は除外
    return [...baseMatches]
      .filter(match => {
        const theirVal = activeFilter.type === 'self' ? match.selfVector[traitIdx] : match.resonanceVector[traitIdx];
        return Math.abs(myVal - theirVal) <= 30; // 許容範囲（必要に応じて調整）
      })
      .sort((a, b) => {
        const aVal = activeFilter.type === 'self' ? a.selfVector[traitIdx] : a.resonanceVector[traitIdx];
        const bVal = activeFilter.type === 'self' ? b.selfVector[traitIdx] : b.resonanceVector[traitIdx];
        return Math.abs(myVal - aVal) - Math.abs(myVal - bVal);
      });
  }, [baseMatches, activeFilter, currentSlot]);

  return (
    <div className="max-w-350 mx-auto flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
      
      {/* 左カラム：固定のマイプロフィール */}
      <div className="w-full lg:w-5/12 xl:w-1/3 p-8 lg:p-12 xl:p-16 flex flex-col gap-8 shrink-0 lg:border-r lg:border-zinc-100 z-10">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight">共鳴マッチング</h1>
          <p className="text-zinc-500 mt-3 text-sm lg:text-base">あなたの現在の分人データと、共鳴スコアが高いユーザーを一覧表示しています。</p>
        </div>
        <MyProfileCard slots={MOCK_SLOTS} currentSlot={currentSlot} onSlotChange={handleSlotChange} />
      </div>

      {/* 右カラム：スクロール領域 */}
      <div className="w-full lg:w-7/12 xl:w-2/3 p-8 lg:p-12 xl:p-16 lg:overflow-y-auto lg:h-full pb-32 relative">
        
        {isSearching && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center pt-32 lg:pt-0">
            <div className="w-12 h-12 border-4 border-zinc-200 border-t-rose-500 rounded-full animate-spin mb-4 shadow-sm"></div>
            <p className="text-zinc-600 font-bold text-sm tracking-widest animate-pulse">共鳴ユーザーを再検索中...</p>
          </div>
        )}

        {/* ▼ 新機能：絞り込みフィルターバー */}
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
              value={filterInput.traitIndex} 
              onChange={(e) => setFilterInput({ ...filterInput, traitIndex: Number(e.target.value) })}
              disabled={filterInput.type === 'none'}
              className="flex-1 bg-zinc-50 border border-zinc-200 text-sm font-medium text-zinc-700 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50 disabled:bg-zinc-100"
            >
              {VECTOR_TRAITS.map((trait, idx) => (
                <option key={idx} value={idx}>{trait}</option>
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

        {/* リスト表示（フィルター適用後のデータを渡す） */}
        <MatchingList matches={filteredMatches} />
      </div>
      
    </div>
  );
}