'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type Lang = 'zh' | 'en';

// Login wave 的 22 個高度，由 sin 函數產生（固定值避免 SSR hydration 不一致）
const LOGIN_WAVE_HEIGHTS: number[] = Array.from({ length: 22 }, (_, i) => {
  const h = 30 + Math.sin(i * 0.5) * 22 + Math.sin(i * 0.18) * 14;
  return Math.max(14, Math.min(72, Math.round(h)));
});

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const { login, loginWithGoogle, setStaySignedIn } = useAuth();
  const [lang, setLang] = useState<Lang>('zh');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 語言切換時同步更新 document title
  useEffect(() => {
    document.title = lang === 'zh' ? '登入 · VocalCanvas' : 'Sign in · VocalCanvas';
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  }, [lang]);

  const isZh = lang === 'zh';

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/library');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[login] handleSubmit failed:', message);
      setError(isZh ? '帳號或密碼錯誤' : 'Invalid credentials');
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
          <h2
            dangerouslySetInnerHTML={{
              __html: isZh
                ? '歡迎回來。<br/>讓你的文字繼續發聲。'
                : 'Welcome back.<br/>Keep giving voice to words.',
            }}
          />
          <p className="b-sub">
            {isZh
              ? '登入後，繼續編輯你的作品、產出新音檔、管理你收藏的聲音。'
              : "Once you're in, keep editing your takes, render new audio, and manage your saved voices."}
          </p>

          {/* Login wave */}
          <div className="login-wave">
            {LOGIN_WAVE_HEIGHTS.map((h, i) => (
              <span
                key={i}
                style={{ height: h, animationDelay: `${i * 0.07}s` }}
              />
            ))}
          </div>

          <div className="login-quote">
            {isZh
              ? '「我用 VocalCanvas 為我的 podcast 開場做了 12 個版本 — 換個聲音、換個停頓位置，立刻就能比較。比錄音棚快太多。」'
              : '"I made 12 versions of my podcast intro with VocalCanvas — swap a voice, move a pause, compare instantly. Way faster than a studio."'}
            <div className="author">— Mia C. · podcast 創作者</div>
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
              className={lang === 'zh' ? 'active' : ''}
              onClick={() => setLang('zh')}
            >
              中文
            </button>
            <button
              className={lang === 'en' ? 'active' : ''}
              onClick={() => setLang('en')}
            >
              English
            </button>
          </div>
        </div>

        <div className="login-form-inner">
          <h1>{isZh ? '登入' : 'Sign in'}</h1>
          <p className="sub">
            {isZh ? '使用你的帳號繼續創作' : 'Use your account to keep creating'}
          </p>

          {/* OAuth */}
          <div className="oauth-row">
            <button className="oauth-btn" type="button" onClick={async () => {
              try {
                await loginWithGoogle();
                router.push('/library');
              } catch (err) {
                setError(isZh ? 'Google 登入失敗' : 'Google sign-in failed');
              }
            }}>
              <svg width={20} height={20} viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.2 5.2C41.4 35.5 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z" />
              </svg>
              <span>{isZh ? '使用 Google 繼續' : 'Continue with Google'}</span>
            </button>

{/* TODO: LINE Login — deferred, requires custom token integration
            <button className="oauth-btn" type="button">
              <svg width={20} height={20} viewBox="0 0 24 24">
                <rect width="24" height="24" rx="5" fill="#06C755" />
                <path fill="#fff" d="M19.5 10.7c0-3.36-3.37-6.1-7.5-6.1s-7.5 2.74-7.5 6.1c0 3.01 2.67 5.53 6.28 6.01.24.05.58.16.66.36.07.18.05.47.02.66l-.11.64c-.03.18-.15.74.65.4.8-.33 4.31-2.54 5.88-4.35 1.08-1.19 1.62-2.4 1.62-3.72zM9.36 12.65H7.87c-.22 0-.4-.18-.4-.4V9.27c0-.22.18-.4.4-.4.22 0 .4.18.4.4v2.58h1.1c.22 0 .4.18.4.4-.01.22-.18.4-.41.4zm1.66-.4c0 .22-.18.4-.4.4-.22 0-.4-.18-.4-.4V9.27c0-.22.18-.4.4-.4.22 0 .4.18.4.4v2.98zm3.55 0c0 .17-.11.32-.27.38-.04.01-.09.02-.13.02-.13 0-.25-.06-.32-.16l-1.52-2.07v1.83c0 .22-.18.4-.4.4-.22 0-.4-.18-.4-.4V9.27c0-.17.11-.32.27-.38.04-.01.09-.02.13-.02.13 0 .25.06.32.16l1.52 2.07V9.27c0-.22.18-.4.4-.4.22 0 .4.18.4.4v2.98zm2.39-1.89c.22 0 .4.18.4.4 0 .22-.18.4-.4.4h-1.1v.69h1.1c.22 0 .4.18.4.4 0 .22-.18.4-.4.4h-1.5c-.22 0-.4-.18-.4-.4V9.27c0-.22.18-.4.4-.4h1.5c.22 0 .4.18.4.4 0 .22-.18.4-.4.4h-1.1v.69h1.1z" />
              </svg>
              <span>{isZh ? '使用 LINE 繼續' : 'Continue with LINE'}</span>
            </button>
*/}

{/* TODO: Apple Sign In — deferred, requires paid Apple Developer account
            <button className="oauth-btn" type="button">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="#000">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span>{isZh ? '使用 Apple 繼續' : 'Continue with Apple'}</span>
            </button>
*/}
          </div>

          <div className="divider">
            <span>{isZh ? '或使用 Email' : 'or use email'}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">{isZh ? 'Email' : 'Email'}</label>
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
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
            </div>
            {error && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#d94f4f', marginBottom: 4 }}>
                {error}
              </div>
            )}
            <div className="field-row">
              <label className="checkbox-row">
                <input type="checkbox" onChange={(e) => setStaySignedIn(e.target.checked)} />
                <span>{isZh ? '保持登入' : 'Stay signed in'}</span>
              </label>
              <Link href="/forgot" className="forgot">
                {isZh ? '忘記密碼？' : 'Forgot password?'}
              </Link>
            </div>
            <button type="submit" className="btn btn-render submit-btn">
              {isZh ? '登入' : 'Sign in'}
            </button>
          </form>

          <div className="signup-row">
            <span>{isZh ? '還沒有帳號？' : 'No account yet?'}</span>
            {' '}
            <Link href="/signup">{isZh ? '免費註冊' : 'Sign up free'}</Link>
          </div>

          <p className="legal">
            <span>{isZh ? '登入即代表你同意我們的' : 'By signing in, you agree to our'}</span>
            {' '}
            <a href="#">{isZh ? '使用條款' : 'Terms'}</a>
            {' '}
            <span>{isZh ? '與' : 'and'}</span>
            {' '}
            <a href="#">{isZh ? '隱私政策' : 'Privacy Policy'}</a>
            {isZh ? '。' : '.'}
          </p>
        </div>
      </main>
    </div>
  );
}
