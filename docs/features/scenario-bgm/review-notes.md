# Code Review — 情境快選 + BGM 功能

**審查日期：** 2026-05-19
**審查員：** Code Reviewer (claude-sonnet-4-6)
**功能代號：** scenario-bgm
**審查範圍：**
- `src/components/app/ScenarioSelector.tsx`
- `src/components/app/BGMPicker.tsx`
- `src/app/(app)/new/page.tsx`（情境/BGM 相關段落）
- `src/app/(marketing)/page.tsx`（Scenarios section）
- `src/styles/marketing.css`（scenarios 樣式）
- `src/styles/app.css`（mobile sidebar 修正 + scenario-strip RWD）

---

## 總結

| 分類 | 數量 |
|------|------|
| 阻擋上線（blocking） | 3 |
| 建議改善（non-blocking） | 8 |

**是否有阻擋上線的嚴重問題：是（3 項）**

---

## 必修問題（Blocking）

### B-01 — BGMVolumeSlider：pointer event 拖曳邏輯有 edge case，會導致 runtime error

**檔案：** `src/components/app/BGMPicker.tsx`，第 136–158 行

`handlePointerDown` 裡，`move` 函式以強制型別轉換方式嘗試讀取 `PointerEvent` 上的 `touches`：

```ts
const clientX = (ev as PointerEvent & { touches?: TouchList }).touches
  ? (ev as PointerEvent & { touches: TouchList }).touches[0].clientX
  : ev.clientX;
```

**問題一（邏輯錯誤）：** `PointerEvent` 本身就已統一 `clientX`，不需要也不應讀 `touches`。這兩行的型別轉換是對 `PointerEvent` 不必要的 fallback，而且在 `window.addEventListener('pointermove', move)` 回呼中，參數確實是標準 `PointerEvent`（無 `touches`），該屬性恆為 `undefined`，導致永遠走 `ev.clientX` 分支，但強制轉換仍會讓 TypeScript strict 模式在某些版本下報錯。

**問題二（release 遺漏）：** `pointerup` 監聽器綁定在 `window` 上，但沒有呼叫 `e.currentTarget.releasePointerCapture()` 或 `setPointerCapture()`。若使用者快速移出視窗或在 pointer down 時迅速鬆開，`up` 監聽器有可能在 `pointermove` 觸發之前就被移除（取決於事件佇列順序），不過更嚴重的是：若 React 元件在拖曳中途 unmount（例如快速切換 scenario），`window` 上的 `pointermove`/`pointerup` 監聽器不會被清除，造成記憶體洩漏與孤兒事件處理器。

**建議修法：** 刪除 `touches` 判斷，直接使用 `ev.clientX`；在 `useEffect` cleanup 或 `handlePointerDown` 的 `up` 中，確保元件 unmount 時也能移除掛在 window 上的監聽器（可用 `useRef` 暫存 `move`/`up` 再在 cleanup 移除）。

---

### B-02 — BGM volume slider 的 CSS class 與元件實際 class 不符

**檔案：** `src/styles/app.css`，第 399–407 行 vs `src/components/app/BGMPicker.tsx`，第 161–170 行

CSS 裡定義的 RWD 規則針對 `.bgm-volume-row`：

```css
.bgm-volume-row {
  grid-template-columns: 1fr 50px !important;
  ...
}
.bgm-volume-row > div:first-child { grid-column: 1 / -1; }
```

但 `BGMVolumeSlider` 元件的根 `<div>` 沒有套用任何 className，只有 inline style：

```tsx
<div style={{ ...gridTemplateColumns: '120px 1fr 50px'... }}>
```

**結果：** 整個 `.bgm-volume-row` 的 mobile 修正規則完全沒有生效。在 480px 以下，音量滑桿的三欄格局不會折行，「音樂音量」標籤會被壓縮，影響可用性。

**建議修法：** 為 `BGMVolumeSlider` 根 `<div>` 加上 `className="bgm-volume-row"`，並移除同一個 `<div>` 上對應的 inline `gridTemplateColumns` style（讓 CSS 接管）。

