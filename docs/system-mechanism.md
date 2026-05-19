# VocalCanvas 系統機制

> 本文件描述各核心功能的實際運作細節（截至 2026-05-19，v0.3.1），與程式碼保持同步。

---

## 1. 模擬身份驗證機制（Mock Auth）

**檔案：** `src/contexts/AuthContext.tsx`、`src/components/AuthProviderWrapper.tsx`、`src/app/(app)/layout.tsx`、`src/app/(marketing)/login/page.tsx`

### 1.1 資料模型

`AuthContext` 定義的使用者資料結構：

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;       // 頭像顯示文字（如姓名縮寫）
  plan: string;         // 方案名稱（如 "Pro"）
  libraryItems: LibraryItem[];   // 作品庫清單
  usageStats: UsageStats;        // 使用量統計數據
}
```

### 1.2 測試帳號

AuthContext 內建兩組硬編碼（hard-coded）測試帳號，無需後端即可驗證不同狀態的 UI 行為：

| 帳號 | 密碼 | 帳號特性 |
|------|------|---------|
| `demo@vocalcanvas.com` | `Demo1234` | 完整示範資料：5 筆作品庫、使用量統計 |
| `empty@vocalcanvas.com` | `Demo1234` | 空白狀態：無作品、使用量全為 0 |

### 1.3 登入流程

1. 使用者在 `/login` 的 Email/Password 表單輸入帳號密碼，點擊「登入」。
2. `LoginPage` 呼叫 `useAuth().login(email, password)`。
3. `login()` 函式比對內建帳號陣列：
   - 比對成功：將 `user` 資料序列化後存入 `sessionStorage`（key: `vc_session`），更新 `user` state，函式正常回傳。
   - 比對失敗：拋出 `Error('Invalid credentials')`，LoginPage catch 後顯示中英雙語錯誤訊息（`「帳號或密碼錯誤」/ "Invalid email or password"`）。
4. `LoginPage` 登入成功後以 `router.push('/library')` 導向作品庫頁。

### 1.4 Session 持久化（sessionStorage）

- **寫入**：`login()` 成功後呼叫 `sessionStorage.setItem('vc_session', JSON.stringify(user))`。
- **讀取**：`AuthProvider` 初始化（`useEffect` on mount）時呼叫 `sessionStorage.getItem('vc_session')`，若有資料則還原 `user` state，實現重新整理後保持登入。
- **清除**：`logout()` 呼叫 `sessionStorage.removeItem('vc_session')` 並將 `user` 設為 `null`；關閉分頁後瀏覽器自動清除 sessionStorage，下次開啟需重新登入。

### 1.5 Auth Guard（App 區路由守衛）

`src/app/(app)/layout.tsx` 是 App 工作區的共用 Layout，在 render 子頁面之前先執行身份驗證檢查：

```
(app)/layout.tsx
├── useAuth() → 取得 user
├── user === null → router.replace('/login')（重新導向，不寫瀏覽器歷史）
└── user !== null → render children（正常顯示頁面）
```

所有在 `(app)` Route Group 下的頁面（`/library`、`/new`、`/voices`、`/settings`、`/account`）都受此守衛保護，未登入者無法直接透過 URL 存取。

### 1.6 AuthProviderWrapper（Server/Client 邊界處理）

Next.js App Router 的 Root Layout（`src/app/layout.tsx`）是 Server Component，無法直接使用 `useState` 或 React Context Provider。`AuthProviderWrapper`（`src/components/AuthProviderWrapper.tsx`）是一個標記 `'use client'` 的薄殼元件，只負責將 `children` 包在 `AuthProvider` 中。Root Layout import 此 wrapper 即可在 Server 端 layout 注入 Client 端的 Context。

```
layout.tsx (Server Component)
└── <AuthProviderWrapper>  ← 'use client'，Client Component 邊界從這裡開始
    └── <AuthProvider>     ← useState / sessionStorage 都在這裡
        └── {children}
