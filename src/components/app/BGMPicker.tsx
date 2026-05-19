'use client';

import React from 'react';
import { IconCheck } from '@/components/ui/Icons';

// ---- Icon primitive ----
interface ScIconProps {
  children: React.ReactNode;
  sz?: string;
}

function ScIcon({ children, sz = '1em' }: ScIconProps): React.JSX.Element {
  return (
    <svg
      width={sz}
      height={sz}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      {children}
    </svg>
  );
}

// ---- BGM icons ----
const IcNone = (
  <ScIcon>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </ScIcon>
);

const IcOcean = (
  <ScIcon>
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
  </ScIcon>
);

const IcForest = (
  <ScIcon>
    <polygon points="12 3 17 9 14.5 9 17.5 13 14.5 13 18 17 6 17 9.5 13 6.5 13 9.5 9 7 9" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </ScIcon>
);

const IcBowl = (
  <ScIcon>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </ScIcon>
);

const IcRain = (
  <ScIcon>
    <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
    <line x1="8" y1="19" x2="8" y2="21" />
    <line x1="12" y1="19" x2="12" y2="21" />
    <line x1="16" y1="19" x2="16" y2="21" />
  </ScIcon>
);

const IcPiano = (
  <ScIcon>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </ScIcon>
);

const IcAmbient = (
  <ScIcon>
    <path d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2" />
  </ScIcon>
);

const IcUpbeat = (
  <ScIcon>
    <circle cx="8" cy="18" r="3.5" />
    <circle cx="18" cy="15" r="3" />
    <path d="M11.5 18V4l9.5 1.5V15" />
  </ScIcon>
);

const IcCinematic = (
  <ScIcon>
    <rect x="2" y="2" width="20" height="20" rx="2" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </ScIcon>
);

// ---- Types ----
export type BgmTrack = {
  id: string;
  icon: React.ReactNode;
  zh: string;
  en: string;
  descZh: string;
  descEn: string;
  duration: string | null;
};

// ---- Data ----
export const BGM_TRACKS: BgmTrack[] = [
  { id: 'none',      icon: IcNone,      zh: '純朗讀',   en: 'No music',      descZh: '只有人聲',   descEn: 'Voice only',      duration: null },
  { id: 'ocean',     icon: IcOcean,     zh: '海浪',     en: 'Ocean',         descZh: '慢拍海浪',   descEn: 'Slow surf',       duration: '8m loop' },
  { id: 'forest',    icon: IcForest,    zh: '森林',     en: 'Forest',        descZh: '鳥鳴與溪流', descEn: 'Birds & brook',   duration: '10m loop' },
  { id: 'bowl',      icon: IcBowl,      zh: '頌缽',     en: 'Singing bowl',  descZh: '藏式頌缽',   descEn: 'Tibetan bowls',   duration: '6m loop' },
  { id: 'rain',      icon: IcRain,      zh: '雨聲',     en: 'Rain',          descZh: '輕柔雨聲',   descEn: 'Gentle rain',     duration: '12m loop' },
  { id: 'piano',     icon: IcPiano,     zh: '輕鋼琴',   en: 'Soft piano',    descZh: '氛圍鋼琴',   descEn: 'Ambient piano',   duration: '9m loop' },
  { id: 'ambient',   icon: IcAmbient,   zh: '環境音',   en: 'Ambient',       descZh: '空靈氛圍',   descEn: 'Ethereal pad',    duration: '8m loop' },
  { id: 'upbeat',    icon: IcUpbeat,    zh: '動感節拍', en: 'Upbeat',        descZh: '現代節奏',   descEn: 'Modern beat',     duration: '4m loop' },
  { id: 'cinematic', icon: IcCinematic, zh: '電影感',   en: 'Cinematic',     descZh: '宏大電影感', descEn: 'Epic, sweeping',  duration: '5m loop' },
];

// ---- BGM Volume Slider ----
interface BGMVolumeSliderProps {
  lang: string;
  value: number;
  onChange: (v: number) => void;
}

