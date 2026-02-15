import { Suspense } from 'react';
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center pt-8 pb-4">
          <Link href="/" className="flex justify-center">
            <img src="/amiro_logo.svg" alt="Amiro" className="h-[5.25rem] md:h-24 w-auto" />
          </Link>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>

        </CardContent>
      </Card>
    </div>
  );
}