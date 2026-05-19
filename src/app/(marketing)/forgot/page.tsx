'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type FormState = 'form' | 'success';

export default function ForgotPage(): React.JSX.Element {
  const { resetPassword } = useAuth();
  const [formState, setFormState] = useState<FormState>('form');
  const [email, setEmail] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await resetPassword(email);
      setSentEmail(email);
      setFormState('success');
    } catch {
      // Still show success (don't reveal if email exists -- security best practice)
      setSentEmail(email);
      setFormState('success');
    }
  };

  if (formState === 'success') {
    return (
      <div className="center-page">
        <div className="card-form success-state">
          <Link href="/" className="logo-row" style={{ color: 'inherit', margin: '0 auto 28px', display: 'flex', justifyContent: 'center' }}>
            <img src="/assets/logo-mark.svg" width={32} height={32} alt="" />
            <span className="name">VocalCanvas</span>
          </Link>

          <div className="ico-circle">
            <svg width={36} height={36} viewBox="0 0 24 24" className="ico-stroke" strokeWidth={2}>
              <polyline points="22 6 12 13 2 6" />
              <path d="M2 6h20v12H2z" />
            </svg>
          </div>

          <h1>信件已寄出 ✉︎</h1>
          <p className="sub">
            重設密碼的連結已寄到{' '}
            <b style={{ color: 'var(--fg-1)' }}>{sentEmail || 'you@example.com'}</b>。<br />
            連結 30 分鐘內有效，記得查看你的收件匣（也檢查垃圾信件夾）。
          </p>

          <Link href="/login" className="btn btn-primary submit-btn">
            回到登入
          </Link>

          <div className="resend-row">
            沒收到信？
            {resent ? (
              <span style={{ fontWeight: 600, color: 'var(--mint-600)' }}>已重新寄送</span>
            ) : (
              <a
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    await resetPassword(sentEmail);
                    setResent(true);
                  } catch {
                    // silently ignore
                  }
                }}
              >重新寄送</a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="center-page">
      <div className="card-form">
        <Link href="/" className="logo-row" style={{ color: 'inherit' }}>
          <img src="/assets/logo-mark.svg" width={32} height={32} alt="" />
          <span className="name">VocalCanvas</span>
        </Link>

        <h1>忘記密碼了？</h1>
        <p className="sub">輸入你註冊時用的 Email，我們會寄一封重設密碼的連結給你。</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-render submit-btn" style={{ marginTop: 8 }}>
            寄送重設連結
          </button>
        </form>

        <Link href="/login" className="back-link">
          <svg width={16} height={16} viewBox="0 0 24 24" className="ico-stroke">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          回到登入
        </Link>
      </div>
    </div>
  );
}
