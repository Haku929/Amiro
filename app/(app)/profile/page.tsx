// app/(app)/profile/page.tsx
import SlotManager from '@/components/layout/SlotManager';
import { User, Settings } from 'lucide-react';

export const metadata = {
  title: 'プロフィール管理 | Amiro',
};

// ▼ ユーザー情報のモックデータ
const MOCK_USER = {
  name: 'Sample User',
  email: 'user@example.com',
  iconUrl: null, // 画像があればURL、なければnull
};

export default function ProfilePage() {
  return (
    // 画面固定のための高さ指定 (サイドバーやヘッダーの有無で調整が必要ですが、ここでは100vh基準で調整)
    // h-screen からパディング等を引いて、画面内に収まるようにしています
    <div className="h-[calc(100vh-2rem)] flex flex-col p-6 lg:p-8 overflow-hidden">
      
      {/* 1. ページヘッダー & ユーザー情報 */}
      <div className="shrink-0 mb-6 flex items-end justify-between border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">プロフィール</h1>
          <p className="text-xs text-zinc-500 mt-1">
            アカウント情報とマッチングスロットの管理
          </p>
          
          {/* ユーザー情報 (New) */}
          <div className="flex items-center gap-3 mt-4">
            <div className="w-12 h-12 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 shadow-sm overflow-hidden">
              {MOCK_USER.iconUrl ? (
                <img src={MOCK_USER.iconUrl} alt={MOCK_USER.name} className="w-full h-full object-cover" />
              ) : (
                <User strokeWidth={1.5} size={24} />
              )}
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-900 leading-none">{MOCK_USER.name}</p>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{MOCK_USER.email}</p>
            </div>
          </div>
        </div>

        {/* 設定ボタン (飾り) */}
        <button className="text-zinc-400 hover:text-zinc-600 p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <Settings size={20} />
        </button>
      </div>

      {/* 2. スロット管理エリア (残り高さいっぱいを使う) */}
      <div className="flex-1 min-h-0 bg-zinc-50 rounded-3xl border border-zinc-200 p-6 shadow-inner overflow-hidden">
        {/* コンポーネント自体で高さ調整を行っているため、ここでは配置のみ */}
        <SlotManager />
      </div>
      
    </div>
  );
}