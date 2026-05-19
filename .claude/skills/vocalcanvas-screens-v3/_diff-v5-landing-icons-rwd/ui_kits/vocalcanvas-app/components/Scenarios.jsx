/* Quick scenarios + BGM tracks for VocalCanvas — Lucide-style SVG icons */

// ---- Icon primitive ----
const ScIcon = ({ children, sz = "1em" }) => (
  <svg
    width={sz}
    height={sz}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
  >
    {children}
  </svg>
);

// ---- Scenario icons (em-sized; size via parent fontSize) ----
const IcMeditation  = <ScIcon><circle cx="12" cy="5" r="2.2"/><path d="M12 7.5v3.5"/><path d="M7.5 19c1.5-4 3-6 4.5-6s3 2 4.5 6"/><path d="M4.5 19h15"/></ScIcon>;
const IcBedtime     = <ScIcon><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></ScIcon>;
const IcAffirmation = <ScIcon><path d="M12 3l1.5 5 5 1.5-5 1.5L12 16l-1.5-5-5-1.5 5-1.5L12 3z"/><path d="M19 14l.7 2.3 2.3.7-2.3.7L19 20l-.7-2.3L16 17l2.3-.7z"/></ScIcon>;
const IcPodcast     = <ScIcon><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></ScIcon>;
const IcAd          = <ScIcon><polygon points="3 11 22 2 22 22 3 13 3 11"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></ScIcon>;
const IcAudiobook   = <ScIcon><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></ScIcon>;
const IcCustom      = <ScIcon><path d="M12 3v18"/><path d="M3 12h18"/><path d="M5.6 5.6l12.8 12.8"/><path d="M18.4 5.6L5.6 18.4"/></ScIcon>;

// ---- BGM icons ----
const IcNone     = <ScIcon><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></ScIcon>;
const IcOcean    = <ScIcon><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></ScIcon>;
const IcForest   = <ScIcon><polygon points="12 3 17 9 14.5 9 17.5 13 14.5 13 18 17 6 17 9.5 13 6.5 13 9.5 9 7 9"/><line x1="12" y1="17" x2="12" y2="21"/></ScIcon>;
const IcBowl     = <ScIcon><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor"/></ScIcon>;
const IcRain     = <ScIcon><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><line x1="8" y1="19" x2="8" y2="21"/><line x1="12" y1="19" x2="12" y2="21"/><line x1="16" y1="19" x2="16" y2="21"/></ScIcon>;
const IcPiano    = <ScIcon><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></ScIcon>;
const IcAmbient  = <ScIcon><path d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2"/></ScIcon>;
const IcUpbeat   = <ScIcon><circle cx="8" cy="18" r="3.5"/><circle cx="18" cy="15" r="3"/><path d="M11.5 18V4l9.5 1.5V15"/></ScIcon>;
const IcCinematic= <ScIcon><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></ScIcon>;

