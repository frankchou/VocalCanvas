# VocalCanvas Design System

> 用 AI 把文字變成有溫度的聲音。
> AI-powered text-to-speech that makes every voice feel personal, warm, and alive.

VocalCanvas 是一個 AI 語音朗讀應用 — 使用者可以挑選聲音性別、用百分比拉桿微調年齡 / 低沉高亢 / 溫柔粗獷，並在文字中插入延遲標記，產出多語言音檔。系統介面支援中文與英文。

This design system codifies the visual language, foundations, components, and a sample UI kit so any designer or agent can produce on-brand VocalCanvas artifacts.

---

## Index

```
.
├── README.md                  ← you are here
├── SKILL.md                   ← Agent Skills-compatible entrypoint
├── colors_and_type.css        ← CSS variables: color, type, radius, shadow, spacing, motion
├── assets/
│   ├── logo-mark.svg          ← coral-sunset waveform mark
│   ├── logo-wordmark.svg      ← horizontal lockup
│   ├── logo-mark-mono.svg     ← single-tone mark for dark UI
│   └── icons/                 ← Lucide subset used by the app
├── preview/
│   └── *.html                 ← cards rendered in the Design System tab
└── ui_kits/
    └── vocalcanvas-app/
        ├── README.md
        ├── index.html          ← clickable 5-screen prototype
        └── components/         ← JSX building blocks
```

---

## Product context

**Brand essence** (Chinese keywords from the brief)
- 活潑 lively · 溫暖 warm · 愛 love · 未來感 futuristic · 科技感 technological
- 新創 AI 系統 / 數位解決方案 — a startup building intimate, personal AI tools that solve everyday frustrations.

**Product**: VocalCanvas — TTS that treats voice like paint.

**Core flow** (from the user brief)
1. Choose voice gender — **男聲 / 女聲** (Male / Female)
2. Tune voice with **percentage sliders**: 年齡 age · 低沉⇄高亢 pitch · 溫柔⇄粗獷 timbre
3. Edit script; insert **`<delay 0.8s>`-style tags** for pauses (custom seconds)
4. **Save → AI generates audio → Preview**
5. Adjust **playback speed** of generated audio (preset options)
6. **Favorite / Download** the rendered file
- Content supports **multilingual** reading. UI supports **中文 + English**.

**Sources used for this design system**
- Brand description + product brief provided in-chat by the founder.
- GitHub repo: <https://github.com/frankchou/VocalCanvas> — note: repo was a stub at time of writing (README only); all visuals here are net-new and grounded in the brand keywords. If you have access, browse the repo for the latest product code, and re-import this design system once production components exist.

---

## CONTENT FUNDAMENTALS

VocalCanvas talks to people like a **warm, capable studio assistant**. Quietly futuristic; never robotic; never childish.

### Voice
- **You-first, never "the user"**. Direct, second-person. *"挑一個聲音開始" / "Pick a voice to start"*
- **Confident verbs, gentle nouns**. *"產出 / Render"*, *"試聽 / Preview"*, *"收藏 / Save to library"*.
- **Bilingual parity**. Headlines often pair `中文 — English` with an em-dash divider. Body copy stays single-language per surface; the UI offers a top-level language switch.
- **Concrete > clever**. A delay tag tooltip says *"在這裡停 0.8 秒"* not *"Add a pause."*
- **No exclamation marks** in product chrome. They're reserved for celebrations (export success).
- **Sparingly poetic** on marketing surfaces only — *"讓文字呼吸 · Let your words breathe."*

### Casing
- **Sentence case** for all UI: buttons (`Render audio`, `儲存到收藏`), menus, dialogs, tooltips.
- **Title Case** allowed only for product names: *VocalCanvas, Vocal Library*.
- Chinese: no full-width punctuation in UI strings (use half-width comma/period for tight layouts).
- ALL-CAPS is for **eyebrow labels** only (e.g. `NEW VOICE`), with `letter-spacing: 0.08em`.

### Numbers & units
- Percentages render with the `%` sign tight: `42%` not `42 %`.
- Time tags display as `0.5s`, `1.2s` (one decimal, lowercase `s`).
- Voice presets get named, never numbered: *晨光 · Dawn*, *夜霧 · Mist*, *焰心 · Ember*.

### Emoji
- **Not used in product UI.** They break the calm-studio tone.
- Allowed sparingly in marketing email and social — never in app chrome.

