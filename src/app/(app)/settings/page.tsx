'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/contexts/LangContext';
import { useAuth } from '@/contexts/AuthContext';
import { IconSparkles } from '@/components/ui/Icons';
import OnboardingModal from '@/components/app/OnboardingModal';
import { auth, db } from '@/lib/firebase';
import { deleteUser } from 'firebase/auth';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

// ---- SettingsRow ----
interface SettingsRowProps {
  label: string;
  sub?: string;
  danger?: boolean;
  children: React.ReactNode;
}

function SettingsRow({ label, sub, danger, children }: SettingsRowProps): React.JSX.Element {
  return (
    <div className="settings-row">
      <div>
        <div className={`settings-row-label${danger ? ' danger' : ''}`}>{label}</div>
        {sub && <div className="settings-row-sub">{sub}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ---- Toggle ----
interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ value, onChange }: ToggleProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="toggle-btn"
      style={{ background: value ? 'var(--coral-500)' : 'var(--cream-300)' }}
    >
      <span
        className="toggle-thumb"
        style={{ left: value ? 21 : 3 }}
      />
    </button>
  );
}

// ---- Settings page ----
export default function SettingsPage(): React.JSX.Element {
  const router = useRouter();
  const { lang, setLang } = useLang();
  const { user, logout } = useAuth();
  const t = (zh: string, en: string): string => (lang === 'zh' ? zh : en);

  const [autoSave, setAutoSave] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [productNews, setProductNews] = useState(false);
  const [readingLang, setReadingLang] = useState('zh-TW');
  const [outputFormat, setOutputFormat] = useState('mp3-240');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    if (!user) return;
    const loadPrefs = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.id));
        if (!snap.exists()) return;
        const prefs = (snap.data().preferences ?? {}) as Record<string, unknown>;
        if (typeof prefs.autoSave === 'boolean') setAutoSave(prefs.autoSave);
        if (typeof prefs.emailNotif === 'boolean') setEmailNotif(prefs.emailNotif);
        if (typeof prefs.productNews === 'boolean') setProductNews(prefs.productNews);
        if (typeof prefs.readingLang === 'string') setReadingLang(prefs.readingLang);
        if (typeof prefs.outputFormat === 'string') setOutputFormat(prefs.outputFormat);
      } catch (err) {
        console.error('[Settings] Failed to load preferences:', err);
      }
    };
    void loadPrefs();
  }, [user]);

  const savePref = async (key: string, value: unknown) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.id), { [`preferences.${key}`]: value });
  };

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser || !user) return;
    const confirmed = window.confirm(
      t('確定刪除帳號？此操作無法復原。', 'Delete account? This cannot be undone.'),
    );
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, 'users', user.id));
      await deleteUser(auth.currentUser);
      router.push('/');
    } catch {
      alert(t('請重新登入後再試', 'Please re-login and try again'));
    }
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>{t('設定', 'Settings')}</h1>
          <div className="sub">{t('帳號、訂閱與偏好設定', 'Account, subscription and preferences')}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* ---- Account ---- */}
        <div className="card">
          <div className="section-label">{t('帳號', 'Account')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0 16px', borderBottom: '1px solid var(--line-1)' }}>
            <div className="avatar" style={{ width: 56, height: 56, fontSize: 22 }}>{user?.avatar ?? '?'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17 }}>{user?.name ?? ''}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>{user?.email ?? ''}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => router.push('/account')}>{t('管理', 'Manage')}</button>
          </div>

          <SettingsRow
            label={t('VocalCanvas Pro', 'VocalCanvas Pro')}
            sub={t(`${user?.usage.total ? user.usage.total - user.usage.rendered : 0} 分鐘可用 · 下次扣款 6/19`, `${user?.usage.total ? user.usage.total - user.usage.rendered : 0} minutes left · Renews 6/19`)}
          >
            <button
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                if (!user) return;
                if (user.plan === 'Pro') {
                  alert(t('請至 Email 中的訂閱管理連結', 'Check your email for subscription management link'));
                } else {
                  try {
                    const res = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: user.id, userEmail: user.email }),
                    });
                    const data = await res.json();
                    if (data.url) {
                      window.open(data.url, '_blank');
                    } else {
                      alert(t('付款功能尚未設定', 'Payment not configured yet'));
                    }
                  } catch {
                    alert(t('發生錯誤，請稍後再試', 'Error, please try again'));
                  }
                }
              }}
            >{t('管理訂閱', 'Manage')}</button>
          </SettingsRow>

          <SettingsRow
            label={t('已連結帳號', 'Connected accounts')}
            sub={t('Google · LINE', 'Google · LINE')}
          >
            <button className="btn btn-ghost btn-sm">{t('檢視', 'View')}</button>
          </SettingsRow>
        </div>

        {/* ---- Preferences ---- */}
        <div className="card">
          <div className="section-label">{t('偏好設定', 'Preferences')}</div>

          <SettingsRow label={t('介面語言', 'UI Language')}>
            <div className="lang-switch">
              <button className={lang === 'zh' ? 'active' : ''} onClick={() => setLang('zh')}>中文</button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
          </SettingsRow>

          <SettingsRow label={t('預設朗讀語言', 'Default reading language')}>
            <select
              value={readingLang}
              onChange={(e) => { setReadingLang(e.target.value); void savePref('readingLang', e.target.value); }}
              style={{ fontFamily: 'var(--font-body)', fontSize: 13, padding: '6px 10px', borderRadius: 10, border: '1px solid var(--line-2)', background: '#fff' }}
            >
              <option value="zh-TW">中文 (繁體)</option>
              <option value="en-US">English (US)</option>
              <option value="ja-JP">日本語</option>
            </select>
          </SettingsRow>

          <SettingsRow label={t('預設輸出格式', 'Default format')}>
            <select
              value={outputFormat}
              onChange={(e) => { setOutputFormat(e.target.value); void savePref('outputFormat', e.target.value); }}
              style={{ fontFamily: 'var(--font-body)', fontSize: 13, padding: '6px 10px', borderRadius: 10, border: '1px solid var(--line-2)', background: '#fff' }}
            >
              <option value="mp3-240">mp3 · 240 kbps</option>
              <option value="mp3-320">mp3 · 320 kbps</option>
              <option value="wav-16">wav · 16-bit</option>
            </select>
          </SettingsRow>

          <SettingsRow
            label={t('自動儲存', 'Auto-save')}
            sub={t('產出後自動加入作品庫', 'Save renders to library automatically')}
          >
            <Toggle value={autoSave} onChange={(v) => { setAutoSave(v); void savePref('autoSave', v); }} />
          </SettingsRow>
        </div>

        {/* ---- Notifications ---- */}
        <div className="card">
          <div className="section-label">{t('通知', 'Notifications')}</div>

          <SettingsRow
            label={t('Email 通知', 'Email notifications')}
            sub={t('音檔產出完成時通知我', 'Email me when a render completes')}
          >
            <Toggle value={emailNotif} onChange={(v) => { setEmailNotif(v); void savePref('emailNotif', v); }} />
          </SettingsRow>

          <SettingsRow
            label={t('產品更新', 'Product news')}
            sub={t('新功能、新聲音的通知', 'New features and new voices')}
          >
            <Toggle value={productNews} onChange={(v) => { setProductNews(v); void savePref('productNews', v); }} />
          </SettingsRow>

          <SettingsRow
            label={t('瀏覽器通知', 'Browser notifications')}
            sub={t('在背景產音檔時提醒你', 'Alert when a long render finishes')}
          >
            <button className="btn btn-ghost btn-sm" onClick={async () => {
              const permission = await Notification.requestPermission();
              if (permission === 'granted') {
                alert(t('瀏覽器通知已開啟', 'Browser notifications enabled'));
              }
            }}>{t('開啟', 'Enable')}</button>
          </SettingsRow>
        </div>

        {/* ---- Help & quick start ---- */}
        <div className="card">
          <div className="section-label">{t('協助與快速上手', 'Help & quick start')}</div>

          <SettingsRow
            label={t('重新看引導教學', 'Replay onboarding')}
            sub={t('4 步驟，30 秒看完', '4 steps · 30 seconds')}
          >
            <button className="btn btn-ghost btn-sm" onClick={() => setShowOnboarding(true)}>
              <IconSparkles size={14} />
              {t('看一次', 'Replay')}
            </button>
          </SettingsRow>

          <SettingsRow label={t('使用文件', 'Documentation')}>
            <button className="btn btn-ghost btn-sm">{t('打開 →', 'Open →')}</button>
          </SettingsRow>

          <SettingsRow label={t('聯絡客服', 'Contact support')}>
            <button className="btn btn-ghost btn-sm">{t('寄信', 'Email')}</button>
          </SettingsRow>

          <SettingsRow label={t('鍵盤快速鍵', 'Keyboard shortcuts')}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-2)' }}>⌘ + /</span>
          </SettingsRow>
        </div>
      </div>

      {/* ---- Danger zone ---- */}
      <div className="card" style={{ marginTop: 20, borderColor: 'rgba(229, 64, 78, 0.3)' }}>
        <div className="section-label" style={{ color: 'var(--danger)' }}>{t('危險區', 'Danger zone')}</div>
        <SettingsRow
          label={t('登出', 'Sign out')}
          sub={t('在這個裝置上登出', 'Sign out on this device')}
        >
          <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>{t('登出', 'Sign out')}</button>
        </SettingsRow>
        <SettingsRow
          label={t('刪除帳號', 'Delete account')}
          sub={t('永久刪除帳號與所有作品 · 無法復原', 'Permanently delete your account and all takes')}
          danger
        >
          <button className="btn btn-sm" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }} onClick={handleDeleteAccount}>{t('刪除...', 'Delete...')}</button>
        </SettingsRow>
      </div>

      <div style={{ textAlign: 'center', marginTop: 36, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-3)' }}>
        VocalCanvas v1.0.0 · © 2026
      </div>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </div>
  );
}
