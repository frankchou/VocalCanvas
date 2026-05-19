'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Lang = 'zh' | 'en';

// 語言文字對照表
const COPY = {
  nav: {
    links: {
      features: { zh: '功能', en: 'Features' },
      scenarios: { zh: '情境模式', en: 'Scenarios' },
      how: { zh: '如何運作', en: 'How It Works' },
      voices: { zh: '聲音庫', en: 'Voices' },
      pricing: { zh: '方案', en: 'Pricing' },
    },
    langZh: { zh: '中文', en: '中文' },
    langEn: { zh: 'English', en: 'English' },
    login: { zh: '登入', en: 'Sign in' },
    trial: { zh: '免費試用', en: 'Free Trial' },
  },
  hero: {
    eyebrow: { zh: 'AI 語音朗讀 · 情境模式 · 多語言', en: 'AI Voice · Scenarios · Multilingual' },
    h1Line1: { zh: '讓你的文字', en: 'Give Your Words' },
    h1Sunset: { zh: '擁有聲音', en: 'a Voice' },
    h1End: { zh: '。', en: '.' },
    sub: {
      zh: '挑一個情境 — 冥想、睡前故事、Podcast 開場 — AI 自動配好聲音與背景音樂。也可以從零自訂，插入停頓、微調音色，產出像對話一樣自然的音檔。',
      en: 'Pick a scenario — meditation, bedtime story, podcast intro — and AI sets the voice and background music. Or start from scratch: insert pauses, tune the timbre, and produce natural-sounding audio.',
    },
    ctaStart: { zh: '開始免費試用', en: 'Start Free Trial' },
    ctaDemo: { zh: '看示範', en: 'Watch Demo' },
    trustCount: { zh: '已有', en: 'Over' },
    trustText: { zh: '位創作者使用 VocalCanvas 製作配音', en: 'creators use VocalCanvas for voice production' },
    trustNum: '2,400+',
  },
  features: {
    eyebrow: { zh: '核心功能', en: 'Core Features' },
    title: { zh: '不只是 TTS — 是\n有溫度的語音工具。', en: 'Not just TTS —\na voice tool with soul.' },
    sub: {
      zh: '挑性別、調音色、插入停頓、選播放速度。從文字到音檔，每一步都在你的掌握之中。',
      en: 'Choose gender, tune timbre, insert pauses, set playback speed. Every step from text to audio is in your hands.',
    },
    f1Title: { zh: '男聲 / 女聲，精選預設', en: 'Male / Female, Curated Presets' },
    f1Body: {
      zh: '從六款精選聲音中挑選 — 晨光、夜霧、焰心、清玻 — 每一款都是 AI 訓練出的細緻音色。也可以從零開始打造你的聲音。',
      en: 'Choose from six curated voices — Dawn, Mist, Ember, Glass — each a finely tuned AI voice. Or build your own from scratch.',
    },
    f2Title: { zh: '百分比拉桿，精細微調', en: 'Percentage Sliders, Fine Control' },
    f2Body: {
      zh: '年齡、音高（低沉↔高亢）、音色（溫柔↔粗獷） — 用直觀的百分比拉桿，把聲音調整到你心中的那個樣子。',
      en: 'Age, pitch (deep↔high), timbre (gentle↔rough) — intuitive percentage sliders let you shape the voice exactly how you imagine it.',
    },
    f3Title: { zh: '停頓標籤，讓聲音呼吸', en: 'Pause Tags, Let the Voice Breathe' },
    f3Body: {
      zh: '在任何地方插入 <delay 0.8s> 讓 AI 在那裡停一下。長度自由設定，朗讀像對話、像呼吸。',
      en: 'Insert <delay 0.8s> anywhere to make AI pause there. Set any duration — reading flows like conversation, like breathing.',
    },
  },
  how: {
    eyebrow: { zh: '四步驟，從文字到音檔', en: 'Four Steps, Text to Audio' },
    title: { zh: '流程簡單到\n不像 AI 工具。', en: 'Simple enough to not\nfeel like an AI tool.' },
    s1Title: { zh: '挑一個聲音', en: 'Pick a Voice' },
    s1Body: { zh: '男聲或女聲，從預設庫挑或自己調。', en: 'Male or female, choose from presets or customize.' },
    s2Title: { zh: '編輯朗讀稿', en: 'Edit Your Script' },
    s2Body: { zh: '貼上文字，在重點處插入停頓標籤。', en: 'Paste text, insert pause tags at key moments.' },
    s3Title: { zh: '產出音檔', en: 'Render Audio' },
    s3Body: { zh: 'AI 朗讀，10 秒內試聽完成品。', en: 'AI reads it out. Preview the result in 10 seconds.' },
    s4Title: { zh: '收藏或下載', en: 'Save or Download' },
    s4Body: { zh: '調整播放速度，存到作品庫或下載 mp3。', en: 'Adjust playback speed, save to library or download mp3.' },
  },
  voices: {
    eyebrow: { zh: '聲音庫', en: 'Voice Library' },
    title: { zh: '六款精選 AI 聲音，\n每一款都有性格。', en: 'Six curated AI voices,\neach with character.' },
    sub: {
      zh: '每一款預設聲音都經過細緻調校，符合不同的使用情境。你可以直接用，也可以基於它再微調。',
      en: 'Every preset voice is carefully tuned for different use cases. Use them as-is, or fine-tune from there.',
    },
    viewAll: { zh: '查看全部聲音 →', en: 'View All Voices →' },
  },
  usecases: {
    eyebrow: { zh: '適合誰', en: 'Who It\'s For' },
    title: { zh: '不管你做什麼，\nVocalCanvas 都能幫你發聲。', en: 'Whatever you do,\nVocalCanvas gives you a voice.' },
    uc1Title: { zh: 'Podcast 創作者', en: 'Podcast Creators' },
    uc1Body: {
      zh: '快速產出開場白、廣告插入、節目片頭 — 不用再開錄音室，半小時搞定一集前後段。',
      en: 'Quickly produce intros, ad reads, and episode openers — no studio needed, half an hour handles an episode\'s bookends.',
    },
    uc2Title: { zh: '內容行銷團隊', en: 'Content Marketing Teams' },
    uc2Body: {
      zh: '短影音配音、品牌廣告、社群影片旁白 — 不用每次都找配音員，自己改一個字就重新產出。',
      en: 'Short video voiceovers, brand ads, social media narration — no need to hire a voice actor every time, change one word and re-render.',
    },
    uc3Title: { zh: '教育與線上課程', en: 'Education & Online Courses' },
    uc3Body: {
      zh: '教材朗讀、語言學習素材、無障礙閱讀 — 多語言支援讓內容跨越語言界線。',
      en: 'Courseware narration, language learning materials, accessible reading — multilingual support lets content cross language barriers.',
    },
    uc4Title: { zh: '個人創作者', en: 'Independent Creators' },
    uc4Body: {
      zh: '自己的小說朗讀、有聲書試讀、社群短影音 — 把文字變成有溫度的聲音，再分享出去。',
      en: 'Novel readings, audiobook previews, social shorts — turn text into warm, expressive audio and share it with the world.',
    },
  },
  pricing: {
    eyebrow: { zh: '方案', en: 'Plans' },
    title: { zh: '先試試，再決定。', en: 'Try first, decide later.' },
    sub: {
      zh: '免費版就能體驗完整功能，需要更長音檔再升級。',
      en: 'The free plan gives you the full experience. Upgrade when you need more.',
    },
    freeDesc: { zh: '適合先試用、個人小作品', en: 'Great for trying out & personal projects' },
    freePriceSub: { zh: '每月 30 分鐘音檔額度', en: '30 minutes of audio per month' },
    freeF1: { zh: '4 款精選聲音預設', en: '4 curated voice presets' },
    freeF2: { zh: '音檔最長 3 分鐘', en: 'Up to 3 minutes per audio' },
    freeF3: { zh: 'mp3 240 kbps 下載', en: 'mp3 240 kbps download' },
    freeF4: { zh: '5 個作品庫存量', en: '5 works in library' },
    freeCta: { zh: '免費開始', en: 'Start Free' },
    proDesc: { zh: '創作者 & 內容團隊', en: 'Creators & Content Teams' },
    proPriceSub: { zh: '每月 600 分鐘音檔額度 · 年付 9 折', en: '600 minutes/month · 10% off annual' },
    proF1: { zh: '全部 6 款聲音 + 自訂預設', en: 'All 6 voices + custom presets' },
    proF2: { zh: '音檔最長 60 分鐘', en: 'Up to 60 minutes per audio' },
    proF3: { zh: 'wav 高音質下載', en: 'wav high-quality download' },
    proF4: { zh: '無限作品庫', en: 'Unlimited library' },
    proF5: { zh: '商業使用授權', en: 'Commercial license' },
    proF6: { zh: '優先 AI 算力', en: 'Priority AI compute' },
    proCta: { zh: '升級 Pro', en: 'Upgrade to Pro' },
  },
  finalCta: {
    title: { zh: '準備好讓你的文字\n擁有聲音了嗎？', en: 'Ready to give your words\na voice?' },
    sub: { zh: '免費註冊，30 秒就能產出第一個音檔。', en: 'Sign up free. Produce your first audio in 30 seconds.' },
    cta: { zh: '開始免費試用', en: 'Start Free Trial' },
  },
  footer: {
    brandDesc: {
      zh: '用 AI 把文字變成有溫度的聲音。多語言支援，為每一段文字找到屬於它的聲音。',
      en: 'Turn text into warm, expressive AI voice. Multilingual support for every piece of writing.',
    },
    colProduct: { zh: '產品', en: 'Product' },
    colProductLinks: {
      features: { zh: '功能介紹', en: 'Features' },
      scenarios: { zh: '情境模式', en: 'Scenarios' },
      voices: { zh: '聲音庫', en: 'Voices' },
      pricing: { zh: '方案', en: 'Pricing' },
      changelog: { zh: '更新紀錄', en: 'Changelog' },
    },
    colResources: { zh: '資源', en: 'Resources' },
    colResourcesLinks: {
      tutorial: { zh: '使用教學', en: 'Tutorial' },
      api: { zh: 'API 文件', en: 'API Docs' },
      blog: { zh: '部落格', en: 'Blog' },
      support: { zh: '客服中心', en: 'Support' },
    },
    colCompany: { zh: '公司', en: 'Company' },
    colCompanyLinks: {
      about: { zh: '關於我們', en: 'About' },
      contact: { zh: '聯絡我們', en: 'Contact' },
      privacy: { zh: '隱私政策', en: 'Privacy' },
      terms: { zh: '使用條款', en: 'Terms' },
    },
    copyright: { zh: '© 2026 VocalCanvas. All rights reserved.', en: '© 2026 VocalCanvas. All rights reserved.' },
    made: { zh: 'Made with ❤︎ in Taiwan', en: 'Made with ❤︎ in Taiwan' },
  },
} as const;

