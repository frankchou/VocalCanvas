'use client';

import React, { useRef } from 'react';
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

// ---- Scenario icons ----
const IcMeditation = (
  <ScIcon>
    <circle cx="12" cy="5" r="2.2" />
    <path d="M12 7.5v3.5" />
    <path d="M7.5 19c1.5-4 3-6 4.5-6s3 2 4.5 6" />
    <path d="M4.5 19h15" />
  </ScIcon>
);

const IcBedtime = (
  <ScIcon>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </ScIcon>
);

const IcAffirmation = (
  <ScIcon>
    <path d="M12 3l1.5 5 5 1.5-5 1.5L12 16l-1.5-5-5-1.5 5-1.5L12 3z" />
    <path d="M19 14l.7 2.3 2.3.7-2.3.7L19 20l-.7-2.3L16 17l2.3-.7z" />
  </ScIcon>
);

const IcPodcast = (
  <ScIcon>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </ScIcon>
);

const IcAd = (
  <ScIcon>
    <polygon points="3 11 22 2 22 22 3 13 3 11" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </ScIcon>
);

const IcAudiobook = (
  <ScIcon>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </ScIcon>
);

const IcCustom = (
  <ScIcon>
    <path d="M12 3v18" />
    <path d="M3 12h18" />
    <path d="M5.6 5.6l12.8 12.8" />
    <path d="M18.4 5.6L5.6 18.4" />
  </ScIcon>
);

// ---- Types ----
export type Scenario = {
  id: string;
  icon: React.ReactNode;
  zh: string;
  en: string;
  descZh: string;
  descEn: string;
  gradient: string;
  fg: string;
  voice?: { gender: 'male' | 'female'; preset: string; age: number; pitch: number; timbre: number };
  bgmRecommended?: string[];
  bgmDefault?: string;
  bgmVolume?: number;
};

// ---- Data ----
export const SCENARIOS: Scenario[] = [
  {
    id: 'custom',
    icon: IcCustom,
    zh: '自訂', en: 'Custom',
    descZh: '從零開始', descEn: 'Start fresh',
    gradient: 'linear-gradient(135deg, #FFFCF7 0%, #F4ECDA 100%)',
    fg: 'var(--ink-700)',
  },
  {
    id: 'meditation',
    icon: IcMeditation,
    zh: '冥想', en: 'Meditation',
    descZh: '柔和、緩慢、低沉', descEn: 'Calm · slow · deep',
    voice: { gender: 'female', preset: 'glass', age: 38, pitch: 22, timbre: 14 },
    bgmRecommended: ['ocean', 'forest', 'bowl', 'rain'],
    bgmDefault: 'ocean',
    bgmVolume: 35,
    gradient: 'linear-gradient(135deg, #7AE5C0 0%, #6E52F2 100%)',
    fg: '#FFFFFF',
  },
  {
    id: 'bedtime',
    icon: IcBedtime,
    zh: '睡前故事', en: 'Bedtime',
    descZh: '溫暖、輕柔、低沉', descEn: 'Warm · soft · low',
    voice: { gender: 'female', preset: 'dawn', age: 36, pitch: 28, timbre: 12 },
    bgmRecommended: ['rain', 'piano', 'forest'],
    bgmDefault: 'rain',
    bgmVolume: 28,
    gradient: 'linear-gradient(135deg, #6E52F2 0%, #FF85A8 100%)',
    fg: '#FFFFFF',
  },
  {
    id: 'affirmation',
    icon: IcAffirmation,
    zh: '正念肯定語', en: 'Affirmation',
    descZh: '柔和、中音、堅定', descEn: 'Soft · mid · grounded',
    voice: { gender: 'female', preset: 'dawn', age: 32, pitch: 50, timbre: 18 },
    bgmRecommended: ['bowl', 'ambient', 'piano'],
    bgmDefault: 'bowl',
    bgmVolume: 25,
    gradient: 'linear-gradient(135deg, #FFC785 0%, #F25C8A 100%)',
    fg: '#FFFFFF',
  },
  {
    id: 'podcast',
    icon: IcPodcast,
    zh: 'Podcast 開場', en: 'Podcast intro',
    descZh: '清亮、有活力', descEn: 'Bright · energetic',
    voice: { gender: 'male', preset: 'glass', age: 30, pitch: 64, timbre: 38 },
    bgmRecommended: ['upbeat', 'cinematic', 'none'],
    bgmDefault: 'upbeat',
    bgmVolume: 18,
    gradient: 'linear-gradient(135deg, #FF5A3C 0%, #FFA94D 100%)',
    fg: '#FFFFFF',
  },
  {
    id: 'ad',
    icon: IcAd,
    zh: '廣告', en: 'Advertisement',
    descZh: '自信、明亮、有節奏', descEn: 'Confident · punchy',
    voice: { gender: 'female', preset: 'ember', age: 28, pitch: 70, timbre: 56 },
    bgmRecommended: ['upbeat', 'cinematic'],
    bgmDefault: 'cinematic',
    bgmVolume: 22,
    gradient: 'linear-gradient(135deg, #F25C8A 0%, #FF5A3C 50%, #FFA94D 100%)',
    fg: '#FFFFFF',
  },
  {
    id: 'audiobook',
    icon: IcAudiobook,
    zh: '有聲書', en: 'Audiobook',
    descZh: '沉穩、中性、清晰', descEn: 'Steady · neutral · clear',
    voice: { gender: 'male', preset: 'mist', age: 45, pitch: 40, timbre: 32 },
    bgmRecommended: ['none', 'piano'],
    bgmDefault: 'none',
    bgmVolume: 0,
    gradient: 'linear-gradient(135deg, #2A271F 0%, #6C6757 100%)',
    fg: '#FFFCF7',
  },
];

// ---- Component ----
interface ScenarioSelectorProps {
  value: string;
  onChange: (scenario: Scenario) => void;
  lang: string;
}

export default function ScenarioSelector({ value, onChange, lang }: ScenarioSelectorProps): React.JSX.Element {
  return (
    <div className="scenario-strip">
      {SCENARIOS.map((s) => {
        const selected = value === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s)}
            style={{
              border: 0,
              borderRadius: 16,
              padding: 14,
              background: s.gradient,
              color: s.fg,
              cursor: 'pointer',
              boxShadow: selected
                ? 'var(--shadow-md), inset 0 0 0 3px var(--coral-500)'
                : 'var(--shadow-sm)',
              transition: 'all 240ms var(--ease-out)',
              transform: selected ? 'translateY(-2px)' : 'none',
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 96,
            }}
          >
            <div style={{ fontSize: 24, lineHeight: 1, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>
              {lang === 'zh' ? s.zh : s.en}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, opacity: 0.85, marginTop: 4, lineHeight: 1.3 }}>
              {lang === 'zh' ? s.descZh : s.descEn}
            </div>
            {selected && (
              <div style={{
                position: 'absolute', top: 8, right: 8,
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--coral-500)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconCheck size={12} stroke={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
