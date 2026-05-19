# VocalCanvas Changelog

---

## 2026-05-19

### 23:30 — v1.0.1 Email 驗證補完 + Email 模板文案

- **更新內容**：
  補完 Email 驗證機制的前端檢查邏輯，並新增 Firebase Auth 系統信件的中英雙版文案設計。

  **Account 頁 Email 驗證狀態**
  Account 頁面（`/account`）的個人資料區塊改為動態讀取 `user.emailVerified` 狀態。未驗證時，Email 旁顯示紅色「未驗證」標籤，並出現「重寄驗證信」按鈕，點擊後呼叫 Firebase `sendEmailVerification` 重新發送驗證信。已驗證時不顯示額外提示。

  **TTS 產出前強制驗證檢查**
  Script Editor（Step 1）的「產出音檔」按鈕新增 `emailVerified` 前置檢查。未完成 Email 驗證的使用者無法產出音檔，系統會顯示提示訊息引導使用者先完成驗證。

  **聲音試聽前強制驗證檢查**
  Voices 頁面（`/voices`）的試聽按鈕同樣新增 `emailVerified` 前置檢查。未驗證的使用者無法試聽聲音，需先完成 Email 驗證。

  **Firebase Auth Email 模板文案**
  完成三封 Firebase Authentication 系統信件的文案設計：Email 驗證信、忘記密碼信、Email 變更確認信。每封信皆有中文與英文兩個版本，語氣溫暖親切，符合品牌調性。文案存放於 `docs/features/firebase-integration/email-templates.md`，需手動貼入 Firebase Console > Authentication > Templates 進行設定。

- **更新檔案**：
  `src/app/(app)/account/page.tsx`、`src/app/(app)/new/page.tsx`、`src/app/(app)/voices/page.tsx`、`docs/features/firebase-integration/email-templates.md`

- **Git 紀錄**：`（待 commit）`

---

### 22:00 — v1.0.0 Firebase 全面整合（Phase 1-7）

