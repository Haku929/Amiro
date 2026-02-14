'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signup } from '@/app/(auth)/login/actions';

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const handleAction = async (formData: FormData, action: typeof signup) => {
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
    handleAction(formData, signup);
  };

  return (
    <div className="space-y-6">
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

        <div className="flex flex-col gap-2 pt-2">
          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full"
          >
            {isPending ? '処理中...' : '新規登録'}
          </Button>
        </div>
      </form>
      
      <div className="text-center text-sm">
        <span className="text-zinc-500 dark:text-zinc-400">すでにアカウントをお持ちの方は </span>
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          ログイン
        </Link>
      </div>
    </div>
  );
}
