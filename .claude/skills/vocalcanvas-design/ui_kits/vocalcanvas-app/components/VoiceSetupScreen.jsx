/* Voice setup screen — pick gender, tune sliders, pick preset */

function VoiceSetupScreen({ state, setState, goTo, lang }) {
  const t = (zh, en) => lang === "zh" ? zh : en;
  const { gender, age, pitch, timbre, preset } = state.voice;
  const setVoice = (patch) => setState((s) => ({ ...s, voice: { ...s.voice, ...patch } }));

  return (
    <div className="screen">
      <Steps active={0} />

      <div className="screen-header">
        <div>
          <h1>{t("挑一個聲音", "Pick a voice")}</h1>
          <div className="sub">{t("先選性別，再用拉桿微調 — 你也可以從預設聲音開始。", "Choose a gender, then dial in the timbre — or start from a preset.")}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        <div className="card">
          <div className="section-label">{t("聲音性別", "Voice gender")}</div>
          <GenderSelector value={gender} onChange={(v) => setVoice({ gender: v, preset: null })} />

          <div style={{ height: 24 }}></div>
          <div className="section-label">{t("聲音調整", "Voice tuning")}</div>
          <Slider
            label={t("年齡 Age", "Age")}
            leftEnd={t("年輕", "young")}
            rightEnd={t("成熟", "mature")}
            value={age}
            onChange={(v) => setVoice({ age: v, preset: null })}
            suffix=""
          />
          <Slider
            label={t("音高 Pitch", "Pitch")}
            leftEnd={t("低沉 deep", "deep")}
            rightEnd={t("高亢 bright", "bright")}
            value={pitch}
            onChange={(v) => setVoice({ pitch: v, preset: null })}
          />
          <Slider
            label={t("音色 Timbre", "Timbre")}
            leftEnd={t("溫柔 gentle", "gentle")}
            rightEnd={t("粗獷 rough", "rough")}
            value={timbre}
            onChange={(v) => setVoice({ timbre: v, preset: null })}
          />
        </div>

        <div className="card">
          <div className="section-label">{t("預設聲音", "Voice presets")}</div>
          <VoicePresets
            value={preset}
            genderFilter={gender}
            onChange={(id) => {
              const p = PRESETS.find((x) => x.id === id);
              const presetTuning = {
                dawn:  { age: 32, pitch: 70, timbre: 24 },
                mist:  { age: 58, pitch: 28, timbre: 38 },
                ember: { age: 42, pitch: 64, timbre: 72 },
                glass: { age: 30, pitch: 56, timbre: 18 },
              }[id];
              setVoice({ preset: id, ...presetTuning });
            }}
          />
          <div style={{ marginTop: 20, padding: 16, background: "var(--cream-100)", borderRadius: 12 }}>
            <div className="section-label" style={{ marginBottom: 4 }}>{t("試聽片段", "Sample preview")}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="iconbtn" style={{ background: "var(--coral-500)", color: "#fff" }}>
                <IconPlay size={18} />
              </button>
              <div style={{ flex: 1, display: "flex", gap: 2, alignItems: "center", height: 32 }}>
                {[8, 14, 20, 26, 22, 16, 12, 18, 24, 20, 14, 10, 16, 22, 18, 12, 8, 14, 20, 26, 18, 12, 8, 14].map((h, i) => (
                  <span key={i} style={{ width: 3, height: h + "px", borderRadius: 2, background: "var(--coral-400)" }}></span>
                ))}
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-2)" }}>0:08</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
        <button className="btn btn-ghost" onClick={() => goTo("library")}>
          <IconChevronLeft size={16} />
          {t("回到作品", "Back to library")}
        </button>
        <button className="btn btn-primary" onClick={() => goTo("script-editor")}>
          {t("下一步：編輯文字", "Continue to script")}
          <IconChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { VoiceSetupScreen });
