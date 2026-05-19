'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/app.css';
import AppShell from '@/components/app/AppShell';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { user } = useAuth();
  const router = useRouter();

  // 未登入時導回 /login，等待 sessionStorage 還原後才判斷
  useEffect(() => {
    if (user === null) {
      const saved = sessionStorage.getItem('vc_user');
      if (!saved) router.replace('/login');
    }
  }, [user, router]);

  // 登入狀態確認前不渲染，避免閃爍
  if (user === null && typeof window !== 'undefined' && !sessionStorage.getItem('vc_user')) {
    return <></>;
  }

  return <AppShell>{children}</AppShell>;
}
