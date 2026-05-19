'use client';

import { IconCheck } from './Icons';

const GENDERS = [
  { id: 'male' as const, zh: '男聲', en: 'Male', sub: 'Lower registers, baritones, warm bass.' },
  { id: 'female' as const, zh: '女聲', en: 'Female', sub: 'Higher registers, soprano, soft alto.' },
];

interface GenderSelectorProps {
  value: 'male' | 'female' | null;
  onChange: (v: 'male' | 'female') => void;
}

export default function GenderSelector({ value, onChange }: GenderSelectorProps): React.JSX.Element {
  return (
    <div className="gender-grid">
      {GENDERS.map((g) => (
        <button
          key={g.id}
          type="button"
          className={`gender-card ${g.id} ${value === g.id ? 'selected' : ''}`}
          onClick={() => onChange(g.id)}
        >
          <div className="orb"></div>
          <h3>
            {g.zh}{' '}
            <span style={{ color: 'var(--fg-3)', fontWeight: 400, fontSize: 16 }}>— {g.en}</span>
          </h3>
          <div className="sub">{g.sub}</div>
          {value === g.id && (
            <div className="check">
              <IconCheck size={16} stroke={2.5} />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
