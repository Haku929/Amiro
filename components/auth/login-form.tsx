'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, signup } from '@/app/(auth)/login/actions';
import { toast } from 'sonner';
import Link from 'next/link';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasNotified = useRef(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get('logged_out') && !hasNotified.current) {
      hasNotified.current = true;
      toast.success('ログアウトしました');
      router.replace('/login');
    }
  }, [searchParams, router]);

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const handleAction = async (formData: FormData, action: typeof login) => {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    handleAction(formData, login);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          required 
          placeholder="m@example.com" 
          onKeyDown={handleEmailKeyDown}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          required 
          ref={passwordRef}
        />
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <div className="flex flex-col gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full"
        >
          {isPending ? '処理中...' : 'ログイン'}
        </Button>
      </div>

      <div className="text-center text-sm mt-4">
        <span className="text-zinc-500 dark:text-zinc-400">アカウントをお持ちでない方は </span>
        <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          新規登録
        </Link>
      </div>
    </form>
  );
}