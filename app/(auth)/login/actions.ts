'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

// 動作確認用のバイパス情報
const TEST_USER = {
  email: 'admin',
  password: 'pass'
};

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // テスト用ユーザーの場合は即座にリダイレクト
if (email === TEST_USER.email && password === TEST_USER.password) {
    const cookieStore = await cookies();
    // 動作確認用のダミークッキーをセット（有効期限1日など）
    cookieStore.set('amiro-test-session', 'true', { maxAge: 60 * 60 * 24 });
    
    revalidatePath('/', 'layout');
    redirect('/');
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'ログインに失敗しました。メールアドレスとパスワードを確認してください。' };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // 新規登録時もテスト用メールアドレスであればバイパス
  if (email === TEST_USER.email) {
    revalidatePath('/', 'layout');
    redirect('/');
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: '新規登録に失敗しました。別のメールアドレスをお試しください。' };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function logout() {
  const cookieStore = await cookies();

  if (cookieStore.get('amiro-test-session')?.value === 'true') {
    cookieStore.delete('amiro-test-session');
    revalidatePath('/', 'layout');
    redirect('/login');
    return;
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  redirect('/login?logged_out=true');
}