/* Shared UI primitives for VocalCanvas */

// ---- Slider with thumb drag ----
function Slider({ label, leftEnd, rightEnd, value, onChange, suffix = "%" }) {
  const ref = React.useRef(null);
  const handlePointer = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const move = (ev) => {
      const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      onChange(Math.round(pct));
    };
    move(e);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return (
    <div className="sl">
      <div className="sl-label">{label}</div>
      <div>
        <div className="sl-track" ref={ref} onPointerDown={handlePointer}>
          <div className="sl-fill" style={{ width: value + "%" }}></div>
          <div className="sl-thumb" style={{ left: value + "%" }}></div>
        </div>
        <div className="sl-ends"><span>{leftEnd}</span><span>{rightEnd}</span></div>
      </div>
      <div className="sl-value">{value}{suffix}</div>
    </div>
  );
}

// ---- Voice gender selector ----
function GenderSelector({ value, onChange }) {
  return (
    <div className="gender-grid">
      {[
        { id: "male", zh: "男聲", en: "Male", sub: "Lower registers, baritones, warm bass." },
        { id: "female", zh: "女聲", en: "Female", sub: "Higher registers, soprano, soft alto." },
      ].map((g) => (
        <button
          key={g.id}
          type="button"
          className={`gender-card ${g.id} ${value === g.id ? "selected" : ""}`}
          onClick={() => onChange(g.id)}
        >
          <div className="orb"></div>
          <h3>{g.zh} <span style={{ color: "var(--fg-3)", fontWeight: 400, fontSize: 16 }}>— {g.en}</span></h3>
          <div className="sub">{g.sub}</div>
          {value === g.id && (
            <div className="check"><IconCheck size={16} stroke={2.5} /></div>
          )}
        </button>
      ))}
    </div>
  );
}

// ---- Voice presets ----
const PRESETS = [
  { id: "dawn",  zh: "晨光", en: "Dawn",  meta: "warm · bright", gender: "female", orb: "o-dawn" },
  { id: "mist",  zh: "夜霧", en: "Mist",  meta: "deep · gentle", gender: "male",   orb: "o-mist" },
  { id: "ember", zh: "焰心", en: "Ember", meta: "rough · playful", gender: "female", orb: "o-ember" },
  { id: "glass", zh: "清玻", en: "Glass", meta: "cool · soft",   gender: "male",   orb: "o-glass" },
];

function VoicePresets({ value, onChange, genderFilter }) {
  const filtered = genderFilter ? PRESETS.filter((p) => p.gender === genderFilter) : PRESETS;
  return (
    <div className="preset-grid">
      {filtered.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`preset ${value === p.id ? "active" : ""}`}
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

// ---- Wizard step indicator ----
function Steps({ active }) {
  const steps = ["Voice", "Script", "Render"];
  return (
    <div className="steps">
      {steps.map((label, i) => {
        const state = i < active ? "done" : i === active ? "active" : "";
        return (
          <React.Fragment key={i}>
            <div className={`step ${state}`}>
              <div className="num">{i < active ? <IconCheck size={14} stroke={2.5} /> : i + 1}</div>
              <div className="lbl">{label}</div>
            </div>
            {i < steps.length - 1 && <div className="step-line"></div>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---- Static waveform (for thumbs and display) ----
function MiniWave({ heights, played = 0, color = "var(--coral-600)" }) {
  return (
    <div className="lib-thumb">
      {heights.map((h, i) => (
        <span key={i} style={{ height: h + "px", background: i < played ? color : "rgba(255,90,60,0.4)" }}></span>
      ))}
    </div>
  );
}

Object.assign(window, { Slider, GenderSelector, VoicePresets, Steps, MiniWave, PRESETS });
