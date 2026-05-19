# Diff v5 — Landing 情境模式區塊 + Icon 全換 SVG + RWD 修正

這包包含這次對話中的所有變更，建立在 v4 的基礎上。

## 📦 變更檔案（4 個）

### 1. `ui_kits/vocalcanvas-marketing/index.html`
**廣告頁加入情境模式區塊**：
- Nav 多了「情境模式」連結（指向 `#scenarios`）
- Hero eyebrow 改為「AI 語音朗讀 · 情境模式 · 多語言」
- Hero 副標重寫，強調一鍵情境
- **新增完整的 Scenarios 區塊**（在 Features 與 How it works 之間）：6 張漸層情境卡 + 推薦 BGM chip + 底部「自訂」CTA
- Footer 加上 `情境模式` 連結到 `#scenarios`
- 情境卡片 emoji 已換成 SVG icon（透過 marketing.css）

### 2. `ui_kits/vocalcanvas-marketing/marketing.css`
**新增 CSS**：
- `.scenarios-grid` / `.scenario-card` — 廣告頁的 6 張情境卡樣式（漸層背景、白色文字、icon、BGM chips、hover 上移效果）
- `.scenario-card .icon svg` — SVG icon 尺寸 36px
- `.uc-ico` 加上 `font-size: 30px` + `line-height: 1`（為了 emoji 顯示，但目前 use case 已換回 SVG）
- 響應式：`@media (max-width: 1024px)` 改 2 欄、`@media (max-width: 640px)` 改 1 欄

### 3. `ui_kits/vocalcanvas-app/components/Scenarios.jsx`
**核心：所有 emoji 換成 Lucide 風格 SVG icon**
- 新增 `ScIcon` primitive — 用 currentColor 描邊、1.75 stroke、`width="1em" height="1em"` 隨父元素 font-size 縮放
- **7 個情境 icon**（含自訂）：打坐人形 / 月 / 雙星 / 麥克風 / 喇叭 / 書 / 米字
- **9 款 BGM icon**：靜音 / 海浪三層波 / 樹形 / 同心圓 / 雲雨 / 音符 / 波形 / 雙音符 / 膠卷
- ScenarioSelector、BGMPicker、BGMVolumeSlider 元件邏輯不變，只是 icon 來源從 string 改為 JSX

### 4. `ui_kits/vocalcanvas-app/app.css`
**多項 RWD + 視覺修正**：

**a. 手機抽屜文字顯示修正（specificity）**：
- 平板規則用 `.app .sidebar` (specificity 2)，手機 re-show 規則只用 `.sidebar` (specificity 1) 導致被覆蓋
- 修法：手機規則全部加上 `.app` 前綴匹配優先級
- 影響：手機選單打開後能正常顯示品牌名稱、CTA 全文、nav-item 文字、profile-row 完整資訊

**b. 側邊欄收起時 profile-row 也縮小**：
- profile-row 加了 button wrapper 後，原本的 selector 失效
- 新 selector：`.app.collapsed .sidebar .profile-row button > div:not(.avatar)` 隱藏文字
- 加 `.profile-row button { flex: 0 0 auto; gap: 0; }` 讓 button 不撐開
- 同套規則用在平板自動收起（≤1024px）

**c. 快速情境 + BGM 區塊 RWD**：
- `.scenario-strip` 桌機 7 欄 → 平板 (≤1200px) 4 欄 → 手機 (≤768px) 3 欄 → 小手機 (≤480px) 2 欄
- 卡片內 padding / font-size 在小螢幕縮小
- BGM 音量滑桿 (≤600px)：標籤跳到上一行、滑桿全寬

## 🗑️ 刪除檔案
- `ui_kits/vocalcanvas-marketing/scenarios.html` — 獨立情境頁已不需要（廣告頁已有 Scenarios 區塊）

> 如果你的 codebase 之前有跟著 v4-ish 實作這個獨立頁，記得手動刪掉並把 footer 連結改為 `#scenarios`。

## 🚀 在 codespaces 解壓

```bash
unzip _diff-v5-landing-icons-rwd.zip -d .claude/skills/vocalcanvas-screens-v5
rm _diff-v5-landing-icons-rwd.zip
git add .claude/skills/vocalcanvas-screens-v5
git commit -m "Add v5: landing scenarios section + SVG icons + mobile sidebar fix + RWD"
git push
```

## 💬 跟 Claude Code 說

> 請參考 `.claude/skills/vocalcanvas-screens-v5/` 資料夾的 README.md，把這 4 個檔案的設計變更套用到我現有的 codebase。
>
> 重點變更：
> 1. 廣告頁 (`marketing/index.html`) 加入新的 Scenarios 區塊（6 張漸層情境卡）
> 2. App 內的 Scenarios.jsx — 7 個情境 + 9 款 BGM icon 全部從 emoji 換成 Lucide 風格 SVG（保持 currentColor + 1.75 stroke 設計系統一致性）
> 3. 手機版選單打開後的文字顯示問題（CSS specificity）
> 4. 側邊欄收起時 profile-row 也要縮小
> 5. 快速情境 + BGM 區塊的 RWD 多斷點
> 6. 刪掉之前的 `scenarios.html` 獨立頁（如果有的話），footer 連結改為 `#scenarios`
