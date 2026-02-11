// components/layout/Header.tsx
import Link from "next/link";
// ※後ほどSupabase Authを導入した際に、実際の認証状態取得処理に置き換えます
// import { getUser } from "@/lib/supabase/server"; // 仮のインポートパス

export default async function Header() {
  // TODO: Supabase Auth から実際のユーザー情報を取得する
  // const user = await getUser();
  const user = null; // 仮の未ログイン状態

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="font-bold text-xl">
          <Link href="/">Amiro</Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/profile" className="text-sm font-medium hover:underline">
            プロフィール
          </Link>
          <Link href="/matching" className="text-sm font-medium hover:underline">
            共鳴マッチング
          </Link>
          {user ? (
            <div className="text-sm font-medium">ログイン中</div>
          ) : (
            <Link href="/login" className="text-sm font-medium hover:underline">
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}