const SCENARIOS = [
  {
    id: "custom",
    icon: IcCustom,
    zh: "自訂", en: "Custom",
    descZh: "從零開始", descEn: "Start fresh",
    gradient: "linear-gradient(135deg, #FFFCF7 0%, #F4ECDA 100%)",
    fg: "var(--ink-700)",
  },
  {
    id: "meditation",
    icon: IcMeditation,
    zh: "冥想", en: "Meditation",
    descZh: "柔和、緩慢、低沉", descEn: "Calm · slow · deep",
    voice: { gender: "female", preset: "glass", age: 38, pitch: 22, timbre: 14 },
    bgmRecommended: ["ocean", "forest", "bowl", "rain"],
    bgmDefault: "ocean",
    bgmVolume: 35,
    gradient: "linear-gradient(135deg, #7AE5C0 0%, #6E52F2 100%)",
    fg: "#FFFFFF",
  },
  {
    id: "bedtime",
    icon: IcBedtime,
    zh: "睡前故事", en: "Bedtime",
    descZh: "溫暖、輕柔、低沉", descEn: "Warm · soft · low",
    voice: { gender: "female", preset: "dawn", age: 36, pitch: 28, timbre: 12 },
    bgmRecommended: ["rain", "piano", "forest"],
    bgmDefault: "rain",
    bgmVolume: 28,
    gradient: "linear-gradient(135deg, #6E52F2 0%, #FF85A8 100%)",
    fg: "#FFFFFF",
  },
  {
    id: "affirmation",
    icon: IcAffirmation,
    zh: "正念肯定語", en: "Affirmation",
    descZh: "柔和、中音、堅定", descEn: "Soft · mid · grounded",
    voice: { gender: "female", preset: "dawn", age: 32, pitch: 50, timbre: 18 },
    bgmRecommended: ["bowl", "ambient", "piano"],
    bgmDefault: "bowl",
    bgmVolume: 25,
    gradient: "linear-gradient(135deg, #FFC785 0%, #F25C8A 100%)",
    fg: "#FFFFFF",
  },
  {
    id: "podcast",
    icon: IcPodcast,
    zh: "Podcast 開場", en: "Podcast intro",
    descZh: "清亮、有活力", descEn: "Bright · energetic",
    voice: { gender: "male", preset: "glass", age: 30, pitch: 64, timbre: 38 },
    bgmRecommended: ["upbeat", "cinematic", "none"],
    bgmDefault: "upbeat",
    bgmVolume: 18,
    gradient: "linear-gradient(135deg, #FF5A3C 0%, #FFA94D 100%)",
    fg: "#FFFFFF",
  },
  {
    id: "ad",
    icon: IcAd,
    zh: "廣告", en: "Advertisement",
    descZh: "自信、明亮、有節奏", descEn: "Confident · punchy",
    voice: { gender: "female", preset: "ember", age: 28, pitch: 70, timbre: 56 },
    bgmRecommended: ["upbeat", "cinematic"],
    bgmDefault: "cinematic",
    bgmVolume: 22,
    gradient: "linear-gradient(135deg, #F25C8A 0%, #FF5A3C 50%, #FFA94D 100%)",
    fg: "#FFFFFF",
  },
  {
    id: "audiobook",
    icon: IcAudiobook,
    zh: "有聲書", en: "Audiobook",
    descZh: "沉穩、中性、清晰", descEn: "Steady · neutral · clear",
    voice: { gender: "male", preset: "mist", age: 45, pitch: 40, timbre: 32 },
    bgmRecommended: ["none", "piano"],
    bgmDefault: "none",
    bgmVolume: 0,
    gradient: "linear-gradient(135deg, #2A271F 0%, #6C6757 100%)",
    fg: "#FFFCF7",
  },
];

const BGM_TRACKS = [
  { id: "none",     icon: IcNone,     zh: "純朗讀",   en: "No music",     descZh: "只有人聲",   descEn: "Voice only",       duration: null },
  { id: "ocean",    icon: IcOcean,    zh: "海浪",     en: "Ocean",        descZh: "慢拍海浪",   descEn: "Slow surf",         duration: "8m loop" },
  { id: "forest",   icon: IcForest,   zh: "森林",     en: "Forest",       descZh: "鳥鳴與溪流", descEn: "Birds & brook",     duration: "10m loop" },
  { id: "bowl",     icon: IcBowl,     zh: "頌缽",     en: "Singing bowl", descZh: "藏式頌缽",   descEn: "Tibetan bowls",     duration: "6m loop" },
  { id: "rain",     icon: IcRain,     zh: "雨聲",     en: "Rain",         descZh: "輕柔雨聲",   descEn: "Gentle rain",       duration: "12m loop" },
  { id: "piano",    icon: IcPiano,    zh: "輕鋼琴",   en: "Soft piano",   descZh: "氛圍鋼琴",   descEn: "Ambient piano",     duration: "9m loop" },
  { id: "ambient",  icon: IcAmbient,  zh: "環境音",   en: "Ambient",      descZh: "空靈氛圍",   descEn: "Ethereal pad",      duration: "8m loop" },
  { id: "upbeat",   icon: IcUpbeat,   zh: "動感節拍", en: "Upbeat",       descZh: "現代節奏",   descEn: "Modern beat",       duration: "4m loop" },
  { id: "cinematic",icon: IcCinematic,zh: "電影感",   en: "Cinematic",    descZh: "宏大電影感", descEn: "Epic, sweeping",    duration: "5m loop" },
];

const getBgmTrack = (id) => BGM_TRACKS.find((t) => t.id === id) || BGM_TRACKS[0];