function BGMVolumeSlider({ lang, value, onChange }: BGMVolumeSliderProps): React.JSX.Element {
  const t = (zh: string, en: string): string => lang === 'zh' ? zh : en;
  const ref = React.useRef<HTMLDivElement>(null);
  // useRef 追蹤拖曳狀態，避免 onPointerMove 在未按下時觸發計算
  const isDragging = React.useRef(false);

  const calcValue = (clientX: number): void => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    onChange(Math.round(pct));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    isDragging.current = true;
    // setPointerCapture 讓後續 pointermove/pointerup 自動路由到此元素，
    // 不需要掛 window listener，元件 unmount 時自動解除，無記憶體洩漏
    ref.current?.setPointerCapture(e.pointerId);
    calcValue(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (!isDragging.current) return;
    calcValue(e.clientX);
  };

  const handlePointerUp = (): void => {
    isDragging.current = false;
  };

  return (
    <div
      className="bgm-volume-row"
      style={{
        marginTop: 16,
        padding: '14px 18px',
        background: '#FBF6EC',
        borderRadius: 12,
        display: 'grid',
        gridTemplateColumns: '120px 1fr 50px',
        gap: 16,
        alignItems: 'center',
      }}
    >
      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}>
        {t('音樂音量', 'Music volume')}
      </div>
      <div>
        <div
          className="sl-track"
          ref={ref}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="sl-fill" style={{ width: value + '%' }}></div>
          <div className="sl-thumb" style={{ left: value + '%' }}></div>
        </div>
        <div className="sl-ends">
          <span>{t('小', 'soft')}</span>
          <span>{t('大', 'loud')}</span>
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--coral-600)', textAlign: 'right' }}>
        {value}%
      </div>
    </div>
  );
}

// ---- BGM Picker ----
interface BGMPickerProps {
  value: string;
  onChange: (id: string) => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  recommended?: string[];
  lang: string;
  expanded: boolean;
  onToggleExpanded: () => void;
}

export default function BGMPicker({
  value,
  onChange,
  volume,
  onVolumeChange,
  recommended,
  lang,
  expanded,
  onToggleExpanded,
}: BGMPickerProps): React.JSX.Element {
  const t = (zh: string, en: string): string => lang === 'zh' ? zh : en;

  const recommendedTracks = recommended
    ? BGM_TRACKS.filter((b) => recommended.includes(b.id))
    : BGM_TRACKS;
  const tracksToShow = expanded ? BGM_TRACKS : recommendedTracks;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div className="section-label" style={{ margin: 0 }}>
            {t('背景音樂', 'Background music')}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', marginTop: 2 }}>
            {recommended && !expanded
              ? t(`推薦 ${recommendedTracks.length} 首音樂`, `${recommendedTracks.length} recommended tracks`)
              : t('全部 9 首音樂', 'All 9 tracks')}
          </div>
        </div>
        {recommended && (
          <button type="button" onClick={onToggleExpanded} className="btn btn-ghost btn-sm">
            {expanded ? t('只看推薦', 'Show recommended') : t('看全部', 'Show all')}
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
      }}>
        {tracksToShow.map((track) => {
          const selected = value === track.id;
          const isRec = recommended?.includes(track.id);
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => onChange(track.id)}
              style={{
                border: selected ? '2px solid #FF5A3C' : '1px solid var(--line-1)',
                borderRadius: 14,
                padding: 12,
                background: selected ? '#FFF1ED' : '#fff',
                cursor: 'pointer',
                transition: 'all 140ms var(--ease-out)',
                textAlign: 'left',
                position: 'relative',
                boxShadow: selected ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: track.id === 'none' ? 'var(--cream-200)' : 'var(--grad-sunset-soft)',
                  color: track.id === 'none' ? 'var(--fg-3)' : 'var(--coral-700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}>
                  {track.icon}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lang === 'zh' ? track.zh : track.en}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)', marginTop: 1 }}>
                    {lang === 'zh' ? track.descZh : track.descEn}
                  </div>
                </div>
              </div>
              {track.duration !== null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>{track.duration}</span>
                  {isRec && !expanded && (
                    <span className="chip coral" style={{ fontSize: 10, padding: '2px 6px' }}>
                      {t('推薦', 'Rec.')}
                    </span>
                  )}
                </div>
              )}
              {selected && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--coral-500)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconCheck size={11} stroke={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {value !== 'none' && (
        <BGMVolumeSlider lang={lang} value={volume} onChange={onVolumeChange} />
      )}
    </div>
  );
}