### Sample copy — empty states
- Library empty → *"還沒有作品。挑一段文字，讓它有聲音。" / "No takes yet. Pick some text and give it a voice."*
- Long render → *"正在調色盤上混音… / Mixing on the palette…"*
- Error (network) → *"連線不穩，先把作品存到本機。" / "Network shaky — saved locally for now."*

### Sample copy — buttons
| Context | 中文 | English |
|---|---|---|
| Primary CTA | 產出音檔 | Render audio |
| Save | 儲存到收藏 | Save to library |
| Download | 下載 mp3 | Download mp3 |
| Add pause | 插入停頓 | Insert pause |
| New project | 新作品 | New canvas |

---

## VISUAL FOUNDATIONS

### Concept
**Voice is paint. The screen is canvas.** The interface stages your text on a warm cream surface (the canvas) and stages the rendered waveform on midnight ink (the studio). The brand swings between these two surfaces.

### Color
- **Coral sunset (`#FF5A3C`)** is the primary brand — warm, lively, emotional. Used for primary actions, the active waveform, accent highlights.
- **Midnight ink (`#1A1813`)** is the dark canvas — used full-bleed for the playback surface, hero blocks, and contrast cards. It's a warm black (slight brown), not pure neutral.
- **Cream (`#FFFCF7`)** is the light canvas — never pure white. Adds warmth and softens contrast.
- **Electric mint (`#1FC68C`)** is the future-tech accent — used sparingly for "AI is working," success states, and second-tier highlights.
- **Violet (`#6E52F2`)** signals AI semantics — male-voice chip, delay-tag chip, info badges.
- **Sunset gradient (coral → pink → amber)** is the signature gradient — appears in the logo, hero glow, render button, voice preset cards. Never gratuitous; treat as ink, not wallpaper.

Avoid: cold corporate blues, true black, pure white, neon purple-blue gradients.

### Type
- **Sora** — display + headings. Geometric with a futuristic edge; carries the tech feel.
- **Manrope** — body, UI, controls. Friendly geometric humanist; carries the warmth.
- **JetBrains Mono** — delay tags, code, file names, time displays.
- **Noto Sans TC** — Chinese (paired in same stack so 中文 and English visually balance).
- Scale: 12 → 72 px, weights 400/500/600/700. Body is 16 px / 1.5; display tightens to 1.05 line-height with `-0.02em` tracking.

### Spacing
- **4-px base** scale (`--space-1` through `--space-24`).
- Generous vertical rhythm — content blocks breathe at 24–48 px gaps.
- Tight, intentional pairings (label → input → helper text) at 4–8 px.

### Backgrounds
- **Light surfaces**: cream `#FFFCF7`, elevated to pure white for cards.
- **Dark surfaces**: midnight `#1A1813` with a subtle vertical gradient to `#2A271F` (`--grad-canvas`).
- **Hero/marketing**: cream + a single soft radial glow (`--grad-glow`) anchoring the focal element. No full-bleed photography; no repeating patterns. Occasional thin waveform lines as quiet ambient motif at low opacity.
- **Never**: stock photography backgrounds, gradient mesh wallpapers, full-bleed bluish-purple gradients.

### Corner radius
- Cards: **20–28 px** (`--r-xl` to `--r-2xl`) — generous and friendly.
- Inputs / smaller cards: **12–16 px**.
- Buttons: **pill** (`--r-pill`) by default; 12 px square only for compact icon buttons.
- The logo mark uses **18 px** on a 64 px tile (≈28% ratio) — keep this ratio if you scale.

### Shadow & elevation
- Warm-tinted (brown alpha, not gray) — see `--shadow-*` tokens.
- **`--shadow-md`** is the workhorse for cards.
- **`--shadow-glow`** wraps the primary CTA when it represents an AI action — coral halo, used at rest and amplified on hover.
- **`--shadow-inner`** for pressed slider tracks, recessed input wells.

### Borders
- Most cards use **shadow + cream surface**, no border.
- Where borders are needed: 1 px `var(--line-1)` (8% black) for subtle separation, 1 px `var(--line-2)` (14%) for inputs.
- Dark surfaces use `var(--line-on-dark)` (12% white).

### Animation
- **Ease-out** (`cubic-bezier(0.22, 1, 0.36, 1)`) for entrances and feedback — feels confident, decisive.
- **Spring** (`cubic-bezier(0.34, 1.56, 0.64, 1)`) used *only* for celebratory micro-moments (render-complete badge, save-to-library heart fill).
- Durations: 140 ms (state changes), 240 ms (transitions), 420 ms (page-level reveals).
- Waveforms breathe with a 1.8 s sinusoidal pulse while AI is rendering.
- No bouncy entrances on chrome. No parallax. No auto-playing videos.