```

### 1.7 動態資料頁面

各頁面透過 `useAuth()` 取得當前 `user`，顯示對應帳號的真實資料：

| 頁面 | 動態資料來源 |
|------|------------|
| `AppShell.tsx` Sidebar Profile Row | `user.name`、`user.avatar`、`user.plan` |
| `LibraryPage` | `user.libraryItems`（空陣列時顯示空態引導） |
| `AccountPage` | `user.name`、`user.email`、`user.avatar`、`user.usageStats` |

---

## 2. 語言切換機制

### 2.1 App 區（LangContext）

**檔案：** `src/contexts/LangContext.tsx`

App 區使用 React Context 集中管理語言狀態：

1. `LangProvider` 包在 `AppShell` 最外層（`AppShell.tsx` 的 `AppShell` export function 先套 `LangProvider`，再 render `AppShellInner`）。
2. `AppShellInner` 內的 `TopBar` 持有語言切換 UI（兩個 button），呼叫 `setLang('zh')` 或 `setLang('en')`。
3. 所有 App 頁面（LibraryPage、NewCanvasPage 各步驟、VoicesPage）呼叫 `useLang()` 取得 `lang`，並以 `const t = (zh, en) => lang === 'zh' ? zh : en` 這個行內 helper 處理文字切換。
4. Lang state 變化時，React re-render 整棵 `LangProvider` 下的子樹，所有頁面同步更新。

```
AppShell
└── LangProvider (lang state 在此)
    └── AppShellInner
        ├── TopBar ← setLang 在這裡觸發
        └── children（各頁面）← useLang() 讀取
