import { Suspense } from 'react';
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import AmiroLogo from "@/components/ui/AmiroLogo";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center pt-8 pb-4">
          <Link href="/" className="flex justify-center mb-3">
            <AmiroLogo className="h-[5.25rem] md:h-24 w-auto" />
          </Link>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">アカウント作成</p>
          <CardDescription>
            Amiroで新しい自分を見つけましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <SignupForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
