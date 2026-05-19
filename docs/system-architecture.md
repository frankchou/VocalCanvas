# VocalCanvas 系統架構

> 本文件描述系統現況（截至 2026-05-19，v1.0.0），與程式碼保持同步。

---

## 1. 技術棧

| 層次 | 技術 | 版本 |
|------|------|------|
| 框架 | Next.js | 16.2.6 |
| 語言 | TypeScript | ^5 |
| UI 函式庫 | React | 19.2.4 |
| 字型載入 | next/font/google | — |
| 樣式 | 全域 CSS 變數 + 頁面層 CSS | — |
| 路由 | Next.js App Router (Route Groups) | — |
| 狀態管理 | React useState / useContext + Firestore | — |
| 圖片 | Next.js `<Image>` | — |
| 身份驗證 | Firebase Auth（Email/Password、Google OAuth） | — |
| 資料庫 | Cloud Firestore | — |
| 檔案儲存 | Firebase Storage | — |
| 語音合成 | Google Cloud Text-to-Speech（Neural2） | — |
| 付款 | Lemon Squeezy（Checkout + Webhooks） | — |

### 1.1 字型

Root Layout (`src/app/layout.tsx`) 透過 `next/font/google` 在伺服器端載入四款字型，以 CSS variable 注入 `<html>`：

| 變數 | 字型 | 用途 |
|------|------|------|
| `--font-sora` (`var(--font-display)`) | Sora | 標題、品牌名 |
| `--font-manrope` (`var(--font-body)`) | Manrope | 內文、按鈕 |
| `--font-jetbrains-mono` (`var(--font-mono)`) | JetBrains Mono | 程式碼、時間戳、數值 |
| `--font-noto-sans-tc` (`var(--font-zh)`) | Noto Sans TC | 中文字元 |

---

## 2. 路由架構

使用 Next.js App Router 的 **Route Groups** 將路由分成兩個獨立群組，各自套用不同的 Layout 與樣式：

```
src/app/
├── layout.tsx                    ← Root Layout（字型注入、全域 globals.css）
├── not-found.tsx                 → URL: /* (404)   全域 404 錯誤頁
│
├── (marketing)/                  ← Route Group：行銷/登入頁
│   ├── page.tsx                  → URL: /          廣告頁 (Landing Page)
│   ├── login/
│   │   └── page.tsx              → URL: /login     登入頁
│   ├── signup/
│   │   └── page.tsx              → URL: /signup    新用戶註冊頁
│   └── forgot/
│       └── page.tsx              → URL: /forgot    忘記密碼頁
│
├── (app)/                        ← Route Group：App 工作區
│   ├── layout.tsx                → 套用 app.css，render <AppShell>
│   ├── library/
│   │   └── page.tsx              → URL: /library   作品庫
│   ├── new/
│   │   └── page.tsx              → URL: /new        New Canvas Wizard
│   ├── voices/
│   │   └── page.tsx              → URL: /voices     聲音庫
│   ├── settings/
│   │   └── page.tsx              → URL: /settings  帳號/偏好/通知設定
│   └── account/
│       └── page.tsx              → URL: /account   個人資料 + 安全性 + 使用量
│
└── api/                          ← API Routes（Server-side）
    ├── tts/
    │   └── route.ts              → POST /api/tts           Google Cloud TTS 語音合成
    ├── checkout/
    │   └── route.ts              → POST /api/checkout      Lemon Squeezy 結帳
    └── webhooks/
        └── lemonsqueezy/
            └── route.ts          → POST /api/webhooks/lemonsqueezy  付款 Webhook
```

> **建置確認（v0.2.1）：** `next build` 靜態產生 11 條路由（含 Next.js 內部的 `/_not-found`），TypeScript 無錯誤，全部為 Static（○）頁面。

### 2.1 Route Group 的隔離機制

- `(marketing)` 群組：無額外 layout，各頁自行 import `marketing.css`（廣告頁在 `page.tsx` 直接使用全域 CSS，登入頁沿用 marketing.css 樣式）。
- `(app)` 群組：`layout.tsx` import `app.css` 並 render `<AppShell>`，讓所有 App 頁面共享 Sidebar + TopBar 結構。

---

## 3. 頁面對應表

