# CSS 設計稿對照審計報告

- **審計日期**: 2026-05-19
- **審計人員**: QA 測試工程師
- **設計稿來源（ground truth）**:
  - `app.css`: `.claude/skills/vocalcanvas-screens-v3/_diff-v5-landing-icons-rwd/ui_kits/vocalcanvas-app/app.css`
  - `marketing.css`: `.claude/skills/vocalcanvas-screens-v3/_diff-v5-landing-icons-rwd/ui_kits/vocalcanvas-marketing/marketing.css`
  - `colors_and_type.css`: `.claude/skills/vocalcanvas-design/colors_and_type.css`
- **現有實作 CSS**:
  - `src/styles/app.css`
  - `src/styles/marketing.css`
  - `src/styles/design-tokens.css`

---

## 摘要

| 類別 | app.css | marketing.css | design-tokens.css |
|------|---------|---------------|-------------------|
| 視覺明顯差異（紅） | 4 | 3 | 0 |
| 細微差異（黃）     | 5 | 1 | 0 |
| 多餘 class（綠）   | 3 | 6 | 0 |
| 設計稿新增 class（缺少）| 0 | 12 | 0 |

**design-tokens.css 與 colors_and_type.css 內容完全一致，無差異。**

---

## app.css 差異

### 🔴 視覺明顯差異

#### 差異 A-1：sidebar 在 mobile 模式下 `.sidebar` vs `.app .sidebar`

| 項目 | 設計稿 | 現有實作 |
|------|--------|---------|
| selector | `.app .sidebar { position: fixed; ... }` | `.sidebar { position: fixed; ... }` |

**說明**: 設計稿 `@media (max-width: 768px)` 使用 `.app .sidebar`（加入 `.app` 父層 specificity），現有實作使用 `.sidebar`（不帶 `.app` 父層）。若 sidebar 元素不在 `.app` wrapper 內，行為一致；但若有 specificity 競爭，設計稿選擇器優先度更高。更關鍵的差異見 A-2。

#### 差異 A-2：mobile drawer re-show 規則 — `profile-row` 子元素選擇器不一致

| 項目 | 設計稿 | 現有實作 |
|------|--------|---------|
| class | `.app .sidebar .profile-row > div:not(.avatar)` | `.app .sidebar .profile-row button > div:not(.avatar)` |

**設計稿**（`@media max-width: 768px`）:
```css
.app .sidebar .profile-row > div:not(.avatar) { display: revert; }
.app .sidebar .profile-row button > div:not(.avatar) { display: revert; }
```
兩條規則都有；**現有實作**只有 `button > div:not(.avatar)` 那條，缺少 `profile-row > div:not(.avatar)` 這條。

**影響**: 若 profile row 裡有直接子 div（非 button 包覆），在 mobile drawer 開啟時可能不會顯示，導致 profile 資訊部分隱藏。屬視覺明顯差異。

#### 差異 A-3：`app.collapsed .sidebar .logout-btn` 整行缺失

| 項目 | 設計稿 | 現有實作 |
|------|--------|---------|
| `.app.collapsed .sidebar .logout-btn { display: none; }` | 存在（設計稿） | **缺失** |

**說明**: 設計稿在 collapsed 狀態下明確隱藏 `.logout-btn`；現有實作未定義此規則。如果 logout-btn 存在，collapsed 模式下會異常顯示。

#### 差異 A-4：scenario-strip 在 `@media (max-width: 1200px)` 的值不同

| 項目 | 設計稿 | 現有實作 |
|------|--------|---------|
| 斷點 1200px `.scenario-strip grid-template-columns` | `repeat(4, minmax(0, 1fr)) !important` | `repeat(4, 1fr)` |

**設計稿**:
```css
@media (max-width: 1200px) {
  .scenario-strip { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
}
```
**現有實作**:
```css
@media (max-width: 1200px) {
  .scenario-strip { grid-template-columns: repeat(4, 1fr); }
}
```

**差異**: (1) 設計稿有 `!important`；(2) 設計稿使用 `minmax(0, 1fr)` 防止 overflow。缺少 `minmax(0, 1fr)` 在窄容器下可能導致 grid 溢出，屬視覺問題。

---

### 🟡 細微差異

#### 差異 A-5：BGM volume row 的 selector 不同

| 項目 | 設計稿 | 現有實作 |
|------|--------|---------|
| `@media (max-width: 600px)` selector | `.card > div[style*="grid-template-columns: 120px"]` | `.bgm-volume-row` |

