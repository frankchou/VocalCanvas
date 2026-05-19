'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthVerifyPage(): React.JSX.Element {
  const router = useRouter();
  const { user, refreshUser, authState } = useAuth();
  const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking');

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const checkVerification = async () => {
      try {
        await refreshUser();
        // After refresh, check if the user is now verified
        // We need to re-check auth.currentUser since refreshUser reloads it
        const { auth } = await import('@/lib/firebase');
        if (auth.currentUser?.emailVerified) {
          setStatus('success');
          // Short delay so user sees success state
          setTimeout(() => router.push('/library'), 1500);
          return;
        }
      } catch {
        // ignore
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkVerification, 2000);
      } else {
        setStatus('failed');
      }
    };

    if (authState === 'authenticated') {
      checkVerification();
    } else if (authState === 'unauthenticated') {
      // User not logged in — redirect to login
      router.push('/login');
    }
  }, [authState, refreshUser, router]);

  return (
    <div className="center-page">
      <div className="card-form" style={{ textAlign: 'center', maxWidth: 440 }}>
        <Link href="/" className="logo-row" style={{ color: 'inherit', margin: '0 auto 28px', display: 'flex', justifyContent: 'center' }}>
          <img src="/assets/logo-mark.svg" width={32} height={32} alt="" />
          <span className="name">VocalCanvas</span>
        </Link>

        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: status === 'success' ? 'var(--positive-soft)' : 'var(--cream-200)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', transition: 'background 300ms',
        }}>
          {status === 'success' ? (
            <svg width={36} height={36} viewBox="0 0 24 24" className="ico-stroke" strokeWidth={2.5} style={{ color: 'var(--mint-600)' }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width={36} height={36} viewBox="0 0 24 24" className="ico-stroke" strokeWidth={2}>
              <polyline points="22 6 12 13 2 6" />
              <path d="M2 6h20v12H2z" />
            </svg>
          )}
        </div>

        {status === 'checking' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
              正在驗證...
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6 }}>
              確認你的 Email 驗證狀態中，請稍候。
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, margin: '0 0 8px', color: 'var(--mint-600)' }}>
              驗證成功
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6 }}>
              正在進入 VocalCanvas...
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
              尚未完成驗證
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6, margin: '0 0 24px' }}>
              請確認你已點擊信箱中的驗證連結，然後重新整理此頁面。
            </p>
            <button className="btn btn-render submit-btn" onClick={() => window.location.reload()} style={{ width: '100%' }}>
              重新檢查
            </button>
          </>
        )}
      </div>
    </div>
  );
}
