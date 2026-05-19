# Code Review — v2 新增頁面審查報告

審查者：Code Reviewer  
審查日期：2026-05-19  
功能代號：v2-new-screens  
Ground truth：`.claude/skills/vocalcanvas-screens-v2/_diff-v2-new-screens/ui_kits/`

---

## 審查範圍

| 實作檔案 | 對應設計稿 |
|---------|-----------|
| `src/app/(app)/settings/page.tsx` | `vocalcanvas-app/components/SettingsScreen.jsx` |
| `src/app/(app)/account/page.tsx` | `vocalcanvas-app/components/AccountScreen.jsx` |
| `src/components/app/OnboardingModal.tsx` | `vocalcanvas-app/components/OnboardingScreen.jsx` + `index.html` |
| `src/app/(marketing)/signup/page.tsx` | `vocalcanvas-marketing/signup.html` |
| `src/app/(marketing)/forgot/page.tsx` | `vocalcanvas-marketing/forgot.html` |
| `src/app/not-found.tsx` | `vocalcanvas-marketing/404.html` |
| `src/styles/app.css`（新增部分） | `SettingsScreen.jsx`（inline style 抽離）|
| `src/styles/marketing.css`（新增部分） | `forgot.html`（card-form 等）|

---

## 通過項目

- **SettingsScreen DOM 結構**：2×2 grid card 排列（Account、Preferences、Notifications、Help）+ Danger zone + 版本碼，與設計稿完全一致。
- **SettingsRow 元件**：`settings-row` / `settings-row-label` / `settings-row-label.danger` / `settings-row-sub` CSS class 均已定義，欄位對齊與 border-bottom 邏輯正確；最後一列 `border-bottom: none` 透過 `settings-row:last-child` 實作。
- **Toggle 元件**：`toggle-btn` / `toggle-thumb` CSS 定義完整；動態 background（coral-500/cream-300）與 `left: value ? 21 : 3` thumb 位置切換均正確；過渡動畫 `240ms var(--ease-out)` 與設計稿一致。
- **Settings 靜態資料完整性**：3 個 Toggle 初始值（autoSave=true、emailNotif=true、productNews=false）；訂閱資訊「240 分鐘可用 · 下次扣款 6/19」；Select 三個 option（中文繁體、English US、日本語）；鍵盤快速鍵 `⌘ + /`——全部與設計稿一致。
- **Settings → Onboarding 路由**：設計稿用 `goTo("onboarding")`，實作改用 `setShowOnboarding(true)` 本地 state + `<OnboardingModal>`，功能等效且更符合 Next.js 架構。
- **Settings → Account 連結**：設計稿用 `goTo("account")`，實作用 `<Link href="/account">`，正確。
- **AccountScreen DOM 結構**：Profile / Security（密碼、2FA、Linked accounts）/ Usage 三 card，Usage 跨欄 `gridColumn: '1 / -1'`，與設計稿完全一致。
- **Account 靜態資料**：Usage 統計數字（360/600 min、23 takes、1.4 GB）、進度條 60% width、Google 已連結（frank@gmail.com）、LINE 尚未連結——均與設計稿吻合。
- **Account 返回按鈕**：設計稿用 `goTo("settings")`，實作用 `router.push('/settings')`，功能等效。
- **OnboardingModal 步驟資料**：4 個 STEPS 的 eyebrow/title/sub/illust 中英文文案與設計稿 `ONBOARDING_STEPS` 完全一致。
- **Dot indicator 動畫**：active dot width=28、inactive=8；background coral-500/cream-300；`transition: all 240ms var(--ease-out)`——與設計稿完全一致。
- **Onboarding 導覽邏輯**：Back（idx>0 才顯示）、Next（非最後一步）、Start creating（最後一步 btn-render）——邏輯與設計稿完全一致。
- **Onboarding 4 個插圖元件**：Hero wave（16 根，高度陣列一致）、Voice grid（4 張卡 + slider）、Script（tag-delay class）、Render（40 根 waveform）——均與設計稿完全一致。
- **IllustHero heroWave keyframe**：`OnboardingModal.tsx` 在 component 內嵌 `<style>` 定義 `@keyframes heroWave`，解決了 app.css 沒有此 keyframe 的問題。
- **Signup DOM 結構**：login-page 兩欄（login-brand + login-form-inner），OAuth 兩個按鈕、divider、表單三欄（name/email/password）、checkbox-row、signup-row——與設計稿完全一致。
- **Signup wave**：22 根，高度由相同 sin 公式生成（`30 + sin(i*0.4)*22 + sin(i*0.2)*14`）；animation-delay stagger `i*0.07s`——與設計稿一致。
- **Signup 語言切換**：isZh state 控制所有文案，並同步更新 `document.title` 與 `html[lang]`——設計稿只有靜態中文，實作補充了完整多語，是正向差異。
- **Forgot success state**：submit 觸發 `setFormState('success')`；顯示用戶輸入的 email；「重新寄送」點擊後顯示「已重新寄送」並停用——功能邏輯與設計稿 `showSuccess()` / `resend()` 一致，且 React 版做法更安全（無 innerHTML 操作）。
- **Forgot CSS class 完整性**：`.center-page` / `.card-form` / `.success-state` / `.ico-circle` / `.resend-row` / `.back-link` 均已在 marketing.css 定義，且值與設計稿 inline style 一致。
- **404 DOM 結構**：error-page → error-content → err-logo / err-404 / err-wave / err-headline / err-sub / err-ctas / err-links，與設計稿完全一致。
- **404 wave**：28 根，高度公式相同（`20 + sin(i*0.45)*18 + sin(i*0.2)*10`）；animation-delay stagger `i*0.06s`；`mounted` state 防止 SSR hydration mismatch——設計稿沒有此保護，實作反而更好。
- **404 err-links**：功能介紹 / 聲音庫 / 方案 / 登入四個快速連結，與設計稿一致。
- **CSS @keyframes heroWave**：marketing.css 第 104 行已定義，供 signup wave、login wave、err-wave 及 not-found.tsx 使用。
- **not-found.tsx CSS 引入**：自行 `import '@/styles/marketing.css'`，確保在 root route（非 marketing group layout）下也能正確套用所有 404 樣式。

