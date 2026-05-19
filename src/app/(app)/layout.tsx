'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/app.css';
import AppShell from '@/components/app/AppShell';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { user, authState } = useAuth();
  const router = useRouter();

  // 未登入時導回 /login，已登入但未驗證 email 導到驗證頁
  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.replace('/login');
    } else if (authState === 'authenticated' && user && !user.emailVerified) {
      router.replace('/verify-email');
    }
  }, [authState, user, router]);

  // Firebase 認證狀態確認前顯示載入畫面，避免閃爍
  if (authState === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        Loading…
      </div>
    );
  }

  // 尚未認證或未驗證 email 時不渲染子頁面
  if (authState !== 'authenticated' || (user && !user.emailVerified)) {
    return <></>;
  }

  return <AppShell>{children}</AppShell>;
}