- **更新內容**：
  VocalCanvas 從純前端展示升級為功能完整的全端應用程式，整合 Firebase 生態系與 Google Cloud 服務，涵蓋身份驗證、資料庫、檔案儲存、語音合成與付款系統。以下按階段說明：

  **Phase 1：Firebase Auth 身份驗證**
  以 Firebase Auth 取代原有的模擬身份驗證（Mock Auth），支援 Email/Password 登入、Google OAuth 登入、新用戶註冊（含發送驗證信）、忘記密碼（Firebase `sendPasswordResetEmail`）。新增三態認證模型（`loading` / `authenticated` / `unauthenticated`），解決初始化期間 Auth Guard 誤跳轉的閃爍問題。首次登入時自動在 Firestore `users/{uid}` 建立使用者文件，包含 name、email、plan、preferences、usage 等欄位。支援「保持登入」切換（`browserLocalPersistence` / `browserSessionPersistence`）。

  **Phase 2：作品庫 CRUD（Library）**
  新增 `src/hooks/useLibrary.ts`，以 Firestore 子集合 `users/{uid}/library` 儲存作品，透過 `onSnapshot` 即時監聽實現 real-time 同步。提供 `addItem`、`toggleFavorite`、`renameItem`、`deleteItem` 四個 CRUD 操作，所有寫入直接對 Firestore 執行，UI 透過 snapshot listener 自動更新，不需手動管理 local state。Library 頁面改用 `useLibrary` hook 取代原先從 AuthContext 讀取的靜態資料。

  **Phase 3：TTS 語音合成核心**
  新增 `/api/tts` API Route，整合 Google Cloud Text-to-Speech。前端將 ScriptNode 陣列、聲音參數與語言送至 API，API 將 script 轉為 SSML（`<speak>` + `<break>` 標籤），將前端 0-100 拉桿值映射為 Google TTS 的 pitch（半音）與 speakingRate，依語言與性別選擇對應的聲音模型（中文 Standard / 英文 Neural2）。回傳 base64 編碼的 MP3 音訊。

  **Phase 4：真實音訊播放器**
  以 HTML5 `Audio` 物件取代原先的 setInterval 模擬播放。支援真實的播放/暫停、快進/快退（調整 `currentTime`）、變速播放（`playbackRate`：0.5x 到 2x）、下載音訊檔案。進度條透過 `ontimeupdate` 事件即時更新。

  **Phase 5：帳號管理**
  Account 頁面實作完整的個人資料管理：修改姓名（Firebase Auth `updateProfile` + Firestore 同步）、上傳頭像（Firebase Storage `avatars/{uid}/`）、修改密碼（`updatePassword`）、Google 帳號連結/解除連結（`linkWithPopup` / `unlink`）。偏好設定（語言、輸出格式、通知）持久化至 Firestore `users/{uid}.preferences`。提供帳號刪除功能（含 Firestore 文件、Storage 檔案、Auth 帳號完整清除）。

  **Phase 6：使用量追蹤與聲音預覽**
  每次 TTS 渲染完成後，自動累加 Firestore `usage.rendered`（秒數）與 `usage.takes`（次數），Account 頁面顯示已使用分鐘數 / 方案上限的進度條。Voices 頁面的試聽按鈕改為呼叫 TTS API 產生真實語音片段。

  **Phase 7：Lemon Squeezy 付款整合**
  新增 `/api/checkout` API Route，以 Lemon Squeezy REST API 建立 Checkout Session（帶 `custom_data.user_id`），回傳結帳頁面 URL。新增 `/api/webhooks/lemonsqueezy` Webhook 接收端，以 HMAC-SHA256 驗證簽章（`crypto.timingSafeEqual` 防止 timing attack），處理 `subscription_created`、`subscription_resumed`（升級 Pro，配額 240 分鐘）、`subscription_cancelled`、`subscription_expired`（降級 Free，配額 30 分鐘）等事件，透過 Firebase Admin SDK 直接更新 Firestore。

  **基礎設施**
  新增 `src/lib/firebase.ts`（Client SDK 初始化：auth / db / storage）與 `src/lib/firebase-admin.ts`（Admin SDK 初始化：adminAuth / adminDb / adminStorage）。新增 `firestore.rules`（owner-only 讀寫，預設拒絕）、`storage.rules`（音訊與頭像 owner-only，頭像限 5MB 圖片，BGM 公開讀取）、`firebase.json`（Firebase CLI 設定）。環境變數新增 `NEXT_PUBLIC_FIREBASE_*`（6 個）、`GOOGLE_APPLICATION_CREDENTIALS`、`GOOGLE_CLOUD_PROJECT_ID`、`LEMONSQUEEZY_API_KEY`、`LEMONSQUEEZY_STORE_ID`、`LEMONSQUEEZY_PRO_VARIANT_ID`、`LEMONSQUEEZY_WEBHOOK_SECRET`。

- **更新檔案**：
  `src/lib/firebase.ts`、`src/lib/firebase-admin.ts`、`src/contexts/AuthContext.tsx`、`src/hooks/useLibrary.ts`、`src/app/api/tts/route.ts`、`src/app/api/checkout/route.ts`、`src/app/api/webhooks/lemonsqueezy/route.ts`、`src/app/(marketing)/login/page.tsx`、`src/app/(marketing)/signup/page.tsx`、`src/app/(marketing)/forgot/page.tsx`、`src/app/(app)/layout.tsx`、`src/app/(app)/library/page.tsx`、`src/app/(app)/new/page.tsx`、`src/app/(app)/voices/page.tsx`、`src/app/(app)/settings/page.tsx`、`src/app/(app)/account/page.tsx`、`src/components/app/AppShell.tsx`、`firestore.rules`、`storage.rules`、`firebase.json`、`package.json`

- **Git 紀錄**：`a799067`

---

### 16:30 — v0.4.0 新增：情境快選（Scenarios）+ 背景音樂（BGM）

