# VocalCanvas 系統機制

> 本文件描述各核心功能的實際運作細節（截至 2026-05-19，v1.0.0），與程式碼保持同步。

---

## 1. Firebase 身份驗證機制

**檔案：** `src/lib/firebase.ts`、`src/contexts/AuthContext.tsx`、`src/components/AuthProviderWrapper.tsx`、`src/app/(app)/layout.tsx`、`src/app/(marketing)/login/page.tsx`

### 1.1 Firebase 初始化

`src/lib/firebase.ts` 以環境變數（`NEXT_PUBLIC_FIREBASE_*`）初始化 Firebase Client SDK，匯出 `auth`（Firebase Auth）、`db`（Firestore）、`storage`（Firebase Storage）三個單例。透過 `getApps().length === 0` 判斷避免重複初始化。

`src/lib/firebase-admin.ts` 初始化 Firebase Admin SDK，供伺服器端 API Routes 使用。以 `GOOGLE_APPLICATION_CREDENTIALS` 環境變數讀取 Service Account 金鑰，匯出 `adminAuth`、`adminDb`、`adminStorage`。

### 1.2 資料模型

`AuthContext` 定義的使用者資料結構（`AppUser`）：

```typescript
interface AppUser {
  id: string;            // Firebase UID
  name: string;
  email: string;
  avatar: string;        // 姓名首字母大寫（用於無頭像時的文字替代）
  avatarUrl: string | null;  // Firebase Storage 或 Google 頭像 URL
  plan: string;          // 'Free' | 'Pro'
  emailVerified: boolean;
  usage: {
    rendered: number;    // 已使用分鐘數（Firestore 儲存秒數，讀取時轉換）
    total: number;       // 方案上限分鐘數
    takes: number;       // 產出次數
    storage: string;     // 儲存空間用量
  };
  library: never[];      // 向下相容空陣列（作品庫改由 useLibrary hook 管理）
}
```

三態認證狀態模型：

```typescript
type AuthState = 'loading' | 'authenticated' | 'unauthenticated';
```

- `loading`：初始狀態，`onAuthStateChanged` 尚未回呼，Auth Guard 顯示空白避免閃爍。
- `authenticated`：Firebase 確認使用者已登入。
- `unauthenticated`：Firebase 確認使用者未登入，Auth Guard 重新導向至 `/login`。

### 1.3 Firestore 使用者文件結構

每位使用者在 Firestore `users/{uid}` 擁有一份文件，首次登入時自動建立（`defaultUserDoc` 函式）：

```typescript
{
  name: string,
  email: string,
  avatarUrl: string | null,
  plan: 'free',
  createdAt: serverTimestamp(),
  preferences: {
    lang: 'zh',
    readingLang: 'zh-TW',
    outputFormat: 'mp3-240',
    autoSave: true,
    emailNotif: true,
    productNews: false,
  },
  usage: {
    rendered: 0,      // 秒
    total: 1800,       // 30 分鐘（秒），Pro 為 14400（240 分鐘）
    takes: 0,
    storage: '0 GB',
    resetAt: null,
  },
}
```

### 1.4 登入流程

**Email/Password 登入**
1. 使用者在 `/login` 輸入帳號密碼，點擊「登入」。
2. `LoginPage` 呼叫 `useAuth().login(email, password)`。
3. `login()` 呼叫 Firebase `signInWithEmailAndPassword(auth, email, password)`。
4. Firebase 驗證成功後觸發 `onAuthStateChanged` 回呼：
   - 讀取 Firestore `users/{uid}` 文件。
   - 以 `buildAppUser()` 將 FirebaseUser + Firestore 資料組裝成 `AppUser`。
   - 設定 `authState = 'authenticated'`。
5. 驗證失敗時 Firebase 拋出錯誤，LoginPage catch 後顯示錯誤訊息。

**Google OAuth 登入**
1. 使用者點擊 Google 登入按鈕。
2. `loginWithGoogle()` 呼叫 `signInWithPopup(auth, GoogleAuthProvider)`。
3. 彈出 Google 授權視窗，使用者完成授權後 `onAuthStateChanged` 觸發。
4. 若 Firestore `users/{uid}` 文件不存在（首次 Google 登入），自動以 `defaultUserDoc()` 建立新文件。

**註冊流程**
1. `signup(name, email, password)` 呼叫 `createUserWithEmailAndPassword`。
2. 以 `updateProfile` 設定 Firebase Auth 的 displayName。
3. 呼叫 `sendEmailVerification` 發送驗證信。
4. 在 Firestore `users/{uid}` 建立使用者文件。

### 1.5 Session 持久化（Firebase Persistence）

