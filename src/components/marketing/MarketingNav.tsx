'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Lang = 'zh' | 'en';

interface MarketingNavProps {
  /** 目前語言，由父元件傳入以保持狀態同步 */
  lang: Lang;
  /** 切換語言的 callback */
  onLangChange: (lang: Lang) => void;
}

/**
 * 行銷頁導覽列
 * sticky + scroll 偵測（>12px 時加 .scrolled class 顯示底線）
 */
export default function MarketingNav({ lang, onLangChange }: MarketingNavProps): React.JSX.Element {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
      <a href="#" className="nav-brand">
        <img src="/assets/logo-mark.svg" width={32} height={32} alt="" />
        <span className="name">VocalCanvas</span>
      </a>
      <div className="nav-links">
        <a href="#features">{lang === 'zh' ? '功能' : 'Features'}</a>
        <a href="#how">{lang === 'zh' ? '如何運作' : 'How It Works'}</a>
        <a href="#voices">{lang === 'zh' ? '聲音庫' : 'Voices'}</a>
        <a href="#pricing">{lang === 'zh' ? '方案' : 'Pricing'}</a>
      </div>
      <div className="nav-right">
        <div className="lang-switch">
          <button
            className={lang === 'zh' ? 'active' : ''}
            onClick={() => onLangChange('zh')}
          >
            中文
          </button>
          <button
            className={lang === 'en' ? 'active' : ''}
            onClick={() => onLangChange('en')}
          >
            English
          </button>
        </div>
        <Link href="/login" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '14px' }}>
          {lang === 'zh' ? '登入' : 'Sign in'}
        </Link>
        <Link href="/login" className="btn btn-render" style={{ padding: '8px 18px', fontSize: '14px' }}>
          {lang === 'zh' ? '免費試用' : 'Free Trial'}
        </Link>
        <button className="nav-menu" aria-label="Menu">
          <svg width={20} height={20} viewBox="0 0 24 24" className="ico-stroke">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