**設計稿**（@media max-width: 600px）:
```css
.card > div[style*="grid-template-columns: 120px"] {
  grid-template-columns: 1fr 50px !important;
  row-gap: 6px !important;
}
.card > div[style*="grid-template-columns: 120px"] > div:first-child {
  grid-column: 1 / -1;
}
```

**現有實作**:
```css
.bgm-volume-row {
  grid-template-columns: 1fr 50px !important;
  row-gap: 6px !important;
}
.bgm-volume-row > div:first-child {
  grid-column: 1 / -1;
}
```

**說明**: 現有實作使用語義化 class `.bgm-volume-row`；設計稿使用 inline style attribute selector。功能等效，但現有實作依賴 HTML 元素有 `.bgm-volume-row` class，若 JSX 未套用此 class，mobile 版面會壞掉。需確認 HTML/JSX 實際套用的 class 名稱。屬中度風險細微差異。

#### 差異 A-6：`@media (max-width: 768px)` `.sidebar.mobile-open` vs `.app .sidebar.mobile-open`

| 項目 | 設計稿 | 現有實作 |
|------|--------|---------|
| selector | `.app .sidebar.mobile-open { transform: translateX(0); }` | `.sidebar.mobile-open { transform: translateX(0); }` |

設計稿加了 `.app` 前綴增強 specificity，現有實作沒有。在大多數情況不影響效果，但 specificity 較低可能被其他規則覆蓋。

#### 差異 A-7：`@media (max-width: 768px)` `.sidebar` 的 `app .sidebar` 語法統一性

設計稿在 768px 斷點的所有 sidebar 規則均使用 `.app .sidebar` 前綴：
```css
.app .sidebar { position: fixed; ... }
.app .sidebar.mobile-open { ... }
```

現有實作在同斷點混用：
```css
.sidebar { position: fixed; ... }        /* 無 .app 前綴 */
.sidebar.mobile-open { ... }             /* 無 .app 前綴 */
.app .sidebar .brand-row .name { ... }   /* 有 .app 前綴 */
```

specificity 不一致，可能在特定 CSS 載入順序下造成規則覆蓋問題。

#### 差異 A-8：`@media (max-width: 768px)` `.app .sidebar .logout-btn` 缺失

現有實作在 768px 斷點的 collapsed 重設區段沒有 `.app .sidebar .logout-btn` 的 display 規則（設計稿也無），但設計稿在 `collapsed` 靜態規則區有，而現有實作不在任何地方定義。（此條與 A-3 呼應，已歸類於 🔴。）

#### 差異 A-9：`@keyframes heroWave` 在 app.css 的處理

| 項目 | 設計稿 | 現有實作 |
|------|--------|---------|
| `@keyframes heroWave` | **不存在**（設計稿 app.css 中無此 keyframe，僅存在 marketing.css） | 存在（第 271 行）|

現有 `src/styles/app.css` 第 271 行有 `@keyframes heroWave`；設計稿 app.css 無此 keyframe（heroWave 只在 marketing.css 定義）。此為現有實作多餘的 keyframe，屬冗餘但不影響功能。

---

### 🟢 多餘 class（現有有、設計稿無）

#### 差異 A-10：`@media (max-width: 1200px)` — 設計稿有 `!important`，現有無

（已列入 A-4，此條單獨說明細節）

現有 `@media (max-width: 1200px)` 的 `.scenario-strip` 規則缺少 `!important`，導致此規則可能被 inline style 覆蓋。

#### 差異 A-11：`@keyframes heroWave`（多餘）

- **class**: `@keyframes heroWave`
- **位置**: `src/styles/app.css` line 271
- **設計稿**: 不存在於 app.css
- **說明**: 此 keyframe 屬於 marketing 範疇，不應在 app.css 中重複定義。

#### 差異 A-12：`.settings-row`、`.settings-row-label`、`.settings-row-sub`、`.toggle-btn`、`.toggle-thumb`

現有 `src/styles/app.css` 包含以下設定頁 class，設計稿 v5 app.css **不存在**：

```
.settings-row
.settings-row-label
.settings-row-label.danger
.settings-row-sub
.toggle-btn
.toggle-thumb
```

這些可能是先前版本留下的 class，或來自其他設計稿版本。不影響已實作功能，但屬冗餘規則。

---

## marketing.css 差異

### 🔴 視覺明顯差異

#### 差異 M-1：`@media (max-width: 768px)` — scenarios / scenario-card 規則缺失

設計稿 `@media (max-width: 768px)` 中有：
```css
.scenarios-grid { grid-template-columns: 1fr; gap: 14px; }
.scenario-card { padding: 22px 20px; min-height: 0; }
.scenario-card h4 { font-size: 19px; }
.scenario-card .icon { font-size: 30px; }
```

