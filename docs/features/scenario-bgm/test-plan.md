# Test Plan — 情境快選 + BGM 功能

功能代號: scenario-bgm
測試類型: 靜態程式碼驗收（無瀏覽器環境）
測試日期: 2026-05-19
測試人員: QA 測試工程師（AI Agile Team）

## 測試範圍

- `src/components/app/ScenarioSelector.tsx`
- `src/components/app/BGMPicker.tsx`
- `src/app/(app)/new/page.tsx`
- `src/app/(marketing)/page.tsx`
- `src/styles/app.css`（scenario-strip 與 mobile sidebar 規則）

---

## T-01: ScenarioSelector 渲染

| # | 前置條件 | 操作步驟 | 預期結果 |
|---|---------|---------|---------|
| T-01-1 | 讀取 SCENARIOS 常數 | 計算陣列長度 | 長度 === 7 |
| T-01-2 | 遍歷每個 scenario | 確認 id、zh、en、gradient、fg 欄位存在 | 所有項目均有必要欄位 |
| T-01-3 | 檢查 JSX 回傳值 | 找 className="scenario-strip" | div 根元素帶有 scenario-strip class |

---

## T-02: Scenario 選取自動套用

| # | 前置條件 | 操作步驟 | 預期結果 |
|---|---------|---------|---------|
| T-02-1 | 非 custom scenario（有 voice 屬性） | 點擊觸發 onChange(s) | setGender / setPreset / setAge / setPitch / setTimbre 均被呼叫 |
| T-02-2 | custom scenario（無 voice 屬性） | 點擊觸發 onChange(s) | 不覆蓋語音設定（s.voice 為 undefined，if 跳過） |
| T-02-3 | 任意 scenario 有 bgmDefault | onChange 執行 | setBgmTrack 被呼叫為 s.bgmDefault |
| T-02-4 | 任意 scenario 有 bgmVolume | onChange 執行 | setBgmVolume 被呼叫為 s.bgmVolume |

---

## T-03: BGMPicker

| # | 前置條件 | 操作步驟 | 預期結果 |
|---|---------|---------|---------|
| T-03-1 | 讀取 BGM_TRACKS 常數 | 計算陣列長度 | 長度 === 9 |
| T-03-2 | expanded=false，有 recommended prop | 讀取 tracksToShow 邏輯 | 只顯示 recommended 中的 tracks |
| T-03-3 | value !== 'none' | 條件渲染邏輯 | BGMVolumeSlider 被渲染 |
| T-03-4 | BGMVolumeSlider 實作 | 檢查 className 使用 | sl-track / sl-fill / sl-thumb 均存在 |

---

## T-04: new/page.tsx 整合

| # | 前置條件 | 操作步驟 | 預期結果 |
|---|---------|---------|---------|
| T-04-1 | 確認 step 枚舉 | 找 ScenarioSelector 渲染位置 | 在 step === 0（VoiceSetupScreen）中 |
| T-04-2 | 確認 step 枚舉 | 找 BGMPicker 渲染位置 | 在 step === 0（VoiceSetupScreen）中，位於 voice sliders 之後 |
| T-04-3 | step === 2（PreviewScreen） | 找 bgmTrack !== 'none' 的條件渲染 | BGM 資訊被顯示 |

---

## T-05: 廣告頁

| # | 前置條件 | 操作步驟 | 預期結果 |
|---|---------|---------|---------|
| T-05-1 | 讀取 page.tsx | 找 id="scenarios" | section 存在 |
| T-05-2 | 讀取 scenarios-grid | 計算 scenario-card 數量 | 6 張 |
| T-05-3 | 讀取 nav | 找 href="#scenarios" | nav-links 中有 #scenarios 連結 |
| T-05-4 | 讀取 footer | 找情境模式連結 | footer 產品欄有 #scenarios 連結 |

---

## T-06: RWD CSS

| # | 前置條件 | 操作步驟 | 預期結果 |
|---|---------|---------|---------|
| T-06-1 | 讀取 app.css | 找 scenario-strip media query | 1200px / 768px / 480px 三斷點均存在 |
| T-06-2 | 讀取 768px mobile block | 找 sidebar re-show 規則 | 使用 .app .sidebar 前綴確保 specificity 覆蓋 tablet 規則 |