- **更新內容**：
  為 New Canvas Wizard 的 Voice Setup 步驟加入兩大全新功能模組，讓使用者能一鍵套用預設情境設定，並為語音加上背景音樂。

  **情境模式（ScenarioSelector）**
  新增 `src/components/app/ScenarioSelector.tsx`，提供 7 張情境卡：自訂、冥想、睡前故事、正念肯定語、Podcast 開場、廣告、有聲書。每張卡片帶有漸層背景色（例如冥想為青綠到紫、有聲書為深墨色）、行內 SVG 圖標（ScIcon primitive）與中英雙語描述。使用者點擊任一情境卡後，系統自動將 `voice`（gender / preset / age / pitch / timbre）與 BGM（bgmDefault / bgmVolume）一次套用到 Wizard 的 AppState，省去手動調整每項參數的步驟。自訂（custom）情境無聲音預設，讓使用者從空白狀態開始。

  **背景音樂（BGMPicker + BGMVolumeSlider）**
  新增 `src/components/app/BGMPicker.tsx`，提供 9 首 BGM 曲目供選擇：純朗讀（無音樂）、海浪、森林、頌缽、雨聲、輕鋼琴、環境音、動感節拍、電影感。每首曲目以圖卡方式呈現，顯示圖標、名稱、描述與循環時長。選擇情境後，BGMPicker 預設僅顯示該情境推薦的曲目子集，使用者可點擊「看全部」展開完整清單。選取非「純朗讀」的曲目後，下方出現 BGMVolumeSlider 音量拉桿，支援 setPointerCapture 拖曳（見機制文件）。

  **Preview Step 顯示 BGM 資訊**
  PreviewScreen（Step 2）在播放器卡片下方新增 BGM 資訊列，顯示目前選用的背景音樂名稱與音量百分比；若選擇「純朗讀」則不顯示此列。

  **行銷頁 Scenarios 區塊**
  廣告頁（`src/app/(marketing)/page.tsx`）新增 Scenarios section，展示 6 張漸層情境卡，與 App 內的卡片設計一致，讓訪客在登入前就能預覽各情境的視覺風格。Nav、Hero、Footer 同步微調。

  **樣式新增與 Bug 修正**
  `marketing.css` 新增 `.scenarios-grid` / `.scenario-card` 等行銷頁情境卡樣式及 RWD 斷點（1024px / 768px）。
  `app.css` 新增 `.scenario-strip` 基礎樣式與 RWD 斷點（1200 / 768 / 480px），BGM volume slider RWD（600px）。
  同批修正 3 個 blocking bug：mobile sidebar specificity 問題、collapsed profile-row 顯示錯誤、以及相關 CSS 特異性衝突。

  **TypeScript 建置狀態**：0 錯誤。

- **更新檔案**：
  `src/components/app/ScenarioSelector.tsx`、`src/components/app/BGMPicker.tsx`、`src/app/(app)/new/page.tsx`、`src/app/(marketing)/page.tsx`、`src/styles/marketing.css`、`src/styles/app.css`

- **Git 紀錄**：`（待 commit）`

---

### 15:00 — v0.3.1 新增：PWA Manifest 與 Favicon 支援

- **更新內容**：
  為 VocalCanvas 加入完整的 PWA（Progressive Web App）安裝支援與跨平台 Favicon 設定，讓使用者可以將網站加入手機主畫面並以獨立應用程式視窗執行。

  **Web App Manifest（`public/manifest.json`）**
  新增 Web App Manifest 設定檔，宣告應用名稱（VocalCanvas）、主題色（#FF5A3C，對應品牌 Coral 色）、啟動背景色（#FFFCF7，對應 Cream 底色）、顯示模式（standalone 獨立視窗，不顯示瀏覽器列）及 SVG 格式的安裝圖示，瀏覽器讀取此檔後即可提示使用者安裝至桌面或主畫面。

  **PWA 圖示（`public/icon.svg`）**
  新增 `public/icon.svg`，內容與既有的 `public/assets/logo-mark.svg` 相同。SVG 格式可自由縮放，無需準備多種解析度的點陣圖，統一作為 PWA 安裝圖示、Apple Touch Icon 及標準 favicon 的來源。

  **Root Layout Metadata 擴充（`src/app/layout.tsx`）**
  透過 Next.js `metadata` 靜態匯出物件新增四項設定：
  - `manifest: '/manifest.json'` — 注入 `<link rel="manifest">` 讓瀏覽器識別 PWA。
  - `icons.icon: '/icon.svg'` — 標準 favicon，顯示於瀏覽器分頁標題列。
  - `icons.apple: '/icon.svg'` — Apple Touch Icon，iOS 儲存捷徑至主畫面時使用。
  - `appleWebApp.capable: true` — 注入 `mobile-web-app-capable` meta，告知 iOS Safari 支援 Web App 模式。

