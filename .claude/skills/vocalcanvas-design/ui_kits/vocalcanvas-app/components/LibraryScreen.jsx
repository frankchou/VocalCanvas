/* Library screen — list of saved takes */

const SAMPLE_LIBRARY = [
  { id: "l1", title: "產品介紹 · 中文版", voice: "晨光 · Dawn", duration: "01:08", kbps: "240 kbps", when: "2 hours ago", fav: true,
    wave: [6, 12, 18, 24, 18, 10, 14, 22, 16, 10, 8, 16, 22, 18] },
  { id: "l2", title: "Welcome script · EN", voice: "Mist · 夜霧", duration: "00:42", kbps: "240 kbps", when: "yesterday", fav: false,
    wave: [8, 14, 22, 28, 24, 16, 10, 14, 20, 26, 18, 12, 8, 16] },
  { id: "l3", title: "Podcast intro v2", voice: "焰心 · Ember", duration: "00:18", kbps: "320 kbps", when: "3 days ago", fav: true,
    wave: [10, 18, 26, 30, 22, 14, 8, 12, 20, 28, 24, 16, 10, 14] },
  { id: "l4", title: "Bedtime meditation", voice: "Glass · 清玻", duration: "03:24", kbps: "240 kbps", when: "last week", fav: false,
    wave: [4, 6, 10, 14, 18, 14, 10, 6, 4, 8, 12, 16, 12, 8] },
  { id: "l5", title: "活動開場白", voice: "晨光 · Dawn", duration: "00:54", kbps: "240 kbps", when: "last week", fav: false,
    wave: [12, 20, 16, 24, 18, 28, 22, 14, 20, 12, 18, 24, 16, 22] },
];

function LibraryScreen({ goTo, lang }) {
  const [favorites, setFavorites] = React.useState(() => new Set(SAMPLE_LIBRARY.filter(i => i.fav).map(i => i.id)));
  const toggleFav = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const t = (zh, en) => lang === "zh" ? zh : en;

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>{t("我的作品", "Your library")}</h1>
          <div className="sub">{t(`${SAMPLE_LIBRARY.length} 個音檔 · ${favorites.size} 個收藏`, `${SAMPLE_LIBRARY.length} takes · ${favorites.size} favorites`)}</div>
        </div>
        <button className="btn btn-render" onClick={() => goTo("voice-setup")}>
          <IconPlus size={16} stroke={2.5} />
          {t("新作品", "New canvas")}
        </button>
      </div>

      <div className="lib-list">
        {SAMPLE_LIBRARY.map((item) => (
          <div className="lib" key={item.id}>
            <div className="lib-thumb">
              {item.wave.map((h, i) => <span key={i} style={{ height: h + "px" }}></span>)}
            </div>
            <div>
              <div className="title">{item.title}</div>
              <div className="sub">
                <span className="voice-chip">{item.voice}</span>
                <span>{item.duration}</span>
                <span>{item.kbps}</span>
                <span>{item.when}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button className="iconbtn" onClick={() => goTo("preview")} title="Play">
                <IconPlay size={18} />
              </button>
              <button
                className={`iconbtn ${favorites.has(item.id) ? "fav" : ""}`}
                onClick={() => toggleFav(item.id)}
                title="Favorite"
              >
                {favorites.has(item.id) ? <IconHeartFill size={18} /> : <IconHeart size={18} />}
              </button>
              <button className="iconbtn" title="Download"><IconDownload size={18} /></button>
              <button className="iconbtn" title="More"><IconMore size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { LibraryScreen });
