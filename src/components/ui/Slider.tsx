'use client';

import { useRef } from 'react';

interface SliderProps {
  label: string;
  leftEnd: string;
  rightEnd: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}

export default function Slider({
  label,
  leftEnd,
  rightEnd,
  value,
  onChange,
  suffix = '%',
}: SliderProps): React.JSX.Element {
  const trackRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();

    const move = (ev: PointerEvent): void => {
      // Pointer Events 已統一 touch/mouse 的 clientX；此處保留相容性寫法
      const clientX = (ev as PointerEvent & { touches?: TouchList }).touches
        ? (ev as PointerEvent & { touches: TouchList }).touches[0].clientX
        : ev.clientX;
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      onChange(Math.round(pct));
    };

    const up = (): void => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };

    move(e.nativeEvent);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div className="sl">
      <div className="sl-label">{label}</div>
      <div>
        <div className="sl-track" ref={trackRef} onPointerDown={handlePointerDown}>
          <div className="sl-fill" style={{ width: value + '%' }}></div>
          <div className="sl-thumb" style={{ left: value + '%' }}></div>
        </div>
        <div className="sl-ends">
          <span>{leftEnd}</span>
          <span>{rightEnd}</span>
        </div>
      </div>
      <div className="sl-value">{value}{suffix}</div>
    </div>
  );
}
