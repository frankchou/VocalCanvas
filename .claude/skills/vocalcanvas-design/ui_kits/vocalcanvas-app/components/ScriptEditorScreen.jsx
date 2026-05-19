/* Script editor screen — write text + insert delay tags */

// Script is modeled as an array of nodes: { type: "text", value } or { type: "delay", seconds }
const DEFAULT_SCRIPT_ZH = [
  { type: "text", value: "歡迎來到 VocalCanvas。" },
  { type: "delay", seconds: 0.8 },
  { type: "text", value: "在這裡，每段文字都能擁有自己的聲音。" },
  { type: "delay", seconds: 1.2 },
  { type: "text", value: "試著挑一個聲音，調整你想要的音色 — " },
  { type: "delay", seconds: 0.5 },
  { type: "text", value: "然後讓 AI 為你朗讀。" },
];

function ScriptEditorScreen({ state, setState, goTo, lang }) {
  const t = (zh, en) => lang === "zh" ? zh : en;
  const script = state.script;
  const setScript = (next) => setState((s) => ({ ...s, script: next }));
  const [editingTag, setEditingTag] = React.useState(null);

  const removeNode = (idx) => setScript(script.filter((_, i) => i !== idx));
  const updateDelay = (idx, seconds) => setScript(script.map((n, i) => i === idx ? { ...n, seconds } : n));
  const insertDelay = () => {
    // append at end (the prototype: real product would use cursor position)
    setScript([...script, { type: "delay", seconds: 0.8 }, { type: "text", value: " " }]);
  };
  const updateText = (idx, value) => setScript(script.map((n, i) => i === idx ? { ...n, value } : n));

  const totalChars = script.filter(n => n.type === "text").map(n => n.value.length).reduce((a,b)=>a+b, 0);
  const totalDelay = script.filter(n => n.type === "delay").map(n => n.seconds).reduce((a,b)=>a+b, 0);
  const estDuration = Math.max(8, Math.round(totalChars * 0.15 + totalDelay));

  const startRender = () => {
    setState((s) => ({ ...s, rendering: true }));
    setTimeout(() => {
      setState((s) => ({ ...s, rendering: false }));
      goTo("preview");
    }, 2400);
  };

  const voice = state.voice;
  const presetLabel = voice.preset ? PRESETS.find(p => p.id === voice.preset) : null;

  return (
    <div className="screen">
      <Steps active={1} />

      <div className="screen-header">
        <div>
          <h1>{t("編輯你的朗讀稿", "Write the script")}</h1>
          <div className="sub">{t("在文字裡插入停頓，讓 AI 朗讀更有節奏。", "Drop a pause anywhere — half a second, two seconds — and the voice will breathe.")}</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="chip ink">{t("中文 (繁體)", "Mandarin (TW)")}</span>
          <span className={`chip ${voice.gender === "male" ? "violet" : "coral"}`}>
            {presetLabel ? `${presetLabel.zh} · ${presetLabel.en}` : (voice.gender === "male" ? t("男聲", "Male") : t("女聲", "Female"))}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        <div>
          <div className="script-area">
            {script.map((node, idx) => {
              if (node.type === "text") {
                return (
                  <span
                    key={idx}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateText(idx, e.target.textContent)}
                    style={{ outline: "none" }}
                  >{node.value}</span>
                );
              }
              const isEditing = editingTag === idx;
              return (
                <span
                  key={idx}
                  className="tag-delay"
                  onClick={() => setEditingTag(isEditing ? null : idx)}
                  onDoubleClick={(e) => { e.stopPropagation(); removeNode(idx); setEditingTag(null); }}
                  title={t("點兩下刪除", "Double-click to remove")}
                >
                  {isEditing ? (
                    <>
                      &lt;delay&nbsp;
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10"
                        value={node.seconds}
                        onChange={(e) => updateDelay(idx, parseFloat(e.target.value) || 0.1)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        style={{ width: 48, fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--violet-600)", background: "rgba(255,255,255,0.6)", border: "1px solid var(--violet-300)", borderRadius: 4, padding: "0 4px", outline: "none" }}
                      />s&gt;
                    </>
                  ) : (
                    <>&lt;delay {node.seconds.toFixed(1)}s&gt;</>
                  )}
                </span>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14 }}>
            <button
              onClick={insertDelay}
              style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, padding: "8px 14px", borderRadius: "var(--r-pill)", border: "1px dashed var(--violet-400)", color: "var(--violet-600)", background: "var(--info-soft)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <IconPlus size={14} stroke={2.5} />
              {t("插入停頓", "Insert pause")}
            </button>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--fg-2)" }}>
              {t("點擊任何停頓標籤即可修改秒數。雙擊刪除。", "Click any delay tag to edit. Double-click to remove.")}
            </span>
          </div>
        </div>

        <div className="card">
          <h3>{t("輸出設定", "Output settings")}</h3>
          <div className="section-label" style={{ marginTop: 4 }}>{t("輸出格式", "Format")}</div>
          <select style={{ width: "100%", fontFamily: "var(--font-body)", fontSize: 14, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line-2)", background: "#fff", outline: "none" }}>
            <option>mp3 · 240 kbps</option>
            <option>mp3 · 320 kbps</option>
            <option>wav · 16-bit</option>
          </select>

          <div className="section-label" style={{ marginTop: 16 }}>{t("朗讀語言", "Reading language")}</div>
          <select style={{ width: "100%", fontFamily: "var(--font-body)", fontSize: 14, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line-2)", background: "#fff", outline: "none" }}>
            <option>中文 (繁體)</option>
            <option>中文 (簡體)</option>
            <option>English (US)</option>
            <option>日本語</option>
          </select>

          <div style={{ marginTop: 20, padding: 14, background: "var(--cream-100)", borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-body)", fontSize: 13 }}>
              <span style={{ color: "var(--fg-2)" }}>{t("預估時長", "Est. duration")}</span>
              <b style={{ fontFamily: "var(--font-mono)" }}>{Math.floor(estDuration/60)}:{String(estDuration % 60).padStart(2, "0")}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-body)", fontSize: 13, marginTop: 6 }}>
              <span style={{ color: "var(--fg-2)" }}>{t("字數", "Characters")}</span>
              <b style={{ fontFamily: "var(--font-mono)" }}>{totalChars}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-body)", fontSize: 13, marginTop: 6 }}>
              <span style={{ color: "var(--fg-2)" }}>{t("停頓總時長", "Total pauses")}</span>
              <b style={{ fontFamily: "var(--font-mono)" }}>{totalDelay.toFixed(1)}s</b>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
        <button className="btn btn-ghost" onClick={() => goTo("voice-setup")}>
          <IconChevronLeft size={16} />
          {t("上一步", "Back")}
        </button>
        <button className="btn btn-render" onClick={startRender}>
          <IconSparkles size={18} />
          {t("產出音檔", "Render audio")}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ScriptEditorScreen, DEFAULT_SCRIPT_ZH });
