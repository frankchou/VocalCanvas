/* Onboarding flow — 4-step modal overlay shown on first login */

const ONBOARDING_STEPS = [
  {
    eyebrowZh: "歡迎來到 VocalCanvas",
    eyebrowEn: "Welcome to VocalCanvas",
    titleZh: "讓你的文字\n擁有聲音。",
    titleEn: "Give your words\na voice.",
    subZh: "用 AI 把任何文字變成有溫度、像真人的聲音。多語言、可微調、可下載。",
    subEn: "Turn any text into a warm, lifelike voice with AI. Multilingual, tunable, downloadable.",
    illust: "hero",
  },
  {
    eyebrowZh: "STEP 1",
    eyebrowEn: "STEP 1",
    titleZh: "挑一個聲音。",
    titleEn: "Pick a voice.",
    subZh: "從六款精選聲音中挑選 — 晨光、夜霧、焰心、清玻… 或自己用拉桿微調年齡、音高、音色。",
    subEn: "Choose from six curated voices — Dawn, Mist, Ember, Glass… or dial in your own with age, pitch, and timbre sliders.",
    illust: "voice",
  },
  {
    eyebrowZh: "STEP 2",
    eyebrowEn: "STEP 2",
    titleZh: "在文字裡呼吸。",
    titleEn: "Let the words breathe.",
    subZh: "在重點處插入 <delay 0.8s> 停頓標籤，讓 AI 朗讀像對話一樣自然，不再像機器人。",
    subEn: "Drop <delay 0.8s> tags anywhere in your script and the voice will pause — natural, never robotic.",
    illust: "script",
  },
  {
    eyebrowZh: "STEP 3",
    eyebrowEn: "STEP 3",
    titleZh: "產出、收藏、下載。",
    titleEn: "Render, save, download.",
    subZh: "10 秒內聽到完成品。調整播放速度，收藏到作品庫，或下載 mp3。",
    subEn: "Hear the result in under 10 seconds. Adjust speed, save to your library, or download as mp3.",
    illust: "render",
  },
];

