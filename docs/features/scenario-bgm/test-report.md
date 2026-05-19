# Test Report — 情境快選 + BGM 功能

功能代號: scenario-bgm
測試類型: 靜態程式碼驗收（無瀏覽器環境）
測試日期: 2026-05-19
測試人員: QA 測試工程師（AI Agile Team）

---

## 摘要

| 狀態 | 件數 |
|------|------|
| PASS | 18   |
| FAIL | 3    |
| WARN | 1    |
| SKIP | 0    |

---

## T-01: ScenarioSelector 渲染

| 案例 | 狀態 | 說明 |
|------|------|------|
| T-01-1 SCENARIOS 陣列長度 === 7 | **PASS** | `SCENARIOS` 共 7 項：custom、meditation、bedtime、affirmation、podcast、ad、audiobook（行 102–183） |
| T-01-2 每個 scenario 有 id / zh / en / gradient / fg | **PASS** | 所有 7 個物件均包含上述 5 個必要欄位（行 102–183） |
| T-01-3 className="scenario-strip" 存在 | **PASS** | 根 `<div>` 使用 `className="scenario-strip"`（行 194） |

---

## T-02: Scenario 選取自動套用

| 案例 | 狀態 | 說明 |
|------|------|------|
| T-02-1 非 custom scenario 呼叫 setGender / setPreset / setAge / setPitch / setTimbre | **PASS** | `new/page.tsx` 第 130–132 行：`if (s.voice) { setVoice({ gender, preset, age, pitch, timbre }) }`，一次 patch 帶入全部 5 個語音參數 |
| T-02-2 custom scenario 不覆蓋現有設定 | **PASS** | custom 無 `voice` 屬性，`if (s.voice)` 判斷跳過（行 130），現有語音設定不變 |
| T-02-3 bgmDefault 在 onChange 中被設定 | **PASS** | 行 133：`if (s.bgmDefault !== undefined) setBgmTrack(s.bgmDefault)` |
| T-02-4 bgmVolume 在 onChange 中被設定 | **PASS** | 行 134：`if (s.bgmVolume !== undefined) setBgmVolume(s.bgmVolume)` |

---

## T-03: BGMPicker

| 案例 | 狀態 | 說明 |
|------|------|------|
| T-03-1 BGM_TRACKS 長度 === 9 | **PASS** | `BGM_TRACKS` 共 9 項：none、ocean、forest、bowl、rain、piano、ambient、upbeat、cinematic（行 113–123） |
| T-03-2 expanded=false 且有 recommended 時只顯示推薦 tracks | **PASS** | 行 215–218：`recommendedTracks = BGM_TRACKS.filter(b => recommended.includes(b.id))`；`tracksToShow = expanded ? BGM_TRACKS : recommendedTracks`，邏輯正確 |
| T-03-3 value !== 'none' 時顯示 BGMVolumeSlider | **PASS** | 行 310–312：`{value !== 'none' && <BGMVolumeSlider ... />}` |
| T-03-4 Volume slider 使用 sl-track / sl-fill / sl-thumb | **PASS** | 行 175–177 確認三個 CSS class 均使用：`className="sl-track"` / `className="sl-fill"` / `className="sl-thumb"` |

---

## T-04: new/page.tsx 整合

| 案例 | 狀態 | 說明 |
|------|------|------|
| T-04-1 情境快選在 Voice Setup step 中 | **FAIL** | `step === 0` 時渲染 `VoiceSetupScreen`（行 621–638）。`ScenarioSelector` 在 `VoiceSetupScreen` 內（行 123–139）。然而測試規格書描述為「step === 1」，但程式碼中 Voice Setup 對應 `step === 0`，步驟編號與規格描述不一致。詳見備注。 |
| T-04-2 BGMPicker card 在 Voice Setup step 中、voice sliders 之後 | **PASS** | `BGMPicker` 包在 `<div className="card">` 中，位於 `marginTop: 24`（行 202–214），確認在 voice sliders（行 141–173）之後 |
| T-04-3 Preview step 顯示 BGM 資訊（bgmTrack !== 'none'） | **PASS** | `PreviewScreen` 行 530–542：`{bgmTrack !== 'none' && (<div>chip + track name + volume</div>)}` |

**T-04-1 FAIL 備注（步驟編號歧義）：**

