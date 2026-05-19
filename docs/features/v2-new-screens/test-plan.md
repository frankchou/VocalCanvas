# Test Plan — v2 新頁面靜態驗收

**功能代號：** v2-new-screens
**測試類型：** 靜態程式碼驗收（不啟動 dev server）
**執行日期：** 2026-05-19
**測試工程師：** QA Agent

---

## 測試範圍

| 頁面 / 元件 | 檔案路徑 |
|------------|---------|
| 註冊頁 `/signup` | `src/app/(marketing)/signup/page.tsx` |
| 忘記密碼 `/forgot` | `src/app/(marketing)/forgot/page.tsx` |
| 404 頁 | `src/app/not-found.tsx` |
| Settings `/settings` | `src/app/(app)/settings/page.tsx` |
| Account `/account` | `src/app/(app)/account/page.tsx` |
| OnboardingModal | `src/components/app/OnboardingModal.tsx` |
| AppShell | `src/components/app/AppShell.tsx` |

---

## 測試案例清單

### TC-01：Signup wave height 格式
- 前置條件：讀取 signup/page.tsx
- 操作步驟：確認 SIGNUP_WAVE_HEIGHTS.map 的 span style height 賦值格式
- 預期結果：height 為 `h + 'px'` 字串格式（如 `"42px"`）
- 驗收標準依據：驗收清單第 1 條

### TC-02：Signup form submit preventDefault
- 前置條件：讀取 signup/page.tsx
- 操作步驟：確認 `<form>` 的 onSubmit handler
- 預期結果：呼叫 `e.preventDefault()`

### TC-03：Signup「已有帳號」連結
- 前置條件：讀取 signup/page.tsx
- 操作步驟：確認登入連結的 href
- 預期結果：`<Link href="/login">`

### TC-04：Forgot formState 初始值
- 前置條件：讀取 forgot/page.tsx
- 操作步驟：確認 useState 初始值
- 預期結果：`useState<FormState>('form')`

### TC-05：Forgot submit 切換 success state
- 前置條件：讀取 forgot/page.tsx
- 操作步驟：確認 handleSubmit 內容
- 預期結果：呼叫 `setFormState('success')`

### TC-06：Forgot success state 顯示 email
- 前置條件：讀取 forgot/page.tsx
- 操作步驟：確認 success state JSX 中是否渲染 email 變數
- 預期結果：包含 `{email}` 或 fallback

### TC-07：Forgot「重新寄送」點擊後 disabled
- 前置條件：讀取 forgot/page.tsx
- 操作步驟：確認 handleResend 後 UI 變化
- 預期結果：resent=true 後按鈕消失並顯示已送出文字（功能等效 disabled）

### TC-08：Forgot back-link 指向 /login
- 前置條件：讀取 forgot/page.tsx
- 操作步驟：確認 back-link href
- 預期結果：`<Link href="/login">`

### TC-09：404 波形 span 數量為 28
- 前置條件：讀取 not-found.tsx
- 操作步驟：確認 ERR_WAVE_HEIGHTS 陣列長度
- 預期結果：`Array.from({ length: 28 }, ...)`

### TC-10：404 wave height 格式
- 前置條件：讀取 not-found.tsx
- 操作步驟：確認 span style height 賦值格式
- 預期結果：height 為 `h + 'px'` 字串格式

### TC-11：Settings Toggle 有 animated thumb
- 前置條件：讀取 settings/page.tsx
- 操作步驟：確認 Toggle 元件內 thumb span 存在
- 預期結果：`<span className="toggle-thumb" ...>` 存在

### TC-12：Settings「管理」使用 button 元素
- 前置條件：讀取 settings/page.tsx
- 操作步驟：確認「管理」按鈕的 HTML 元素類型
- 預期結果：`<button>` 而非 `<Link>` 或 `<a>`

### TC-13：Settings「看一次」觸發 setShowOnboarding
- 前置條件：讀取 settings/page.tsx
- 操作步驟：確認 onClick handler
- 預期結果：`setShowOnboarding(true)`

### TC-14：Settings OnboardingModal 在 return 末端
- 前置條件：讀取 settings/page.tsx
- 操作步驟：確認 `<OnboardingModal>` 位置
- 預期結果：在 return 最末端且被 showOnboarding 條件保護

### TC-15：Account 返回按鈕指向 /settings
- 前置條件：讀取 account/page.tsx
- 操作步驟：確認返回按鈕 onClick
- 預期結果：`router.push('/settings')`

### TC-16：Account name state 可編輯
- 前置條件：讀取 account/page.tsx
- 操作步驟：確認 name input 的 onChange
- 預期結果：`onChange={(e) => setName(e.target.value)}`

### TC-17：Account email readOnly
- 前置條件：讀取 account/page.tsx
- 操作步驟：確認 email input 屬性
- 預期結果：具有 `readOnly` 屬性

### TC-18：Onboarding 步驟數量為 4
- 前置條件：讀取 OnboardingModal.tsx
- 操作步驟：確認 STEPS 陣列長度
- 預期結果：4 個 step 物件

### TC-19：Onboarding dot indicators 數量 = 4
- 前置條件：讀取 OnboardingModal.tsx
- 操作步驟：確認 dot 渲染邏輯
- 預期結果：`STEPS.map(...)` 迴圈渲染，數量由 STEPS.length 決定

### TC-20：Onboarding 最後一步「開始創作」按鈕
- 前置條件：讀取 OnboardingModal.tsx
- 操作步驟：確認 isLast 時渲染的按鈕
- 預期結果：含「開始創作」文字的 button

### TC-21：AppShell crumb 格式含 `<b>` 標籤
- 前置條件：讀取 AppShell.tsx
- 操作步驟：確認 CRUMB_MAP 所有條目
- 預期結果：每個條目皆用 `<b>` 包裹當前頁名稱

### TC-22：AppShell rendering state 從 LangContext 讀取
- 前置條件：讀取 AppShell.tsx
- 操作步驟：確認 useLang() 解構內容
- 預期結果：`const { lang, rendering } = useLang()`

### TC-23：連結串接 — /login → /signup（免費註冊）
- 前置條件：讀取 login/page.tsx
- 操作步驟：確認 signup-row 內的 Link
- 預期結果：`<Link href="/signup">`

### TC-24：連結串接 — /login → /forgot
- 前置條件：讀取 login/page.tsx
- 操作步驟：確認忘記密碼連結
- 預期結果：`<Link href="/forgot">`

### TC-25：連結串接 — landing → /signup（免費試用）
- 前置條件：讀取 marketing/page.tsx
- 操作步驟：確認主要 CTA 連結
- 預期結果：`<Link href="/signup">`

### TC-26：AppShell sidebar Settings → /settings
- 前置條件：讀取 AppShell.tsx
- 操作步驟：確認 nav 陣列中 settings 項目
- 預期結果：`href: '/settings'`

### TC-27：AppShell profile-row → /account
- 前置條件：讀取 AppShell.tsx
- 操作步驟：確認 profile-row 按鈕 onClick
- 預期結果：`handleNav('/account')`

### TC-28：Settings「管理」→ /account
- 前置條件：讀取 settings/page.tsx
- 操作步驟：確認帳號區塊「管理」button 的 onClick
- 預期結果：`router.push('/account')`

### TC-29：Account 返回 → /settings
- 前置條件：讀取 account/page.tsx
- 操作步驟：確認返回按鈕 onClick
- 預期結果：`router.push('/settings')`