| URL | 元件檔案 | 功能說明 |
|-----|---------|---------|
| `/` | `(marketing)/page.tsx` | 廣告頁：Nav、Hero、Features、How It Works、Voices Teaser、Use Cases、Pricing、Final CTA、Footer |
| `/login` | `(marketing)/login/page.tsx` | 登入頁：左側品牌欄 + 右側表單（OAuth + Email），雙語切換 |
| `/signup` | `(marketing)/signup/page.tsx` | 新用戶註冊 |
| `/forgot` | `(marketing)/forgot/page.tsx` | 忘記密碼 + success state |
| `/*` (not-found) | `not-found.tsx` | 404 全域錯誤頁 |
| `/library` | `(app)/library/page.tsx` | 作品庫：作品列表、收藏切換、波形縮圖 |
| `/new` | `(app)/new/page.tsx` | New Canvas Wizard：三步驟（Voice Setup → Script Editor → Preview） |
| `/voices` | `(app)/voices/page.tsx` | 聲音庫：全部 6 款聲音、性別篩選 |
| `/settings` | `(app)/settings/page.tsx` | 帳號/偏好/通知設定 |
| `/account` | `(app)/account/page.tsx` | 個人資料 + 安全性 + 使用量 |

---

## 4. 元件樹結構

```
RootLayout (src/app/layout.tsx)
│
└── AuthProviderWrapper (src/components/AuthProviderWrapper.tsx)
    └── AuthProvider (src/contexts/AuthContext.tsx)
        │
        ├── MarketingPage (src/app/(marketing)/page.tsx)
        │   └── [內嵌元件，無共用 layout]
        │       ├── Nav（sticky header，scroll 偵測）
        │       ├── Hero（wave 動畫、stage card）
        │       ├── Features（3 格卡片）
        │       ├── Scenarios（6 張漸層情境卡）
        │       ├── How It Works（4 步驟卡片）
        │       ├── Voices Teaser（4 個 voice-card）
        │       ├── Use Cases（2×2 格）
        │       ├── Pricing（Free + Pro）
        │       ├── Final CTA
        │       └── Footer
        │
        ├── LoginPage (src/app/(marketing)/login/page.tsx)
        │   ├── aside.login-brand（波形動畫、引言）
        │   └── main.login-form（OAuth buttons + Email form，串接 AuthContext.login() / loginWithGoogle()）
        │
        └── AppLayout (src/app/(app)/layout.tsx)  ← Auth Guard：未登入跳轉 /login
            └── AppShell (src/components/app/AppShell.tsx)
                ├── LangProvider (src/contexts/LangContext.tsx)
                ├── Sidebar
                │   ├── Logo（logo-mark.svg）
                │   ├── New Canvas CTA button
                │   ├── Nav items（Library / Voices / Settings）
                │   ├── Recent 捷徑（靜態 3 筆）
                │   └── Profile Row（頭像 / 姓名 / 方案，來自 AuthContext；登出按鈕）
                ├── TopBar
                │   ├── Hamburger menu（mobile）
                │   ├── Breadcrumb（路徑對應中英文標題）
                │   └── Lang Switch（中文 / English）
                └── children（各 App 頁面）
                    ├── LibraryPage (src/app/(app)/library/page.tsx)
                    │   └── lib-list（來自 useLibrary hook，Firestore 即時同步；無作品時顯示空態）
                    ├── NewCanvasPage (src/app/(app)/new/page.tsx)
                    │   ├── VoiceSetupScreen (Step 0)
                    │   │   ├── ScenarioSelector (src/components/app/ScenarioSelector.tsx)
                    │   │   │   └── 7 張情境卡（自訂/冥想/睡前故事/肯定語/Podcast/廣告/有聲書）
                    │   │   ├── GenderSelector (src/components/ui/GenderSelector.tsx)
                    │   │   ├── Slider × 3 (src/components/ui/Slider.tsx)
                    │   │   ├── VoicePresets (src/components/ui/VoicePresets.tsx)
                    │   │   └── BGMPicker (src/components/app/BGMPicker.tsx)
                    │   │       ├── 9 首 BGM 曲目選擇格
                    │   │       └── BGMVolumeSlider（選非「純朗讀」時顯示）
                    │   ├── ScriptEditorScreen (Step 1)
                    │   │   ├── script-area（contentEditable text nodes + delay tags）
                    │   │   └── rendering-overlay（pulseWave 動畫）
                    │   └── PreviewScreen (Step 2)
                    │       ├── studio-stage（波形播放）
                    │       ├── Playback controls（SkipBack / Play / SkipForward）
                    │       ├── Speed pills（0.5× 到 2×）
                    │       ├── BGM 資訊列（曲目名稱 + 音量，純朗讀時隱藏）
                    │       └── Action cards（Favorite / Save / Download）
                    ├── VoicesPage (src/app/(app)/voices/page.tsx)
                    │   └── 6 個聲音卡片（gender filter）
                    ├── SettingsPage (src/app/(app)/settings/page.tsx)
                    │   ├── 帳號 card、偏好 card、通知 card、說明 card
                    │   ├── Toggle 元件
                    │   ├── danger zone
                    │   └── OnboardingModal 觸發入口
                    ├── AccountPage (src/app/(app)/account/page.tsx)
                    │   ├── 個人資料編輯區（姓名 / Email 來自 AuthContext）
                    │   ├── 安全性設定（密碼 / 2FA / 已連結帳號）
                    │   └── 使用量統計（來自 AuthContext.user）
                    └── OnboardingModal (src/components/app/OnboardingModal.tsx)
                        ├── 4 步驟引導（idx: 0–3）
                        ├── 左側插圖（hero/voice/script/render 4 種 JSX）
                        └── dot indicator 動畫
```