Firebase Auth 內建持久化機制，取代原先的 sessionStorage 方案：

- `setStaySignedIn(true)` → `setPersistence(auth, browserLocalPersistence)`：關閉瀏覽器後仍保持登入。
- `setStaySignedIn(false)` → `setPersistence(auth, browserSessionPersistence)`：關閉分頁後需重新登入。
- 預設為 `browserLocalPersistence`，由 Firebase SDK 自行管理 IndexedDB 中的 token 存取。

### 1.6 Auth Guard（App 區路由守衛）

`src/app/(app)/layout.tsx` 是 App 工作區的共用 Layout，在 render 子頁面之前先執行身份驗證檢查：

```
(app)/layout.tsx
├── useAuth() → 取得 { user, authState }
├── authState === 'loading' → 顯示空白（等待 Firebase 初始化）
├── authState === 'unauthenticated' → router.replace('/login')
└── authState === 'authenticated' → render children
```

所有在 `(app)` Route Group 下的頁面（`/library`、`/new`、`/voices`、`/settings`、`/account`）都受此守衛保護，未登入者無法直接透過 URL 存取。三態模型避免了初始化期間的誤跳轉閃爍問題。

### 1.7 AuthProviderWrapper（Server/Client 邊界處理）

Next.js App Router 的 Root Layout（`src/app/layout.tsx`）是 Server Component，無法直接使用 `useState` 或 React Context Provider。`AuthProviderWrapper`（`src/components/AuthProviderWrapper.tsx`）是一個標記 `'use client'` 的薄殼元件，只負責將 `children` 包在 `AuthProvider` 中。Root Layout import 此 wrapper 即可在 Server 端 layout 注入 Client 端的 Context。

```
layout.tsx (Server Component)
└── <AuthProviderWrapper>  ← 'use client'，Client Component 邊界從這裡開始
    └── <AuthProvider>     ← Firebase onAuthStateChanged 在這裡監聽
        └── {children}
```

### 1.8 動態資料頁面

各頁面透過 `useAuth()` 取得當前 `user`，顯示對應帳號的真實資料：

| 頁面 | 動態資料來源 |
|------|------------|
| `AppShell.tsx` Sidebar Profile Row | `user.name`、`user.avatar`、`user.avatarUrl`、`user.plan` |
| `LibraryPage` | `useLibrary(user.id)` — Firestore 即時同步（空集合時顯示空態引導） |
| `AccountPage` | `user.name`、`user.email`、`user.avatarUrl`、`user.usage` |

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

- 點擊「產出音檔」按鈕時，`startRender()` 將 `rendering` 設為 `true`，顯示全屏 `rendering-overlay`。
- 前端發送 POST `/api/tts` 請求，帶上 `script`（ScriptNode 陣列）、`voice`（聲音參數）與 `lang`。
- API 回傳 base64 編碼的 MP3 音訊資料，前端轉為 Blob URL 供 PreviewScreen 的 HTML5 Audio 播放。
- 渲染完成後 `setRendering(false)` 並呼叫 `onNext()`（進入 Step 2）。
- 同時更新 Firestore 使用者的 `usage.rendered` 與 `usage.takes` 欄位（使用量追蹤）。
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

## 7. 音訊播放機制（HTML5 Audio）

**檔案：** `src/app/(app)/new/page.tsx`（`PreviewScreen` 內）

使用 HTML5 `Audio` 物件播放由 `/api/tts` 回傳的真實 MP3 音訊：

- `audioRef` 持有 `Audio` 實例，`src` 設為 TTS API 回傳的 base64 Blob URL。
- 透過 `audio.ontimeupdate` 事件即時更新 `progress` state（`currentTime / duration`）。
- `audio.onended` 事件觸發時將 `playing` 設為 `false`。

### 7.1 播放 / 暫停

`pb-btn-big` 點擊切換 `playing` boolean，呼叫 `audio.play()` 或 `audio.pause()`。

### 7.2 快進 / 快退

`pb-btn-sm` 點擊調整 `audio.currentTime`（前後跳躍固定秒數）。

### 7.3 播放速度

Speed pills（0.5x 到 2x）點擊後設定 `audio.playbackRate`，Audio API 原生支援變速播放。

### 7.4 波形播放指示

`waveform`：80 個高度值，以 `useMemo` 用 sin 函數計算（僅計算一次）。

`playedIdx = Math.floor(progress * waveform.length)` 計算已播放到第幾棒，index < playedIdx 的 `<span>` 加上 `className="played"`，CSS 將其改為 `--coral-500` 顏色並帶發光效果。

### 7.5 下載