現有實作有前三條，**缺少**：
```css
.scenario-card .icon { font-size: 30px; }
```

**影響**: 在 768px 以下，scenario card 的 icon 不會縮小至 30px，維持 36px 桌機大小，造成排版壓縮。

#### 差異 M-2：設計稿 marketing.css 新增 Scenarios Detail 頁面大量 class，現有完全缺失

設計稿 `marketing.css`（v5 版本）包含完整的 **Scenarios Detail 頁** CSS，現有 `src/styles/marketing.css` **完全沒有**以下 class：

| Class 名稱 | 說明 |
|-----------|------|
| `.scn-hero` | Scenario detail 頁 hero 區塊 |
| `.scn-hero h1` | Hero 標題 56px |
| `.scn-hero h1 .sunset` | 漸層文字 |
| `.scn-hero p` | Hero 說明文字 |
| `.scn-anchors` | sticky 錨點導覽列 |
| `.scn-anchors-inner` | 錨點列內層 |
| `.scn-anchors a` | 錨點連結 |
| `.scn-anchors a:hover` | hover 狀態 |
| `.scn-anchors a.active` | active 狀態（ink-800 背景） |
| `.scn-block` | 內容區塊（grid 1fr 1fr） |
| `.scn-block:nth-child(even) > :first-child` | 偶數區塊反轉排列 |
| `.scn-stage` | 場景展示卡片 |
| `.scn-stage::before` | 光暈裝飾 pseudo |
| `.scn-stage > *` | z-index 修正 |
| `.scn-stage .scn-icon` | 場景 icon |
| `.scn-stage .scn-icon svg` | icon 尺寸 56×56 |
| `.scn-anchors a .scn-inline-ic` | 錨點 inline icon |
| `.scn-anchors a .scn-inline-ic svg` | 16×16 |
| `.scn-name-cell .scn-inline-ic` | table name cell icon |
| `.scn-name-cell .scn-inline-ic svg` | 18×18 |
| `.scenario-card .icon` (重宣告) | 特定 line-height 修正 |
| `.scenario-card .icon svg` | svg 36×36 |
| `.scn-stage .scn-name` | 標題 32px |
| `.scn-stage .scn-name-en` | 英文副標 14px |
| `.scn-stage .scn-snippet` | 腳本預覽框 |
| `.scn-stage .scn-snippet .tag` | 內嵌標籤 |
| `.scn-stage .scn-player` | 播放器列 |
| `.scn-stage .scn-play-btn` | 播放按鈕 |
| `.scn-stage .scn-wave` | 波形顯示 |
| `.scn-stage .scn-time` | 時間顯示 |
| `.scn-content h2` | 說明內容標題 36px |
| `.scn-content .scn-lead` | 引言文字 |
| `.scn-content h3` | 小標題（uppercase） |
| `.scn-specs` | 規格 grid |
| `.scn-specs > div` | 規格項目 |
| `.scn-specs b` | 規格粗體 |
| `.scn-specs span` | 規格次要文字 |
| `.scn-bgms` | BGM 列表 |
| `.scn-bgms .bgm-pill` | BGM 標籤 pill |
| `.scn-uses` | 使用情境列表 |
| `.scn-uses li` | 列表項目 |
| `.scn-uses li svg` | 清單 icon（mint-500） |
| `.scn-cta` | CTA 按鈕列 |
| `.scn-compare` | 比較區塊 |
| `.scn-compare h2` | 比較區塊標題 |
| `.scn-compare p` | 比較區塊說明 |
| `.scn-table` | 比較表格 |
| `.scn-table th, .scn-table td` | 表格儲存格 |
| `.scn-table th` | 表頭 |
| `.scn-table tr:last-child td` | 最後一行 border 移除 |
| `.scn-table .scn-name-cell` | 表格名稱欄 |