### 4.1 共用 UI 元件（`src/components/ui/`）

| 元件 | 說明 |
|------|------|
| `Slider.tsx` | 百分比拉桿，pointer event 拖拽，含 touch-event 相容判斷 |
| `GenderSelector.tsx` | 男聲 / 女聲二選一卡片 |
| `VoicePresets.tsx` | 預設聲音選擇器（4 款，可依 gender 篩選） |
| `Steps.tsx` | Wizard 步驟指示器（Voice / Script / Render） |
| `Icons.tsx` | 所有 SVG icon 元件集合 |
| `Button.tsx` | 通用 Button 元件 |

### 4.2 共用 App 元件（`src/components/app/`）

| 元件 | 說明 |
|------|------|
| `AppShell.tsx` | Sidebar + TopBar + LangProvider 整合容器 |
| `OnboardingModal.tsx` | 4 步驟全屏 onboarding modal，接受 `{ onClose: () => void }` prop |
| `ScenarioSelector.tsx` | 7 個情境快選卡片，選取後自動套用聲音設定與 BGM 預設值；含 ScIcon primitive、SCENARIOS 資料陣列、Scenario 型別定義 |
| `BGMPicker.tsx` | 9 首 BGM 曲目選擇器，含推薦篩選/全部切換、BGMVolumeSlider 音量拉桿（setPointerCapture 拖曳）；含 BGM_TRACKS 資料陣列、BgmTrack 型別定義 |

---

## 5. 狀態管理

### 5.0 身份驗證狀態（全站）

`AuthContext`（`src/contexts/AuthContext.tsx`）提供全站的使用者身份驗證狀態，由 `AuthProviderWrapper`（`src/components/AuthProviderWrapper.tsx`）包在 Root Layout 最外層，行銷區與 App 區皆可存取：

- `AuthProvider`：持有 `user: AppUser | null` 與 `authState: 'loading' | 'authenticated' | 'unauthenticated'` 三態模型。初始化時透過 Firebase `onAuthStateChanged` 監聽登入狀態，並從 Firestore `users/{uid}` 文件讀取使用者資料。
- `useAuth()` hook：對外暴露 `{ user, authState, login, signup, loginWithGoogle, logout, resetPassword, setStaySignedIn }`。
- `login(email, password)`：呼叫 Firebase `signInWithEmailAndPassword`，由 `onAuthStateChanged` 回呼自動更新 user state。
- `signup(name, email, password)`：呼叫 `createUserWithEmailAndPassword`，設定 displayName，發送驗證信，並在 Firestore 建立使用者文件。
- `loginWithGoogle()`：呼叫 `signInWithPopup(GoogleAuthProvider)`，若為首次登入則自動在 Firestore 建立使用者文件。
- `logout()`：呼叫 Firebase `signOut`，`onAuthStateChanged` 回呼將 user 設為 `null`。
- `resetPassword(email)`：呼叫 Firebase `sendPasswordResetEmail`。
- `setStaySignedIn(stay)`：切換 Firebase 持久化模式（`browserLocalPersistence` / `browserSessionPersistence`）。

### 5.0.1 作品庫狀態（useLibrary hook）

`useLibrary`（`src/hooks/useLibrary.ts`）提供作品庫的即時 CRUD 功能：