---

### B-03 — ScenarioSelector 的 `scenario-strip` 沒有定義 grid display，元件本身沒設 display: grid

**檔案：** `src/components/app/ScenarioSelector.tsx`，第 194 行；`src/styles/app.css`，第 385–396 行

RWD 規則全部使用 `!important` override `grid-template-columns`，但 `scenario-strip` 在 `app.css` 裡完全沒有基礎的 `display: grid` 宣告；元件程式碼也只有 `className="scenario-strip"`，沒有 inline `display: grid`。

若基礎 grid 宣告不存在，RWD breakpoint 裡的 `grid-template-columns: repeat(4, ...) !important` 等規則只會改變一個未設定的屬性，按鈕會以預設的 block/inline 排列，整列 UI 全部跑版。

**建議修法：** 在 `app.css` 非 media query 範圍補上 `.scenario-strip { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 10px; }`（欄數依設計稿決定），或在元件 inline style 補上 `display: 'grid'`。

---

## 建議改善（Non-blocking）

### N-01 — ScIcon primitive 在兩個元件檔案中完整重複定義

**檔案：** `src/components/app/ScenarioSelector.tsx` 第 7–28 行；`src/components/app/BGMPicker.tsx` 第 7–28 行

`ScIconProps` interface 與 `ScIcon` function component 一字不差地在兩個檔案各出現一次，違反 DRY 原則。日後若需修改 strokeWidth 或 style，必須改兩處。

**建議：** 抽成 `src/components/ui/ScIcon.tsx`（或放入現有的 `src/components/ui/Icons.tsx`），由兩個元件 import。

---

### N-02 — `lang` prop 型別過寬，應收窄為 literal union

**檔案：** `src/components/app/ScenarioSelector.tsx` 第 189 行；`src/components/app/BGMPicker.tsx` 第 126、198 行

`lang: string` 讓傳入任意字串都不會有型別錯誤，但元件只處理 `'zh'` 和 `'en'` 兩種值。依慣例，應定義並重用 `type Lang = 'zh' | 'en'`（marketing page 也有同樣的本地型別）。若共用一個 `Lang` 型別，傳錯值時 TypeScript 就能提早報錯。

**建議：** 在 `src/types/lang.ts`（或共用 types barrel）中匯出 `export type Lang = 'zh' | 'en'`，三個元件一起改用。

---

### N-03 — BGMPicker：「全部 9 首音樂」為硬編碼數字

**檔案：** `src/components/app/BGMPicker.tsx`，第 230 行

```tsx
t('全部 9 首音樂', 'All 9 tracks')
```

`BGM_TRACKS.length` 已在同一個檔案中可取得，直接寫死 `9` 表示日後新增或移除音軌時，這段文字不會自動更新。

**建議：** 改為 `` t(`全部 ${BGM_TRACKS.length} 首音樂`, `All ${BGM_TRACKS.length} tracks`) ``。

---

### N-04 — SCENARIOS / BGM_TRACKS 中使用字串 `'none'` 作為特殊 ID，缺乏型別保護

**檔案：** `src/components/app/BGMPicker.tsx` 第 310 行；`src/app/(app)/new/page.tsx` 第 530、615 行

`'none'` 作為「無 BGM」的 magic string 散佈在元件、頁面、與初始狀態三處，且型別都是 `string`。若任何地方拼錯，不會得到編譯錯誤。

**建議：** 定義 `const BGM_NONE_ID = 'none' as const` 並替換所有比較，或在 `BgmTrack` 的 `id` 型別中做 discriminated union。

---

### N-05 — BGM_TRACKS.find() 結果在 page.tsx 中未做 null 保護

**檔案：** `src/app/(app)/new/page.tsx`，第 536 行

```tsx
{BGM_TRACKS.find((t) => t.id === bgmTrack)?.[lang === 'zh' ? 'zh' : 'en']}
```

此處用了 optional chaining，不會 runtime crash，但若 `bgmTrack` 值無效（例如從 localStorage 恢復了一個已被移除的音軌 ID），整個 BGM 欄位會靜默地渲染空字串，使用者看不到任何提示。屬低風險但屬資料防禦性不足。