以及對應的 **RWD 規則**（`@media (max-width: 1024px)` 和 `@media (max-width: 768px)`）：
```css
@media (max-width: 1024px) {
  .scn-block { grid-template-columns: 1fr; gap: 28px; margin-bottom: 64px; }
  .scn-block:nth-child(even) > :first-child { order: 0; }
  .scenarios-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .scn-hero { padding: 48px 16px 16px; }
  .scn-hero h1 { font-size: 36px; }
  .scn-hero p { font-size: 15px; }
  .scn-anchors { padding: 10px 16px; top: 60px; margin-bottom: 36px; }
  .scn-anchors a { font-size: 12px; padding: 6px 12px; }
  .scn-block { padding: 0 16px; margin-bottom: 48px; }
  .scn-stage { padding: 24px; min-height: 0; }
  .scn-stage .scn-icon { font-size: 48px; }
  .scn-stage .scn-name { font-size: 26px; }
  .scn-content h2 { font-size: 26px; }
  .scn-content .scn-lead { font-size: 15px; }
  .scn-specs { grid-template-columns: 1fr; }
  .scn-uses { grid-template-columns: 1fr; }
  .scn-compare { padding: 36px 22px; margin: 36px 16px 0; border-radius: 22px; }
  .scn-compare h2 { font-size: 24px; }
  .scn-table { font-size: 12px; }
  .scn-table th, .scn-table td { padding: 10px 12px; }
  .scenarios-grid { grid-template-columns: 1fr; gap: 14px; }
  .scenario-card { padding: 22px 20px; min-height: 0; }
  .scenario-card h4 { font-size: 19px; }
  .scenario-card .icon { font-size: 30px; }
}
```

**影響**: Scenarios Detail 頁面若實作，將完全沒有樣式，造成版面崩潰。

#### 差異 M-3：`@media (max-width: 1024px)` 缺少 `.scn-block` 相關規則

設計稿 `@media (max-width: 1024px)` 在現有 marketing.css 對應斷點中新增了：
```css
.scn-block { grid-template-columns: 1fr; gap: 28px; margin-bottom: 64px; }
.scn-block:nth-child(even) > :first-child { order: 0; }
.scenarios-grid { grid-template-columns: 1fr 1fr; }
```

現有實作只有 `.scenarios-grid { grid-template-columns: 1fr 1fr; }`，缺少 `.scn-block` 的 RWD 規則。（與 M-2 部分重疊，單獨列出強調 RWD 面向。）

---

### 🟡 細微差異

#### 差異 M-4：`@media (max-width: 1024px)` `.scenarios-grid` 一致但上下文不同

現有 marketing.css 與設計稿均有：
```css
.scenarios-grid { grid-template-columns: 1fr 1fr; }
```
此條規則一致，無差異。（確認通過）

---

### 🟢 多餘 class（現有有、設計稿無）

設計稿 v5 marketing.css 沒有以下 class（現有實作有）：

#### 差異 M-5：`.center-page`

```css
.center-page { min-height: 100vh; display: flex; ... background: var(--cream-100); }
```
設計稿無此 class。為 forgot-password 頁面佈局用途，可能是實作自行添加。

#### 差異 M-6：`.card-form` 及子元素

```css
.card-form { background: #fff; border-radius: 28px; padding: 48px; ... }
.card-form .logo-row { ... }
.card-form .logo-row .name { ... }
.card-form h1 { font-size: 28px; ... }
.card-form .sub { ... }
```
設計稿無這些 class。屬 forgot-password 頁面用途。

#### 差異 M-7：`.back-link`

設計稿無，現有有。

#### 差異 M-8：`.success-state` 及 `.ico-circle`

設計稿無，現有有。

#### 差異 M-9：`.resend-row` 及 `.resend-row a`

設計稿無，現有有。

#### 差異 M-10：`@media (max-width: 480px) .card-form`

```css
@media (max-width: 480px) { .card-form { padding: 32px 24px; border-radius: 22px; } .card-form h1 { font-size: 24px; } }
```
設計稿無此斷點規則（因為 `.card-form` 本身就不存在）。

#### 差異 M-11：`.error-page` 及完整 404 頁面 class 群

現有有以下 class，設計稿無：
```
.error-page
.error-page::before
.error-content
.err-logo
.err-logo .name
.err-404
.err-wave
.err-wave span
.err-headline
.err-sub
.err-ctas
.err-links
.err-links .lbl
.err-links a
.err-links a:hover
@media (max-width: 768px) .err-404 / .err-headline / .err-sub
```

---

## design-tokens.css 差異

`src/styles/design-tokens.css` 與 `.claude/skills/vocalcanvas-design/colors_and_type.css` **內容完全一致**。

所有 CSS 變數、字體宣告、語義型別 class（`.display-xl`、`.h1`、`.h2` 等）、`.tag-delay` 均相同。

**結論**: 無差異，通過。

---

## 差異彙整總表

### app.css

