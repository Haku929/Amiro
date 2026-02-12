// app/(app)/matching/[userId]/page.tsx
import { notFound } from 'next/navigation';
import MatchingDetail, { DetailUser } from '@/components/layout/MatchingDetails';
import { Slot } from '@/lib/types';

// ▼ 型定義拡張
type TargetUserWithScore = DetailUser & { resonanceScore: number };

// ▼ モックデータ：自分のスロット情報（数値に変化をつける）
const MOCK_MY_SLOTS: Slot[] = [
  { 
    slotIndex: 1, 
    personaSummary: '相手の話を丁寧に聴き、共感を示す傾向が強く表れています。リラックスした関係性を築く際に活性化しやすいペルソナです。', 
    personaIcon: '',
    // 自分：内向的(E低)で協調的(A高)
    selfVector: { n: 0.2, c: 0.6, e: 0.3, a: 0.8, o: 0.5 }, 
    // 理想：外交的(E高)で創造的(O高)な人を求めている
    resonanceVector: { n: 0.3, c: 0.5, e: 0.8, a: 0.6, o: 0.9 },
    createdAt: new Date().toISOString()
  },
  { 
    slotIndex: 2, 
    personaSummary: '効率とロジックを重視し、知的な会話を好むペルソナです。目的志向の強い相手と深い共鳴を起こしやすい状態です。', 
    personaIcon: '',
    // 自分：勤勉(C高)で情動性低め(N低)
    selfVector: { n: 0.2, c: 0.9, e: 0.6, a: 0.4, o: 0.6 }, 
    // 理想：同じく勤勉(C高)で開放的(O高)な人
    resonanceVector: { n: 0.2, c: 0.8, e: 0.5, a: 0.5, o: 0.8 },
    createdAt: new Date().toISOString()
  },
  { 
    slotIndex: 3, 
    personaSummary: '新しいことへの好奇心が旺盛で、感情表現が豊かな状態です。一緒にアクティビティを楽しめる相手を求めています。', 
    personaIcon: '',
    // 自分：開放的(O高)で外向的(E高)
    selfVector: { n: 0.5, c: 0.3, e: 0.9, a: 0.7, o: 0.9 }, 
    // 理想：落ち着いている(N低)人を求めている
    resonanceVector: { n: 0.2, c: 0.6, e: 0.7, a: 0.8, o: 0.6 },
    createdAt: new Date().toISOString()
  },
];

// ▼ モックデータ：相手リスト（数値に変化をつける）
const MOCK_TARGETS: Record<string, TargetUserWithScore> = {
  'u1': { 
    id: 'u1', name: 'ミナト', 
    personaSummary: '穏やかで聞き上手な一面が強く出ています。休日は静かなカフェで読書を楽しむことが多いです。',
    // ミナト：外向的(E高)で創造的(O高) -> 分人1の理想に近い
    selfVector: { n: 0.3, c: 0.6, e: 0.85, a: 0.5, o: 0.85 }, 
    // ミナト理想：内向的(E低)で協調的(A高) -> 分人1の自分に近い
    resonanceVector: { n: 0.2, c: 0.5, e: 0.35, a: 0.9, o: 0.5 },
    resonanceScore: 92
  },
  'u2': { 
    id: 'u2', name: 'ユイ', 
    personaSummary: '相手の感情に寄り添う共感性の高さが特徴です。リラックスした雰囲気作りが得意です。',
    selfVector: { n: 0.4, c: 0.6, e: 0.5, a: 0.9, o: 0.6 }, 
    resonanceVector: { n: 0.3, c: 0.5, e: 0.4, a: 0.8, o: 0.5 },
    resonanceScore: 88
  },
  'u3': { 
    id: 'u3', name: 'ケンジ', 
    personaSummary: '趣味の話になると熱中するタイプですが、普段は協調性を大切にして周りに合わせます。',
    selfVector: { n: 0.6, c: 0.4, e: 0.8, a: 0.5, o: 0.7 }, 
    resonanceVector: { n: 0.3, c: 0.6, e: 0.7, a: 0.7, o: 0.8 },
    resonanceScore: 81
  },
  'u4': { 
    id: 'u4', name: 'サクラ', 
    personaSummary: '論理的な思考を好み、物事の効率化について議論することに喜びを感じるペルソナです。',
    selfVector: { n: 0.3, c: 0.85, e: 0.5, a: 0.4, o: 0.7 }, 
    resonanceVector: { n: 0.2, c: 0.9, e: 0.6, a: 0.5, o: 0.6 },
    resonanceScore: 95
  },
  'u5': { 
    id: 'u5', name: 'リク', 
    personaSummary: '新しい技術やビジネスの話題に敏感で、常に自己研鑽を怠らない真面目な一面があります。',
    selfVector: { n: 0.5, c: 0.7, e: 0.6, a: 0.5, o: 0.8 }, 
    resonanceVector: { n: 0.4, c: 0.6, e: 0.6, a: 0.6, o: 0.7 },
    resonanceScore: 74
  },
  'u6': { 
    id: 'u6', name: 'ハル', 
    personaSummary: 'アウトドアやスポーツを好み、常に新しい体験を求めて行動するアクティブな状態です。',
    selfVector: { n: 0.2, c: 0.5, e: 0.9, a: 0.7, o: 0.8 }, 
    resonanceVector: { n: 0.3, c: 0.4, e: 0.8, a: 0.6, o: 0.9 },
    resonanceScore: 89
  },
};

const MOCK_AI_EXPLANATION = `
### 💫 共鳴ポイントの解析
お二人の「勤勉性」と「創造性」のベクトルは非常に近い波形を描いています。これは、物事に対する真摯な姿勢と、新しい価値観を受け入れる柔軟さが共通していることを示唆しています。

特に、あなたの選択した分人が持つ**"受容的な態度"**と、相手の**"穏やかな聞き上手"**という特性は、互いに安心感を与え合う**「安らぎのループ」**を生み出す可能性が高いです。

### ⚠️ 注意点とアドバイス
一方で、「外向性」に関してはわずかな乖離が見られます。あなたが静かな時間を求めている時、相手がアクティブな提案をする場面があるかもしれません。ですが、お二人の高い「協調性」があれば、互いのペースを尊重しながら心地よい距離感を見つけられるでしょう。

### 💡 おすすめのアクション
まずは静かなカフェや美術館など、落ち着いて会話ができる場所でのデートをお勧めします。互いの好きな本や映画について語り合うことで、深い精神的な繋がりを感じられるはずです。
`;

type Props = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ slot?: string }>;
};

export default async function MatchingDetailPage({ params, searchParams }: Props) {
  const { userId } = await params;
  const { slot } = await searchParams;

  const currentSlotIndex = Number(slot) || 1;
  const mySlotData = MOCK_MY_SLOTS.find(s => s.slotIndex === currentSlotIndex) || MOCK_MY_SLOTS[0];

  const targetUser = MOCK_TARGETS[userId];

  if (!targetUser) {
    return notFound();
  }

  const meDetail: DetailUser = {
    id: 'me',
    name: 'あなた',
    personaSummary: mySlotData.personaSummary,
    slotTitle: `分人${mySlotData.slotIndex}`,
    selfVector: mySlotData.selfVector,
    resonanceVector: mySlotData.resonanceVector,
  };

  return (
    <MatchingDetail 
      me={meDetail} 
      target={targetUser} 
      resonanceScore={targetUser.resonanceScore} 
      aiExplanation={MOCK_AI_EXPLANATION} 
    />
  );
}