```

### 2.2 行銷區（Local State）

Landing Page 與 Login Page 在 Route Group `(marketing)` 中，沒有共用 layout，各自用 `useState<'zh' | 'en'>` 管理語言：

- Landing Page：Nav 右上角的語言切換 button 更新 `lang` state，`t(key, lang)` helper 讀取內嵌的 `COPY` 物件中文 / 英文欄位。
- Login Page：`isZh` boolean 直接用三元運算式切換文字，另外在 `useEffect` 中同步更新 `document.title` 與 `document.documentElement.lang`。

---

## 3. Three-step Wizard 流程

**檔案：** `src/app/(app)/new/page.tsx`

Wizard 是一個單頁元件 `NewCanvasPage`，以 `step: 0 | 1 | 2` 的 local state 控制顯示哪個步驟畫面，共享同一份 `appState: AppState`。

### 3.1 步驟切換

```typescript
const goNext = (): void => setStep((s) => Math.min(2, s + 1) as Step);
const goBack = (): void => setStep((s) => Math.max(0, s - 1) as Step);
```

`NewCanvasPage` 根據 `step` 值條件 render：
- `step === 0` → `<VoiceSetupScreen>`
- `step === 1` → `<ScriptEditorScreen>`
- `step === 2` → `<PreviewScreen>`

### 3.2 Step 0：Voice Setup

- 使用者選擇性別（`GenderSelector`）、調整三個拉桿（`Slider`）、或選取 preset（`VoicePresets`）。
- 選取 preset 時，除更新 `preset` 外，同時以 `PRESET_TUNING` 常數覆寫 `age / pitch / timbre` 三個數值，讓拉桿跳到對應位置。
- 調整拉桿或更換性別時，`preset` 被設回 `null`，表示目前是「自訂聲音」。

### 3.3 Step 1：Script Editor

- 點擊「產出音檔」按鈕時，`startRender()` 將 `rendering` 設為 `true`，顯示全屏 `rendering-overlay`，並以 `setTimeout` 模擬 2400ms 處理時間後，設回 `false` 並呼叫 `onNext()`（進入 Step 2）。
- 互動細節見第 4、5 節。

### 3.4 Step 2：Preview

- 進入後自動開始播放（`playing` 初始值為 `true`）。
- 互動細節見第 6 節。

---

## 4. Slider 拖拽互動機制

**檔案：** `src/components/ui/Slider.tsx`

使用 Pointer Events API 實作，並加入 touch-event 相容判斷，確保桌面（mouse）與行動裝置（touch）都能正常拖拽：

1. 使用者在 `.sl-track` 上觸發 `onPointerDown`。
2. Handler 先用 `trackRef.current.getBoundingClientRect()` 取得軌道的絕對位置（`rect`）。
3. 計算目前點擊位置的百分比：`(e.clientX - rect.left) / rect.width * 100`，夾在 0–100 之間，取整數後呼叫 `onChange`。
4. 在 `window` 上掛 `pointermove` 與 `pointerup` listener，移動時持續計算新百分比，放開後移除 listener。
5. `rect` 在 `pointerdown` 時就計算好，避免拖拽過程中重複計算 layout（效能最佳化）。
6. touch-event 相容判斷：偵測 `pointerType === 'touch'` 時，以 `touch-action: none` 防止瀏覽器預設捲頁行為干擾拖拽。

`.sl-fill` 的寬度與 `.sl-thumb` 的 `left` 都直接綁定 `value + '%'`，達到即時視覺回饋。

---

## 5. Delay Tag 互動機制

**檔案：** `src/app/(app)/new/page.tsx`（`ScriptEditorScreen` 內）

Script 的資料模型是一個 `ScriptNode[]` 陣列，每個節點是 `{ type: 'text', value: string }` 或 `{ type: 'delay', seconds: number }`。

### 5.1 顯示

Delay 節點渲染為 `<span className="tag-delay">`，內容為 `<delay Xs>` 格式字串。

### 5.2 單擊：編輯模式

點擊 `.tag-delay` → `setEditingTag(idx)` → 該節點進入 editing 狀態 → render 變成：

```
<delay\u00a0 [<input type="number">] s>
```

Input 綁定 `onChange` 呼叫 `updateDelay(idx, parseFloat(value))`，即時更新 `script` state。Input 的 `onClick` 有 `e.stopPropagation()`，防止點擊 input 時觸發外層 tag 的 `onClick`。

### 5.3 雙擊：刪除

`onDoubleClick` → `e.stopPropagation()` + `removeNode(idx)` + `setEditingTag(null)`，從 `script` 陣列移除該節點。

### 5.4 Text 節點編輯

Text 節點渲染為 `<span contentEditable suppressContentEditableWarning>`，使用者直接在畫面上編輯文字。`onBlur` 時呼叫 `updateText(idx, e.currentTarget.textContent ?? '')` 同步回 state。

### 5.5 插入新停頓

點擊「插入停頓」按鈕 → `insertDelay()` → 在 `script` 陣列末端插入 `{ type: 'delay', seconds: 0.8 }` 與 `{ type: 'text', value: ' ' }`，確保停頓後有一個文字節點可供游標落點。

---

## 6. 預估時長計算

**檔案：** `src/app/(app)/new/page.tsx`（`ScriptEditorScreen` 內）

每次 `script` state 更新，以 `useMemo`（實際為直接計算，因位於 render 函數中）動態計算：

- `totalChars`：所有 text 節點的字元數加總。
- `totalDelay`：所有 delay 節點的秒數加總。
- `estDuration`：`Math.max(8, Math.round(totalChars * 0.15 + totalDelay))`，每字元約 0.15 秒，加上停頓秒數，最少 8 秒。

---

## 7. Playback 模擬機制

**檔案：** `src/app/(app)/new/page.tsx`（`PreviewScreen` 內）

目前為模擬播放（無真實音訊），以 `setInterval` 驅動進度：

```typescript
useEffect(() => {
  if (!playing) return;
  const interval = setInterval(() => {
    setProgress((p) => {
      if (p >= 1) { setPlaying(false); return 1; }
      return p + 0.005 * speed;
    });
  }, 50);
  return () => clearInterval(interval);
}, [playing, speed]);
```

- 每 50ms 執行一次，進度增加 `0.005 * speed`（speed 預設 1x，進度 100% 需約 10 秒）。
- 達到 100% 時停止播放。
- 切換 `speed`（speed pills 按鈕）或 `playing`（play/pause）會觸發 effect 重新執行，先清除舊的 interval 再建立新的。

### 7.1 播放 / 暫停

`pb-btn-big` 點擊切換 `playing` boolean，`useEffect` 依賴 `playing` 故 interval 隨之停止或啟動。

### 7.2 快進 / 快退

`pb-btn-sm` 點擊直接 `setProgress(Math.max/Min(0/1, progress ± 0.1))`，跳躍 10%。

### 7.3 波形播放指示

`waveform`：80 個高度值，以 `useMemo` 用 sin 函數計算（僅計算一次）。

`playedIdx = Math.floor(progress * waveform.length)` 計算已播放到第幾棒，index < playedIdx 的 `<span>` 加上 `className="played"`，CSS 將其改為 `--coral-500` 顏色並帶發光效果。

---

## 8. App Shell 行為

**檔案：** `src/components/app/AppShell.tsx`、`src/styles/app.css`

### 8.1 Sidebar 展開 / 收合（Desktop）

`AppShellInner` 持有 `collapsed: boolean` state。點擊 `.sidebar-collapse` 按鈕 → `setCollapsed(c => !c)`。

`.app` 根元素加上 `collapsed` class 時，CSS 變更 grid：

```css
.app                { grid-template-columns: 280px 1fr; }
.app.collapsed      { grid-template-columns: 76px 1fr; }
```

收合時，CSS 以 selector 隱藏所有文字標籤，只保留 `.ico` 圖標：

```css
.app.collapsed .sidebar .brand-row .name,
.app.collapsed .sidebar .nav-section,
.app.collapsed .sidebar .nav-item span:not(.ico),
...
{ display: none; }
```

折疊箭頭圖標 CSS `rotate(180deg)` 表示目前狀態。

### 8.2 Mobile Drawer

`AppShellInner` 持有 `mobileOpen: boolean`。TopBar 的 hamburger 按鈕（`menu-btn`）點擊後呼叫 `setMobileOpen(true)`。

當 `mobileOpen` 為 `true` 時：
- `.sidebar` 加上 `mobile-open` class → CSS `transform: translateX(0)` 從左側滑入。
- `.sidebar-backdrop` 加上 `mobile-open` class → 半透明遮罩出現。

點擊遮罩或 nav-item 後呼叫 `closeMobile()` → `setMobileOpen(false)`，sidebar 滑出、遮罩消失。

### 8.3 Active Route 偵測

Sidebar nav items 使用 `usePathname()` 取得目前路由，以 `pathname.startsWith('/' + item.id)` 判斷是否為 active，加上 `active` class 改變背景與文字顏色。

---

## 9. RWD 行為

**檔案：** `src/styles/app.css`、`src/styles/marketing.css`

### 9.1 App 區斷點

| 斷點 | 行為 |
|------|------|
| `> 1024px` | Sidebar 280px 展開，collapse button 可見 |
| `<= 1024px` | Sidebar 強制收合為 76px（icon-only），collapse button 隱藏 |
| `<= 768px` | Sidebar 完全隱藏，改為 mobile drawer 模式（fixed position，從左側 slide in），TopBar 顯示 hamburger button，兩欄 grid 改為單欄 |

### 9.2 行銷頁斷點

| 斷點 | 行為 |
|------|------|
| `<= 1024px` | Hero 字型縮小，Features 改為單欄，Steps 改 2×2，Footer 改 2×2 |
| `<= 768px` | Nav links 隱藏改顯示 hamburger，Hero 改單欄，hero-snippet 浮動卡片隱藏，Voices 2 欄，Pricing 單欄，Login 品牌欄縮小為上方 banner |

---

## 10. Wave 動畫機制

### 10.1 heroWave / loginWave 動畫

在廣告頁 Hero 與登入頁左側，每個波形棒（`<span>`）都套用相同的 `heroWave` CSS keyframe 動畫：

```css
@keyframes heroWave {
  0%, 100% { transform: scaleY(0.3); }
  50%       { transform: scaleY(1);   }
}
```

高度值本身為靜態（由 sin 函數預先計算好的常數陣列），各棒的 `animation-delay` 以 `i * 0.06s`（Hero）或 `i * 0.07s`（Login）遞增，形成從左到右的波浪效果。靜態高度陣列的設計是為了避免 SSR hydration mismatch（Server 與 Client 渲染不一致問題）。

### 10.2 pulseWave 動畫（Rendering Overlay）

渲染等待畫面的 5 個棒使用相同的 keyframe 結構，但間距為 `(i-1) * 0.2s`，形成較慢節奏的脈衝效果：

```css
@keyframes pulseWave {
  0%, 100% { transform: scaleY(0.3); }
  50%       { transform: scaleY(1);   }
}
```

---

## 11. UI 語意細節

### 11.1 Library 播放按鈕路由

**檔案：** `src/app/(app)/library/page.tsx`

作品清單每筆的播放按鈕帶有 preview 語意：點擊後路由至 `/new?play=true`，代表以預覽模式進入 New Canvas 頁面，讓使用者直接聆聽該作品，而非建立新的作品。

### 11.2 TopBar Breadcrumb 樣式

**檔案：** `src/components/app/AppShell.tsx`

TopBar 的 breadcrumb 顯示純文字路徑，不套用任何 `<b>` 或粗體 wrapper，符合設計稿的純文字 crumb 規範。語言切換時，路徑文字同步以中英文對照表更新。

### 11.3 VoicesPage Gender Filter 語意

**檔案：** `src/app/(app)/voices/page.tsx`

Voices 頁的性別篩選按鈕組（全部 / 女聲 / 男聲）帶有 `data-purpose="filter"` attribute，明確標示此按鈕組的用途為篩選功能，有助於自動化測試選取與無障礙語意識別。

### 11.4 Wave 高度單位規範（全站一致）

**檔案：** `src/app/(marketing)/page.tsx`、`src/app/(marketing)/signup/page.tsx`、`src/app/not-found.tsx`

全站所有 wave 波形棒的高度一律以明確的 `px` 單位字串指定（例如 `{ height: h + 'px' }`），避免省略單位時瀏覽器將數值忽略或隱性轉換導致波形棒高度為 0 的問題。v0.2.1 將 `not-found.tsx` 的寫法統一補齊，與廣告頁、註冊頁保持一致。

### 11.5 marketing.css Import 順序

**檔案：** `src/styles/marketing.css`

`marketing.css` 將 `@import './design-tokens.css'` 置於檔案最頂部，確保所有設計基礎變數在行銷頁樣式規則解析前已完整載入，避免 CSS 自訂屬性未定義的問題。

---

## 12. Onboarding Modal 機制

**檔案：** `src/components/app/OnboardingModal.tsx`

### 12.1 觸發方式

- Settings 頁「看引導教學」按鈕點擊 → `setShowOnboarding(true)` → render `<OnboardingModal onClose={...} />`。
- 未來可從 auth 首次登入流程觸發（擴充點）。

### 12.2 元件 Props

```typescript
interface OnboardingScreenProps {
  onClose: () => void;
}
```

### 12.3 步驟切換

- 元件內持有 `idx: number`（0–3），共 4 個步驟。
- 「下一步」按鈕：`setIdx(i => i + 1)`；最後一步改為「開始使用」，點擊呼叫 `onClose()`。
- 「跳過」按鈕：直接呼叫 `onClose()`。

### 12.4 左側插圖

每個步驟根據 `step.illust` 字串（`'hero'`、`'voice'`、`'script'`、`'render'`）條件 render 對應的 JSX 插圖，四種插圖各自描述功能主題。

### 12.5 Dot Indicator 動畫

底部 dot 列依 `idx` 高亮當前點：

- active dot：CSS `width: 28px`（膠囊形狀）
- inactive dot：CSS `width: 8px`（圓點）

以 CSS transition 實現寬度動畫，提供步驟進度視覺回饋。

---

## 13. 忘記密碼流程機制

**檔案：** `src/app/(marketing)/forgot/page.tsx`

### 13.1 表單狀態切換

元件持有 `formState: 'form' | 'success'` state：

- 初始狀態 `'form'`：顯示 Email 輸入欄位與送出按鈕。
- 使用者送出表單後：記錄 email 值，將 `formState` 切換為 `'success'`。
- 狀態 `'success'`：隱藏表單，改為顯示「信件已寄出」畫面，並呈現使用者輸入的 email 地址。

### 13.2 重新寄送功能

success 狀態頁面提供「重新寄送」按鈕：

- 元件另持有 `resent: boolean` state，初始為 `false`。
- 點擊「重新寄送」→ `setResent(true)` → 按鈕文字改為「已重新寄送」，同時加上 `pointer-events: none` 防止重複點擊。

---

## 15. PWA 支援與 Favicon 機制

**檔案：** `src/app/layout.tsx`、`public/manifest.json`、`public/icon.svg`

### 15.1 Next.js Metadata 匯出

Root Layout（`src/app/layout.tsx`）以 Next.js 的 `metadata` 靜態匯出物件宣告所有頁面的 `<head>` 資訊，包含 PWA 與 Favicon 所需的 link / meta 標籤，Next.js 在建置時自動注入至每個頁面的 HTML `<head>`。

```typescript
export const metadata: Metadata = {
  // ...基本欄位...
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VocalCanvas',
  },
};
```

- `manifest`：指向 `/public/manifest.json`，瀏覽器讀取後取得 PWA 安裝所需的名稱、顏色、圖示、啟動模式等資訊。
- `icons.icon`：標準 favicon，對應 `/icon.svg`。
- `icons.apple`：Apple Touch Icon，讓使用者儲存捷徑至 iOS 主畫面時使用同一份 SVG 圖示。
- `appleWebApp.capable`：注入 `<meta name="mobile-web-app-capable" content="yes">`，告知 iOS Safari 此網頁支援 Web App 模式。

### 15.2 Web App Manifest（`public/manifest.json`）

| 欄位 | 值 | 說明 |
|------|----|------|
| `name` | `VocalCanvas` | 完整應用名稱 |
| `short_name` | `VocalCanvas` | 主畫面捷徑顯示名稱 |
| `theme_color` | `#FF5A3C` | 瀏覽器工具列與 PWA 視窗標題列顏色（對應 `--coral-500`） |
| `background_color` | `#FFFCF7` | 啟動畫面背景色（對應 `--cream-50`） |
| `display` | `standalone` | 以獨立視窗模式啟動，不顯示瀏覽器 UI |
| `icons` | `[{ src: "/icon.svg", type: "image/svg+xml", sizes: "any" }]` | PWA 安裝圖示，SVG 格式可縮放至任意尺寸 |