| 編號 | 嚴重性 | Class / 規則 | 屬性/項目 | 設計稿值 | 現有值 |
|------|--------|-------------|----------|---------|--------|
| A-1 | 🔴 | `@media 768px` `.sidebar` | selector specificity | `.app .sidebar` | `.sidebar` |
| A-2 | 🔴 | `@media 768px` profile-row re-show | `.profile-row > div:not(.avatar)` | 存在 | **缺失** |
| A-3 | 🔴 | `.app.collapsed .sidebar .logout-btn` | `display: none` | 存在 | **缺失** |
| A-4 | 🔴 | `@media 1200px` `.scenario-strip` | `grid-template-columns` | `repeat(4, minmax(0, 1fr)) !important` | `repeat(4, 1fr)` |
| A-5 | 🟡 | `@media 600px` BGM slider | selector | `[style*="grid-template-columns: 120px"]` | `.bgm-volume-row` |
| A-6 | 🟡 | `@media 768px` `.sidebar.mobile-open` | selector | `.app .sidebar.mobile-open` | `.sidebar.mobile-open` |
| A-7 | 🟡 | `@media 768px` sidebar 規則 | selector 一致性 | 全部使用 `.app .sidebar` | 混用 `.sidebar` 和 `.app .sidebar` |
| A-8 | 🟡 | `@media 1200px` `.scenario-strip` | `!important` | 有 | **缺失** |
| A-9 | 🟡 | `@keyframes heroWave` | 存在於 app.css | 不存在 | 第 271 行存在（冗餘） |
| A-10 | 🟢 | `.settings-row` / `.toggle-btn` 等 6 個 | 整組 | 不存在 | 存在（多餘） |
| A-11 | 🟢 | `@keyframes heroWave`（重複） | — | 不存在 | 存在 |
| A-12 | 🟢 | `.app.collapsed .sidebar .logout-btn` | — | 存在（設計稿有） | 缺失（紅色已列） |

### marketing.css

| 編號 | 嚴重性 | Class / 規則 | 屬性/項目 | 設計稿值 | 現有值 |
|------|--------|-------------|----------|---------|--------|
| M-1 | 🔴 | `@media 768px` `.scenario-card .icon` | `font-size` | `30px` | **缺失** |
| M-2 | 🔴 | Scenarios Detail 全部 class（50+ 條） | 整組 | 存在 | **全部缺失** |
| M-3 | 🔴 | `@media 1024px` `.scn-block` | RWD 規則 | 存在 | **缺失** |
| M-4 | 🟡 | `@media 1024px` `.scenarios-grid` | — | 一致 | 一致（通過）|
| M-5 | 🟢 | `.center-page` | — | 不存在 | 存在（多餘）|
| M-6 | 🟢 | `.card-form` 及子元素 | — | 不存在 | 存在（多餘）|
| M-7 | 🟢 | `.back-link` | — | 不存在 | 存在（多餘）|
| M-8 | 🟢 | `.success-state` / `.ico-circle` | — | 不存在 | 存在（多餘）|
| M-9 | 🟢 | `.resend-row` | — | 不存在 | 存在（多餘）|
| M-10 | 🟢 | `@media 480px` `.card-form` | — | 不存在 | 存在（多餘）|
| M-11 | 🟢 | `.error-page` 及完整 404 class 群 | — | 不存在 | 存在（多餘）|

---

## 關鍵問題說明

### 最高優先（需立即修正）

1. **M-2（Scenarios Detail 頁完全缺失）**: 設計稿 v5 已定義 50+ 個 Scenarios Detail 頁 class，現有 `src/styles/marketing.css` 完全沒有。若此頁面已實作或計畫實作，CSS 需完整補入。
2. **A-2（mobile profile-row 顯示 bug）**: mobile drawer 開啟時，profile row 的直接子 div 可能不顯示。設計稿有 `.profile-row > div:not(.avatar)` 規則，現有缺失。
3. **A-3（collapsed 模式 logout-btn 未隱藏）**: sidebar collapsed 時 logout-btn 可能仍可見，破壞 icon-only 佈局。

### 中等優先（建議修正）

4. **A-4（scenario-strip RWD 使用 `1fr` 而非 `minmax(0, 1fr)`）**: 可能在某些容器寬度下造成 grid overflow。
5. **A-5（BGM slider selector 不對應）**: 若 JSX 中元素使用的是 inline style 而非 `.bgm-volume-row` class，mobile 版 BGM 滑桿會版面錯亂。
6. **M-1（scenario-card icon 未縮小）**: mobile 下 icon 比設計稿大 6px。

### 低優先（清理用）

7. **A-10 / A-11 / M-5-M-11（多餘 class）**: 多餘 class 不影響現有功能，但增加維護負擔，可考慮移至獨立檔案或刪除。
8. **A-6 / A-7（selector specificity 不一致）**: 目前不造成 bug，但應與設計稿保持一致以避免未來 specificity 問題。

---

*報告產出路徑: `docs/features/scenario-bgm/css-audit.md`*