- **更新檔案**：
  `public/manifest.json`、`public/icon.svg`、`src/app/layout.tsx`

- **Git 紀錄**：`（待 commit）`

---

### 14:00 — v0.3.0 新增：模擬身份驗證系統（Mock Auth）

- **更新內容**：
  實作完整的前端模擬登入系統，讓應用程式具備帳號身份識別能力，所有用戶相關頁面改為動態顯示當前登入者的真實資料。

  **AuthContext（身份驗證 Context）**
  新增 `src/contexts/AuthContext.tsx`，提供全域身份驗證狀態管理。內建兩組測試帳號：`demo@vocalcanvas.com`（含完整示範資料：5 筆作品庫、使用量統計）與 `empty@vocalcanvas.com`（空白狀態）。登入狀態以 `sessionStorage` 保存，重新整理頁面後保持登入，關閉分頁後自動清除。對外暴露 `useAuth()` hook，提供 `user`、`login()`、`logout()` 三個介面。

  **AuthProviderWrapper（Server 端相容包裝器）**
  新增 `src/components/AuthProviderWrapper.tsx`，作為「Client Component 薄殼」，讓 Server Component（`src/app/layout.tsx`）能在 layout 層套上 `AuthProvider`，解決 Next.js App Router 的 Server/Client Component 混用限制。

  **Root Layout 整合**
  `src/app/layout.tsx` 在 `children` 外層包上 `<AuthProviderWrapper>`，使所有頁面（行銷區與 App 區）都能存取 Auth 狀態。

  **App Layout 身份驗證守衛（Auth Guard）**
  `src/app/(app)/layout.tsx` 加入登入狀態檢查：若使用者未登入（`user === null`），自動重新導向至 `/login`，防止未授權存取 App 工作區任何頁面。

  **登入頁表單串接**
  `src/app/(marketing)/login/page.tsx` 的 Email/Password 表單呼叫 `AuthContext.login()`，登入成功後自動跳轉至 `/library`；憑證不符時顯示中英雙語錯誤訊息（`「帳號或密碼錯誤」/ "Invalid email or password"`）。

  **Library 頁動態資料**
  `src/app/(app)/library/page.tsx` 改為從 `AuthContext.user` 取得作品庫清單，`demo` 帳號顯示 5 筆作品，`empty` 帳號顯示「作品庫空白」的空態引導畫面。

  **Account 頁動態資料**
  `src/app/(app)/account/page.tsx` 改為從 `AuthContext.user` 取得姓名、Email、頭像、使用量數據，頁面內容隨當前登入帳號即時變化。

  **AppShell Profile Row 與登出**
  `src/components/app/AppShell.tsx` 的側欄底部 Profile Row 改為顯示 `AuthContext.user` 的頭像、姓名、方案標籤；登出按鈕呼叫 `logout()` 並重新導向至 `/login`。

- **更新檔案**：
  `src/contexts/AuthContext.tsx`、`src/components/AuthProviderWrapper.tsx`、`src/app/layout.tsx`、`src/app/(app)/layout.tsx`、`src/app/(marketing)/login/page.tsx`、`src/app/(app)/library/page.tsx`、`src/app/(app)/account/page.tsx`、`src/components/app/AppShell.tsx`

- **Git 紀錄**：`（待 commit）`

---

### 10:00 — v0.2.1 修復：404 頁 wave 高度單位補齊，確認全站乾淨建置

- **更新內容**：
  修正 `not-found.tsx`（404 錯誤頁）的 wave 波形棒高度計算，補上明確的 `'px'` 單位（`height: h + 'px'`），與 `signup/page.tsx` 的寫法一致。這個問題在部分瀏覽器中會導致波形棒高度被忽略、顯示為 0。
  全站建置驗證通過：11 條路由（含 `/_not-found`）全部靜態產生，TypeScript 無錯誤，無任何 warning。

- **更新檔案**：`src/app/not-found.tsx`