---

## 問題清單

| # | 嚴重度 | 位置 | 設計稿期望 | 實作現況 |
|---|--------|------|-----------|---------|
| 1 | **HIGH** | `src/app/(app)/settings/page.tsx` L80 | `<button className="btn btn-ghost btn-sm" onClick={() => goTo("account")}>管理</button>`（button 元素） | 使用 `<Link href="/account" className="btn btn-ghost btn-sm">`。`Link` 渲染為 `<a>` 而非 `<button>`，語意不符無障礙規範（`role` 應為 button 的地方變成 link）。 |
| 2 | **MEDIUM** | `src/styles/app.css` 無此定義 | OnboardingModal 設計稿（`index.html`）在 `app.css` 中依賴 `@keyframes heroWave`（`IllustHero` 用到） | app.css 沒有 `@keyframes heroWave`；實作在 OnboardingModal 組件內嵌 `<style>` 解決，但此方式每次 modal 開啟都會插入 `<style>` tag 到 DOM，在 React strict mode 下可能重複；建議將 `@keyframes heroWave` 移至 app.css。 |
| 3 | **MEDIUM** | `src/app/(marketing)/signup/page.tsx` L104 | 設計稿 `signup.html` 的語言切換按鈕使用 `className="active"` 靜態 HTML，切換邏輯以 JS 操作 classList | 實作為 React controlled state（`isZh`），邏輯正確，但語言切換的文案分支只分 `isZh` 兩路，**品牌左欄文案（h2、b-sub、bullets、copyright）並不隨 `isZh` 切換**，設計稿是純中文靜態稿（沒有英文版），但若 App 已有多語需求，右欄切到英文後左欄仍顯示中文會不一致。 |
| 4 | **MEDIUM** | `src/app/(marketing)/forgot/page.tsx` L39 | 設計稿 `forgot.html` 第 74 行：`<h1>信件已寄出 ✉︎</h1>`（無裝飾文字） | 實作 L39：`<h1>信件已寄出 ✉︎</h1>`——文案相同，無問題。但 success-state 中「回到登入」用的是 `<Link>` 帶 `className="btn btn-primary submit-btn"` 加 `style={{ background: 'var(--ink-800)' }}`；設計稿是 `<a href="login.html" class="btn btn-primary submit-btn" style="background: var(--ink-800);">`。兩者外觀相同，但 `--ink-800` 已是 `btn-primary` 在 **app.css** 裡的 `background`；marketing.css 的 `.btn-primary` 設定為 `background: var(--ink-800)`，所以這個 inline style 是冗餘的（雖無害）。此問題嚴重度低，記錄供清理參考。 |
| 5 | **LOW** | `src/app/not-found.tsx` L4 | 設計稿 `404.html` 沒有任何 JS 框架，body 背景由 `<style>body { background: var(--bg); }` 控制 | 實作沒有 `body { background }` 設定，依賴 `globals.css` 的全局樣式（L34）。此路徑依賴隱含，若 globals.css 被更動可能失效。建議在 marketing.css 或 not-found 的 `.error-page` 加上明確背景，或確認 globals.css 永遠在 not-found 之前載入。 |
| 6 | **LOW** | `src/components/app/OnboardingModal.tsx` L62-75 | 設計稿 `OnboardingScreen.jsx` 的 hero wave spans：`height: h + "px"` 傳入字串 | 實作傳入純 number（`height: h`）。React style prop 接受 number 並自動加 `px`，功能正常，但違反「明確標注單位」的 coding convention。 |
| 7 | **LOW** | `src/app/(marketing)/signup/page.tsx` L42-49 | 設計稿 signup wave spans：`height: ${h}px`（字串） | 實作傳入純 number `height: h`，同問題 #6，React 自動補 px，功能無誤但不符慣例。 |
| 8 | **LOW** | `src/app/(marketing)/forgot/page.tsx` L46 | `<Link href="/login" className="btn btn-primary submit-btn" style={{ background: 'var(--ink-800)' }}>` | marketing.css `.btn-primary` 已設定 `background: var(--ink-800)`，inline style 重複設定相同值，是冗餘程式碼，應移除 inline style。 |

