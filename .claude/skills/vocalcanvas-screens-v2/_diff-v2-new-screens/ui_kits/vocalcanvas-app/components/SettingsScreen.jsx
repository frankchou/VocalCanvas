/* Full Settings screen */

function SettingsRow({ label, sub, children, danger }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 16,
      alignItems: "center",
      padding: "16px 0",
      borderBottom: "1px solid var(--line-1)",
    }}>
      <div>
        <div style={{
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: 15,
          color: danger ? "var(--danger)" : "var(--fg-1)",
        }}>{label}</div>
        {sub && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--fg-2)", marginTop: 2 }}>{sub}</div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function SettingsScreen({ lang, setLang, goTo }) {
  const t = (zh, en) => lang === "zh" ? zh : en;
  const [autoSave, setAutoSave] = React.useState(true);
  const [emailNotif, setEmailNotif] = React.useState(true);
  const [productNews, setProductNews] = React.useState(false);

  const Toggle = ({ value, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 26, borderRadius: 999,
        border: 0,
        background: value ? "var(--coral-500)" : "var(--cream-300)",
        position: "relative", cursor: "pointer",
        transition: "background 240ms var(--ease-out)",
      }}
    >
      <span style={{
        position: "absolute",
        top: 3, left: value ? 21 : 3,
        width: 20, height: 20, borderRadius: 999,
        background: "#fff",
        boxShadow: "var(--shadow-sm)",
        transition: "left 240ms var(--ease-out)",
      }}></span>
    </button>
  );

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>{t("設定", "Settings")}</h1>
          <div className="sub">{t("帳號、訂閱與偏好設定", "Account, subscription and preferences")}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* ---- Account ---- */}
        <div className="card">
          <div className="section-label">{t("帳號", "Account")}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 0 16px", borderBottom: "1px solid var(--line-1)" }}>
            <div className="avatar" style={{ width: 56, height: 56, fontSize: 22 }}>F</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17 }}>Frank Chou</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--fg-2)" }}>frank@example.com</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => goTo("account")}>{t("管理", "Manage")}</button>
          </div>

          <SettingsRow
            label={t("VocalCanvas Pro", "VocalCanvas Pro")}
            sub={t("240 分鐘可用 · 下次扣款 6/19", "240 minutes left · Renews 6/19")}
          >
            <button className="btn btn-ghost btn-sm">{t("管理訂閱", "Manage")}</button>
          </SettingsRow>

          <SettingsRow
            label={t("已連結帳號", "Connected accounts")}
            sub={t("Google · LINE", "Google · LINE")}
          >
            <button className="btn btn-ghost btn-sm">{t("檢視", "View")}</button>
          </SettingsRow>
        </div>

        {/* ---- Preferences ---- */}
        <div className="card">
          <div className="section-label">{t("偏好設定", "Preferences")}</div>

          <SettingsRow label={t("介面語言", "UI Language")}>
            <div className="lang-switch">
              <button className={lang === "zh" ? "active" : ""} onClick={() => setLang("zh")}>中文</button>
              <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
            </div>
          </SettingsRow>

          <SettingsRow label={t("預設朗讀語言", "Default reading language")}>
            <select style={{ fontFamily: "var(--font-body)", fontSize: 13, padding: "6px 10px", borderRadius: 10, border: "1px solid var(--line-2)", background: "#fff" }}>
              <option>中文 (繁體)</option>
              <option>English (US)</option>
              <option>日本語</option>
            </select>
          </SettingsRow>

          <SettingsRow label={t("預設輸出格式", "Default format")}>
            <select style={{ fontFamily: "var(--font-body)", fontSize: 13, padding: "6px 10px", borderRadius: 10, border: "1px solid var(--line-2)", background: "#fff" }}>
              <option>mp3 · 240 kbps</option>
              <option>mp3 · 320 kbps</option>
              <option>wav · 16-bit</option>
            </select>
          </SettingsRow>

          <SettingsRow
            label={t("自動儲存", "Auto-save")}
            sub={t("產出後自動加入作品庫", "Save renders to library automatically")}
          >
            <Toggle value={autoSave} onChange={setAutoSave} />
          </SettingsRow>
        </div>

        {/* ---- Notifications ---- */}
        <div className="card">
          <div className="section-label">{t("通知", "Notifications")}</div>

          <SettingsRow
            label={t("Email 通知", "Email notifications")}
            sub={t("音檔產出完成時通知我", "Email me when a render completes")}
          >
            <Toggle value={emailNotif} onChange={setEmailNotif} />
          </SettingsRow>

          <SettingsRow
            label={t("產品更新", "Product news")}
            sub={t("新功能、新聲音的通知", "New features and new voices")}
          >
            <Toggle value={productNews} onChange={setProductNews} />
          </SettingsRow>

          <SettingsRow
            label={t("瀏覽器通知", "Browser notifications")}
            sub={t("在背景產音檔時提醒你", "Alert when a long render finishes")}
          >
            <button className="btn btn-ghost btn-sm">{t("開啟", "Enable")}</button>
          </SettingsRow>
        </div>

        {/* ---- Onboarding & help ---- */}
        <div className="card">
          <div className="section-label">{t("協助與快速上手", "Help & quick start")}</div>

          <SettingsRow
            label={t("重新看引導教學", "Replay onboarding")}
            sub={t("4 步驟，30 秒看完", "4 steps · 30 seconds")}
          >
            <button className="btn btn-ghost btn-sm" onClick={() => goTo("onboarding")}>
              <IconSparkles size={14} />
              {t("看一次", "Replay")}
            </button>
          </SettingsRow>

          <SettingsRow label={t("使用文件", "Documentation")}>
            <button className="btn btn-ghost btn-sm">{t("打開 →", "Open →")}</button>
          </SettingsRow>

          <SettingsRow label={t("聯絡客服", "Contact support")}>
            <button className="btn btn-ghost btn-sm">{t("寄信", "Email")}</button>
          </SettingsRow>

          <SettingsRow label={t("鍵盤快速鍵", "Keyboard shortcuts")}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-2)" }}>⌘ + /</span>
          </SettingsRow>
        </div>
      </div>

      {/* ---- Danger zone ---- */}
      <div className="card" style={{ marginTop: 20, borderColor: "rgba(229, 64, 78, 0.3)" }}>
        <div className="section-label" style={{ color: "var(--danger)" }}>{t("危險區", "Danger zone")}</div>
        <SettingsRow
          label={t("登出", "Sign out")}
          sub={t("在這個裝置上登出", "Sign out on this device")}
        >
          <button className="btn btn-ghost btn-sm">{t("登出", "Sign out")}</button>
        </SettingsRow>
        <SettingsRow
          label={t("刪除帳號", "Delete account")}
          sub={t("永久刪除帳號與所有作品 · 無法復原", "Permanently delete your account and all takes")}
          danger
        >
          <button className="btn btn-sm" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>{t("刪除...", "Delete...")}</button>
        </SettingsRow>
      </div>

      <div style={{ textAlign: "center", marginTop: 36, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--fg-3)" }}>
        VocalCanvas v1.0.0 · © 2026
      </div>
    </div>
  );
}

Object.assign(window, { SettingsScreen });
