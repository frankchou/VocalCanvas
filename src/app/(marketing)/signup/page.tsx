'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type Lang = 'zh' | 'en';

// Signup wave 的 22 個高度，由 sin 函數產生（固定值避免 SSR hydration 不一致）
const SIGNUP_WAVE_HEIGHTS: number[] = Array.from({ length: 22 }, (_, i) => {
  const h = 30 + Math.sin(i * 0.4) * 22 + Math.sin(i * 0.2) * 14;
  return Math.max(14, Math.min(72, Math.round(h)));
});

export default function SignupPage(): React.JSX.Element {
  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('zh');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  // 語言切換時同步更新 document title
  useEffect(() => {
    document.title = lang === 'zh' ? '免費註冊 · VocalCanvas' : 'Sign up · VocalCanvas';
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  }, [lang]);

  const isZh = lang === 'zh';

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!agreed) {
      setError(isZh ? '請先同意使用條款' : 'Please agree to the terms');
      return;
    }
    try {
      await signup(name, email, password);
      router.push('/library');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('email-already-in-use')) {
        setError(isZh ? '此 Email 已被註冊' : 'Email already in use');
      } else if (message.includes('weak-password')) {
        setError(isZh ? '密碼至少 6 個字元' : 'Password must be at least 6 characters');
      } else {
        setError(isZh ? '註冊失敗，請重試' : 'Sign up failed, please try again');
      }
    }
  };

  return (
    <div className="login-page">
      {/* ============ LEFT: BRAND ============ */}
      <aside className="login-brand">
        <Link href="/" className="top" style={{ color: 'inherit' }}>
          <img src="/assets/logo-mark.svg" width={36} height={36} alt="" />
          <span className="name">VocalCanvas</span>
        </Link>

        <div>
          <h2>
            {isZh ? (
              <>30 秒註冊，<br />馬上產出你的第一個音檔。</>
            ) : (
              'Sign up in 30 seconds.'
            )}
          </h2>
          <p className="b-sub">
            {isZh
              ? '免費版每月 30 分鐘音檔額度，6 款精選 AI 聲音任你挑。'
              : 'Free plan includes 30 min/month — no credit card.'}
          </p>

          {/* Signup wave */}
          <div className="login-wave">
            {SIGNUP_WAVE_HEIGHTS.map((h, i) => (
              <span
                key={i}
                style={{ height: h + 'px', animationDelay: `${i * 0.07}s` }}
              />
            ))}
          </div>

          {/* Feature bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(isZh
              ? [
                  '每月 30 分鐘免費額度，不收信用卡',
                  '多語言朗讀（中文、英文、日文）',
                  '隨時可以升級 Pro，也隨時可以取消',
                ]
              : [
                  '30 min/month free — no credit card required',
                  'Multilingual TTS (Chinese, English, Japanese)',
                  'Upgrade to Pro anytime, cancel anytime',
                ]
            ).map((text, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  color: 'rgba(255,252,247,0.9)',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(255,90,60,0.2)',
                    color: 'var(--coral-300)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" className="ico-stroke">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,252,247,0.5)' }}>
          © 2026 VocalCanvas · Made in Taiwan
        </div>
      </aside>

      {/* ============ RIGHT: FORM ============ */}
      <main className="login-form">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
          <div className="lang-switch">
            <button
              className={isZh ? 'active' : ''}
              onClick={() => setLang('zh')}
            >
              中文
            </button>
            <button
              className={!isZh ? 'active' : ''}
              onClick={() => setLang('en')}
            >
              English
            </button>
          </div>
        </div>

        <div className="login-form-inner">
          <h1>{isZh ? '建立帳號' : 'Create account'}</h1>
          <p className="sub">
            {isZh ? '免費開始，產出你的第一個音檔。' : 'Start free. Produce your first audio.'}
          </p>

          {/* OAuth */}
          <div className="oauth-row">
            <button
              className="oauth-btn"
              type="button"
              onClick={async () => {
                try {
                  await loginWithGoogle();
                  router.push('/library');
                } catch {
                  setError(isZh ? 'Google 註冊失敗' : 'Google sign-up failed');
                }
              }}
            >
              <svg width={20} height={20} viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.2 5.2C41.4 35.5 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z" />
              </svg>
              {isZh ? '使用 Google 註冊' : 'Sign up with Google'}
            </button>
{/* TODO: LINE Login — deferred, requires custom token integration
            <button className="oauth-btn" type="button">
              <svg width={20} height={20} viewBox="0 0 24 24">
                <rect width="24" height="24" rx="5" fill="#06C755" />
                <path fill="#fff" d="M19.5 10.7c0-3.36-3.37-6.1-7.5-6.1s-7.5 2.74-7.5 6.1c0 3.01 2.67 5.53 6.28 6.01.24.05.58.16.66.36.07.18.05.47.02.66l-.11.64c-.03.18-.15.74.65.4.8-.33 4.31-2.54 5.88-4.35 1.08-1.19 1.62-2.4 1.62-3.72z" />
              </svg>
              {isZh ? '使用 LINE 註冊' : 'Sign up with LINE'}
            </button>
*/}
{/* TODO: Apple Sign In — deferred, requires paid Apple Developer account
            <button className="oauth-btn" type="button">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="#000">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span>{isZh ? '使用 Apple 註冊' : 'Sign up with Apple'}</span>
            </button>
*/}
          </div>

          <div className="divider">
            <span>{isZh ? '或使用 Email' : 'or use email'}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">{isZh ? '姓名' : 'Name'}</label>
              <input
                type="text"
                id="name"
                placeholder={isZh ? '你的名字' : 'Your name'}
                autoComplete="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
              />
            </div>
            <div className="field">
              <label htmlFor="password">{isZh ? '密碼' : 'Password'}</label>
              <input
                type="password"
                id="password"
                placeholder={isZh ? '至少 8 個字元' : 'At least 8 characters'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  color: 'var(--fg-3)',
                  marginTop: 2,
                }}
              >
                {isZh ? '至少 8 個字元，包含英文與數字' : 'At least 8 characters, including letters and numbers'}
              </span>
            </div>
            {error && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#d94f4f', marginBottom: 4 }}>
                {error}
              </div>
            )}
            <label className="checkbox-row" style={{ margin: '16px 0 20px' }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>
                {isZh ? '我同意 ' : 'I agree to the '}
                <a href="#" className="forgot" style={{ textDecoration: 'underline' }}>
                  {isZh ? '使用條款' : 'Terms of Service'}
                </a>
                {isZh ? ' 與 ' : ' and '}
                <a href="#" className="forgot" style={{ textDecoration: 'underline' }}>
                  {isZh ? '隱私政策' : 'Privacy Policy'}
                </a>
              </span>
            </label>
            <button type="submit" className="btn btn-render submit-btn">
              {isZh ? '建立帳號' : 'Create account'}
            </button>
          </form>

          <div className="signup-row">
            {isZh ? '已經有帳號？' : 'Already have an account?'}
            {' '}
            <Link href="/login">{isZh ? '登入' : 'Sign in'}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
