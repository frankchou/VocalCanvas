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

## 🎭 情緒控制滑桿（Emotion Slider）

**構想來源：** 2026-05-21 產品討論  
**優先級：** 未排入（需更換 TTS 引擎）  
**狀態：** 構想階段

### 背景

目前系統的聲音調整有 4 個參數（性別/年齡/音高/音色），但 Google Cloud TTS Neural2 不支援情緒控制。音色（timbre）滑桿目前沒有實際對應的 API 參數，效果有限。加入情緒滑桿（如開心、悲傷、溫柔、激動）能讓語音更自然、更貼合情境。

### 技術限制

| TTS 引擎 | 情緒支援 |
|---------|---------|
| Google Cloud TTS | ❌ 不支援 |
| Amazon Polly | ❌ 不支援 |
| **Microsoft Azure TTS** | ✅ SSML `<mstts:express-as style="cheerful/sad/angry/...">` + `styledegree` 強度控制 |
| **ElevenLabs** | ✅ stability + style 參數 |

### 技術方向

- 需更換或新增 TTS 引擎（建議 **Azure TTS**，原生支援情緒 + 中文品質好）
- 新增 `/api/tts/azure` route 或修改現有 route 支援多引擎
- 前端新增情緒滑桿 UI（可復用現有 Slider 元件）
- 情緒選項：cheerful / sad / friendly / angry / whispering / newscast 等
- 情緒強度：0.01–2.0（映射到 0-100 滑桿）

### 附帶改善

同時可解決「音色 timbre 滑桿無實際效果」的問題。Azure TTS 支援 `role`（角色扮演），可映射為更有意義的音色控制。

### 預估影響

- 語音自然度大幅提升，特別是冥想/睡前故事等情緒導向場景
- 與情境模式搭配：選「冥想」自動配「溫柔」情緒，選「廣告」配「活力」
- 成為與競品 ElevenLabs 差異化的功能點（ElevenLabs 沒有情境 + 情緒 + BGM 的組合）

---

## 🗣️ 台語 / 客語語音輸出

**構想來源：** 2026-05-21 產品討論  
**優先級：** 未排入（主流雲端 TTS 均不支援）  
**狀態：** 構想階段

### 背景

台灣約 70% 人口使用台語（閩南語），約 15% 使用客語。目前全球沒有任何 TTS 創作工具支援台語或客語輸出。如果 VocalCanvas 能做到，在台灣市場將完全沒有競品，是殺手級差異化功能。

### 技術限制

| TTS 引擎 | 台語 | 客語 |
|---------|------|------|
| Google Cloud TTS | ❌ | ❌ |
| Amazon Polly | ❌ | ❌ |
| Microsoft Azure TTS | ❌ | ❌ |
| ElevenLabs | ❌ | ❌ |

主流雲端 TTS 全部不支援。

### 可能的技術路徑

1. **工研院（ITRI）**：有台語語音合成研究，可能有可授權的模型或 API
2. **台灣政府資源**：教育部推動「本土語言數位化」，可能有開源語料庫
3. **學術合作**：台大、成大等有語音實驗室，可能有台語 TTS 研究成果
4. **自訓練模型**：使用開源 TTS 框架（如 Coqui TTS、VITS）+ 台語語料自行訓練
5. **社群合作**：台語社群（如 iTaigi 愛台語）可能有語音資源

### 預估影響

- 台灣市場：零競品，品類定義者
- 文化價值：推動本土語言數位化，可能獲得政府/媒體關注
- PR 價值：「全球第一個支援台語 AI 配音的工具」— 新聞價值極高
- 但技術難度高、開發時程長，需專案評估

---

*新增構想請依相同格式補在此文件。*
