'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/contexts/LangContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  IconPlus,
  IconPlay,
  IconHeart,
  IconHeartFill,
  IconDownload,
  IconMore,
} from '@/components/ui/Icons';

// 為每個 library item 產生固定波形條（以 id 作為 seed，避免 hydration 不一致）
function waveForId(id: string): number[] {
  const seed = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return Array.from({ length: 14 }, (_, i) => {
    const v = 6 + ((seed * (i + 1) * 17) % 26);
    return Math.max(4, Math.min(30, v));
  });
}

export default function LibraryPage(): React.JSX.Element {
  const router = useRouter();
  const { lang } = useLang();
  const { user } = useAuth();
  const t = (zh: string, en: string): string => lang === 'zh' ? zh : en;

  const items = user?.library ?? [];

  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(items.filter((i) => i.favorite).map((i) => i.id))
  );

  const toggleFav = (id: string): void => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>{t('我的作品', 'Your library')}</h1>
          <div className="sub">
            {t(
              `${items.length} 個音檔 · ${favorites.size} 個收藏`,
              `${items.length} takes · ${favorites.size} favorites`
            )}
          </div>
        </div>
        <button className="btn btn-render" onClick={() => router.push('/new')}>
          <IconPlus size={16} stroke={2.5} />
          {t('新作品', 'New canvas')}
        </button>
      </div>

      {items.length === 0 ? (
        // 空狀態
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--cream-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconPlay size={28} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
              {t('還沒有作品', 'No takes yet')}
            </div>
            <div className="sub" style={{ maxWidth: 320 }}>
              {t('建立第一個音檔，讓你的文字開口說話。', 'Create your first take and give your words a voice.')}
            </div>
          </div>
          <button className="btn btn-render" onClick={() => router.push('/new')}>
            <IconPlus size={16} stroke={2.5} />
            {t('開始創作', 'Create your first')}
          </button>
        </div>
      ) : (
        <div className="lib-list">
          {items.map((item) => (
            <div className="lib" key={item.id}>
              <div className="lib-thumb">
                {waveForId(item.id).map((h, i) => (
                  <span key={i} style={{ height: h + 'px' }}></span>
                ))}
              </div>
              <div>
                <div className="title">{item.title}</div>
                <div className="sub">
                  <span className="voice-chip">{item.voice}</span>
                  <span>{item.duration}</span>
                  <span>{item.sub.split('·').pop()?.trim()}</span>
                  <span>{item.date}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="iconbtn" onClick={() => router.push('/new')} title="試聽" aria-label="試聽">
                  <IconPlay size={18} />
                </button>
                <button
                  className={`iconbtn ${favorites.has(item.id) ? 'fav' : ''}`}
                  onClick={() => toggleFav(item.id)}
                  title="Favorite"
                >
                  {favorites.has(item.id) ? <IconHeartFill size={18} /> : <IconHeart size={18} />}
                </button>
                <button className="iconbtn" title="Download"><IconDownload size={18} /></button>
                <button className="iconbtn" title="More"><IconMore size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