- **Git 紀錄**：`（待 commit）`

---

## [0.2.0] — 2026-05-19

### Added
- **註冊頁** (`/signup`) — 兩欄 layout，Google/LINE OAuth，Email/密碼表單，wave 動畫，語言切換
- **忘記密碼頁** (`/forgot`) — Email 輸入表單 + success state（信件已寄出畫面 + 重新寄送功能）
- **404 頁** (`/not-found`) — 404 gradient text，err-wave 動畫，快速連結
- **Settings 頁** (`/settings`) — 帳號/偏好/通知/說明四 card，Toggle 元件，danger zone
- **Account 頁** (`/account`) — 個人資料編輯，安全性設定（密碼/2FA/已連結帳號），使用量統計
- **Onboarding Modal** — 4 步驟引導，左側插圖（hero/voice/script/render），dot indicator

### Changed
- AppShell profile-row 頭像改為可點擊，導向 `/account`
- Crumb 格式還原為 demo 規範：當前頁用 `<b>`，parent 用普通文字
- Rendering overlay 提升至 AppShell `.main` 層（覆蓋 topbar）
- Settings「看引導教學」觸發 OnboardingModal
- LangContext 加入 `rendering` / `setRendering` 全域狀態

### Fixed
- Settings「管理」按鈕改為 `<button>` 符合 WCAG 語意
- `@keyframes heroWave` 移至 app.css，移除 OnboardingModal inline `<style>`
- Signup / OnboardingModal wave span height 補 `'px'` 單位

---

## [0.1.1] — 2026-05-19 (patch)

### Fixed
- **Slider touch 相容性**：Slider 元件加入 touch-event 相容判斷，確保 mobile 拖拽正常
- **Library 播放按鈕路由**：play button 語意修正，加上 preview 語意（`/new?play=true`）
- **TopBar crumb 樣式**：移除非必要的 `<b>` wrapper，符合設計稿純文字 crumb 規範
- **hero-wave height 格式**：明確帶 `px` 單位避免隱性轉換
- **marketing.css import 順序**：確認 design-tokens 在最頂部正確 import
- **VoicesPage filter 語意**：gender filter 按鈕組加入 `data-purpose="filter"` attribute

---

## 2026-05-19

### 00:00 — 初始前端實作：完成廣告頁、登入頁與 App 工作區 UI

