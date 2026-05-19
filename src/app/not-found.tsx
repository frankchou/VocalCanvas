'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import '@/styles/marketing.css';

// 404 wave 的 28 個高度，由 sin 函數產生（固定值避免 SSR hydration 不一致）
const ERR_WAVE_HEIGHTS: number[] = Array.from({ length: 28 }, (_, i) => {
  const h = 20 + Math.sin(i * 0.45) * 18 + Math.sin(i * 0.2) * 10;
  return Math.max(8, Math.min(50, Math.round(h)));
});

export default function NotFound(): React.JSX.Element {
  // wave spans 在 client hydration 後才掛載，避免 SSR/CSR 不一致
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="error-page">
      <div className="error-content">
        <Link href="/" className="err-logo" style={{ color: 'inherit' }}>
          <img src="/assets/logo-mark.svg" width={32} height={32} alt="" />
          <span className="name">VocalCanvas</span>
        </Link>

        <div className="err-404">404</div>

        <div className="err-wave">
          {mounted && ERR_WAVE_HEIGHTS.map((h, i) => (
            <span
              key={i}
              style={{ height: h + 'px', animationDelay: `${i * 0.06}s` }}
            />
          ))}
        </div>

        <h1 className="err-headline">這裡沒有聲音。</h1>
        <p className="err-sub">
          你找的頁面好像走丟了 —<br />
          也許是連結錯了，也許是頁面搬家了。
        </p>

        <div className="err-ctas">
          <Link href="/" className="btn btn-render">
            <svg width={16} height={16} viewBox="0 0 24 24" className="ico-stroke">
              <path d="M3 12l9-9 9 9" />
              <path d="M5 10v10h14V10" />
            </svg>
            回到首頁
          </Link>
          <button
            className="btn btn-ghost"
            onClick={() => window.history.back()}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" className="ico-stroke">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            回上一頁
          </button>
        </div>

        <div className="err-links">
          <div className="lbl">或前往</div>
          <Link href="/#features">功能介紹</Link>
          <Link href="/#voices">聲音庫</Link>
          <Link href="/#pricing">方案</Link>
          <Link href="/login">登入</Link>
        </div>
      </div>
    </div>
  );
}
