# Test Report — v2 新頁面靜態驗收

**功能代號：** v2-new-screens
**測試類型：** 靜態程式碼驗收（不啟動 dev server）
**執行日期：** 2026-05-19
**測試工程師：** QA Agent
**參照測試計畫：** `docs/features/v2-new-screens/test-plan.md`

---

## 驗收結果總覽

### 功能驗收

| TC | 驗收項目 | 結果 | 備註 |
|----|---------|------|------|
| TC-01 | Signup：wave span height 格式（`h + 'px'`） | FAIL | `style={{ height: h }}` — h 為 `number`，無 `'px'` 字串串接 |
| TC-02 | Signup：form submit `preventDefault` | PASS | `onSubmit={(e) => e.preventDefault()}` 確認存在 |
| TC-03 | Signup：「已有帳號」→ `/login` | PASS | `<Link href="/login">` 確認存在 |
| TC-04 | Forgot：`formState` 初始為 `'form'` | PASS | `useState<FormState>('form')` 確認存在 |
| TC-05 | Forgot：submit 切換到 `'success'` | PASS | `handleSubmit` 呼叫 `setFormState('success')` |
| TC-06 | Forgot：success state 顯示 email | PASS | `{email \|\| 'you@example.com'}` 確認存在 |
| TC-07 | Forgot：「重新寄送」點擊後 disabled | PASS | `resent=true` 後條件渲染移除 `<a>`，功能等效 disabled |
| TC-08 | Forgot：back-link → `/login` | PASS | `<Link href="/login" className="back-link">` 確認存在 |
| TC-09 | 404：28 個 err-wave span | PASS | `Array.from({ length: 28 }, ...)` 確認 |
| TC-10 | 404：span height 正確帶 px | FAIL | `style={{ height: h }}` — h 為 `number`，無 `'px'` 字串串接 |
| TC-11 | Settings：Toggle 有 animated thumb | PASS | `<span className="toggle-thumb" style={{ left: value ? 21 : 3 }} />` 存在 |
| TC-12 | Settings：「管理」使用 `<button>` | PASS | `<button className="btn btn-ghost btn-sm" onClick={() => router.push('/account')}>` 確認 |
| TC-13 | Settings：「看一次」觸發 `setShowOnboarding(true)` | PASS | `onClick={() => setShowOnboarding(true)}` 確認 |
| TC-14 | Settings：`<OnboardingModal>` 在 return 末端 | PASS | 第 210 行，位於 return JSX 最末端，條件 `{showOnboarding && <OnboardingModal ...>}` 確認 |
| TC-15 | Account：「← 返回」→ `/settings` | PASS | `router.push('/settings')` 確認 |
| TC-16 | Account：name state 可編輯 | PASS | `value={name} onChange={(e) => setName(e.target.value)}` 確認 |
| TC-17 | Account：email readOnly | PASS | `readOnly` 屬性確認存在 |
| TC-18 | Onboarding：4 個步驟資料完整 | PASS | STEPS 陣列共 4 個物件，每個均含 eyebrow、title、sub、illust |
| TC-19 | Onboarding：dot indicators 數量 = 4 | PASS | `STEPS.map((_, i) => ...)` 渲染，數量等於 STEPS.length（4） |
| TC-20 | Onboarding：最後一步有「開始創作」按鈕 | PASS | `isLast` 為 true 時渲染 `btn btn-render` + 文字「開始創作」 |
| TC-21 | AppShell：crumb 格式含 `<b>` 標籤 | PASS | CRUMB_MAP 全部 5 個條目皆包含 `<b>` 標籤 |
| TC-22 | AppShell：rendering state 從 LangContext 讀取 | PASS | `const { lang, rendering } = useLang()` 確認 |

### 連結串接驗收

