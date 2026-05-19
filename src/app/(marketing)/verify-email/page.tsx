'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { sendEmailVerification } from 'firebase/auth';

export default function VerifyEmailPage(): React.JSX.Element {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!auth.currentUser) return;
    auth.languageCode = 'zh-TW';
    const continueUrl = `${window.location.origin}/auth/verify`;
    await sendEmailVerification(auth.currentUser, {
      url: continueUrl,
      handleCodeInApp: false,
    });
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  return (
    <div className="center-page">
      <div className="card-form" style={{ textAlign: 'center', maxWidth: 440 }}>
        <Link href="/" className="logo-row" style={{ color: 'inherit', margin: '0 auto 28px', display: 'flex', justifyContent: 'center' }}>
          <img src="/assets/logo-mark.svg" width={32} height={32} alt="" />
          <span className="name">VocalCanvas</span>
        </Link>

        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--cream-200)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width={36} height={36} viewBox="0 0 24 24" className="ico-stroke" strokeWidth={2}>
            <polyline points="22 6 12 13 2 6" />
            <path d="M2 6h20v12H2z" />
          </svg>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
          請到信箱完成驗證
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6, margin: '0 0 24px' }}>
          我們已寄送驗證信到{' '}
          <b style={{ color: 'var(--fg-1)' }}>{user?.email || 'your email'}</b>。
          <br /><br />
          請打開信箱，點擊信中的驗證連結。
          <br />
          驗證完成後會自動帶你進入 VocalCanvas。
        </p>

        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', marginBottom: 16 }}>
          沒收到信？{' '}
          {resent ? (
            <span style={{ fontWeight: 600, color: 'var(--mint-600)' }}>已重新寄送</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--coral-600)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              重寄驗證信
            </button>
          )}
        </div>

        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-3)' }}>
          <button
            type="button"
            onClick={async () => { await logout(); router.push('/login'); }}
            style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            換一個帳號登入
          </button>
        </div>
      </div>
    </div>
  );
}
