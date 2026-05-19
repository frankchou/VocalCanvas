/* Preview screen — playback with speed control, save/download/favorite */

function PreviewScreen({ state, setState, goTo, lang }) {
  const t = (zh, en) => lang === "zh" ? zh : en;
  const [playing, setPlaying] = React.useState(true);
  const [progress, setProgress] = React.useState(0.3);
  const [speed, setSpeed] = React.useState(1);
  const [fav, setFav] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const presetLabel = state.voice.preset ? PRESETS.find(p => p.id === state.voice.preset) : null;
  const voiceName = presetLabel ? `${presetLabel.zh} · ${presetLabel.en}` : (state.voice.gender === "male" ? t("男聲", "Male") : t("女聲", "Female"));

  React.useEffect(() => {
    if (!playing) return;
    const i = setInterval(() => {
      setProgress((p) => {
        if (p >= 1) { setPlaying(false); return 1; }
        return p + 0.005 * speed;
      });
    }, 50);
    return () => clearInterval(i);
  }, [playing, speed]);

  const totalSec = 68;
  const cur = Math.floor(progress * totalSec);
  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // generate waveform heights
  const waveform = React.useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => {
      const base = 30 + Math.sin(i * 0.4) * 18 + Math.sin(i * 0.13) * 22 + Math.sin(i * 0.7) * 14;
      return Math.max(8, Math.min(80, Math.round(base)));
    });
  }, []);
  const playedIdx = Math.floor(progress * waveform.length);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="screen">
      <Steps active={2} />

      <div className="screen-header">
        <div>
          <h1>{t("試聽你的作品", "Preview your take")}</h1>
          <div className="sub">{t("調整播放速度，喜歡的話收藏或下載。", "Adjust the playback speed, then save or download.")}</div>
        </div>
        <span className="chip mint">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--mint-500)" }}></span>
          {t("音檔已就緒", "Ready")}
        </span>
      </div>

      <div className="studio-stage">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2>產品介紹 · 中文版</h2>
            <div className="stage-sub">{voiceName} · {t("中文 (繁體)", "Mandarin (TW)")} · mp3 240 kbps</div>
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,252,247,0.6)" }}>
            vocalcanvas_{state.voice.preset || "custom"}_240519.mp3
          </span>
        </div>

        <div className="wave-display">
          {waveform.map((h, i) => (
            <span
              key={i}
              className={i < playedIdx ? "played" : ""}
              style={{ height: h + "px" }}
            ></span>
          ))}
        </div>

        <div className="pb-row">
          <button className="pb-btn-sm" onClick={() => setProgress(Math.max(0, progress - 0.1))}>
            <IconSkipBack size={18} />
          </button>
          <button className="pb-btn-big" onClick={() => setPlaying(!playing)}>
            {playing ? <IconPause size={26} /> : <IconPlay size={26} />}
          </button>
          <button className="pb-btn-sm" onClick={() => setProgress(Math.min(1, progress + 0.1))}>
            <IconSkipForward size={18} />
          </button>

          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 4 }}>
            <div style={{ height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: (progress * 100) + "%", background: "var(--coral-500)", borderRadius: 2 }}></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="pb-time">{fmt(cur)}</span>
              <span className="pb-time">−{fmt(totalSec - cur)}</span>
            </div>
          </div>

          <div className="speed-pills">
            {speeds.map((s) => (
              <button key={s} className={speed === s ? "active" : ""} onClick={() => setSpeed(s)}>
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 24 }}>
        <button
          className="card"
          style={{ cursor: "pointer", border: fav ? "2px solid var(--coral-500)" : "1px solid var(--line-1)", textAlign: "left" }}
          onClick={() => setFav(!fav)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: fav ? "var(--coral-500)" : "var(--cream-200)", color: fav ? "#fff" : "var(--fg-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {fav ? <IconHeartFill size={20} /> : <IconHeart size={20} />}
            </div>
            <span className="chip ink" style={{ visibility: fav ? "visible" : "hidden" }}><IconCheck size={12} stroke={2.5} />已收藏</span>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, marginTop: 12 }}>{t("加入收藏", "Add to favorites")}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--fg-2)", marginTop: 4 }}>{t("收藏的作品會顯示在側邊欄", "Favorites pin to your sidebar")}</div>
        </button>

        <button
          className="card"
          style={{ cursor: "pointer", border: saved ? "2px solid var(--mint-500)" : "1px solid var(--line-1)", textAlign: "left" }}
          onClick={() => setSaved(true)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: saved ? "var(--mint-500)" : "var(--cream-200)", color: saved ? "#fff" : "var(--fg-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {saved ? <IconCheck size={20} stroke={2.5} /> : <IconLibrary size={20} />}
            </div>
            <span className="chip mint" style={{ visibility: saved ? "visible" : "hidden" }}><IconCheck size={12} stroke={2.5} />已儲存</span>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, marginTop: 12 }}>{t("儲存到作品庫", "Save to library")}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--fg-2)", marginTop: 4 }}>{t("以後可以重新聆聽、修改、下載", "Replay, remix or download later")}</div>
        </button>

        <button className="card" style={{ cursor: "pointer", textAlign: "left" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--cream-200)", color: "var(--fg-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconDownload size={20} />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, marginTop: 12 }}>{t("下載 mp3", "Download mp3")}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--fg-2)", marginTop: 4 }}>{t("240 kbps · ~1.2 MB", "240 kbps · ~1.2 MB")}</div>
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
        <button className="btn btn-ghost" onClick={() => goTo("script-editor")}>
          <IconChevronLeft size={16} />
          {t("回到編輯", "Back to script")}
        </button>
        <button className="btn btn-primary" onClick={() => goTo("library")}>
          {t("完成 · 回到作品庫", "Done — back to library")}
          <IconCheck size={16} stroke={2.5} />
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { PreviewScreen });