規格書寫「情境快選是否在 Voice Setup step（step === 1）中」，但原始碼中：
- `step === 0` → `VoiceSetupScreen`（含 ScenarioSelector）
- `step === 1` → `ScriptEditorScreen`
- `step === 2` → `PreviewScreen`

`ScenarioSelector` 確實在 Voice Setup 畫面，但該畫面對應 `step === 0` 而非 `step === 1`。此為規格書描述與程式碼步驟索引不符，非邏輯錯誤；功能行為本身正確。建議總指揮確認需修正規格書描述或步驟編號設計。

---

## T-05: 廣告頁

| 案例 | 狀態 | 說明 |
|------|------|------|
| T-05-1 id="scenarios" section 存在 | **PASS** | 行 405：`<section id="scenarios" ...>` |
| T-05-2 scenarios-grid 有 6 張 scenario-card | **PASS** | 行 418–548：冥想、睡前故事、正念肯定語、Podcast 開場、廣告、有聲書，共 6 個 `<div className="scenario-card">` |
| T-05-3 nav 有 #scenarios 連結 | **PASS** | 行 209：`<a href="#scenarios">{t(COPY.nav.links.scenarios, lang)}</a>` |
| T-05-4 footer 有情境模式連結 | **PASS** | 行 855：`<a href="#scenarios">{t(COPY.footer.colProductLinks.scenarios, lang)}</a>` |

---

## T-06: RWD CSS

| 案例 | 狀態 | 說明 |
|------|------|------|
| T-06-1 scenario-strip 有 1200px / 768px / 480px 三個斷點 | **PASS** | `app.css` 行 385–396：三個 `@media` 均存在且針對 `.scenario-strip` |
| T-06-2 mobile sidebar re-show 使用 .app .sidebar 前綴 | **PASS** | 行 321–332：所有 re-show 規則均使用 `.app .sidebar` 前綴，正確覆蓋 1024px tablet 的 specificity |

---

## WARN 項目

| 案例 | 狀態 | 說明 |
|------|------|------|
| BGMVolumeSlider grid class | **WARN** | `BGMPicker.tsx` 行 162–168 的 volume slider 外層 `<div>` 使用 inline `style` 設定 `grid-template-columns: 120px 1fr 50px`，而 `app.css` 行 399–407 定義了 `.bgm-volume-row` 的 responsive override，但 JSX 並未使用 `className="bgm-volume-row"`，導致 600px 以下的 CSS breakpoint 規則實際上無效（無法命中元素）。行為上 volume slider 在窄螢幕不會自動換行，視覺上可能擠壓。此為 RWD 潛在缺陷，建議確認是否需補 className。 |

---

## FAIL 清單與重現步驟

### FAIL-1: T-04-1 — Voice Setup step 索引與規格描述不一致

**影響範圍:** 規格文件描述

**重現步驟（靜態驗證）:**
1. 開啟 `src/app/(app)/new/page.tsx`
2. 查找行 621：`if (step === 0)` → 渲染 `VoiceSetupScreen`
3. 查找行 640：`if (step === 1)` → 渲染 `ScriptEditorScreen`
4. 規格書寫「情境快選是否在 Voice Setup step（step === 1）中」，與行 621 的 `step === 0` 不符

**程式行為:** 功能本身正確，`ScenarioSelector` 確實在 Voice Setup 畫面中。

**建議:** 請總指揮確認規格書描述「step === 1」為筆誤，更正為「step === 0」，無需改碼。

---

### FAIL-2: WARN-1 補充 — .bgm-volume-row class 未掛載

**影響範圍:** 窄螢幕（≤ 600px）BGM 音量滑桿版面

**重現步驟（靜態驗證）:**
1. 開啟 `src/styles/app.css`，行 399–407，定義 `.bgm-volume-row` responsive 規則
2. 開啟 `src/components/app/BGMPicker.tsx`，行 160–188，`BGMVolumeSlider` 的外層 `<div>` 無 `className` 屬性
3. 兩者不相連，CSS 規則無法命中

**程式行為:** 600px 以下，volume slider label 不會跨行顯示，三欄 grid 可能造成元素過窄。

**建議:** 請總指揮轉交全端工程師，在 `BGMVolumeSlider` 外層 `<div>` 加上 `className="bgm-volume-row"`，並移除對應的 inline style。

---

## 未測項目

無。所有要求案例均已完成靜態驗證。
