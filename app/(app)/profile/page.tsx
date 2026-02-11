// app/(app)/profile/page.tsx
import SlotManager from '@/components/layout/SlotManager';

// ※メタデータを設定する場合はここに追加
export const metadata = {
  title: 'プロフィール管理 | Amiro',
};

export default function ProfilePage() {
  return (
    // 親の layout.tsx でサイドバー分の余白 (ml-20 など) が設定されている前提のスタイリングです
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      
      {/* ページヘッダー */}
      <div className="mb-10 border-b pb-6">
        <h1 className="text-3xl font-bold text-zinc-900">プロフィール</h1>
        <p className="text-zinc-500 mt-2">
          あなたのアカウント情報と、マッチング用のスロットを管理します。
        </p>
      </div>

      <div className="space-y-12">
        {/* --- プロフィール基本情報エリア (今回はプレースホルダー) --- */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-800 mb-4">基本情報</h2>
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <p className="text-zinc-500 text-sm">※ここにユーザー名やアイコンなどの設定項目が入ります</p>
          </div>
        </section>

        {/* --- スロット管理エリア --- */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-800 mb-4">マッチングスロット設定</h2>
          <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-200">
            {/* 作成した SlotManager コンポーネントを配置 */}
            <SlotManager />
          </div>
        </section>
      </div>
      
    </div>
  );
}