| TC | 驗收項目 | 結果 | 備註 |
|----|---------|------|------|
| TC-23 | `/login` → `/signup`（免費註冊） | PASS | `<Link href="/signup">` 在 login/page.tsx 第 166 行確認 |
| TC-24 | `/login` → `/forgot`（忘記密碼） | PASS | `<Link href="/forgot">` 在 login/page.tsx 第 154 行確認 |
| TC-25 | landing → `/signup`（免費試用） | PASS | `<Link href="/signup">` 在 marketing/page.tsx 第 229、256 行確認（多處） |
| TC-26 | AppShell sidebar Settings → `/settings` | PASS | nav 陣列中 `{ href: '/settings', ... }` 確認 |
| TC-27 | AppShell profile-row → `/account` | PASS | `handleNav('/account')` 確認 |
| TC-28 | Settings「管理」→ `/account` | PASS | `router.push('/account')` 確認 |
| TC-29 | Account 返回 → `/settings` | PASS | `router.push('/settings')` 確認 |

---

## 統計

| 狀態 | 數量 |
|------|------|
| PASS | 27 |
| FAIL | 2 |
| SKIP | 0 |

---

## 發現的問題

| # | 頁面 | 問題描述 | 重現步驟 | 建議處理 |
|---|------|---------|---------|---------|
| BUG-01 | `signup/page.tsx` | `SIGNUP_WAVE_HEIGHTS.map` 中 span 的 `style={{ height: h }}` 傳入的是 `number` 型別（如 `42`），而非驗收標準要求的字串格式 `h + 'px'`（如 `"42px"`）。雖然 React 對 numeric style 值會自動加 px，兩者在瀏覽器行為上等效，但與驗收標準不符。 | 讀取 `src/app/(marketing)/signup/page.tsx` 第 46 行：`style={{ height: h, animationDelay: ... }}` — h 來自 `SIGNUP_WAVE_HEIGHTS: number[]` | 將 height 改為 `height: h + 'px'` 以符合驗收標準的明確格式要求 |
| BUG-02 | `not-found.tsx` | `ERR_WAVE_HEIGHTS.map` 中 span 的 `style={{ height: h }}` 同樣傳入 `number`，非字串 `h + 'px'`，與驗收標準不符。 | 讀取 `src/app/not-found.tsx` 第 34 行：`style={{ height: h, animationDelay: ... }}` — h 來自 `ERR_WAVE_HEIGHTS: number[]` | 將 height 改為 `height: h + 'px'` 以符合驗收標準的明確格式要求 |

---

## 附加觀察（非失敗項，供參考）

1. **Forgot「重新寄送」disabled 實作方式**（TC-07）：驗收標準描述為「點擊後 disabled」，實際實作使用條件渲染（`resent` 為 true 時將 `<a>` 替換為靜態 `<span>`）。功能結果等效（無法再次點擊），但並非 `disabled` HTML 屬性。此差異不影響使用者行為，標記為 PASS，但可與產品經理確認語意是否需要統一。

2. **Account 返回按鈕**（TC-15）：實作為 `<button> + router.push('/settings')`，而非 `<Link href="/settings">`。兩者行為相同，但語意上 `<Link>` 更符合導航慣例（SEO、無障礙）。非本次失敗項，但可供 Code Reviewer 參考。

3. **Settings Toggle 動畫**（TC-11）：thumb 的動畫效果依賴 CSS class `toggle-thumb` 的 transition 定義，inline style 只有 `left` 位置值。靜態驗收無法確認 CSS 是否定義 transition；若需確認動畫效果請以瀏覽器實際渲染驗證。

---

## 整體驗收結論

**有問題待修（2 項 FAIL）**

兩個失敗項均為同一類問題：wave span 的 `height` style 屬性使用 `number` 型別而非 `string` 型別（`h + 'px'`），位於 `signup/page.tsx` 與 `not-found.tsx`。雖然瀏覽器行為等效，但與驗收標準的明確格式要求不符，需修正後重新驗收。

其餘 27 項（含 7 項連結串接）全數通過。