function t(key: { zh: string; en: string }, lang: Lang): string {
  return key[lang];
}

// Hero wave 的 32 個高度，由 sin 函數產生（固定值避免 SSR hydration 不一致）
const HERO_WAVE_HEIGHTS: number[] = Array.from({ length: 32 }, (_, i) => {
  const h = 30 + Math.sin(i * 0.45) * 30 + Math.sin(i * 0.15) * 20;
  return Math.max(20, Math.min(110, Math.round(h)));
});

// 各聲音的 mini-wave 高度
const VOICE_WAVES = {
  dawn: [6, 12, 18, 14, 8, 12, 18, 22, 16, 10, 14, 8],
  mist: [4, 8, 14, 20, 16, 10, 6, 12, 18, 14, 8, 12],
  ember: [8, 14, 22, 18, 12, 16, 20, 14, 8, 12, 18, 22],
  glass: [6, 10, 14, 12, 8, 14, 18, 12, 8, 14, 18, 12],
} as const;

export default function MarketingPage(): React.JSX.Element {
  const [lang, setLang] = useState<Lang>('zh');
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Scroll 偵測
  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* ============ NAV ============ */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} id="nav" ref={navRef}>
        <a href="#" className="nav-brand">
          <img src="/assets/logo-mark.svg" width={32} height={32} alt="" />
          <span className="name">VocalCanvas</span>
        </a>
        <div className="nav-links">
          <a href="#features">{t(COPY.nav.links.features, lang)}</a>
          <a href="#scenarios">{t(COPY.nav.links.scenarios, lang)}</a>
          <a href="#how">{t(COPY.nav.links.how, lang)}</a>
          <a href="#voices">{t(COPY.nav.links.voices, lang)}</a>
          <a href="#pricing">{t(COPY.nav.links.pricing, lang)}</a>
        </div>
        <div className="nav-right">
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
          <Link href="/login" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '14px' }}>
            {t(COPY.nav.login, lang)}
          </Link>
          <Link href="/signup" className="btn btn-render" style={{ padding: '8px 18px', fontSize: '14px' }}>
            {t(COPY.nav.trial, lang)}
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

      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="hero-grid">
          {/* 左欄 */}
          <div>
            <div className="eyebrow">{t(COPY.hero.eyebrow, lang)}</div>
            <h1>
              {t(COPY.hero.h1Line1, lang)}
              <br />
              <span className="sunset">{t(COPY.hero.h1Sunset, lang)}</span>
              {t(COPY.hero.h1End, lang)}
            </h1>
            <p className="hero-sub">{t(COPY.hero.sub, lang)}</p>
            <div className="hero-ctas">
              <Link href="/signup" className="btn btn-render btn-lg">
                <svg width={18} height={18} viewBox="0 0 24 24" className="ico-stroke">
                  <path d="M12 3l1.5 5 5 1.5-5 1.5L12 16l-1.5-5-5-1.5 5-1.5L12 3z" />
                </svg>
                {t(COPY.hero.ctaStart, lang)}
              </Link>
              <a href="#how" className="btn btn-ghost btn-lg">{t(COPY.hero.ctaDemo, lang)}</a>
            </div>
            <div className="hero-trust">
              <div className="avatars">
                <div />
                <div />
                <div />
                <div />
              </div>
              <span>
                {t(COPY.hero.trustCount, lang)}{' '}
                <b style={{ color: 'var(--fg-1)' }}>{COPY.hero.trustNum}</b>{' '}
                {t(COPY.hero.trustText, lang)}
              </span>
            </div>
          </div>

          {/* 右欄 */}
          <div style={{ position: 'relative' }}>
            {/* Floating script snippet */}
            <div className="hero-snippet">
              歡迎來到 VocalCanvas{' '}
              <span className="tag">&lt;delay 0.8s&gt;</span>
              {' '}讓你的文字{' '}
              <span className="tag">&lt;delay 0.5s&gt;</span>{' '}
              擁有聲音。
            </div>

            <div className="hero-stage">
              <div className="hero-stage-head">
                <div>
                  <h3 className="hero-stage-title">產品介紹 · 中文版</h3>
                  <div className="hero-stage-sub">晨光 · Dawn · 中文 (繁體) · mp3 240 kbps</div>
                </div>
                <span className="preset-chip">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint-500)' }} />
                  就緒
                </span>
              </div>

              {/* Hero wave — 固定高度陣列 */}
              <div className="hero-wave">
                {HERO_WAVE_HEIGHTS.map((h, i) => (
                  <span
                    key={i}
                    style={{ height: h + 'px', animationDelay: `${i * 0.06}s` }}
                  />
                ))}
              </div>

              <div className="hero-stage-controls">
                <button className="hero-stage-btn" aria-label="Play">
                  <svg width={22} height={22} viewBox="0 0 24 24" className="ico-fill">
                    <polygon points="6 4 20 12 6 20 6 4" />
                  </svg>
                </button>
                <div className="hero-stage-progress">
                  <div className="bar">
                    <div className="fill" />
                  </div>
                  <div className="times">
                    <span>00:26</span>
                    <span>01:08</span>
                  </div>
                </div>
                <div className="hero-stage-speed">
                  <span>0.5×</span>
                  <span>0.75×</span>
                  <span className="active">1×</span>
                  <span>1.25×</span>
                  <span>1.5×</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="section" id="features">
        <div className="eyebrow">{t(COPY.features.eyebrow, lang)}</div>
        <h2 className="section-title">
          {t(COPY.features.title, lang).split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </h2>
        <p className="section-sub">{t(COPY.features.sub, lang)}</p>

        <div className="features">
          <div className="feature">
            <div className="ico-wrap">
              <svg width={28} height={28} viewBox="0 0 24 24" className="ico-stroke">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <h3>{t(COPY.features.f1Title, lang)}</h3>
            <p>{t(COPY.features.f1Body, lang)}</p>
          </div>
          <div className="feature">
            <div className="ico-wrap" style={{ background: 'var(--info-soft)', color: 'var(--violet-600)' }}>
              <svg width={28} height={28} viewBox="0 0 24 24" className="ico-stroke">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h3>{t(COPY.features.f2Title, lang)}</h3>
            <p>{t(COPY.features.f2Body, lang)}</p>
          </div>
          <div className="feature">
            <div className="ico-wrap" style={{ background: 'var(--positive-soft)', color: 'var(--mint-600)' }}>
              <svg width={28} height={28} viewBox="0 0 24 24" className="ico-stroke">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3>{t(COPY.features.f3Title, lang)}</h3>
            <p>
              {lang === 'zh'
                ? <>在任何地方插入{' '}
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--info-soft)', color: 'var(--violet-600)', padding: '2px 6px', borderRadius: 6 }}>
                      &lt;delay 0.8s&gt;
                    </code>{' '}
                    讓 AI 在那裡停一下。長度自由設定，朗讀像對話、像呼吸。
                  </>
                : <>Insert{' '}
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--info-soft)', color: 'var(--violet-600)', padding: '2px 6px', borderRadius: 6 }}>
                      &lt;delay 0.8s&gt;
                    </code>{' '}
                    anywhere to make AI pause there. Set any duration — reading flows like conversation, like breathing.
                  </>
              }
            </p>
          </div>
        </div>
      </section>

      {/* ============ SCENARIOS ============ */}
      <section id="scenarios" style={{ padding: '96px 48px', maxWidth: 1280, margin: '0 auto' }}>
        <p className="eyebrow">{lang === 'zh' ? '情境模式' : 'Scenarios'}</p>
        <h2 className="section-title">
          {lang === 'zh'
            ? <>不只是配音 — 是有<span className="sunset">情境</span>的聲音作品。</>
            : <>Not just audio — a voice with <span className="sunset">context</span>.</>}
        </h2>
        <p className="section-sub">
          {lang === 'zh'
            ? '一鍵選擇情境，VocalCanvas 自動配好聲音、音色、與背景音樂。產出時混音為單一音檔，下載即用。'
            : 'Choose a scenario and VocalCanvas sets the voice, timbre, and background music automatically. Renders as a single mixed audio file, ready to download.'}
        </p>

        <div className="scenarios-grid">
          {/* 冥想 */}
          <div className="scenario-card" style={{ background: 'linear-gradient(135deg, #7AE5C0 0%, #6E52F2 100%)' }}>
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="2.2" />
                <path d="M12 7.5v3.5" />
                <path d="M7.5 19c1.5-4 3-6 4.5-6s3 2 4.5 6" />
                <path d="M4.5 19h15" />
              </svg>
            </div>
            <h4>{lang === 'zh' ? '冥想' : 'Meditation'}</h4>
            <div className="sub-en">Meditation · 柔和 · 緩慢 · 低沉</div>
            <p className="desc">
              {lang === 'zh'
                ? '引導冥想、瑜珈靜心、正念呼吸 — 配上海浪、森林或頌缽聲，讓人沉浸下來。'
                : 'Guided meditation, yoga stillness, mindful breathing — paired with ocean waves, forest sounds or singing bowls.'}
            </p>
            <div className="bgm-row">
              <span className="bgm-chip">🌊 {lang === 'zh' ? '海浪' : 'Ocean'}</span>
              <span className="bgm-chip">🌲 {lang === 'zh' ? '森林' : 'Forest'}</span>
              <span className="bgm-chip">◉ {lang === 'zh' ? '頌缽' : 'Singing Bowl'}</span>
            </div>
          </div>

          {/* 睡前故事 */}
          <div className="scenario-card" style={{ background: 'linear-gradient(135deg, #6E52F2 0%, #FF85A8 100%)' }}>
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
            <h4>{lang === 'zh' ? '睡前故事' : 'Bedtime Story'}</h4>
            <div className="sub-en">Bedtime · 溫暖 · 輕柔</div>
            <p className="desc">
              {lang === 'zh'
                ? '親子睡前故事、安眠引導、ASMR 朗讀 — 雨聲與輕鋼琴讓孩子（或自己）安心入眠。'
                : "Bedtime stories, sleep guidance, ASMR reading — rain and soft piano help children (or yourself) drift off peacefully."}
            </p>
            <div className="bgm-row">
              <span className="bgm-chip">💧 {lang === 'zh' ? '雨聲' : 'Rain'}</span>
              <span className="bgm-chip">♪ {lang === 'zh' ? '輕鋼琴' : 'Soft Piano'}</span>
              <span className="bgm-chip">🌲 {lang === 'zh' ? '森林' : 'Forest'}</span>
            </div>
          </div>

          {/* 正念肯定語 */}
          <div className="scenario-card" style={{ background: 'linear-gradient(135deg, #FFC785 0%, #F25C8A 100%)' }}>
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.5 5 5 1.5-5 1.5L12 16l-1.5-5-5-1.5 5-1.5L12 3z" />
                <path d="M19 14l.7 2.3 2.3.7-2.3.7L19 20l-.7-2.3L16 17l2.3-.7z" />
              </svg>
            </div>
            <h4>{lang === 'zh' ? '正念肯定語' : 'Affirmations'}</h4>
            <div className="sub-en">Affirmation · 柔和 · 堅定</div>
            <p className="desc">
              {lang === 'zh'
                ? '每日自我肯定、療癒練習、靈性內容 — 頌缽與環境音帶來凝聚的能量場。'
                : 'Daily affirmations, healing practice, spiritual content — singing bowls and ambient sounds create a grounding energy field.'}
            </p>
            <div className="bgm-row">
              <span className="bgm-chip">◉ {lang === 'zh' ? '頌缽' : 'Singing Bowl'}</span>
              <span className="bgm-chip">≈ {lang === 'zh' ? '環境音' : 'Ambient'}</span>
              <span className="bgm-chip">♪ {lang === 'zh' ? '輕鋼琴' : 'Soft Piano'}</span>
            </div>
          </div>

          {/* Podcast 開場 */}
          <div className="scenario-card" style={{ background: 'linear-gradient(135deg, #FF5A3C 0%, #FFA94D 100%)' }}>
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <h4>{lang === 'zh' ? 'Podcast 開場' : 'Podcast Intro'}</h4>
            <div className="sub-en">Podcast intro · 清亮 · 動感</div>
            <p className="desc">
              {lang === 'zh'
                ? '節目片頭、廣告插入、結尾 outro — 動感節拍或電影感配樂，讓你的節目專業感倍增。'
                : 'Episode intros, ad reads, outros — dynamic beats or cinematic music that makes your show sound professional.'}
            </p>
            <div className="bgm-row">
              <span className="bgm-chip">♬ {lang === 'zh' ? '動感節拍' : 'Upbeat'}</span>
              <span className="bgm-chip">▲ {lang === 'zh' ? '電影感' : 'Cinematic'}</span>
              <span className="bgm-chip">○ {lang === 'zh' ? '純朗讀' : 'Voice Only'}</span>
            </div>
          </div>

          {/* 廣告 */}
          <div className="scenario-card" style={{ background: 'linear-gradient(135deg, #F25C8A 0%, #FF5A3C 50%, #FFA94D 100%)' }}>
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 22 22 3 13 3 11" />
                <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
              </svg>
            </div>
            <h4>{lang === 'zh' ? '廣告' : 'Advertisement'}</h4>
            <div className="sub-en">Advertisement · 自信 · 有節奏</div>
            <p className="desc">
              {lang === 'zh'
                ? '社群短影音配音、品牌廣告、活動宣傳 — 自動混合人聲與背景音，無需後製。'
                : 'Social video voiceovers, brand ads, event promos — auto-mixed voice and music, no post-production needed.'}
            </p>
            <div className="bgm-row">
              <span className="bgm-chip">♬ {lang === 'zh' ? '動感節拍' : 'Upbeat'}</span>
              <span className="bgm-chip">▲ {lang === 'zh' ? '電影感' : 'Cinematic'}</span>
            </div>
          </div>

          {/* 有聲書 */}
          <div className="scenario-card" style={{ background: 'linear-gradient(135deg, #2A271F 0%, #6C6757 100%)' }}>
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h4>{lang === 'zh' ? '有聲書' : 'Audiobook'}</h4>
            <div className="sub-en">Audiobook · 沉穩 · 清晰</div>
            <p className="desc">
              {lang === 'zh'
                ? '小說朗讀、有聲書試讀、長篇文章 — 純人聲或搭輕鋼琴，專注於文字本身。'
                : 'Novel readings, audiobook previews, long-form articles — voice only or with soft piano, focused on the words.'}
            </p>
            <div className="bgm-row">
              <span className="bgm-chip">○ {lang === 'zh' ? '純朗讀' : 'Voice Only'}</span>
              <span className="bgm-chip">♪ {lang === 'zh' ? '輕鋼琴' : 'Soft Piano'}</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-2)', marginBottom: 20 }}>
            {lang === 'zh'
              ? '或選「自訂」從零打造 — 9 款 BGM 任你混搭。'
              : 'Or choose "Custom" to build from scratch — mix and match from 9 BGM tracks.'}
          </p>
          <a href="/new" className="btn btn-render">
            {lang === 'zh' ? '✦ 免費試用情境模式' : '✦ Try Scenarios Free'}
          </a>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section
        className="section"
        id="how"
        style={{ background: 'var(--cream-100)', maxWidth: 'none', paddingLeft: 0, paddingRight: 0 }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
          <div className="eyebrow">{t(COPY.how.eyebrow, lang)}</div>
          <h2 className="section-title">
            {t(COPY.how.title, lang).split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h2>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">1</div>
              <h4>{t(COPY.how.s1Title, lang)}</h4>
              <p>{t(COPY.how.s1Body, lang)}</p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <h4>{t(COPY.how.s2Title, lang)}</h4>
              <p>{t(COPY.how.s2Body, lang)}</p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <h4>{t(COPY.how.s3Title, lang)}</h4>
              <p>{t(COPY.how.s3Body, lang)}</p>
            </div>
            <div className="step-card">
              <div className="step-num">4</div>
              <h4>{t(COPY.how.s4Title, lang)}</h4>
              <p>{t(COPY.how.s4Body, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ VOICES TEASER ============ */}
      <section className="section" id="voices">
        <div className="eyebrow">{t(COPY.voices.eyebrow, lang)}</div>
        <h2 className="section-title">
          {t(COPY.voices.title, lang).split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </h2>
        <p className="section-sub">{t(COPY.voices.sub, lang)}</p>

        <div className="voices-row">
          {/* Dawn */}
          <div className="voice-card">
            <div className="orb v-dawn" />
            <h4>晨光 · Dawn</h4>
            <div className="meta">female · warm · bright</div>
            <div className="play-row">
              <button className="play-btn">
                <svg width={12} height={12} viewBox="0 0 24 24" className="ico-fill">
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
              </button>
              <div className="mini-wave">
                {VOICE_WAVES.dawn.map((h, i) => (
                  <span key={i} style={{ height: h + 'px' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Mist */}
          <div className="voice-card">
            <div className="orb v-mist" />
            <h4>夜霧 · Mist</h4>
            <div className="meta">male · deep · gentle</div>
            <div className="play-row">
              <button className="play-btn">
                <svg width={12} height={12} viewBox="0 0 24 24" className="ico-fill">
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
              </button>
              <div className="mini-wave">
                {VOICE_WAVES.mist.map((h, i) => (
                  <span key={i} style={{ height: h + 'px' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Ember */}
          <div className="voice-card">
            <div className="orb v-ember" />
            <h4>焰心 · Ember</h4>
            <div className="meta">female · rough · playful</div>
            <div className="play-row">
              <button className="play-btn">
                <svg width={12} height={12} viewBox="0 0 24 24" className="ico-fill">
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
              </button>
              <div className="mini-wave">
                {VOICE_WAVES.ember.map((h, i) => (
                  <span key={i} style={{ height: h + 'px' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Glass */}
          <div className="voice-card">
            <div className="orb v-glass" />
            <h4>清玻 · Glass</h4>
            <div className="meta">male · cool · soft</div>
            <div className="play-row">
              <button className="play-btn">
                <svg width={12} height={12} viewBox="0 0 24 24" className="ico-fill">
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
              </button>
              <div className="mini-wave">
                {VOICE_WAVES.glass.map((h, i) => (
                  <span key={i} style={{ height: h + 'px' }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link href="/signup" className="btn btn-ghost">{t(COPY.voices.viewAll, lang)}</Link>
        </div>
      </section>

      {/* ============ USE CASES ============ */}
      <section
        className="section"
        style={{ background: 'var(--cream-100)', maxWidth: 'none', paddingLeft: 0, paddingRight: 0 }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
          <div className="eyebrow">{t(COPY.usecases.eyebrow, lang)}</div>
          <h2 className="section-title">
            {t(COPY.usecases.title, lang).split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h2>

          <div className="usecase-grid">
            <div className="usecase">
              <div className="uc-ico">
                <svg width={28} height={28} viewBox="0 0 24 24" className="ico-stroke">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1v-7h3v5zM3 19a2 2 0 0 0 2 2h1v-7H3v5z" />
                </svg>
              </div>
              <div>
                <h4>{t(COPY.usecases.uc1Title, lang)}</h4>
                <p>{t(COPY.usecases.uc1Body, lang)}</p>
              </div>
            </div>
            <div className="usecase">
              <div className="uc-ico" style={{ color: 'var(--violet-600)' }}>
                <svg width={28} height={28} viewBox="0 0 24 24" className="ico-stroke">
                  <rect x="3" y="3" width="18" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <div>
                <h4>{t(COPY.usecases.uc2Title, lang)}</h4>
                <p>{t(COPY.usecases.uc2Body, lang)}</p>
              </div>
            </div>
            <div className="usecase">
              <div className="uc-ico" style={{ color: 'var(--mint-600)' }}>
                <svg width={28} height={28} viewBox="0 0 24 24" className="ico-stroke">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div>
                <h4>{t(COPY.usecases.uc3Title, lang)}</h4>
                <p>{t(COPY.usecases.uc3Body, lang)}</p>
              </div>
            </div>
            <div className="usecase">
              <div className="uc-ico" style={{ color: 'var(--coral-600)' }}>
                <svg width={28} height={28} viewBox="0 0 24 24" className="ico-stroke">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <div>
                <h4>{t(COPY.usecases.uc4Title, lang)}</h4>
                <p>{t(COPY.usecases.uc4Body, lang)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="section" id="pricing">
        <div style={{ textAlign: 'center' }}>
          <div className="eyebrow">{t(COPY.pricing.eyebrow, lang)}</div>
          <h2 className="section-title" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            {t(COPY.pricing.title, lang)}
          </h2>
          <p className="section-sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            {t(COPY.pricing.sub, lang)}
          </p>
        </div>

        <div className="pricing-grid">
          {/* Free plan */}
          <div className="plan">
            <h3>Free</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', margin: 0 }}>
              {t(COPY.pricing.freeDesc, lang)}
            </p>
            <div className="price">NT$0<small>/月</small></div>
            <div className="price-sub">{t(COPY.pricing.freePriceSub, lang)}</div>
            <ul>
              {([
                COPY.pricing.freeF1,
                COPY.pricing.freeF2,
                COPY.pricing.freeF3,
                COPY.pricing.freeF4,
              ] as const).map((item, i) => (
                <li key={i}>
                  <svg width={18} height={18} viewBox="0 0 24 24" className="ico-stroke">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t(item, lang)}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn btn-ghost plan-cta">{t(COPY.pricing.freeCta, lang)}</Link>
          </div>

          {/* Pro plan */}
          <div className="plan featured">
            <span className="badge">最受歡迎</span>
            <h3>Pro</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,252,247,0.7)', margin: 0 }}>
              {t(COPY.pricing.proDesc, lang)}
            </p>
            <div className="price">NT$299<small>/月</small></div>
            <div className="price-sub">{t(COPY.pricing.proPriceSub, lang)}</div>
            <ul>
              {([
                COPY.pricing.proF1,
                COPY.pricing.proF2,
                COPY.pricing.proF3,
                COPY.pricing.proF4,
                COPY.pricing.proF5,
                COPY.pricing.proF6,
              ] as const).map((item, i) => (
                <li key={i}>
                  <svg width={18} height={18} viewBox="0 0 24 24" className="ico-stroke">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t(item, lang)}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn btn-render plan-cta">{t(COPY.pricing.proCta, lang)}</Link>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section id="cta">
        <div className="final-cta">
          <h2>
            {t(COPY.finalCta.title, lang).split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h2>
          <p>{t(COPY.finalCta.sub, lang)}</p>
          <Link href="/signup" className="btn btn-render btn-lg">
            <svg width={18} height={18} viewBox="0 0 24 24" className="ico-stroke">
              <path d="M12 3l1.5 5 5 1.5-5 1.5L12 16l-1.5-5-5-1.5 5-1.5L12 3z" />
            </svg>
            {t(COPY.finalCta.cta, lang)}
          </Link>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/assets/logo-mark.svg" width={40} height={40} alt="" />
            <div className="name">VocalCanvas</div>
            <p>{t(COPY.footer.brandDesc, lang)}</p>
          </div>
          <div className="footer-col">
            <h5>{t(COPY.footer.colProduct, lang)}</h5>
            <a href="#features">{t(COPY.footer.colProductLinks.features, lang)}</a>
            <a href="#scenarios">{t(COPY.footer.colProductLinks.scenarios, lang)}</a>
            <a href="#voices">{t(COPY.footer.colProductLinks.voices, lang)}</a>
            <a href="#pricing">{t(COPY.footer.colProductLinks.pricing, lang)}</a>
            <a href="#">{t(COPY.footer.colProductLinks.changelog, lang)}</a>
          </div>
          <div className="footer-col">
            <h5>{t(COPY.footer.colResources, lang)}</h5>
            <a href="#">{t(COPY.footer.colResourcesLinks.tutorial, lang)}</a>
            <a href="#">{t(COPY.footer.colResourcesLinks.api, lang)}</a>
            <a href="#">{t(COPY.footer.colResourcesLinks.blog, lang)}</a>
            <a href="#">{t(COPY.footer.colResourcesLinks.support, lang)}</a>
          </div>
          <div className="footer-col">
            <h5>{t(COPY.footer.colCompany, lang)}</h5>
            <a href="#">{t(COPY.footer.colCompanyLinks.about, lang)}</a>
            <a href="#">{t(COPY.footer.colCompanyLinks.contact, lang)}</a>
            <a href="#">{t(COPY.footer.colCompanyLinks.privacy, lang)}</a>
            <a href="#">{t(COPY.footer.colCompanyLinks.terms, lang)}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t(COPY.footer.copyright, lang)}</span>
          <span>{t(COPY.footer.made, lang)}</span>
        </div>
      </footer>
    </>
  );
}