Action cards 的下載按鈕建立 `<a>` 元素，將 `href` 設為 Blob URL、`download` 設為檔名，觸發瀏覽器下載。

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
- TTS API 回傳音訊後 → `setRendering(false)` → 隱藏 overlay，進入 Step 2 Preview。

---

## 16. 情境模式機制（Scenarios + BGM）

**檔案：** `src/components/app/ScenarioSelector.tsx`、`src/components/app/BGMPicker.tsx`、`src/app/(app)/new/page.tsx`

### 16.1 情境快選：自動套用聲音設定

`ScenarioSelector` 顯示 7 張情境卡，每張卡片在 `SCENARIOS` 陣列中對應一個 `Scenario` 物件，其中有一個可選的 `voice` 欄位：

```typescript
voice?: { gender: 'male' | 'female'; preset: string; age: number; pitch: number; timbre: number }
```

使用者點擊情境卡時，`VoiceSetupScreen` 的 `onChange` handler 執行以下動作：

1. 更新 `scenarioId` state 為選取情境的 id。
2. 若 `s.voice` 存在，以 `setState` 一次性覆寫 `appState.voice` 的五個欄位（gender、preset、age、pitch、timbre），讓 GenderSelector、三個 Slider 及 VoicePresets 立即跳到對應數值，視覺上同步更新。
3. 若 `s.bgmDefault` 存在，呼叫 `setBgmTrack(s.bgmDefault)` 預選建議 BGM 曲目。
4. 若 `s.bgmVolume` 存在，呼叫 `setBgmVolume(s.bgmVolume)` 設定建議音量。
5. 「自訂」情境（id: `'custom'`）沒有 `voice` 欄位，因此不覆寫任何聲音設定，讓使用者從目前狀態繼續調整。

選取情境後若使用者手動調整拉桿或更換性別，`preset` 會被設回 `null`（既有的 Slider / VoicePresets 邏輯），情境卡仍維持選取高亮，表示情境是使用者的出發點，不是鎖定設定。

### 16.2 BGMPicker 推薦篩選機制

`BGMPicker` 接受 `recommended?: string[]` prop（由 `SCENARIOS.find(s => s.id === scenarioId)?.bgmRecommended` 傳入）：

- `recommended` 有值時，預設僅顯示 `BGM_TRACKS.filter(b => recommended.includes(b.id))` 的子集，並在每張卡片右下角顯示「推薦」標籤（`chip coral`）。
- 使用者點擊「看全部」按鈕後，`bgmExpanded` state 切換為 `true`，改顯示完整的 9 首曲目。點擊「只看推薦」可收回。
- 選擇「自訂」情境時 `recommended` 為 `undefined`，BGMPicker 直接顯示全部 9 首，不顯示切換按鈕。

### 16.3 BGMVolumeSlider 的 setPointerCapture 拖曳原理

**檔案：** `src/components/app/BGMPicker.tsx`（`BGMVolumeSlider` 函式）

`BGMVolumeSlider` 使用 `setPointerCapture` API 實作拖曳，與 `Slider.tsx` 的 window listener 方式不同：

1. `onPointerDown` 觸發時，呼叫 `ref.current?.setPointerCapture(e.pointerId)`，將後續所有來自該 pointerId 的 `pointermove` / `pointerup` 事件「捕捉」到此元素，即使滑鼠移出元素外也能持續收到事件。
2. `onPointerMove` 收到事件後，以 `isDragging.current`（useRef，非 state，不觸發 re-render）判斷是否正在拖曳，避免未按下時誤觸計算。
3. `onPointerUp` 將 `isDragging.current` 設回 `false`，結束拖曳。
4. 計算邏輯：每次移動取 `ref.current.getBoundingClientRect()` 已在 `onPointerDown` 前快取在 `calcValue` 閉包中，即時以 `(clientX - rect.left) / rect.width * 100` 計算百分比，夾在 0–100 並四捨五入後呼叫 `onChange`。

`setPointerCapture` 相比 window listener 的優點：元件 unmount 後 pointer capture 自動解除，無需手動 cleanup，不會有記憶體洩漏的風險。

### 16.4 BGM 資訊傳遞到 Preview Step

`bgmTrack` 與 `bgmVolume` 是 `NewCanvasPage` 的 local state，以 props 直接傳入 `PreviewScreen`：

```
NewCanvasPage
├── VoiceSetupScreen (Step 0) ← bgmTrack / bgmVolume 讀寫
└── PreviewScreen (Step 2)   ← bgmTrack / bgmVolume 唯讀
```

`PreviewScreen` 在播放器卡片下方以條件渲染顯示 BGM 資訊列：

