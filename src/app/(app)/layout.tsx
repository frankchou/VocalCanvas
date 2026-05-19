'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/app.css';
import AppShell from '@/components/app/AppShell';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { user, authState } = useAuth();
  const router = useRouter();

  // 未登入時導回 /login
  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.replace('/login');
    }
  }, [authState, router]);

  // Firebase 認證狀態確認前顯示載入畫面，避免閃爍
  if (authState === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        Loading…
      </div>
    );
  }

  // 尚未認證時不渲染子頁面（useEffect 會導向 /login）
  if (authState !== 'authenticated') {
    return <></>;
  }

  return <AppShell>{children}</AppShell>;
}
