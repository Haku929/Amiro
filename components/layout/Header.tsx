// components/layout/Header.tsx
import Link from "next/link";
// shadcn/ui 標準のアイコンライブラリからアイコンをインポート
import { Home, Compass, Sparkles, User, Settings } from "lucide-react";

export default function Header() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-20 flex flex-col items-center py-6 border-r border-zinc-200 bg-white">
      
      {/* 上部: アプリのロゴ（縦幅が狭いので頭文字などに） */}
      <div className="flex-shrink-0 mb-auto mt-2">
        <Link href="/" className="font-bold text-2xl text-zinc-900 flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100">
          A
        </Link>
      </div>

      {/* 中央付近: ダミーアイコン3つ（後で差し替え可能） */}
      <nav className="flex flex-col items-center gap-6 my-auto">
        <Link href="/" className="p-3 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all" title="ホーム">
          <Home className="w-6 h-6" strokeWidth={2} />
        </Link>
        <Link href="/matching" className="p-3 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all" title="マッチング">
          <Compass className="w-6 h-6" strokeWidth={2} />
        </Link>
        <Link href="/chat" className="p-3 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all" title="チャット">
          <Sparkles className="w-6 h-6" strokeWidth={2} />
        </Link>
      </nav>

      {/* 下部: プロフィールと設定 */}
      <div className="flex-shrink-0 flex flex-col items-center gap-4 mt-auto mb-2">
        <Link href="/profile" className="p-3 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all" title="プロフィール">
          <User className="w-6 h-6" strokeWidth={2} />
        </Link>
        <Link href="/settings" className="p-3 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all" title="設定">
          <Settings className="w-6 h-6" strokeWidth={2} />
        </Link>
      </div>
      
    </aside>
  );
}