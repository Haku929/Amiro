import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Amiro</CardTitle>
          <CardDescription>
            「好きな自分」を探すマッチングアプリ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-blue-500 hover:underline">
              トップページに戻る（テスト用）
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}