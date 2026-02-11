// app/(app)/page.tsx
import Link from 'next/link';

const DAILY_AIS = [
  {
    id: 'passionate_challenger',
    name: '情熱的な挑戦者',
    description: 'あなたの野心や、熱い思いを引き出します。エネルギッシュな自分に出会いたい時に。',
    icon: '🔥',
    colorClass: 'bg-red-50 text-red-600 border-red-200'
  },
  {
    id: 'calm_listener',
    name: '穏やかな傾聴者',
    description: 'リラックスした状態で、あなたの本音を優しく引き出します。安心感を求めたい時に。',
    icon: '🌿',
    colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  },
  {
    id: 'logical_analyst',
    name: '冷静な分析家',
    description: '客観的な視点から、あなたの思考を整理します。論理的で知的な自分を引き出したい時に。',
    icon: '📊',
    colorClass: 'bg-blue-50 text-blue-600 border-blue-200'
  },
];

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 mt-4">
      
      {/* ページヘッダー部分 */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">今日の「鏡」を選ぶ</h1>
        <p className="text-zinc-600 text-sm md:text-base max-w-xl mx-auto">
          話してみたいAIを選択してください。対話を通じて、相手の性格に響き合うあなたの新しい「分人」を引き出します。
        </p>
      </div>

      {/* AIカード一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DAILY_AIS.map((ai) => (
          <div 
            key={ai.id} 
            className="h-full border border-zinc-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md hover:border-zinc-300 transition-all flex flex-col items-center text-center space-y-5"
          >
            {/* アイコン部分 */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl border ${ai.colorClass} transition-transform duration-300 hover:scale-110`}>
              {ai.icon}
            </div>
            
            {/* テキスト部分 */}
            <div className="flex-grow space-y-2">
              <h2 className="text-lg font-bold text-zinc-900">{ai.name}</h2>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {ai.description}
              </p>
            </div>
            
            {/* アクションボタン（ここだけをリンクに変更） */}
            <div className="w-full pt-2">
              <Link 
                href={`/chat?ai=${ai.id}`}
                className="inline-block w-full py-3 px-4 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
              >
                このAIと話す
              </Link>
            </div>
            
          </div>
        ))}
      </div>
      
    </div>
  );
}