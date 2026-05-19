# Test Plan — Marketing Landing Page 設計稿忠實度對照

**功能代號**: marketing-landing  
**測試類型**: 設計稿忠實度驗收（靜態文案 / 結構對照）  
**Ground Truth**: `.claude/skills/vocalcanvas-screens-v3/_diff-v5-landing-icons-rwd/ui_kits/vocalcanvas-marketing/index.html`  
**受測實作**: `src/app/(marketing)/page.tsx`  
**執行日期**: 2026-05-19  
**執行人員**: QA Tester (Claude Sonnet 4.6)

---

## 測試範圍

| # | 區塊 | 測試項目 |
|---|------|---------|
| 1 | Nav | 連結文字、順序、是否含「情境模式」 |
| 2 | Hero eyebrow | 文案一致性 |
| 3 | Hero h1 | 主標題文案 |
| 4 | Hero sub | 副標文案（中文） |
| 5 | Scenarios section | 存在性（id="scenarios"）、eyebrow/標題/副標、卡片數量、每張卡文案與 BGM chips |
| 6 | Features section | eyebrow、標題、副標、3 個 feature 文案 |
| 7 | How it works | eyebrow、標題、4 步驟文案 |
| 8 | Voices | eyebrow、標題、4 個聲音名稱 |
| 9 | Use cases | eyebrow、標題、4 個情境文案 |
| 10 | Pricing | Free/Pro 方案標題、價格、功能列表 |
| 11 | Final CTA | 標題、副標 |
| 12 | Footer | 四欄連結清單、是否有情境模式連結 |

---

## 測試案例格式

每個案例：**前置條件 → 操作步驟 → 預期結果 → 實際結果**

### TC-01 Nav 導覽列
- **前置條件**：以中文模式（預設）載入頁面
- **操作步驟**：檢視 nav-links 區域的連結文字與順序
- **預期結果**：依序為「功能」「情境模式」「如何運作」「聲音庫」「方案」

### TC-02 Hero eyebrow
- **前置條件**：以中文模式載入頁面
- **操作步驟**：檢視 Hero 段落 eyebrow 文字
- **預期結果**：`AI 語音朗讀 · 情境模式 · 多語言`

### TC-03 Hero h1
- **前置條件**：中文模式
- **操作步驟**：檢視 h1 完整文字（含換行）
- **預期結果**：`讓你的文字` 換行 `擁有聲音`（sunset 色）`。`

### TC-04 Hero sub
- **前置條件**：中文模式
- **操作步驟**：檢視 hero-sub 段落文字
- **預期結果**：`挑一個情境 — 冥想、睡前故事、Podcast 開場 — AI 自動配好聲音與背景音樂。也可以從零自訂，插入停頓、微調音色，產出像對話一樣自然的音檔。`（注意破折號樣式）

### TC-05 Scenarios section 存在性
- **前置條件**：頁面已渲染
- **操作步驟**：確認 `id="scenarios"` 元素存在
- **預期結果**：存在

### TC-06 Scenarios section eyebrow
- **前置條件**：中文模式
- **操作步驟**：檢視 scenarios section 的 eyebrow
- **預期結果**：`情境模式`

### TC-07 Scenarios section 標題
- **前置條件**：中文模式
- **操作步驟**：檢視 scenarios section h2 標題
- **預期結果**：`不只是配音 —` 換行 `是有情境的聲音作品。`

### TC-08 Scenarios section 副標
- **前置條件**：中文模式
- **操作步驟**：檢視 scenarios section section-sub 段落
- **預期結果**：`一鍵選擇情境，VocalCanvas 自動配好聲音、音色、與背景音樂。產出時混音為單一音檔，下載即用。`

### TC-09 Scenarios 卡片數量
- **前置條件**：頁面已渲染
- **操作步驟**：計算 scenarios-grid 內的 scenario-card 數量
- **預期結果**：6 張卡（冥想、睡前故事、正念肯定語、Podcast 開場、廣告、有聲書）+ 自訂文字說明

### TC-10 情境卡文案（逐張）
- **前置條件**：中文模式
- **操作步驟**：逐張確認標題、sub-en、描述、BGM chips
- **預期結果**：見設計稿各卡內容

### TC-11 Scenarios section 底部 CTA 文案
- **前置條件**：中文模式
- **操作步驟**：檢視 scenarios 底部按鈕文字與說明文字
- **預期結果**：說明文字「或選「自訂」從零打造 — 9 款 BGM 任你混搭。」，按鈕「免費試用情境模式」

### TC-12 Features eyebrow/標題/副標
- **前置條件**：中文模式
- **操作步驟**：檢視 features section 標頭區
- **預期結果**：eyebrow=`核心功能`，標題=`不只是 TTS — 是有溫度的語音工具。`，副標=`挑性別、調音色...`

### TC-13 How it works eyebrow/標題
- **前置條件**：中文模式
- **操作步驟**：檢視 how section 標頭
- **預期結果**：eyebrow=`四步驟，從文字到音檔`，標題=`流程簡單到不像 AI 工具。`

### TC-14 Voices eyebrow/標題
- **前置條件**：中文模式
- **操作步驟**：檢視 voices section 標頭
- **預期結果**：eyebrow=`聲音庫`，標題=`六款精選 AI 聲音，每一款都有性格。`，4 聲音=晨光/夜霧/焰心/清玻

### TC-15 Pricing 方案文案
- **前置條件**：中文模式
- **操作步驟**：逐一確認 Free/Pro 的標題、價格、功能列表、CTA 按鈕
- **預期結果**：見設計稿

### TC-16 Final CTA
- **前置條件**：中文模式
- **操作步驟**：檢視 final-cta section 標題與副標
- **預期結果**：標題=`準備好讓你的文字擁有聲音了嗎？`，副標=`免費註冊，30 秒就能產出第一個音檔。`

### TC-17 Footer 欄位與連結
- **前置條件**：中文模式
- **操作步驟**：確認 footer 四欄（產品/資源/公司）的連結清單，及「情境模式」連結存在
- **預期結果**：產品欄包含「情境模式」連結；其餘連結與設計稿一致