### 15.3 PWA 圖示（`public/icon.svg`）

`public/icon.svg` 內容與 `public/assets/logo-mark.svg` 相同，提供 PWA 安裝圖示、Apple Touch Icon 及標準 favicon 的統一來源。SVG 格式無需另備多份不同解析度的點陣圖。

---

## 14. Global Rendering Overlay 機制

**檔案：** `src/contexts/LangContext.tsx`、`src/components/app/AppShell.tsx`、`src/styles/app.css`

### 14.1 狀態來源

`LangContext` 提供 `rendering: boolean` 與 `setRendering: (v: boolean) => void`，作為全域渲染遮罩狀態。任何頁面或元件均可透過 `useLang()` 取得並設定此狀態。

### 14.2 渲染位置

遮罩渲染於 `AppShell` 的 `.main` 容器層，而非 `NewCanvasPage` 內部。覆蓋範圍包含 topbar，符合 demo 設計規格（使用者操作完全被鎖定直到渲染完成）。

```
AppShell
└── .main
    ├── TopBar
    ├── children（各頁面）
    └── .rendering-overlay（rendering === true 時顯示，position: absolute，覆蓋整個 .main）
```

### 14.3 觸發與還原

- Script Editor「產出音檔」按鈕 → `setRendering(true)` → 顯示 overlay。
- 模擬處理結束（setTimeout 2400ms）→ `setRendering(false)` → 隱藏 overlay，進入 Step 2 Preview。