**建議：** 加 fallback：`?? t('未知音軌', 'Unknown track')`，或在 `onChange` 入口處做 ID 合法性驗證。

---

### N-06 — marketing page 的 Scenarios section 沿用 inline style 而不用已定義的 `.section` class，造成兩套行為不一致

**檔案：** `src/app/(marketing)/page.tsx`，第 405–406 行

```tsx
<section id="scenarios" style={{ padding: '96px 48px', maxWidth: 1280, margin: '0 auto' }}>
```

其他所有 section 都用 `<section className="section">` 取得 RWD 的 padding 縮放（`@media max-width: 1024px` 縮為 `72px 32px`，`768px` 縮為 `56px 16px`），唯獨 Scenarios section 用 inline style，在 tablet/mobile 上 padding 不會縮小，右側可能裁切。

**建議：** 改為 `<section id="scenarios" className="section">`，移除 inline style。

---

### N-07 — marketing page 廣告卡片：`sub-en` 欄位雙語不一致

**檔案：** `src/app/(marketing)/page.tsx`，第 429 行（冥想）、第 449 行（睡前故事）等

各卡片的 `.sub-en` 欄位（灰色副標）內容不受 `lang` 狀態控制，永遠顯示混合中文與英文的固定字串，例如：

```html
<div class="sub-en">Meditation · 柔和 · 緩慢 · 低沉</div>
```

當使用者切到英文模式時，仍然看到中文形容詞。雖然整體可讀，但破壞雙語一致性原則。

**建議：** 將 `sub-en` 內容加入 COPY 對照表（或至少區分 `lang`），英文模式顯示純英文形容詞，例如 `Meditation · soft · slow · deep`。

---

### N-08 — `new/page.tsx` 中 `PRESET_TUNING` 與 `SCENARIOS` 的 voice 預設值出現重複/不一致

**檔案：** `src/app/(app)/new/page.tsx`，第 49–54 行；`src/components/app/ScenarioSelector.tsx`，第 102–183 行

`PRESET_TUNING` 定義了每個 preset 的 `{ age, pitch, timbre }`；但 `SCENARIOS` 裡的 `voice` 物件也各自帶有同樣三個欄位，且兩者的數值不完全一致（例如 `glass` 在 PRESET_TUNING 是 `{ age: 30, pitch: 56, timbre: 18 }`，但 meditation scenario 用 `glass` preset 設定的是 `{ age: 38, pitch: 22, timbre: 14 }`）。

這代表「情境套用聲音」與「點選 preset 套用聲音」在同一個 preset 名稱下，會套用不同的數值，容易引起混亂。目前因為情境直接 override 拉桿數值所以 UI 行為說得通，但若未來邏輯改變，很容易埋下 bug。

**建議：** 在 code comment 中明確說明 SCENARIOS 的 voice 數值是「情境客製化調整後的值，不一定等於 preset 預設值」，或考慮讓 scenario voice 只儲存 preset name，調整值統一從 PRESET_TUNING 讀取。

---

## 其他確認事項（無問題）

- **SCENARIOS 與 BGM_TRACKS 的 undefined access 風險：** 兩個陣列均為模組頂層靜態常數，不存在 runtime 為空的情況；`SCENARIOS.find(...)?.bgmRecommended` 在 page.tsx 中已有 optional chaining 保護，無問題。
- **沒有 `any` 使用：** 全程型別明確，無 `any` 出現。
- **`useEffect` cleanup：** page.tsx 的 progress interval 有正確 cleanup（第 437–446 行），scroll listener 也有（行 192–196 行 marketing page）。
- **Breaking change 檢查：** ScenarioSelector 與 BGMPicker 為新增元件，不涉及既有 API 變更；new/page.tsx 是現有頁面的擴充，新增 state 均有初始值，不影響既有流程。

---

*本文件由 Code Reviewer agent 產出，問題修正請交由 Fullstack Engineer 處理。*
