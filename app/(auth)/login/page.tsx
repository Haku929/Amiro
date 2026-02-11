// app/(auth)/login/page.tsx
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="p-8 bg-white rounded-lg shadow-md border text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-4">Amiro</h1>
        <p className="text-sm text-zinc-600 mb-8">
          「好きな自分」を探すマッチングアプリ
        </p>
        
        {/* ※実際の認証ロジック（Supabase Auth UIなど）は別のIssue/タスクで実装します */}
        <div className="p-4 bg-zinc-100 rounded text-sm text-zinc-500 mb-4">
          ここにログインフォームが入ります
        </div>

        <Link href="/" className="text-sm text-blue-500 hover:underline">
          トップページに戻る（テスト用）
        </Link>
      </div>
    </div>
  );
}