---

## 詳細說明

### 問題 #1（HIGH）— Settings「管理」按鈕語意錯誤

`/workspaces/VocalCanvas/src/app/(app)/settings/page.tsx` 第 80 行使用 `<Link>` 渲染「管理」按鈕，但設計稿（`SettingsScreen.jsx` 第 77 行）是 `<button onClick={() => goTo("account")}`。`<Link>` 在 HTML 輸出為 `<a>`，而視覺上套用 `btn btn-ghost btn-sm` 樣式讓它看起來像按鈕。這個問題影響：

1. 無障礙（螢幕閱讀器會報「連結」而非「按鈕」）
2. 鍵盤操作語意（Enter 觸發 link navigation，`Space` 在 button 才有效）

建議修法：改用 `<button className="btn btn-ghost btn-sm" onClick={() => router.push('/account')}>管理</button>` 以符合設計稿語意。

### 問題 #2（MEDIUM）— app.css 缺少 `@keyframes heroWave`

`/workspaces/VocalCanvas/src/styles/app.css` 沒有定義 `@keyframes heroWave`。`OnboardingModal.tsx` 透過 component 內嵌 `<style>` 補上此 keyframe，可以運作，但：

1. 每次 modal render（含 React Strict Mode 雙重 render）都會插入一個 `<style>` tag
2. 若未來其他 app 頁面也需要 heroWave（如 rendering overlay 改用此動畫），會找不到 keyframe

建議修法：將 `@keyframes heroWave { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }` 加入 `app.css`，並移除 `OnboardingModal.tsx` 的 component-level `<style>` 中的此 keyframe（保留其他 responsive 樣式）。

### 問題 #3（MEDIUM）— Signup 品牌左欄不響應語言切換

`/workspaces/VocalCanvas/src/app/(marketing)/signup/page.tsx` 的語言切換邏輯（`isZh`）只更新右欄 form 文案，左欄 `<aside className="login-brand">` 的 `h2`、`b-sub`、feature bullets、copyright 均為硬編碼中文。如果使用者切換到英文介面，左欄仍是中文，造成混用。

設計稿（`signup.html`）是純靜態中文頁，沒有此問題，但實作加了語言切換功能，應保持一致性。建議修法：在左欄也加入 `isZh ? zh文案 : en文案` 的條件渲染，或與產品確認左欄是否必須多語。

---

## 整體還原度

**整體還原度：94%**

| 面向 | 評分 | 備註 |
|------|------|------|
| CSS class 完整性（Settings、Account、Forgot、404 新增部分） | 100% | 所有新 class 定義完整、值與設計稿一致 |
| DOM 結構（6 個新頁面） | 97% | 結構高度一致；`<Link>` 取代 `<button>` 是語意偏差 |
| 互動功能（Toggle、dots、forgot success、wave animation） | 96% | 全部功能正確實作；heroWave 在 app.css 缺定義靠元件內嵌補強 |
| 靜態資料正確性（settings rows、account stats） | 100% | 所有數字、文案、初始值完全吻合 |
| 連結串接（settings→account、forgot→login、404→首頁） | 95% | 語意問題（`<Link>` 當 button）；其餘跳轉路由正確 |

主要問題：
1. Settings「管理」使用 `<Link>` 而非 `<button>`，語意有誤（HIGH）
2. `app.css` 缺少 `@keyframes heroWave`，靠元件內嵌 style 解決，可維護性較差（MEDIUM）
3. Signup 左欄文案不支援語言切換，與右欄切換行為不一致（MEDIUM）
