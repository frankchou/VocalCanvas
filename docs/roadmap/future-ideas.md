# VocalCanvas — 未來功能構想

> 這份文件記錄已識別但尚未排入開發計劃的功能構想，避免遺忘。
> 每項構想包含背景脈絡與初步技術方向，待時機成熟時可直接提取規劃。

---

## 💡 AI 輔助寫稿（AI Script Writer）

**構想來源：** 2026-05-19 產品規劃會議  
**優先級：** 未排入（未來加分功能）  
**狀態：** 構想階段

### 背景

目前使用者在 Script Editor 步驟需要自行輸入朗讀腳本。部分使用者（尤其是 podcast 開場、廣告、冥想引導等情境）可能希望有 AI 協助生成初稿，再手動微調。

### 構想功能

- 使用者輸入主題、情境、語氣、長度（例如：「冥想引導，溫和舒緩，30 秒」）
- Claude API 根據提示生成朗讀腳本草稿，直接填入 Script Editor
- 可選「重新生成」或「微調風格」
- 生成的腳本包含建議的 delay 停頓位置

### 技術方向

- 使用 **Claude API**（`claude-sonnet-4-6` 或更新版）
- Next.js API route：`/api/script-gen`
- Prompt 設計：注入情境（scenario id）、語氣（voice preset）、目標時長
- Streaming 回應（打字機效果）呈現在 Script Editor

### 整合點

- Script Editor Step 1 新增「✦ AI 幫我寫」入口按鈕
- 選完情境（Scenario）後可帶入情境語氣作為 prompt 上下文
- Pro 限定功能（Free 方案不開放或每月限制次數）

### 預估影響

- 大幅降低使用門檻，尤其對不擅長寫稿的非創作者用戶
- 增加 Pro 升級誘因
- 與情境模式（Scenario）搭配後，形成「一鍵生成腳本 → 一鍵配音」完整流程

---

## 💬 LINE 登入 / 註冊（LINE Login）

**構想來源：** 2026-05-19 產品規劃會議  
**優先級：** 未排入（需自建 custom token 整合，Firebase 不原生支援）  
**狀態：** UI 已完成並隱藏，待啟用

### 背景

Login 頁與 Signup 頁已有 LINE Login 按鈕，但 Firebase Auth 不原生支援 LINE OAuth。需要自建 API route 接 LINE Login，取得 LINE 用戶 token 後換成 Firebase custom token，複雜度較高。目前暫緩，按鈕以 JSX 註解隱藏。

### 啟用前置作業

1. 到 LINE Developers Console 建立 LINE Login Channel
2. 取得 Channel ID + Channel Secret
3. 設定 Callback URL（`https://你的網域/api/auth/line/callback`）
4. `.env.local` 填入 `LINE_CHANNEL_ID` 和 `LINE_CHANNEL_SECRET`

### 技術方向

- 自建 `/api/auth/line` route：導向 LINE 授權頁
- 自建 `/api/auth/line/callback` route：收到 LINE code → 換 access token → 取得用戶資料 → Firebase Admin SDK `createCustomToken` → 回傳給前端
- 前端收到 custom token → `signInWithCustomToken`
- Account 頁連結/解除：`linkWithCredential`

### 啟用步驟

1. 完成上述前置作業
2. 實作 `/api/auth/line` 和 `/api/auth/line/callback` API routes
3. 取消 login/signup 頁面的 LINE 按鈕 JSX 註解
4. Account 頁 LINE 連結列從假資料改為真實狀態

---

## 🍎 Apple 登入 / 註冊（Apple Sign In）

**構想來源：** 2026-05-19 產品規劃會議  
**優先級：** 未排入（需付費 Apple Developer 帳號 $99/年）  
**狀態：** UI 已完成並隱藏，待啟用

### 背景

Login 頁與 Signup 頁已有 Apple Sign In 按鈕（Google / LINE / Apple 三個 OAuth），但 Apple 要求開發者擁有付費 Apple Developer Program 帳號才能使用 Sign In with Apple 服務。目前暫緩，按鈕以 JSX 註解隱藏。

### 啟用前置作業

1. 申請 Apple Developer Program（$99 USD/年）
2. 建立 App ID，啟用 Sign In with Apple capability
3. 建立 Service ID，設定 Return URL
4. 下載 private key（`.p8` 檔）
5. Firebase Console → Authentication → Sign-in method → 啟用 Apple

### 技術方向

- Firebase Auth `OAuthProvider('apple.com')` + `signInWithPopup`
- Account 頁連結/解除：`linkWithPopup(appleProvider)` / `unlink`
- Account 頁需補顯示 Apple 連結狀態（目前只有 Google / LINE）

### 啟用步驟

1. 完成上述前置作業
2. 取消 login/signup 頁面的 Apple 按鈕 JSX 註解
3. Account 頁新增 Apple 連結列

---

*新增構想請依相同格式補在此文件。*