```typescript
{bgmTrack !== 'none' && (
  // 顯示標籤 + BGM_TRACKS.find(t => t.id === bgmTrack)?.zh/en + bgmVolume%
)}
```

曲目名稱從 `BGM_TRACKS` 陣列以 id 查找，語言跟隨 `useLang().lang`，音量數值以 `%` 格式顯示。

---

## 17. TTS 語音合成 API 機制

**檔案：** `src/app/api/tts/route.ts`

### 17.1 請求格式

前端 POST `/api/tts`，body 包含：

```typescript
{
  script: ScriptNode[];  // text | delay 節點陣列
  voice: { gender, age, pitch, timbre, preset };
  lang: 'zh' | 'en';
}
```

### 17.2 SSML 轉換

`scriptToSsml()` 將 `ScriptNode[]` 轉為 SSML（Speech Synthesis Markup Language）：

- `text` 節點 → 直接插入文字內容。
- `delay` 節點 → 轉為 `<break time="Xs"/>` 標籤。
- 頭尾以 `<speak>...</speak>` 包覆。

### 17.3 聲音參數映射

`mapVoiceParams()` 將前端 0-100 的拉桿數值映射為 Google Cloud TTS 參數：

- `pitch`：0-100 映射為 -10.0 到 +10.0 半音（50 為中心值）。
- `speakingRate`：由 `age` 值計算，0（年輕）= 1.3 倍速，100（年長）= 0.7 倍速。
- 聲音名稱依語言與性別選擇：
  - 中文：`cmn-TW-Standard-A`（女）/ `cmn-TW-Standard-B`（男）
  - 英文：`en-US-Neural2-F`（女）/ `en-US-Neural2-D`（男）

### 17.4 音訊回傳

Google Cloud TTS 回傳 MP3 二進位資料，API 將其轉為 base64 字串回傳前端：

```json
{ "audio": "<base64-encoded-mp3>", "format": "mp3" }
```

前端解碼 base64 → 建立 `Blob` → `URL.createObjectURL()` 產生 Blob URL 供 HTML5 Audio 播放。

---

## 18. 作品庫 CRUD 機制（useLibrary）

**檔案：** `src/hooks/useLibrary.ts`

### 18.1 資料結構

作品儲存在 Firestore 子集合 `users/{uid}/library/{docId}`，每筆文件包含：

```typescript
{
  title: string;        // 作品標題
  voice: string;        // 使用的聲音名稱
  duration: string;     // 音訊時長（如 "1:23"）
  audioUrl: string;     // 音訊檔案 URL
  favorite: boolean;    // 是否收藏
  scenarioId: string;   // 使用的情境 id
  bgmTrack: string;     // 使用的 BGM 曲目 id
  createdAt: Timestamp; // 建立時間（serverTimestamp）
}
```

### 18.2 即時同步（onSnapshot）

`useLibrary(uid)` 在 `useEffect` 中建立 Firestore `onSnapshot` 監聽器，查詢條件為 `orderBy('createdAt', 'desc')`。任何文件變更（新增 / 修改 / 刪除）都會即時觸發回呼，將 snapshot 中的所有文件映射為 `LibraryItem[]` 並更新 state，UI 自動重新渲染。

元件 unmount 時呼叫 `unsubscribe()` 解除監聽。`uid` 變更時會重新建立監聽器。

### 18.3 CRUD 操作

| 操作 | 函式 | Firestore 方法 |
|------|------|----------------|
| 新增作品 | `addItem(item)` | `addDoc(collection(...), { ...item, createdAt: serverTimestamp() })` |
| 切換收藏 | `toggleFavorite(id, current)` | `updateDoc(doc(...), { favorite: !current })` |
| 重新命名 | `renameItem(id, newTitle)` | `updateDoc(doc(...), { title: newTitle })` |
| 刪除作品 | `deleteItem(id)` | `deleteDoc(doc(...))` |

所有寫入操作直接對 Firestore 執行，不手動更新 local state；`onSnapshot` 監聽器會自動接收變更並更新 UI。

---

## 19. 帳號管理機制

**檔案：** `src/app/(app)/account/page.tsx`、`src/contexts/AuthContext.tsx`

### 19.1 個人資料編輯

- 修改姓名：呼叫 Firebase `updateProfile(user, { displayName })` + 更新 Firestore `users/{uid}.name`。
- 上傳頭像：將圖片上傳至 Firebase Storage `avatars/{uid}/` 路徑，取得下載 URL 後更新 Firestore `users/{uid}.avatarUrl`。
- Email 顯示為唯讀（Firebase Auth 不支援直接修改 email）。