- **更新內容**：
  VocalCanvas 完成第一次有意義的前端實作，建立完整的前端頁面架構與 UI 元件系統。

  **專案基礎架構**
  - 以 Next.js 16.2.6 + TypeScript + React 19 搭建專案骨架。
  - 使用 Next.js App Router 的 Route Groups 將路由分為 `(marketing)` 行銷區與 `(app)` 工作區兩個獨立群組，各自套用不同 Layout 與 CSS。
  - 透過 `next/font/google` 在伺服器端載入 Sora、Manrope、JetBrains Mono、Noto Sans TC 四款字型，以 CSS 變數注入全站。

  **設計系統（Design Tokens）**
  - 建立 `design-tokens.css`，定義完整的設計基礎變數：Coral / Mint / Violet / Ink / Cream 色票、簽名漸層（`--grad-sunset`、`--grad-canvas`、`--grad-aurora`）、陰影、圓角、字型、間距、動效曲線。
  - 行銷樣式（`marketing.css`）與 App 樣式（`app.css`）都以這份 token 為基礎，不直接寫死色值。

  **廣告頁（Landing Page，`/`）**
  - Sticky Nav：scroll 後顯示底線，右上角語言切換（local state）。
  - Hero：左側文案 + 右側模擬播放器 stage card，Hero Wave 動畫（32 棒，sin 函數預算高度）。
  - Features：三格卡片（男/女聲預設、百分比拉桿、停頓標籤）。
  - How It Works：四步驟卡片，虛線連接線。
  - Voices Teaser：四款聲音卡片（晨光 Dawn、夜霧 Mist、焰心 Ember、清玻 Glass）帶 mini-wave。
  - Use Cases：2×2 使用情境卡片（Podcast、行銷、教育、個人）。
  - Pricing：Free + Pro 方案卡片。
  - Final CTA + Footer（四欄 footer grid）。
  - 全頁雙語支援（中文 / English），語言狀態以 local useState 管理。

  **登入頁（Login Page，`/login`）**
  - 左側品牌欄：Logo、Tagline、Login Wave 動畫（22 棒）、使用者見證引言。
  - 右側表單：Google / LINE / Apple OAuth 按鈕、Email + Password 表單、保持登入 checkbox、忘記密碼連結。
  - 語言切換同步更新 `document.title` 與 `document.documentElement.lang`。

  **App Shell（Sidebar + TopBar）**
  - Sidebar（280px）：Logo、新作品 CTA 按鈕（漸層背景）、導覽 items（Library / Voices / Settings）、Recent 捷徑、用戶 Profile Row。
  - 收合功能：點擊 collapse button 切換 76px icon-only 模式（CSS grid 過渡動畫）。
  - Mobile Drawer：768px 以下 Sidebar 改為 fixed position 從左滑入，半透明遮罩點擊可關閉。
  - TopBar：左側 breadcrumb（路徑對應中英文名稱）、右側語言切換（透過 LangContext 全站同步）。

  **語言切換系統（LangContext）**
  - `src/contexts/LangContext.tsx`：提供 `LangProvider` 與 `useLang()` hook。
  - App 區所有頁面共享同一個語言狀態，TopBar 切換後即時更新所有子頁面。

  **Library 頁（`/library`）**
  - 作品清單（5 筆示範資料）：每筆顯示波形縮圖、標題、聲音名稱、時長、音質、時間。
  - 收藏切換（`favorites: Set<string>` state，心型圖示填充/空心切換）。
  - 下載、更多選項 icon buttons。

  **New Canvas Wizard（`/new`）**
  - 三步驟 Wizard（Step 指示器：Voice / Script / Render）。
  - Step 0 Voice Setup：GenderSelector（男/女聲卡片）、三個 Slider（Age / Pitch / Timbre）、VoicePresets（4 款預設）、試聽片段 placeholder。選 Preset 自動帶入 PRESET_TUNING 數值。
  - Step 1 Script Editor：contentEditable text 節點 + delay tag 節點混排、delay tag 單擊編輯 / 雙擊刪除、插入停頓按鈕、輸出設定 card（格式 / 語言）、預估時長計算（字元數 × 0.15s + 停頓秒數）、rendering overlay（pulseWave 動畫，模擬 2.4 秒處理時間）。
  - Step 2 Preview：studio-stage 播放器（深色漸層卡片）、80 棒波形（已播 Coral 色，未播半透明）、播放 / 暫停 / 快進 / 快退、速度 pills（0.5× 到 2×）、三個動作卡片（收藏 / 儲存 / 下載）。

  **Voices 頁（`/voices`）**
  - 6 款聲音 3 欄卡片：晨光、夜霧、焰心、清玻、墨色、花瓣。
  - 性別篩選 pills（全部 / 女聲 / 男聲）。
  - 試聽按鈕 + 用這個聲音按鈕（導向 /new）。

  **設計資產**
  - `public/assets/` 下的 `logo-mark.svg`、`logo-wordmark.svg`、`logo-mark-mono.svg`。

- **更新檔案**：
  `package.json`、`src/app/layout.tsx`、`src/app/(marketing)/page.tsx`、`src/app/(marketing)/login/page.tsx`、`src/app/(app)/layout.tsx`、`src/app/(app)/library/page.tsx`、`src/app/(app)/new/page.tsx`、`src/app/(app)/voices/page.tsx`、`src/components/app/AppShell.tsx`、`src/components/ui/Slider.tsx`、`src/components/ui/GenderSelector.tsx`、`src/components/ui/VoicePresets.tsx`、`src/components/ui/Steps.tsx`、`src/components/ui/Icons.tsx`、`src/components/ui/Button.tsx`、`src/contexts/LangContext.tsx`、`src/styles/design-tokens.css`、`src/styles/globals.css`、`src/styles/marketing.css`、`src/styles/app.css`、`public/assets/logo-mark.svg`、`public/assets/logo-wordmark.svg`、`public/assets/logo-mark-mono.svg`

- **Git 紀錄**：`77cd44c`
