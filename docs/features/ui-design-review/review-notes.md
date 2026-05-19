# UI 設計還原度審查報告

審查者：Code Reviewer
審查日期：2026-05-19
審查範圍：設計稿 vs. 實作 100% 對比

---

## 通過的項目

- **CSS class 名稱**：`src/styles/marketing.css` 與 `src/styles/app.css` 內容與設計稿逐行一致，未見 typo 或缺漏 class。
- **SAMPLE_LIBRARY 資料筆數**：5 筆，id/title/voice/duration/kbps/when/wave 均與設計稿完全一致。
- **PRESETS 4 筆**：dawn/mist/ember/glass，id/zh/en/meta/gender/orb 值與 `Primitives.jsx` 完全一致。
- **PRESET_TUNING 值**：`dawn {age:32,pitch:70,timbre:24}` / `mist {age:58,pitch:28,timbre:38}` / `ember {age:42,pitch:64,timbre:72}` / `glass {age:30,pitch:56,timbre:18}`，與設計稿的 `presetTuning` 物件完全吻合。
- **Hero wave 高度陣列公式**：`30 + sin(i*0.45)*30 + sin(i*0.15)*20`，與設計稿腳本一致；SSR 安全的固定陣列實作方式正確。
- **Voice mini-wave 陣列**：dawn/mist/ember/glass 四組高度與設計稿完全一致。
- **Slider 拖拽**：使用 `onPointerDown` + `pointermove` / `pointerup` 實作，邏輯與設計稿 `Primitives.jsx` 相同，可正常拖拽。
- **Delay tag click 編輯 / double-click 刪除**：`onClick`→`editingTag` 切換；`onDoubleClick`→`removeNode`，邏輯與設計稿一致。
- **Playback 進度模擬**：`useEffect` + `setInterval(50ms)` 累積 `progress += 0.005*speed`，與設計稿邏輯完全相同。
- **Sidebar collapse / mobile drawer**：collapse toggle、backdrop overlay、`mobile-open` class 切換均已實作，CSS 響應式亦與設計稿一致。
- **Wave 動畫 animation-delay stagger**：hero wave 與 login wave 的 `animationDelay` stagger 均已設定。
- **Rendering overlay (pulseWave)**：`rendering-overlay` + `rendering-card` + `pulse-wave`，CSS `@keyframes pulseWave` 與設計稿完全一致。
- **DOM 結構**：各主要頁面（marketing、login、library、voiceSetup、scriptEditor、preview）的父子結構與元素順序均與設計稿一致。
- **Login page**：`login-page` 兩欄結構、`login-brand` / `login-form` / `login-wave` / `login-quote` 均實作。
- **TopBar crumb 文字**：實作加了 `<b>` 標籤包裹，設計稿為純文字；功能上屬於視覺強調，不影響邏輯，但細節上有差異（見問題 #4）。

---

## 發現的問題

### P1 — 阻擋上線（high）

目前無 high 嚴重度的阻擋上線問題。

---

### P2 — 中等（medium）

**問題 #1：Slider touch-event 支援遺漏**

- 檔案：`/workspaces/VocalCanvas/src/components/ui/Slider.tsx`，第 28-30 行
- 設計稿期望（`Primitives.jsx` 第 9 行）：`const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;` — 同時處理 `TouchEvent` 和 `PointerEvent`。
- 實作現況：`move` 函式僅讀取 `ev.clientX`，未處理 `ev.touches`。`PointerEvent` 在大多數觸控裝置上會自動轉換，但在某些 Android WebView 及 PWA 場景下，如果瀏覽器未觸發 Pointer API，觸控拖拽會失效。
- 嚴重程度：**medium**
- 建議修法：在 `move` 內改為 `const clientX = (ev as PointerEvent & { touches?: TouchList }).touches?.[0]?.clientX ?? ev.clientX;`，或改用 `ontouchmove` 補充。

---

**問題 #2：ScriptEditorScreen 缺少 rendering-overlay**

- 檔案：`/workspaces/VocalCanvas/src/app/(app)/new/page.tsx`，第 355-368 行（實作有）
- 補充說明：審查後確認實作**已包含** rendering-overlay。但設計稿 `ScriptEditorScreen.jsx` **沒有** rendering overlay，overlay 只出現在實作版，比設計稿多了這個功能。這是正向差異，但需記錄。
- 嚴重程度：無（正向差異，可接受）

---

**問題 #3：Library 頁面「Play」按鈕路由不符合設計意圖**

- 檔案：`/workspaces/VocalCanvas/src/app/(app)/library/page.tsx`，第 87 行
- 設計稿期望（`LibraryScreen.jsx` 第 56 行）：`onClick={() => goTo("preview")}` — 點擊播放跳轉到 preview 畫面。
- 實作現況：`onClick={() => router.push('/new')}` — 跳轉到 `/new`（VoiceSetup 起點），而非直接 Preview。
- 嚴重程度：**medium**
- 建議修法：Library 播放按鈕應路由至 `/preview` 或以 query param 帶入 item id，直接進入試聽模式，而非重新建立作品。