### 19.2 安全性設定

- 修改密碼：呼叫 Firebase `updatePassword(user, newPassword)`（需先 reauthenticate）。
- Google 帳號連結：使用 `linkWithPopup(user, GoogleAuthProvider)` 將 Google 帳號綁定至現有帳號，或 `unlink(user, 'google.com')` 解除連結。
- 顯示已連結的登入方式（Email / Google）。

### 19.3 偏好設定持久化

使用者在 Settings 頁修改的偏好（語言、輸出格式、自動儲存、通知）寫入 Firestore `users/{uid}.preferences`，下次登入時從 Firestore 讀取還原。

### 19.4 刪除帳號

danger zone 的刪除帳號功能：先 reauthenticate，再依序刪除 Firestore 使用者文件、Firebase Storage 中的使用者檔案、最後呼叫 `user.delete()` 刪除 Firebase Auth 帳號。

---

## 20. 使用量追蹤機制

**檔案：** `src/app/(app)/new/page.tsx`、`src/contexts/AuthContext.tsx`

### 20.1 追蹤時機

每次 TTS 渲染完成後（`/api/tts` 回傳音訊），前端更新 Firestore `users/{uid}.usage`：

- `rendered`：累加本次音訊的秒數（Firestore 以秒為單位儲存）。
- `takes`：累加 1。

### 20.2 顯示

`AuthContext` 的 `buildAppUser()` 在讀取 Firestore 時將秒數轉為分鐘數（`Math.round(rendered / 60)`），Account 頁面直接顯示 `usage.rendered / usage.total` 分鐘數與進度條。

### 20.3 方案配額

| 方案 | `usage.total`（秒） | 等於 |
|------|---------------------|------|
| Free | 1,800 | 30 分鐘 |
| Pro | 14,400 | 240 分鐘 |

方案升級時由 Lemon Squeezy Webhook 自動更新配額（見第 21 節）。

---

## 21. 付款機制（Lemon Squeezy）

**檔案：** `src/app/api/checkout/route.ts`、`src/app/api/webhooks/lemonsqueezy/route.ts`

### 21.1 結帳流程

1. 使用者在 Pricing 頁或 Settings 頁點擊「升級 Pro」。
2. 前端 POST `/api/checkout`，body 帶 `{ userId, userEmail }`。
3. API 以 `LEMONSQUEEZY_API_KEY` 向 Lemon Squeezy REST API 建立 Checkout Session，將 `userId` 存入 `custom_data` 以便 Webhook 識別。
4. Lemon Squeezy 回傳結帳頁面 URL，前端將使用者導向該 URL 完成付款。

### 21.2 Webhook 事件處理

Lemon Squeezy 付款事件透過 POST `/api/webhooks/lemonsqueezy` 送達：

**簽章驗證**：每筆 Webhook 請求的 `x-signature` header 以 HMAC-SHA256 驗證（secret 為 `LEMONSQUEEZY_WEBHOOK_SECRET`），使用 `crypto.timingSafeEqual` 防止 timing attack。

**事件類型處理**：

| 事件 | 動作 |
|------|------|
| `subscription_created` / `subscription_resumed` | 將 Firestore `users/{userId}.plan` 更新為 `'pro'`，`usage.total` 設為 14400 秒 |
| `subscription_cancelled` / `subscription_expired` | 將 plan 降為 `'free'`，`usage.total` 設為 1800 秒 |
| `subscription_updated` | 預留擴充（方案變更處理） |

Webhook 使用 Firebase Admin SDK（`adminDb`）直接寫入 Firestore，不經過 Client SDK 的安全規則。

---

## 22. 安全規則

### 22.1 Firestore 安全規則

**檔案：** `firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }   // 預設拒絕
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /library/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

- 預設全部拒絕。
- 使用者只能讀寫自己的 `users/{uid}` 文件及其 `library` 子集合。
- 未登入（`request.auth == null`）或存取他人資料（`auth.uid != uid`）一律拒絕。
- Webhook API Route 使用 Admin SDK 繞過安全規則。

### 22.2 Storage 安全規則

**檔案：** `storage.rules`

| 路徑 | 讀取 | 寫入 | 限制 |
|------|------|------|------|
| `audio/{uid}/**` | 僅 owner | 僅 owner | 無額外限制 |
| `avatars/{uid}/**` | 僅 owner | 僅 owner | 檔案 < 5MB，content type 須為 `image/*` |
| `bgm/**` | 公開（無需登入） | 禁止 | BGM 素材為公用資源 |
| 其他路徑 | 禁止 | 禁止 | 預設拒絕 |