### Hover / press states
- **Buttons**: hover lifts via a deeper coral (`--coral-600`) + 1 px translateY(-1px); press flattens + 2% darker overlay. Never opacity-fade.
- **Cards (interactive)**: hover swaps to `--shadow-lg` and shifts inner content up 2 px; press goes to `--shadow-sm` (compresses).
- **Icon buttons**: hover paints background `rgba(255,90,60,0.08)` (coral wash); press deepens to `rgba(255,90,60,0.14)`.
- **List rows**: hover `bg: var(--cream-100)`; press `bg: var(--cream-200)`.

### Transparency & blur
- Used **sparingly**: only on the floating playback bar (back-drop blur 18 px over content) and the modal scrim (`rgba(15,14,10,0.48)` + 6 px blur).
- Never on cards, never on hero text.

### Layout rules
- **Max content width**: 1280 px for marketing, 1440 px for the app shell.
- App shell uses **fixed left sidebar (280 px)** + **fixed top bar (64 px)** + scrollable main.
- Mobile breakpoint at 768 px; below that, the sidebar collapses to a bottom tab bar.
- All interactive elements meet **44 × 44 px** hit target minimums.

### Imagery
- We don't ship branded photography — the product is sound, not faces.
- When user content needs a representative tile (a saved take in the library), we use a **waveform thumbnail** rendered live, tinted with sunset gradient at low intensity.
- Avatars (for voice presets) are **abstract orb illustrations** in the brand palette — no faces.

---

## ICONOGRAPHY

VocalCanvas uses **[Lucide](https://lucide.dev)** icons (MIT-licensed) at **1.75 px stroke**, **24 px** default size.

- **Why Lucide**: the rounded-but-precise stroke aesthetic matches Manrope's warmth and Sora's geometry.
- **Loading**: via the official CDN (`https://unpkg.com/lucide@latest/dist/umd/lucide.js`) in prototypes and HTML mocks. A subset (`Mic`, `Play`, `Pause`, `Square`, `SkipBack`, `SkipForward`, `Volume2`, `Heart`, `Download`, `Plus`, `Trash2`, `Pencil`, `Clock`, `Sparkles`, `Settings`, `User`, `Languages`, `Search`, `MoreHorizontal`, `ChevronDown`, `ChevronLeft`, `ChevronRight`, `Check`, `X`) is copied to `assets/icons/` as raw SVGs for offline / static contexts.
- **Color**: icons inherit `currentColor`. In light UI, default to `--fg-1`; in dark UI, default to `--fg-on-dark`. Active states tint coral.
- **No emoji** anywhere in product chrome.
- **No unicode glyphs** (✓, ✗, ★, ♥) — always use the matching Lucide icon (`Check`, `X`, `Star`, `Heart`) so stroke weight is consistent.
- **No PNG icons** — strokes don't survive rescaling.

> Substitution note: VocalCanvas has no proprietary icon set yet. Lucide is the explicit choice for this brand. If the team later adopts a custom set, document it here and re-export the icon sheet.

---

## Quick start (for designers + agents)

1. `@import "./colors_and_type.css";` at the top of any HTML you create.
2. Pull `assets/logo-mark.svg` or `assets/logo-wordmark.svg` into hero / nav.
3. For app surfaces, copy the JSX components in `ui_kits/vocalcanvas-app/components/` — they are intentionally simple and styled with the CSS vars above.
4. Use the gradient token `--grad-sunset` for any **AI-touch** moment. Use coral solid for everything else primary.
5. When in doubt, read this doc + open `preview/*.html` files in the Design System tab.

---

## CAVEATS

- The provided GitHub repo (`frankchou/VocalCanvas`) contained only a stub `# VocalCanvas` README — **no existing code, components, or visual assets to mirror.** This design system was built net-new from the brand keywords and product brief.
- **Fonts** are loaded from Google Fonts (Sora, Manrope, JetBrains Mono, Noto Sans TC). No proprietary font files were provided. If the team has a licensed brand typeface, drop the `.woff2` files into `fonts/` and rewire `--font-display` / `--font-body` in `colors_and_type.css`.
- **Icons**: Lucide is a substitution — no project icons existed. Swap with the team's icon set when available.
- **Logo & wordmark** here are placeholder marks — a coral sunset gradient + waveform glyph. They follow the brand keywords but should be replaced by a real logo from the founder.
- **Voice-preset avatars** ("Dawn / Mist / Ember") are conceptual labels invented to make the UI kit feel real; replace with the team's real preset names before shipping.
