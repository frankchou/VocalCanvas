/* App shell: sidebar + topbar */

function Sidebar({ screen, goTo, libraryCount, mobileOpen, onToggleCollapse, onCloseMobile }) {
  const nav = [
    { id: "library", label: "Library", icon: <IconLibrary size={18} />, count: libraryCount },
    { id: "voices",  label: "Voices",  icon: <IconHeadphones size={18} /> },
    { id: "settings",label: "Settings",icon: <IconSettings size={18} /> },
  ];
  const handleNav = (id) => { goTo(id); onCloseMobile && onCloseMobile(); };
  return (
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      {onToggleCollapse && (
        <button className="sidebar-collapse" onClick={onToggleCollapse} title="Toggle sidebar">
          <IconChevronLeft size={14} stroke={2.5} />
        </button>
      )}
      <div className="brand-row">
        <img src="../../assets/logo-mark.svg" width="32" height="32" alt="VocalCanvas" />
        <div className="name">VocalCanvas</div>
      </div>

      <button className="nav-cta" onClick={() => handleNav("voice-setup")} title="New canvas">
        <IconPlus size={18} stroke={2.5} />
        <span>新作品 · New canvas</span>
      </button>

      <div className="nav-section">Workspace</div>
      {nav.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-item ${screen === item.id ? "active" : ""}`}
          onClick={() => handleNav(item.id)}
          title={item.label}
        >
          <span className="ico">{item.icon}</span>
          <span>{item.label}</span>
          {item.count != null && <span className="count">{item.count}</span>}
        </button>
      ))}

      <div className="nav-section">Recent</div>
      <button className="nav-item" title="產品介紹">
        <span className="ico"><IconClock size={18} /></span>
        <span>產品介紹 · 中文版</span>
      </button>
      <button className="nav-item" title="Welcome script">
        <span className="ico"><IconClock size={18} /></span>
        <span>Welcome script · EN</span>
      </button>
      <button className="nav-item" title="Podcast intro">
        <span className="ico"><IconClock size={18} /></span>
        <span>Podcast intro v2</span>
      </button>

      <div className="profile-row">
        <div className="avatar">F</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Frank Chou</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-2)" }}>Pro · 240 mins left</div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ crumb, lang, setLang, right, onMenu }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-btn" onClick={onMenu} title="Menu" aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div className="crumb">{crumb}</div>
      </div>
      <div className="topbar-tools">
        {right}
        <div className="lang-switch">
          <button className={lang === "zh" ? "active" : ""} onClick={() => setLang("zh")}>中文</button>
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>English</button>
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { Sidebar, TopBar });
