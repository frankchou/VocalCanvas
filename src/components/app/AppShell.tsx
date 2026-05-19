'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { LangProvider, useLang } from '@/contexts/LangContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  IconLibrary,
  IconHeadphones,
  IconSettings,
  IconPlus,
  IconClock,
  IconChevronLeft,
} from '@/components/ui/Icons';
import { useLibrary } from '@/hooks/useLibrary';

// ---- Crumb mapping ----
// parent 用普通文字，當前頁用 <b>，比照 demo 設計稿格式
const CRUMB_MAP: Record<string, (lang: string) => React.ReactNode> = {
  '/library':  (lang) => <><b>{lang === 'zh' ? '作品庫' : 'Library'}</b></>,
  '/voices':   (lang) => <><b>{lang === 'zh' ? '聲音庫' : 'Voices'}</b></>,
  '/settings': (lang) => <><b>{lang === 'zh' ? '設定' : 'Settings'}</b></>,
  '/account':  (lang) => <>{lang === 'zh' ? '設定' : 'Settings'} · <b>{lang === 'zh' ? '帳號管理' : 'Account'}</b></>,
  '/new':      (lang) => <>{lang === 'zh' ? '新作品' : 'New canvas'} · <b>{lang === 'zh' ? '新建' : 'New'}</b></>,
};

// ---- Sidebar ----
interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapse: () => void;
}

function Sidebar({ mobileOpen, onCloseMobile, onToggleCollapse }: SidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = (): void => {
    logout();
    router.push('/login');
  };

  const { items: recentItems } = useLibrary(user?.id);
  const recentFive = recentItems.slice(0, 5);

  const nav = [
    { id: 'library',  href: '/library',  label: 'Library',  icon: <IconLibrary size={18} />,   count: recentItems.length || undefined },
    { id: 'voices',   href: '/voices',   label: 'Voices',   icon: <IconHeadphones size={18} /> },
    { id: 'settings', href: '/settings', label: 'Settings', icon: <IconSettings size={18} /> },
  ];

  const handleNav = (href: string): void => {
    router.push(href);
    onCloseMobile();
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <button
        className="sidebar-collapse"
        onClick={onToggleCollapse}
        title="Toggle sidebar"
      >
        <IconChevronLeft size={14} stroke={2.5} />
      </button>

      <div className="brand-row">
        <Image src="/assets/logo-mark.svg" width={32} height={32} alt="VocalCanvas" />
        <div className="name">VocalCanvas</div>
      </div>

      <button className="nav-cta" onClick={() => handleNav('/new')} title="New canvas">
        <IconPlus size={18} stroke={2.5} />
        <span>新作品 · New canvas</span>
      </button>

      <div className="nav-section">Workspace</div>
      {nav.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-item ${pathname.startsWith('/' + item.id) ? 'active' : ''}`}
          onClick={() => handleNav(item.href)}
          title={item.label}
        >
          <span className="ico">{item.icon}</span>
          <span>{item.label}</span>
          {item.count != null && <span className="count">{item.count}</span>}
        </button>
      ))}

      {recentFive.length > 0 && (
        <>
          <div className="nav-section">Recent</div>
          {recentFive.map((item) => (
            <button
              key={item.id}
              className="nav-item"
              title={item.title}
              onClick={() => handleNav('/new')}
            >
              <span className="ico"><IconClock size={18} /></span>
              <span>{item.title}</span>
            </button>
          ))}
        </>
      )}

      <div className="profile-row">
        <button
          type="button"
          onClick={() => handleNav('/account')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 0, padding: 0, cursor: 'pointer', flex: 1, minWidth: 0, textAlign: 'left' }}
          title="Account"
        >
          <div className="avatar">{user?.avatar ?? '?'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name ?? ''}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-2)' }}>
              {user ? `${user.plan} · ${user.usage.total - user.usage.rendered} mins left` : ''}
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          title="登出 / Log out"
          className="logout-btn"
          style={{ background: 'transparent', border: 0, padding: '4px 6px', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          登出
        </button>
      </div>
    </aside>
  );
}

// ---- TopBar ----
interface TopBarProps {
  onMenu: () => void;
}

function TopBar({ onMenu }: TopBarProps): React.JSX.Element {
  const pathname = usePathname();
  const { lang, setLang } = useLang();

  // 找出最長前綴匹配，避免 /settings 誤配 /settings/xxx
  const crumbFn = Object.entries(CRUMB_MAP)
    .filter(([key]) => pathname.startsWith(key))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1];
  const crumb = crumbFn ? crumbFn(lang) : <b>{pathname}</b>;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-btn" onClick={onMenu} title="Menu" aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="crumb">
          {crumb}
        </div>
      </div>
      <div className="topbar-tools">
        <div className="lang-switch">
          <button className={lang === 'zh' ? 'active' : ''} onClick={() => setLang('zh')}>中文</button>
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>English</button>
        </div>
      </div>
    </header>
  );
}

// ---- AppShellInner (needs LangContext in scope) ----
function AppShellInner({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, rendering } = useLang();
  const t = (zh: string, en: string): string => lang === 'zh' ? zh : en;

  const toggleCollapse = (): void => setCollapsed((c) => !c);
  const closeMobile = (): void => setMobileOpen(false);

  return (
    <div className={`app ${collapsed ? 'collapsed' : ''}`}>
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
        onToggleCollapse={toggleCollapse}
      />
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'mobile-open' : ''}`}
        onClick={closeMobile}
      />
      {/* position: relative 讓 rendering-overlay 可以用 absolute inset-0 覆蓋整個 main 區域 */}
      <div className="main" style={{ position: 'relative' }}>
        <TopBar onMenu={() => setMobileOpen(true)} />
        {children}
        {rendering && (
          <div className="rendering-overlay">
            <div className="rendering-card">
              <div className="pulse-wave">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <span key={i} style={{ animationDelay: `${i * 0.1}s`, height: 40 + (i % 3) * 8 + 'px' }}></span>
                ))}
              </div>
              <h3>{t('正在調色盤上混音…', 'Mixing on the palette…')}</h3>
              <p>{t('AI 正在為你的文字配音，大約 12 秒。', 'AI is voicing your script — about 12s.')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- AppShell (exported — wraps LangProvider) ----
export default function AppShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <LangProvider>
      <AppShellInner>{children}</AppShellInner>
    </LangProvider>
  );
}