// ---- Scenario selector ----
function ScenarioSelector({ value, onChange, lang }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
      gap: 12,
    }} className="scenario-strip">
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
              cursor: "pointer",
              boxShadow: selected ? "var(--shadow-md), inset 0 0 0 3px var(--coral-500)" : "var(--shadow-sm)",
              transition: "all 240ms var(--ease-out)",
              transform: selected ? "translateY(-2px)" : "none",
              textAlign: "left",
              position: "relative",
              overflow: "hidden",
              minHeight: 96,
            }}
          >
            <div style={{ fontSize: 24, lineHeight: 1, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>
              {lang === "zh" ? s.zh : s.en}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, opacity: 0.85, marginTop: 4, lineHeight: 1.3 }}>
              {lang === "zh" ? s.descZh : s.descEn}
            </div>
            {selected && (
              <div style={{
                position: "absolute", top: 8, right: 8,
                width: 20, height: 20, borderRadius: "50%",
                background: "var(--coral-500)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
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

// ---- BGM picker grid ----
function BGMPicker({ value, onChange, volume, onVolumeChange, recommended, lang, expanded, onToggleExpanded }) {
  const t = (zh, en) => lang === "zh" ? zh : en;
  const recommendedTracks = recommended
    ? BGM_TRACKS.filter((b) => recommended.includes(b.id))
    : BGM_TRACKS;
  const tracksToShow = expanded ? BGM_TRACKS : recommendedTracks;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div className="section-label" style={{ margin: 0 }}>
            {t("背景音樂", "Background music")}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--fg-2)", marginTop: 2 }}>
            {recommended && !expanded
              ? t(`推薦 ${recommendedTracks.length} 首音樂`, `${recommendedTracks.length} recommended tracks`)
              : t("全部 9 首音樂", "All 9 tracks")}
          </div>
        </div>
        {recommended && (
          <button type="button" onClick={onToggleExpanded} className="btn btn-ghost btn-sm">
            {expanded ? t("只看推薦", "Show recommended") : t("看全部", "Show all")}
          </button>
        )}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
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
                border: selected ? "2px solid var(--coral-500)" : "1px solid var(--line-1)",
                borderRadius: 14,
                padding: 12,
                background: selected ? "var(--coral-50)" : "#fff",
                cursor: "pointer",
                transition: "all 140ms var(--ease-out)",
                textAlign: "left",
                position: "relative",
                boxShadow: selected ? "var(--shadow-sm)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: track.id === "none" ? "var(--cream-200)" : "var(--grad-sunset-soft)",
                  color: track.id === "none" ? "var(--fg-3)" : "var(--coral-700)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}>
                  {track.icon}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {lang === "zh" ? track.zh : track.en}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--fg-2)", marginTop: 1 }}>
                    {lang === "zh" ? track.descZh : track.descEn}
                  </div>
                </div>
              </div>
              {track.duration && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-3)" }}>{track.duration}</span>
                  {isRec && !expanded && (
                    <span className="chip coral" style={{ fontSize: 10, padding: "2px 6px" }}>
                      {t("推薦", "Rec.")}
                    </span>
                  )}
                </div>
              )}
              {selected && (
                <div style={{
                  position: "absolute", top: 8, right: 8,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "var(--coral-500)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IconCheck size={11} stroke={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {value !== "none" && (
        <BGMVolumeSlider lang={lang} value={volume} onChange={onVolumeChange} />
      )}
    </div>
  );
}

function BGMVolumeSlider({ lang, value, onChange }) {
  const t = (zh, en) => lang === "zh" ? zh : en;
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
    <div style={{
      marginTop: 16,
      padding: "14px 18px",
      background: "var(--cream-100)",
      borderRadius: 12,
      display: "grid",
      gridTemplateColumns: "120px 1fr 50px",
      gap: 16,
      alignItems: "center",
    }}>
      <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}>
        {t("音樂音量", "Music volume")}
      </div>
      <div>
        <div className="sl-track" ref={ref} onPointerDown={handlePointer}>
          <div className="sl-fill" style={{ width: value + "%" }}></div>
          <div className="sl-thumb" style={{ left: value + "%" }}></div>
        </div>
        <div className="sl-ends">
          <span>{t("小", "soft")}</span>
          <span>{t("大", "loud")}</span>
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: "var(--coral-600)", textAlign: "right" }}>
        {value}%
      </div>
    </div>
  );
}

Object.assign(window, { SCENARIOS, BGM_TRACKS, getBgmTrack, ScenarioSelector, BGMPicker });
