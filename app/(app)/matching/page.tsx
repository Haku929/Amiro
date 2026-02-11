// app/(app)/matching/page.tsx
import MatchingList from '@/components/layout/MatchingList';
import MyProfileCard from '@/components/layout/MyProfileCard';

export const metadata = {
  title: '共鳴マッチング | Amiro',
};

export default function MatchingPage() {
  return (
    // PC画面（lg以上）では高さを画面いっぱい（h-screen）にし、ページ全体のスクロールを停止（overflow-hidden）します
    <div className="max-w-350 mx-auto flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
      
      {/* ▼ 左カラム：完全に固定されたエリア */}
      {/* padding はここで設定します。右側に薄い境界線（border-r）を引いて区切りを強調しています */}
      <div className="w-full lg:w-5/12 xl:w-1/3 p-8 lg:p-12 xl:p-16 flex flex-col gap-8 shrink-0 lg:border-r lg:border-zinc-100 z-10">
        
        {/* ページタイトル */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight">
            共鳴マッチング
          </h1>
          <p className="text-zinc-500 mt-3 text-sm lg:text-base">
            あなたの現在の分人データと、共鳴スコアが高いユーザーを一覧表示しています。
          </p>
        </div>

        {/* 自分のカード */}
        <MyProfileCard />

      </div>

      {/* ▼ 右カラム：このブロックの中だけが独立してスクロールされます */}
      {/* lg:overflow-y-auto と lg:h-full で、右側だけスクロールバーが出るようになります */}
      <div className="w-full lg:w-7/12 xl:w-2/3 p-8 lg:p-12 xl:p-16 lg:overflow-y-auto lg:h-full pb-32">
        <MatchingList />
      </div>
      
    </div>
  );
}