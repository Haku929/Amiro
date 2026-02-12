// components/layout/Header.tsx
'use client'; // フックを使用するため追加

import Link from "next/link";
import { usePathname } from "next/navigation"; // 現在のパスを取得するために追加
// shadcn/ui 標準のアイコンライブラリからアイコンをインポート
import { Home, Compass, Sparkles, User, Settings } from "lucide-react";

export default function Header() {
  const pathname = usePathname(); // 現在のURLパスを取得

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
        <Link 
          href="/" 
          className={`p-3 rounded-xl transition-all ${
            pathname === "/" 
              ? "bg-zinc-100 text-zinc-900 shadow-sm" // アクティブ状態（濃い色＋背景）
              : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100" // 非アクティブ状態
          }`} 
          title="ホーム"
        >
          <Home className="w-6 h-6" strokeWidth={2} />
        </Link>
        <Link 
          href="/matching" 
          className={`p-3 rounded-xl transition-all ${
            pathname.startsWith("/matching") // サブページ（詳細など）に入ってもアクティブにする
              ? "bg-zinc-100 text-zinc-900 shadow-sm"
              : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
          }`} 
          title="マッチング"
        >
          <Compass className="w-6 h-6" strokeWidth={2} />
        </Link>

      </nav>

      {/* 下部: プロフィールと設定 */}
      <div className="flex-shrink-0 flex flex-col items-center gap-4 mt-auto mb-2">
        <Link 
          href="/profile" 
          className={`p-3 rounded-full transition-all ${
            pathname.startsWith("/profile")
              ? "bg-zinc-100 text-zinc-900 shadow-sm"
              : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
          }`} 
          title="プロフィール"
        >
          <User className="w-6 h-6" strokeWidth={2} />
        </Link>
        <Link 
          href="/settings" 
          className={`p-3 rounded-full transition-all ${
            pathname.startsWith("/settings")
              ? "bg-zinc-100 text-zinc-900 shadow-sm"
              : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
          }`} 
          title="設定"
        >
          <Settings className="w-6 h-6" strokeWidth={2} />
        </Link>
      </div>
      
    </aside>
  );
}