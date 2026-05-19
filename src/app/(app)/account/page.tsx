'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/contexts/LangContext';
import { useAuth } from '@/contexts/AuthContext';
import { IconChevronLeft, IconCheck } from '@/components/ui/Icons';
import { auth, db, storage } from '@/lib/firebase';
import { updateProfile, updatePassword, GoogleAuthProvider, linkWithPopup, unlink } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AccountPage(): React.JSX.Element {
  const router = useRouter();
  const { lang } = useLang();
  const { user } = useAuth();
  const t = (zh: string, en: string): string => (lang === 'zh' ? zh : en);

  const [name, setName] = useState(user?.name ?? '');
  const email = user?.email ?? '';
  const usage = user?.usage ?? { rendered: 0, total: 600, takes: 0, storage: '0 GB' };
  const avatarLetter = user?.avatar ?? name[0] ?? '?';

  const isGoogleLinked = auth.currentUser?.providerData.some(
    (p) => p.providerId === 'google.com',
  ) ?? false;

  const handleSaveName = async () => {
    if (!auth.currentUser || !user) return;
    await updateProfile(auth.currentUser, { displayName: name });
    await updateDoc(doc(db, 'users', user.id), { name });
    alert(t('已儲存', 'Saved'));
  };

  const handleAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !user || !auth.currentUser) return;
      const storageRef = ref(storage, `avatars/${user.id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser, { photoURL: url });
      await updateDoc(doc(db, 'users', user.id), { avatarUrl: url });
      alert(t('頭像已更新', 'Avatar updated'));
    };
    input.click();
  };

  const handleChangePassword = async () => {
    const newPw = window.prompt(t('請輸入新密碼', 'Enter new password'));
    if (!newPw || !auth.currentUser) return;
    try {
      await updatePassword(auth.currentUser, newPw);
      alert(t('密碼已更新', 'Password updated'));
    } catch {
      alert(t('請重新登入後再試', 'Please re-login and try again'));
    }
  };

  const handleGoogleLink = async () => {
    if (!auth.currentUser) return;
    try {
      if (isGoogleLinked) {
        await unlink(auth.currentUser, 'google.com');
        alert(t('已取消連結 Google', 'Google unlinked'));
      } else {
        await linkWithPopup(auth.currentUser, new GoogleAuthProvider());
        alert(t('已連結 Google', 'Google linked'));
      }
    } catch {
      alert(t('操作失敗，請稍後再試', 'Operation failed, please try again'));
    }
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="iconbtn"
            onClick={() => router.push('/settings')}
            style={{ width: 36, height: 36 }}
          >
            <IconChevronLeft size={18} />
          </button>
          <div>
            <h1>{t('帳號管理', 'Account')}</h1>
            <div className="sub">{t('個人資料與安全設定', 'Personal info and security')}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* ---- Profile ---- */}
        <div className="card">
          <div className="section-label">{t('個人資料', 'Profile')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '8px 0' }}>
              <div className="avatar" style={{ width: 72, height: 72, fontSize: 28 }}>{avatarLetter}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t('頭像', 'Avatar')}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={handleAvatarUpload}>{t('上傳新圖', 'Upload')}</button>
                  <button className="btn btn-sm" style={{ background: 'transparent', color: 'var(--fg-2)' }}>{t('移除', 'Remove')}</button>
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>
                {t('姓名', 'Display name')}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', fontFamily: 'var(--font-body)', fontSize: 15, padding: '12px 14px', borderRadius: 12, border: '1px solid var(--line-2)', background: '#fff', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={email}
                  readOnly
                  style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 15, padding: '12px 14px', borderRadius: 12, border: '1px solid var(--line-2)', background: 'var(--cream-100)', color: 'var(--fg-2)', outline: 'none' }}
                />
                <button className="btn btn-ghost btn-sm">{t('變更', 'Change')}</button>
              </div>
              {user?.emailVerified ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--mint-600)' }}>
                  <IconCheck size={12} stroke={2.5} />
                  {t('已驗證', 'Verified')}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--danger, #d94f4f)' }}>
                    {t('未驗證', 'Not verified')}
                  </span>
                  <button
                    type="button"
                    style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--coral-600)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    onClick={async () => {
                      const { sendEmailVerification } = await import('firebase/auth');
                      if (auth.currentUser) {
                        auth.languageCode = lang === 'zh' ? 'zh-TW' : 'en';
                        await sendEmailVerification(auth.currentUser);
                        alert(t('驗證信已寄出，請查收 Email', 'Verification email sent'));
                      }
                    }}
                  >
                    {t('重寄驗證信', 'Resend')}
                  </button>
                </div>
              )}
            </div>

            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleSaveName}>{t('儲存變更', 'Save changes')}</button>
          </div>
        </div>

        {/* ---- Security ---- */}
        <div className="card">
          <div className="section-label">{t('安全性', 'Security')}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--line-1)' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14 }}>{t('密碼', 'Password')}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', marginTop: 2 }}>{t('上次更新 3 個月前', 'Updated 3 months ago')}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleChangePassword}>{t('變更密碼', 'Change')}</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--line-1)' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14 }}>{t('兩步驗證', 'Two-factor auth')}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', marginTop: 2 }}>{t('尚未啟用', 'Not enabled')}</div>
            </div>
            <button className="btn btn-ghost btn-sm">{t('啟用', 'Enable')}</button>
          </div>

          <div style={{ padding: '14px 0' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, marginBottom: 10 }}>{t('已連結的帳號', 'Linked accounts')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Google */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--cream-100)', borderRadius: 12 }}>
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.2 5.2C41.4 35.5 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z" />
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}>Google</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>frank@gmail.com</div>
                </div>
                {isGoogleLinked ? (
                  <button className="chip mint" onClick={handleGoogleLink} style={{ cursor: 'pointer', border: 'none' }}>{t('已連結', 'Connected')}</button>
                ) : (
                  <button className="btn btn-ghost btn-sm" onClick={handleGoogleLink}>{t('連結', 'Connect')}</button>
                )}
              </div>
              {/* LINE */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--cream-100)', borderRadius: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="5" fill="#06C755" />
                  <path fill="#fff" d="M19.5 10.7c0-3.36-3.37-6.1-7.5-6.1s-7.5 2.74-7.5 6.1c0 3.01 2.67 5.53 6.28 6.01.24.05.58.16.66.36.07.18.05.47.02.66l-.11.64c-.03.18-.15.74.65.4.8-.33 4.31-2.54 5.88-4.35 1.08-1.19 1.62-2.4 1.62-3.72z" />
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}>LINE</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{t('尚未連結', 'Not linked')}</div>
                </div>
                <button className="btn btn-ghost btn-sm">{t('連結', 'Connect')}</button>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Usage ---- */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="section-label">{t('使用量', 'Usage this month')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 8 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, letterSpacing: '-0.02em' }}>{usage.rendered}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)' }}>/ {usage.total} {t('分鐘', 'min')}</span>
              </div>
              <div style={{ height: 6, background: 'var(--cream-200)', borderRadius: 3, marginTop: 8, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${Math.min(100, Math.round((usage.rendered / usage.total) * 100))}%`, background: 'var(--grad-sunset)', borderRadius: 3 }} />
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', marginTop: 6 }}>{t('音檔朗讀時長', 'Audio rendered')}</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, letterSpacing: '-0.02em' }}>{usage.takes}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)' }}>{t('個作品', 'takes')}</span>
              </div>
              <div style={{ height: 6, background: 'var(--cream-200)', borderRadius: 3, marginTop: 8 }} />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', marginTop: 6 }}>{t('產出的作品數量', 'Renders this month')}</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, letterSpacing: '-0.02em' }}>{usage.storage}</span>
              </div>
              <div style={{ height: 6, background: 'var(--cream-200)', borderRadius: 3, marginTop: 8 }} />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', marginTop: 6 }}>{t('作品庫儲存空間', 'Storage used')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