- 透過 Firestore `onSnapshot` 即時監聽 `users/{uid}/library` 子集合，按 `createdAt` 降序排列。
- 對外暴露 `{ items, loading, toggleFavorite, deleteItem, renameItem, addItem }`。
- 所有寫入操作（toggle、delete、rename、add）直接操作 Firestore，UI 透過 snapshot listener 自動更新。

### 5.1 語言狀態與 Rendering 狀態（App 區）

`LangContext`（`src/contexts/LangContext.tsx`）提供 App 區的全域語言與渲染狀態：

- `LangProvider`：包在 `AppShell` 最外層，State 持有 `lang: 'zh' | 'en'` 及 `rendering: boolean`。
- `useLang()` hook：各 App 頁面與元件呼叫，取得 `{ lang, setLang, rendering, setRendering }`。
- TopBar 的語言切換 button 呼叫 `setLang`，所有子頁面即時更新顯示語言。
- `rendering` / `setRendering`：全域渲染遮罩狀態，由 AppShell `.main` 層監聽；`true` 時覆蓋 topbar 顯示 rendering overlay。

行銷區（Landing Page、Login Page）沒有使用 LangContext，各自用 local `useState<'zh' | 'en'>` 管理語言狀態。

### 5.2 New Canvas Wizard 狀態

`NewCanvasPage` 持有 `AppState` 物件（local state）及 BGM / Scenario 相關獨立狀態，在三個步驟之間共享：

```typescript
interface AppState {
  voice: {
    gender: 'male' | 'female';
    age: number;       // 0–100
    pitch: number;     // 0–100
    timbre: number;    // 0–100
    preset: string | null;
  };
  script: ScriptNode[];  // text | delay 節點陣列
  rendering: boolean;
}

// BGM / Scenario 相關 (NewCanvasPage local state，以 props 傳入 VoiceSetupScreen / PreviewScreen)
// scenarioId: string          — 目前選取的情境 id（'custom' | 'meditation' | ...）
// bgmTrack: string            — 目前選取的 BGM id（'none' | 'ocean' | ...）
// bgmVolume: number           — BGM 音量百分比（0–100）
// bgmExpanded: boolean        — BGMPicker 是否展開全部曲目
```

各步驟 Screen 元件接受 `state` 與 `setState` props，共享同一份狀態。BGM / Scenario 狀態由 `NewCanvasPage` 以個別 props 傳遞給 `VoiceSetupScreen`（讀寫）及 `PreviewScreen`（唯讀顯示）。

### 5.3 其他 Local States

| 頁面 / 元件 | State | 說明 |
|------------|-------|------|
| `LibraryPage` | `useLibrary(uid)` | 作品庫即時同步（Firestore onSnapshot） |
| `VoicesPage` | `genderFilter: 'all' \| 'male' \| 'female'` | 聲音庫篩選條件 |
| `PreviewScreen` | `playing`, `progress`, `speed`, `fav`, `saved` | 播放器狀態 |
| `AppShellInner` | `collapsed`, `mobileOpen` | Sidebar 展開/收合、mobile drawer 開關 |
| `MarketingPage` | `lang`, `scrolled` | 廣告頁語言與 Nav scroll 狀態 |
| `NewCanvasPage` | `scenarioId`, `bgmTrack`, `bgmVolume`, `bgmExpanded` | 情境快選、BGM 曲目選擇、音量、是否展開全部曲目 |
| `SettingsPage` | `showOnboarding` | 控制 OnboardingModal 顯示 |
| `ForgotPage` | `formState`, `resent` | 忘記密碼表單 / success 狀態切換，重新寄送狀態 |

---

## 6. 設計系統整合

```
src/styles/
├── design-tokens.css   ← 設計基礎：色票、字型、間距、陰影、圓角、動效
├── globals.css         ← Root 全域重置（由 root layout 載入）
├── marketing.css       ← 行銷頁樣式（@import design-tokens.css）
└── app.css             ← App 工作區樣式（import design-tokens.css 透過 globals）
```

`design-tokens.css` 定義所有 CSS 自訂屬性（Custom Properties），所有元件直接引用變數，不直接寫死顏色或字型名稱。

### 6.1 主要 Design Token 分類

