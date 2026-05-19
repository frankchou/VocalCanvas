'use client';

export const PRESETS = [
  { id: 'dawn',  zh: '晨光', en: 'Dawn',  meta: 'warm · bright',   gender: 'female', orb: 'o-dawn' },
  { id: 'mist',  zh: '夜霧', en: 'Mist',  meta: 'deep · gentle',   gender: 'male',   orb: 'o-mist' },
  { id: 'ember', zh: '焰心', en: 'Ember', meta: 'rough · playful', gender: 'female', orb: 'o-ember' },
  { id: 'glass', zh: '清玻', en: 'Glass', meta: 'cool · soft',     gender: 'male',   orb: 'o-glass' },
] as const;

export type PresetId = typeof PRESETS[number]['id'];

interface VoicePresetsProps {
  value: string | null;
  onChange: (id: string) => void;
  genderFilter?: 'male' | 'female' | null;
}

export default function VoicePresets({ value, onChange, genderFilter }: VoicePresetsProps): React.JSX.Element {
  const filtered = genderFilter ? PRESETS.filter((p) => p.gender === genderFilter) : PRESETS;
  return (
    <div className="preset-grid">
      {filtered.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`preset ${value === p.id ? 'active' : ''}`}
          onClick={() => onChange(p.id)}
        >
          <div className={`orb ${p.orb}`}></div>
          <h4>{p.zh} · {p.en}</h4>
          <div className="meta">{p.meta}</div>
        </button>
      ))}
    </div>
  );
}