function OnboardingScreen({ lang, onClose }) {
  const t = (zh, en) => lang === "zh" ? zh : en;
  const [idx, setIdx] = React.useState(0);
  const step = ONBOARDING_STEPS[idx];
  const isLast = idx === ONBOARDING_STEPS.length - 1;

  const renderIllust = (kind) => {
    if (kind === "hero") return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, padding: 24 }}>
        <img src="../../assets/logo-mark.svg" width="120" height="120" alt="" style={{ filter: "drop-shadow(0 16px 36px rgba(255,90,60,0.35))" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 4, height: 80 }}>
          {[40, 60, 90, 70, 50, 30, 70, 95, 80, 50, 30, 60, 85, 60, 40, 25].map((h, i) => (
            <span key={i} style={{
              width: 5, height: h + "px", borderRadius: 3,
              background: "var(--coral-500)",
              boxShadow: "0 0 12px rgba(255,90,60,0.5)",
              animation: `heroWave 1.6s var(--ease-in-out) infinite`,
              animationDelay: `${i * 0.08}s`,
            }}></span>
          ))}
        </div>
      </div>
    );
    if (kind === "voice") return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 32, gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { name: "晨光 Dawn",  bg: "radial-gradient(circle at 30% 25%, #FFC785, #FF5A3C 70%, #BF3015)", sel: true },
            { name: "夜霧 Mist",  bg: "radial-gradient(circle at 30% 25%, #B49CFF, #6E52F2 70%, #5239D1)" },
            { name: "焰心 Ember", bg: "radial-gradient(circle at 30% 25%, #FF85A8, #F25C8A 60%, #BF3015)" },
            { name: "清玻 Glass", bg: "radial-gradient(circle at 30% 25%, #7AE5C0, #1FC68C 70%, #0FA873)" },
          ].map((v, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: 14, padding: 12,
              border: v.sel ? "2px solid var(--coral-500)" : "1px solid var(--line-1)",
              boxShadow: v.sel ? "var(--shadow-md)" : "var(--shadow-sm)",
            }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: v.bg, marginBottom: 8 }}></div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13 }}>{v.name}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 40px", gap: 10, alignItems: "center", fontFamily: "var(--font-body)", fontSize: 12 }}>
            <span style={{ fontWeight: 600 }}>音高</span>
            <div style={{ height: 6, background: "var(--cream-200)", borderRadius: 3, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "64%", background: "var(--grad-sunset)", borderRadius: 3 }}></div>
              <div style={{ position: "absolute", top: -5, left: "64%", transform: "translateX(-50%)", width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 0 0 2px var(--coral-500)" }}></div>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--coral-600)" }}>64%</span>
          </div>
        </div>
      </div>
    );
    if (kind === "script") return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}>
        <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "var(--shadow-md)", fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.85, maxWidth: 360 }}>
          歡迎來到 VocalCanvas <span className="tag-delay" style={{ fontSize: 12 }}>&lt;delay 0.8s&gt;</span>
          {" "}讓你的文字 <span className="tag-delay" style={{ fontSize: 12 }}>&lt;delay 0.5s&gt;</span> 擁有聲音。
        </div>
      </div>
    );
    if (kind === "render") return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}>
        <div style={{ background: "var(--ink-700)", backgroundImage: "var(--grad-canvas)", borderRadius: 20, padding: 24, color: "var(--cream-50)", width: "100%", maxWidth: 360, boxShadow: "var(--shadow-xl)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>產品介紹 · 中文版</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,252,247,0.6)", marginTop: 2 }}>晨光 · 中文 · mp3</div>
          <div style={{ display: "flex", alignItems: "center", gap: 2, height: 50, margin: "16px 0" }}>
            {Array.from({ length: 40 }, (_, i) => {
              const h = 8 + Math.abs(Math.sin(i * 0.4) * 32 + Math.sin(i * 0.16) * 16);
              return <span key={i} style={{ flex: 1, height: h + "px", borderRadius: 1.5, background: i < 14 ? "var(--coral-500)" : "rgba(255,255,255,0.18)" }}></span>;
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--coral-500)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-glow)" }}>
              <IconPlay size={14} />
            </div>
            <div style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,252,247,0.7)" }}>0:18 / 1:08</div>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, padding: "3px 8px", borderRadius: 999, background: "var(--coral-500)", color: "#fff", fontWeight: 600 }}>1×</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, padding: "3px 8px", borderRadius: 999, color: "rgba(255,252,247,0.6)" }}>1.5×</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,14,10,0.48)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 28,
        width: "100%",
        maxWidth: 880,
        maxHeight: "calc(100vh - 48px)",
        overflow: "hidden",
        boxShadow: "var(--shadow-xl)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }} className="onb-modal">
        {/* Left: illust */}
        <div style={{
          background: "var(--cream-100)",
          backgroundImage: idx === 0 ? "var(--grad-canvas)" : undefined,
          position: "relative",
          minHeight: 480,
        }}>
          {renderIllust(step.illust)}
        </div>

        {/* Right: copy */}
        <div style={{ padding: 48, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="eyebrow" style={{ color: "var(--coral-600)" }}>{t(step.eyebrowZh, step.eyebrowEn)}</div>
            <button
              onClick={onClose}
              style={{ background: "transparent", border: 0, color: "var(--fg-2)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, padding: 4 }}
            >
              {t("略過", "Skip")}
            </button>
          </div>

          <div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 36, lineHeight: 1.05, letterSpacing: "-0.02em",
              margin: "0 0 14px", whiteSpace: "pre-line",
            }}>{t(step.titleZh, step.titleEn)}</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.55, color: "var(--fg-2)", margin: 0 }}>
              {t(step.subZh, step.subEn)}
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {ONBOARDING_STEPS.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} style={{
                  width: i === idx ? 28 : 8,
                  height: 8,
                  borderRadius: 999,
                  border: 0,
                  background: i === idx ? "var(--coral-500)" : "var(--cream-300)",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 240ms var(--ease-out)",
                }}></button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {idx > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={() => setIdx(idx - 1)}>
                  <IconChevronLeft size={14} />
                  {t("上一步", "Back")}
                </button>
              )}
              {!isLast ? (
                <button className="btn btn-primary btn-sm" onClick={() => setIdx(idx + 1)}>
                  {t("下一步", "Next")}
                  <IconChevronRight size={14} />
                </button>
              ) : (
                <button className="btn btn-render btn-sm" onClick={onClose}>
                  <IconSparkles size={14} />
                  {t("開始創作", "Start creating")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .onb-modal { grid-template-columns: 1fr !important; max-height: calc(100vh - 32px); overflow-y: auto; }
          .onb-modal > div:first-child { min-height: 240px !important; }
          .onb-modal > div:last-child { padding: 28px 22px !important; }
          .onb-modal h2 { font-size: 26px !important; }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { OnboardingScreen });
