'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/contexts/LangContext';
import { IconPlay } from '@/components/ui/Icons';

type VoiceGender = 'male' | 'female';
type GenderFilter = 'all' | VoiceGender;

interface Voice {
  id: string;
  zh: string;
  en: string;
  meta: string;
  gender: VoiceGender;
  lang: string;
  desc: string;
  orbStyle: string;
}

const ORB_STYLES: Record<string, string> = {
  dawn:  'radial-gradient(circle at 30% 25%, #FFC785, #FF5A3C 70%, #BF3015)',
  mist:  'radial-gradient(circle at 30% 25%, #B49CFF, #6E52F2 70%, #5239D1)',
  ember: 'radial-gradient(circle at 30% 25%, #FF85A8, #F25C8A 60%, #BF3015)',
  glass: 'radial-gradient(circle at 30% 25%, #7AE5C0, #1FC68C 70%, #0FA873)',
  ink:   'radial-gradient(circle at 30% 25%, #B49CFF, #6E52F2 70%, #5239D1)',
  petal: 'radial-gradient(circle at 30% 25%, #FF85A8, #F25C8A 60%, #BF3015)',
};

const ALL_VOICES: Voice[] = [
  { id: 'dawn',  zh: '晨光', en: 'Dawn',  meta: 'warm · bright',   gender: 'female', lang: 'ZH · EN · JP', desc: '溫暖明亮，適合說故事、廣告。',        orbStyle: ORB_STYLES.dawn },
  { id: 'mist',  zh: '夜霧', en: 'Mist',  meta: 'deep · gentle',   gender: 'male',   lang: 'ZH · EN',      desc: '低沉溫柔，適合冥想、書摘。',        orbStyle: ORB_STYLES.mist },
  { id: 'ember', zh: '焰心', en: 'Ember', meta: 'rough · playful', gender: 'female', lang: 'ZH · EN',      desc: '粗獷有力，適合 podcast、廣播劇。', orbStyle: ORB_STYLES.ember },
  { id: 'glass', zh: '清玻', en: 'Glass', meta: 'cool · soft',     gender: 'male',   lang: 'ZH · EN · JP', desc: '清亮柔和，適合科普、教學。',        orbStyle: ORB_STYLES.glass },
  { id: 'ink',   zh: '墨色', en: 'Ink',   meta: 'narrative',       gender: 'male',   lang: 'ZH',           desc: '沉穩敘事，適合長篇朗讀。',          orbStyle: ORB_STYLES.ink },
  { id: 'petal', zh: '花瓣', en: 'Petal', meta: 'young · airy',    gender: 'female', lang: 'ZH · EN',      desc: '輕盈年輕，適合品牌口號。',          orbStyle: ORB_STYLES.petal },
];

export default function VoicesPage(): React.JSX.Element {
  const router = useRouter();
  const { lang } = useLang();
  const t = (zh: string, en: string): string => lang === 'zh' ? zh : en;
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');

  const filtered = genderFilter === 'all'
    ? ALL_VOICES
    : ALL_VOICES.filter((v) => v.gender === genderFilter);

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>{t('聲音庫', 'Voice library')}</h1>
          <div className="sub">
            {t('精選的 AI 聲音，每一個都可以再用拉桿微調。', 'Curated AI voices — each one tunable with the sliders.')}
          </div>
        </div>
        <div className="lang-switch" data-purpose="filter">
          <button className={genderFilter === 'all' ? 'active' : ''} onClick={() => setGenderFilter('all')}>
            {t('全部', 'All')}
          </button>
          <button className={genderFilter === 'female' ? 'active' : ''} onClick={() => setGenderFilter('female')}>
            {t('女聲', 'Female')}
          </button>
          <button className={genderFilter === 'male' ? 'active' : ''} onClick={() => setGenderFilter('male')}>
            {t('男聲', 'Male')}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {filtered.map((v) => (
          <div key={v.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: v.orbStyle,
                  flexShrink: 0,
                }}
              ></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>
                  {v.zh} · {v.en}
                </h3>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-2)', marginTop: 2 }}>{v.meta}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <span className={`chip ${v.gender === 'male' ? 'violet' : 'coral'}`}>
                    {v.gender === 'male' ? t('男聲', 'Male') : t('女聲', 'Female')}
                  </span>
                  <span className="chip ink">{v.lang}</span>
                </div>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', margin: '14px 0 0', lineHeight: 1.5 }}>
              {v.desc}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                <IconPlay size={14} />
                {t('試聽', 'Preview')}
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                onClick={() => router.push('/new')}
              >
                {t('用這個聲音', 'Use voice')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