| 分類 | 代表變數 |
|------|---------|
| 主色 Coral | `--coral-500` (#FF5A3C) |
| 強調色 Mint | `--mint-500` (#1FC68C) |
| 深色畫布 Ink | `--ink-700` (#1A1813)、`--ink-800` (#0F0E0A) |
| 背景 Cream | `--cream-50` (#FFFCF7) |
| 漸層 | `--grad-sunset`、`--grad-canvas`、`--grad-aurora` |
| 陰影 | `--shadow-sm` 到 `--shadow-xl`、`--shadow-glow` |
| 圓角 | `--r-sm`(8px) 到 `--r-pill`(999px) |
| 字型 | `--font-display`、`--font-body`、`--font-mono` |
| 動效 | `--ease-out`、`--ease-in-out`、`--ease-spring` |

---

## 7. 資料夾結構說明

```
/workspaces/VocalCanvas/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 Root Layout，字型注入
│   │   ├── not-found.tsx              全域 404 錯誤頁
│   │   ├── (marketing)/               行銷區 Route Group
│   │   │   ├── page.tsx               廣告頁
│   │   │   ├── login/page.tsx         登入頁
│   │   │   ├── signup/page.tsx        新用戶註冊頁
│   │   │   └── forgot/page.tsx        忘記密碼頁
│   │   ├── (app)/                     App 區 Route Group
│   │   │   ├── layout.tsx             App Layout（AppShell wrapper）
│   │   │   ├── library/page.tsx       作品庫頁
│   │   │   ├── new/page.tsx           New Canvas Wizard
│   │   │   ├── voices/page.tsx        聲音庫頁
│   │   │   ├── settings/page.tsx      設定頁
│   │   │   └── account/page.tsx       帳號頁
│   │   └── api/                       API Routes
│   │       ├── tts/route.ts           Google Cloud TTS 語音合成 API
│   │       ├── checkout/route.ts      Lemon Squeezy 結帳 API
│   │       └── webhooks/
│   │           └── lemonsqueezy/route.ts  付款 Webhook 接收端
│   ├── components/
│   │   ├── app/
│   │   │   ├── AppShell.tsx           Sidebar + TopBar 整合元件
│   │   │   ├── OnboardingModal.tsx    4 步驟全屏 Onboarding Modal
│   │   │   ├── ScenarioSelector.tsx   情境快選元件（7 張卡片）
│   │   │   └── BGMPicker.tsx          BGM 選擇器 + 音量拉桿
│   │   ├── AuthProviderWrapper.tsx    Client 薄殼，讓 Server Layout 能套上 AuthProvider
│   │   ├── marketing/
│   │   │   └── MarketingNav.tsx       (備用，目前廣告頁 Nav 內嵌於 page.tsx)
│   │   └── ui/
│   │       ├── Button.tsx             通用 Button
│   │       ├── GenderSelector.tsx     性別選擇器
│   │       ├── Icons.tsx              SVG Icon 集合
│   │       ├── Slider.tsx             百分比拉桿
│   │       ├── Steps.tsx              步驟指示器
│   │       └── VoicePresets.tsx       預設聲音選擇器
│   ├── lib/
│   │   ├── firebase.ts                Firebase Client SDK 初始化（auth / db / storage）
│   │   └── firebase-admin.ts          Firebase Admin SDK 初始化（伺服器端專用）
│   ├── hooks/
│   │   └── useLibrary.ts              作品庫 CRUD hook（Firestore onSnapshot 即時同步）
│   ├── contexts/
│   │   ├── AuthContext.tsx            全站身份驗證 Context（Firebase Auth + Firestore 使用者資料）
│   │   └── LangContext.tsx            App 區語言 + rendering 全域 Context
│   └── styles/
│       ├── design-tokens.css          設計基礎變數
│       ├── globals.css                全域重置
│       ├── marketing.css              行銷頁樣式
│       └── app.css                    App 工作區樣式
├── public/
│   ├── assets/
│   │   ├── logo-mark.svg              彩色 Logo 圖標
│   │   ├── logo-wordmark.svg          Logo 完整版（含文字）
│   │   └── logo-mark-mono.svg         單色 Logo 圖標
│   ├── manifest.json                  Web App Manifest（PWA 設定）
│   └── icon.svg                       PWA 圖示（同 logo-mark.svg）
├── firestore.rules                    Firestore 安全規則（owner-only 讀寫）
├── storage.rules                      Storage 安全規則（owner-only + 頭像大小限制）
├── firebase.json                      Firebase CLI 設定（指向 rules 檔案）
├── package.json
└── tsconfig.json
```
