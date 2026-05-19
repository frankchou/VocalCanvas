import React from 'react';
import { IconCheck } from './Icons';

const STEP_LABELS = ['Voice', 'Script', 'Render'];

interface StepsProps {
  active: 0 | 1 | 2;
}

export default function Steps({ active }: StepsProps): React.JSX.Element {
  return (
    <div className="steps">
      {STEP_LABELS.map((label, i) => {
        const state = i < active ? 'done' : i === active ? 'active' : '';
        return (
          <React.Fragment key={i}>
            <div className={`step ${state}`}>
              <div className="num">
                {i < active ? <IconCheck size={14} stroke={2.5} /> : i + 1}
              </div>
              <div className="lbl">{label}</div>
            </div>
            {i < STEP_LABELS.length - 1 && <div className="step-line"></div>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