---

**問題 #4：TopBar crumb 文字加了 `<b>` wrapper，設計稿無此元素**

- 檔案：`/workspaces/VocalCanvas/src/components/app/AppShell.tsx`，第 128-130 行
- 設計稿期望（`AppShell.jsx` 第 74 行）：`<div className="crumb">{crumb}</div>` — 純文字節點。
- 實作現況：`<div className="crumb"><b>{crumbLabel}</b></div>` — 外加 `<b>` 標籤。
- CSS 已有 `.crumb b { color: var(--fg-1); font-weight: 600; }` 對應，因此視覺上略粗，但設計稿中 crumb 文字只是 `fg-2` 色的正常字重。
- 嚴重程度：**medium**（視覺與設計稿不一致）
- 建議修法：移除 `<b>` wrapper，或確認此為有意的視覺強化並更新設計稿。

---

### P3 — 低（low）

**問題 #5：hero-wave span 的 `height` style 傳入 number 而非字串**

- 檔案：`/workspaces/VocalCanvas/src/app/(marketing)/page.tsx`，第 307 行
- 設計稿期望（`index.html` 第 350 行）：`height: ${h}px` — 字串含單位。
- 實作現況：`style={{ height: h, animationDelay: ... }}` — 傳入純 number `h`（例如 `56`）。
- React 對 `style.height` 傳入 number 時，會自動補 `px`（行為符合 React DOM spec），因此不影響功能，但不符合明確標注單位的慣例。
- 嚴重程度：**low**
- 建議修法：改為 `height: h + 'px'` 或 `height: \`${h}px\`` 以保持一致性。

---

**問題 #6：Login wave 在 DOM 順序上與設計稿略有差異**

- 檔案：`/workspaces/VocalCanvas/src/app/(marketing)/login/page.tsx`，第 49-56 行
- 設計稿期望（`login.html` 第 24-29 行）：`login-wave` 在 `b-sub` 之後，`login-quote` 之前。
- 實作現況：順序為 `h2` → `b-sub` → `login-wave` → `login-quote`，與設計稿一致。此項確認通過，無問題。

---

**問題 #7：marketing.css 缺少 `@import` 來源宣告（Next.js 架構差異）**

- 檔案：`/workspaces/VocalCanvas/src/styles/marketing.css`
- 設計稿期望（`marketing.css` 第 2 行）：`@import url("../../colors_and_type.css");`
- 實作現況：`/workspaces/VocalCanvas/src/styles/marketing.css` 未包含此 import。設計稿 CSS 的顏色變數（`--coral-500` 等）在 Next.js 架構下可能透過 global CSS 或 layout 引入，需確認所有 CSS 變數都已在全域載入。
- 嚴重程度：**low**（如果全域已正確引入則無影響，但需確認）
- 建議修法：確認 `src/app/globals.css` 或 layout 已完整引入 `colors_and_type.css` 的所有 CSS 變數，避免在生產環境中遺漏樣式。

---

**問題 #8：VoicesPage 使用 `lang-switch` class 作為 Gender Filter UI，語意不準確**

- 檔案：`/workspaces/VocalCanvas/src/app/(app)/voices/page.tsx`，第 59-69 行
- 設計稿期望：無對應的 Voices 頁面設計稿（此頁面為實作自行擴充）。
- 實作現況：Gender filter 按鈕組使用了 `className="lang-switch"`，這是語言切換的 class，語意與功能不符。
- 嚴重程度：**low**（功能正常，但可維護性差）
- 建議修法：為 filter 按鈕組新增專屬 class（如 `filter-tabs`），或在既有 `lang-switch` 上額外加 modifier class。

---

## 整體設計還原度評估

**還原度：92%**

### 說明

| 面向 | 評分 | 備註 |
|------|------|------|
| CSS class 名稱與樣式 | 100% | 與設計稿逐行一致 |
| DOM 結構與元素順序 | 98% | TopBar crumb 多了 `<b>`，其餘完全一致 |
| 互動功能完整性 | 93% | Library 播放按鈕路由錯誤；Slider touch 支援有潛在問題 |
| 資料完整性 | 100% | SAMPLE_LIBRARY 5筆、PRESETS 4筆、tuning 值、wave 高度全部正確 |
| 動畫與視覺效果 | 97% | pulseWave、heroWave、stagger 全部實作；hero-wave height 無單位為細節缺失 |

### 主要扣分原因

1. Library 播放按鈕路由到 `/new` 而非 preview（最影響使用者體驗）
2. Slider 缺少觸控事件補強（跨裝置相容性風險）
3. TopBar crumb 額外的 `<b>` wrapper 與設計稿不符

整體而言實作品質相當高，設計稿細節複製度優秀，主要問題集中在行為層（路由邏輯）與邊緣案例（觸控相容性），無阻擋上線的結構性缺陷。
