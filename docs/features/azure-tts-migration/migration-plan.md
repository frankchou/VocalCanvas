# Azure TTS Migration Plan — 技術評估報告

> **功能代號**: azure-tts-migration  
> **角色**: 架構師 / Tech Lead  
> **日期**: 2026-05-21  
> **狀態**: 評估階段

---

## 目錄

1. [Azure TTS 能力盤點](#1-azure-tts-能力盤點)
2. [參數映射方案](#2-參數映射方案)
3. [轉換計劃](#3-轉換計劃)
4. [風險評估](#4-風險評估)
5. [前置作業清單](#5-前置作業清單)
6. [雙引擎共存評估](#6-雙引擎共存評估)
7. [成本估算](#7-成本估算)

---

## 1. Azure TTS 能力盤點

### 1.1 VocalCanvas 所需功能 vs Azure 支援

| 功能 | Google TTS (現有) | Azure TTS | 備註 |
|------|-------------------|-----------|------|
| SSML `<speak>` | 支援 | 支援 | 完全相容 |
| SSML `<break>` | 支援 | 支援 | 語法相同 `<break time="800ms"/>` |
| SSML `<prosody>` | 支援 (pitch, rate) | 支援 (pitch, rate, volume, contour) | Azure 更彈性，支援 contour 細緻調音 |
| 情緒/風格控制 | 不支援 | **支援** `<mstts:express-as>` | Azure 獨有，重大優勢 |
| 音色微調 | 不支援 | 部分支援 (role 切換) | 可映射 timbre 滑桿 |
| Neural 語音 | Neural2 等級 | Neural / HD 等級 | 兩者品質接近，Azure 中文選擇更多 |
| 多語言 | 支援 | 支援 | Azure 語言數量更多 |
| 即時串流 | 不支援 (REST only) | 支援 WebSocket | 未來可做即時預覽 |
| 輸出格式 MP3 | 支援 | 支援 (audio-16khz-128kbitrate-mono-mp3 等多種) | 相容 |

### 1.2 Azure 中文語音清單（繁體中文 zh-TW）

Azure 提供的 zh-TW Neural 語音（截至 2025 Q4）:

| Voice Name | 性別 | 風格 | 品質 |
|------------|------|------|------|
| zh-TW-HsiaoChenNeural | 女 | 一般/友善 | HD |
| zh-TW-YunJheNeural | 男 | 一般/新聞 | HD |
| zh-TW-HsiaoYuNeural | 女 | 多風格（cheerful, angry, sad 等） | HD |

**簡體中文 zh-CN（補充）**— 如果需要更豐富的風格控制:

| Voice Name | 性別 | 特色 | 風格支援 |
|------------|------|------|---------|
| zh-CN-XiaoxiaoNeural | 女 | **最豐富風格支援** | affectionate, angry, calm, cheerful, disgruntled, fearful, gentle, lyrical, sad, serious, poetry-reading 等 14+ 風格 |
| zh-CN-YunxiNeural | 男 | 多風格 | angry, cheerful, depressed, fearful, narration-relaxed, sad, serious 等 |
| zh-CN-YunjianNeural | 男 | 多風格/運動播報 | sports-commentary, narration-relaxed, angry, cheerful, sad 等 |
| zh-CN-XiaoyiNeural | 女 | 多風格 | affectionate, angry, cheerful, gentle, sad, serious 等 |

**品質評估**: Azure 中文語音在自然度、情緒表達上普遍優於 Google Standard 等級，與 Google Neural2 持平或略優。zh-CN 語音的風格數量遠超 zh-TW，若產品定位偏向內容創作，建議同時開放 zh-CN 語音供用戶選擇。

### 1.3 情緒/風格支援完整清單

Azure `<mstts:express-as>` 支援的 style 值（以 zh-CN-XiaoxiaoNeural 為例）:

```
affectionate, angry, assistant, calm, chat, chat-casual,
cheerful, customerservice, disgruntled, embarrassed, empathetic,
envious, fearful, gentle, lyrical, narration-professional,
narration-relaxed, newscast, newscast-casual, newscast-formal,
poetry-reading, sad, serious, shouting, sports-commentary,
sports-commentary-excited, whispering
```

搭配 `styledegree` 屬性可控制風格強度（0.01 ~ 2.0，預設 1.0）:
```xml
<mstts:express-as style="cheerful" styledegree="1.5">
  歡迎來到 VocalCanvas！
</mstts:express-as>
```

### 1.4 SSML 支援程度

Azure 完整支援標準 SSML 1.0，並擴展了 `mstts` 命名空間:

```xml
<speak version="1.0"
  xmlns="http://www.w3.org/2001/10/synthesis"
  xmlns:mstts="http://www.w3.org/2001/mstts"
  xml:lang="zh-TW">
  <voice name="zh-TW-HsiaoChenNeural">
    <mstts:express-as style="cheerful" styledegree="1.2">
      <prosody rate="-10%" pitch="+5%">
        歡迎來到 VocalCanvas。
      </prosody>
    </mstts:express-as>
    <break time="800ms"/>
    在這裡，每段文字都能擁有自己的聲音。
  </voice>
</speak>
```

**關鍵差異**: Azure SSML 的 `<speak>` 根元素**必須**包含 `version`、`xmlns`、`xml:lang` 屬性，且文字必須包裹在 `<voice name="...">` 標籤內。現有的 `scriptToSsml()` 需要調整。

### 1.5 定價比較

| 項目 | Google TTS | Azure TTS |
|------|-----------|-----------|
| Neural 語音 | $16 / 100 萬字元 | $16 / 100 萬字元 |
| Standard 語音 | $4 / 100 萬字元 | $4 / 100 萬字元 |
| HD 語音 | — | $24 / 100 萬字元 |
| 免費額度 (Neural) | 100 萬字元/月 | 50 萬字元/月 |
| 免費額度 (Standard) | 400 萬字元/月 | 50 萬字元/月 |
| 免費期限 | 前 12 個月 | 前 12 個月 (F0 tier 永久免費 50 萬字元) |

**結論**: Neural 等級單價相同。Azure 免費額度較少（50 萬 vs 100 萬字元），但 F0 tier 可永久免費。若使用 Azure 的風格/情緒功能，不需額外付費。

---

## 2. 參數映射方案

### 2.1 完整參數映射表

| VocalCanvas 參數 | Google TTS 映射 (現有) | Azure TTS 映射 (建議) | 備註 |
|-----------------|----------------------|---------------------|------|
| `gender` | voiceName 選擇 | voiceName 選擇 | 直接對應 |
| `age` (0-100) | `speakingRate` 1.3~0.7 | `<prosody rate>` "+30%" ~ "-30%" | 語意相同：年輕=快、成熟=慢 |
| `pitch` (0-100) | `pitch` -10~+10 semitones | `<prosody pitch>` "-50%" ~ "+50%" | Azure 用百分比或 Hz 偏移 |
| `timbre` (0-100) | **未映射** | `<mstts:express-as role>` + `<prosody>` 組合 | **新增映射**，見下方 |
| `preset` | 未對應 | voiceName + style 組合 | **新增映射**，見下方 |
| (新增) `emotion` | N/A | `<mstts:express-as style>` + `styledegree` | 建議新增情緒滑桿 |

### 2.2 Voice Name 映射

```typescript
const AZURE_VOICE_MAP: Record<string, Record<string, string>> = {
  zh: {
    female: 'zh-TW-HsiaoChenNeural',  // 一般女聲
    male:   'zh-TW-YunJheNeural',      // 一般男聲
  },
  en: {
    female: 'en-US-JennyNeural',       // 多風格女聲
    male:   'en-US-GuyNeural',         // 多風格男聲
  },
};
```

### 2.3 Age 映射 (語速)

```typescript
// age 0 (年輕) → rate "+30%" (快)
// age 100 (成熟) → rate "-30%" (慢)
function mapAge(age: number): string {
  const ratePercent = 30 - (age / 100) * 60; // +30% → -30%
  const sign = ratePercent >= 0 ? '+' : '';
  return `${sign}${Math.round(ratePercent)}%`;
}
```

### 2.4 Pitch 映射

```typescript
// pitch 0 (低沉) → "-50%"
// pitch 100 (高亢) → "+50%"
function mapPitch(pitch: number): string {
  const pctVal = (pitch - 50); // -50 ~ +50
  const sign = pctVal >= 0 ? '+' : '';
  return `${sign}${Math.round(pctVal)}%`;
}
```

### 2.5 Timbre 映射 — 核心新增

Timbre（音色）在 Google TTS 完全沒有對應。Azure 提供了兩個可組合的機制來模擬:

**方案: express-as style + prosody 組合**

- timbre 0~33 (溫柔端): 使用 `style="gentle"` 或 `style="calm"`，搭配較低的 volume
- timbre 34~66 (中性): 不使用特殊 style，或使用 `style="chat"`
- timbre 67~100 (粗獷端): 使用 `style="serious"` 或 `style="narration-relaxed"`，搭配較高的 volume

```typescript
function mapTimbre(timbre: number): { style?: string; styledegree?: number; volume?: string } {
  if (timbre <= 33) {
    return {
      style: 'gentle',
      styledegree: 1.0 + (33 - timbre) / 33 * 0.5, // 1.0 ~ 1.5
      volume: '-10%',
    };
  } else if (timbre <= 66) {
    return {
      style: 'chat',
      styledegree: 0.5,
    };
  } else {
    return {
      style: 'serious',
      styledegree: 0.5 + (timbre - 66) / 34 * 1.0, // 0.5 ~ 1.5
      volume: '+10%',
    };
  }
}
```

**限制**: 並非所有 voice name 都支援所有 style。需要建立一個 fallback 機制：如果所選聲音不支援該 style，則退回 prosody-only 調整。

### 2.6 Preset 映射

| Preset | 現有值 | Azure Voice + Style 建議 |
|--------|--------|------------------------|
| dawn (晨光) | age:32, pitch:70, timbre:24 | `zh-TW-HsiaoChenNeural` + style: `cheerful`, rate: "+10%", pitch: "+20%" |
| mist (夜霧) | age:58, pitch:28, timbre:38 | `zh-TW-YunJheNeural` + style: `calm`, rate: "-5%", pitch: "-22%" |
| ember (焰心) | age:42, pitch:64, timbre:72 | `zh-TW-HsiaoChenNeural` + style: `serious`, rate: "+5%", pitch: "+14%" |
| glass (清玻) | age:30, pitch:56, timbre:18 | `zh-TW-YunJheNeural` + style: `gentle`, rate: "+12%", pitch: "+6%" |
| ink (墨色) | — | `zh-TW-YunJheNeural` + style: `narration-relaxed` |
| petal (花瓣) | — | `zh-TW-HsiaoChenNeural` + style: `cheerful`, styledegree: 1.3, rate: "+15%" |

**注意**: zh-TW 語音的 style 支援有限。如果 `zh-TW-HsiaoChenNeural` 不支援某個 style，SSML 會被忽略（不會報錯，只是用預設風格合成）。建議在 preset 設定中加入 fallback voice（例如退回 zh-CN 語音）。

### 2.7 情緒滑桿（建議新增）

如果加入情緒控制，建議 UI 新增:

- **情緒選擇器**: dropdown 或 chip 選擇 style（cheerful / calm / sad / serious / gentle）
- **強度滑桿**: 0-100 映射到 styledegree 0.01 ~ 2.0

```typescript
interface EmotionConfig {
  style: string;     // 'cheerful' | 'calm' | 'sad' | 'serious' | 'gentle' | 'none'
  degree: number;    // 0-100 → 0.01 ~ 2.0
}

function mapEmotion(emotion: EmotionConfig): { style: string; styledegree: number } | null {
  if (emotion.style === 'none') return null;
  return {
    style: emotion.style,
    styledegree: 0.01 + (emotion.degree / 100) * 1.99,
  };
}
```

**此為 Phase 2 建議**，Phase 1 先完成基礎切換，不改前端。

---

## 3. 轉換計劃

### 3.1 影響檔案清單

| 檔案 | 變更類型 | 變更內容 |
|------|---------|---------|
| `src/app/api/tts/route.ts` | **重寫** | 移除 Google SDK，改用 Azure REST API 或 SDK |
| `package.json` | **修改** | 移除 `@google-cloud/text-to-speech`，加入 `microsoft-cognitiveservices-speech-sdk` (可選) |
| `.env.local` | **修改** | 移除 Google 金鑰，加入 Azure key + region |
| `src/app/(app)/new/page.tsx` | **不改** | API 介面不變 |
| `src/app/(app)/voices/page.tsx` | **不改** | API 介面不變 |
| `src/lib/audio-mixer.ts` | **不改** | 接收 Blob，格式不變 |

### 3.2 能不能「只改 API route + env vars」就完成切換？

**可以。** 這是本方案的核心設計目標。

API route 對前端的契約是:
```typescript
// Request
POST /api/tts
Body: { script: ScriptNode[], voice: VoiceState, lang: 'zh' | 'en' }

// Response
{ audio: string /* base64 */, format: 'mp3' }
```

只要 Azure 版 route 維持同樣的 request/response 格式，前端和 audio-mixer 完全不需要改動。

### 3.3 API Route 重寫方案

Azure TTS 有兩種呼叫方式:

**方案 A: REST API（建議）** — 零依賴，輕量
```typescript
// 不需要安裝 SDK，直接用 fetch 呼叫 Azure REST endpoint
const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Ocp-Apim-Subscription-Key': azureKey,
    'Content-Type': 'application/ssml+xml',
    'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
  },
  body: ssml,
});
const audioBuffer = await response.arrayBuffer();
const base64Audio = Buffer.from(audioBuffer).toString('base64');
```

**方案 B: Azure Speech SDK** — 功能完整但包較大
```
npm install microsoft-cognitiveservices-speech-sdk
```

**建議採用方案 A**，理由:
1. 不增加 node_modules 體積（SDK 約 30MB）
2. REST API 足夠滿足需求
3. 減少依賴管理負擔
4. Edge Runtime 相容性更好

### 3.4 新 SSML 組建函式

```typescript
function buildAzureSsml(
  script: ScriptNode[],
  voiceName: string,
  lang: string,
  prosody: { rate: string; pitch: string; volume?: string },
  expressAs?: { style: string; styledegree: number },
): string {
  const xmlLang = lang === 'zh' ? 'zh-TW' : 'en-US';

  let body = '';
  for (const node of script) {
    if (node.type === 'text' && node.value) {
      body += node.value;
    } else if (node.type === 'delay' && node.seconds) {
      // Azure 支援 <break time="800ms"/> 格式，需轉換秒為毫秒
      body += `<break time="${Math.round(node.seconds * 1000)}ms"/>`;
    }
  }

  // 用 prosody 包裹
  const vol = prosody.volume ? ` volume="${prosody.volume}"` : '';
  body = `<prosody rate="${prosody.rate}" pitch="${prosody.pitch}"${vol}>${body}</prosody>`;

  // 用 express-as 包裹（如果有）
  if (expressAs) {
    body = `<mstts:express-as style="${expressAs.style}" styledegree="${expressAs.styledegree}">${body}</mstts:express-as>`;
  }

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="${xmlLang}"><voice name="${voiceName}">${body}</voice></speak>`;
}
```

### 3.5 轉換步驟（實作順序）

1. **建立 Azure 資源**（使用者操作，約 10 分鐘）
2. **更新 `.env.local`** — 加入 `AZURE_SPEECH_KEY` 和 `AZURE_SPEECH_REGION`
3. **重寫 `src/app/api/tts/route.ts`** — 移除 Google SDK，改用 Azure REST
4. **移除 Google 依賴** — `npm uninstall @google-cloud/text-to-speech`，刪除 `gcp-sa-key.json`
5. **測試** — 中文/英文 + 男/女聲 + 各 preset + break 停頓
6. **部署**

### 3.6 前端不需改動的原因

- `/api/tts` 的 request body 結構不變
- Response 仍然是 `{ audio: base64, format: 'mp3' }`
- `audio-mixer.ts` 接收的是 `Blob`（`audio/mp3`），Azure 同樣輸出 MP3
- `voices/page.tsx` 的 `handlePreview` 呼叫方式完全相同

---

## 4. 風險評估

### 4.1 音質差異

| 面向 | 風險等級 | 說明 |
|------|---------|------|
| zh-TW 女聲 | 中 | Azure `HsiaoChenNeural` 自然度與 Google `cmn-TW-Standard-A` 相當或略優，但音色不同，用戶會感知差異 |
| zh-TW 男聲 | 中 | Azure `YunJheNeural` 品質良好，但腔調略有不同 |
| en-US 語音 | 低 | Azure `JennyNeural` / `GuyNeural` 品質成熟，與 Google Neural2 相當 |
| 風格/情緒 | 正面 | Azure 獨有優勢，Google 完全沒有對應功能 |

**緩解措施**: 上線前進行 A/B 音質比較測試，確認可接受度。

### 4.2 延遲差異

| 指標 | Google TTS | Azure TTS | 備註 |
|------|-----------|-----------|------|
| 首次回應 (TTFB) | 200-500ms | 200-600ms | 接近 |
| 完整回應 (短句) | 500-1500ms | 500-1500ms | 接近 |
| 完整回應 (長篇) | 2-5s | 2-5s | 接近 |

Azure 在 `eastasia` region 部署時，對台灣用戶延遲約 20-50ms。建議選擇 `eastasia` 或 `southeastasia` region。

### 4.3 音檔格式相容性

| 項目 | 狀態 | 說明 |
|------|------|------|
| 輸出 MP3 | 相容 | Azure 支援 `audio-16khz-128kbitrate-mono-mp3` 等格式 |
| Base64 編碼 | 相容 | Azure REST 回傳 binary，轉 base64 邏輯相同 |
| audio-mixer 接收 | 相容 | `Blob({ type: 'audio/mp3' })` 不變 |
| 前端播放 | 相容 | MP3 格式，`new Audio(url)` 不變 |

**Azure 輸出格式選項** (建議使用):
- `audio-16khz-128kbitrate-mono-mp3` — 品質與現有 Google 輸出相近
- `audio-24khz-160kbitrate-mono-mp3` — 較高品質，檔案略大
- `audio-48khz-192kbitrate-mono-mp3` — 最高品質

### 4.4 SSML 相容性

| SSML 元素 | 現有使用 | Azure 支援 | 注意事項 |
|-----------|---------|-----------|---------|
| `<speak>` | 有 | 有 | Azure 要求 `version` + `xmlns` 屬性，**需修改** |
| `<break time="Xs"/>` | 有 | 有 | Azure 偏好毫秒格式 `<break time="800ms"/>`，秒格式 `<break time="0.8s"/>` 也支援 |
| `<prosody>` | 無 (用 API 參數) | 有 | 改用 SSML 內嵌 |
| `<voice>` | 無 | **必須** | Azure 要求用 `<voice name="...">` 包裹內容 |

**結論**: 現有 `scriptToSsml()` 的 `<break>` 語法可以直接沿用，但整體 SSML 結構需要調整（加外層標籤）。這是 route 內部的改動，不影響前端。

### 4.5 停機時間

**零停機方案**:
1. 先寫好 Azure 版 route（可用一個新的臨時 route `/api/tts-azure` 測試）
2. 測試通過後，一次性替換 `/api/tts/route.ts`
3. 部署是原子操作（Vercel / Next.js 部署是 immutable deployment）

### 4.6 Rollback 方案

```
# 快速回滾步驟:
1. git revert <azure-migration-commit>
2. 還原 .env.local 中的 Google 金鑰
3. npm install @google-cloud/text-to-speech
4. 重新部署
```

建議在切換前將 Google 版 route 備份為 `route.ts.google-backup`，或使用 git tag 標記切換點。

如果採用「雙引擎共存」方案（見第 6 節），rollback 只需改一個環境變數。

---

## 5. 前置作業清單

### 5.1 Azure 帳號與資源建立

| 步驟 | 操作 | 預估時間 |
|------|------|---------|
| 1 | 前往 [Azure Portal](https://portal.azure.com) 註冊或登入 | 5 分鐘 |
| 2 | 建立 Resource Group（例: `rg-vocalcanvas`） | 2 分鐘 |
| 3 | 建立 Speech Service 資源（搜尋 "Speech"） | 3 分鐘 |
| 4 | 選擇 Pricing Tier: **F0 (Free)** — 50 萬字元/月免費 | — |
| 5 | 選擇 Region: **East Asia** (香港，對台灣延遲最低) | — |
| 6 | 建立完成後，到 Keys and Endpoint 頁面複製 Key 1 | 1 分鐘 |

### 5.2 需要取得的值

| 值 | 來源 | 用途 |
|---|------|------|
| `AZURE_SPEECH_KEY` | Azure Portal > Speech 資源 > Keys and Endpoint > Key 1 | API 認證 |
| `AZURE_SPEECH_REGION` | 建立時選擇的 region，例如 `eastasia` | API endpoint |

### 5.3 環境變數設定

在 `.env.local` 中新增:
```env
# Azure Speech Service
AZURE_SPEECH_KEY=your-key-here
AZURE_SPEECH_REGION=eastasia

# (可移除，或保留作為 fallback)
# GOOGLE_APPLICATION_CREDENTIALS=./gcp-sa-key.json
```

### 5.4 依賴變更

```bash
# 移除 Google TTS SDK
npm uninstall @google-cloud/text-to-speech

# Azure REST API 不需要額外 SDK
# (如果選擇 SDK 方案才需要: npm install microsoft-cognitiveservices-speech-sdk)
```

---

## 6. 雙引擎共存評估

### 6.1 建議: 是，保留雙引擎

**理由**:
1. **降低切換風險** — 如果 Azure 在某些場景表現不佳，可即時切回 Google
2. **A/B 測試** — 可讓部分用戶使用 Azure，比較滿意度
3. **供應商鎖定避免** — 不完全依賴單一供應商
4. **實作成本低** — 只需在 route 中加入一層 adapter

### 6.2 雙引擎架構設計

```
src/
  lib/
    tts/
      types.ts          # 共用介面定義
      google-adapter.ts  # Google TTS 實作
      azure-adapter.ts   # Azure TTS 實作
      index.ts           # Factory: 根據 env var 選擇引擎
  app/
    api/
      tts/
        route.ts         # 呼叫 tts/index.ts，不關心底層引擎
```

**核心介面**:
```typescript
// src/lib/tts/types.ts
export interface TtsAdapter {
  synthesize(params: {
    ssmlBody: string;          // 純文字+break 的 SSML 片段
    voiceName: string;
    lang: string;
    prosody: { rate: string; pitch: string; volume?: string };
    expressAs?: { style: string; styledegree: number };
  }): Promise<Buffer>;         // MP3 binary
}
```

**引擎選擇**:
```typescript
// src/lib/tts/index.ts
import { TtsAdapter } from './types';

export function getTtsAdapter(): TtsAdapter {
  const engine = process.env.TTS_ENGINE || 'azure'; // 'azure' | 'google'
  if (engine === 'google') {
    return new GoogleTtsAdapter();
  }
  return new AzureTtsAdapter();
}
```

**切換方式**: 只需在 `.env.local` 設定 `TTS_ENGINE=google` 或 `TTS_ENGINE=azure`。

### 6.3 雙引擎的額外成本

| 項目 | 成本 |
|------|------|
| 額外程式碼 | 約 150 行 (adapter + factory) |
| 維護負擔 | 低 — 兩個 adapter 互相獨立 |
| 依賴管理 | 需保留 `@google-cloud/text-to-speech`（如果要保留 Google） |
| 測試 | 需各引擎各跑一次 |

### 6.4 建議實作路線

- **Phase 1**: 先實作雙引擎架構 + Azure adapter，`TTS_ENGINE=azure` 為預設
- **Phase 2**: 觀察 1-2 週，確認 Azure 穩定後，移除 Google adapter 和 SDK（可選）

---

## 7. 成本估算

### 7.1 使用量假設

| 假設 | 值 |
|------|---|
| 每次合成平均字數 | 200 字元 |
| 每個用戶每月平均合成次數 | 10 次 |
| 每用戶每月字元數 | 2,000 字元 |

### 7.2 月成本估算

| 用戶數 | 月字元量 | Google Neural ($16/1M) | Azure Neural ($16/1M) | Azure F0 免費額度內？ |
|--------|---------|----------------------|---------------------|--------------------|
| 50 | 10 萬 | $1.60 | $1.60 | 是 (50 萬內免費) |
| 200 | 40 萬 | $6.40 | $6.40 | 是 (50 萬內免費) |
| 1,000 | 200 萬 | $32.00 | $32.00 | 否 (超出 150 萬，約 $24) |

**重點**:
- 50-200 用戶規模: Azure F0 完全免費，Google 需要付費（除非在免費試用期內）
- 1,000 用戶規模: 兩者單價相同，月成本約 $24-32
- Azure F0 tier 的 50 萬字元永久免費額度在早期階段是明顯優勢

### 7.3 隱性成本

| 項目 | Google | Azure |
|------|--------|-------|
| SDK 體積 | ~15MB | 0 (REST) 或 ~30MB (SDK) |
| 金鑰管理 | Service Account JSON | 單一 API Key |
| 冷啟動影響 | 中 (SDK 初始化) | 低 (REST 無狀態) |

---

## 附錄 A: 決策摘要

| 決策項目 | 建議 | 信心度 |
|---------|------|-------|
| 是否遷移到 Azure | 是 | 高 — 功能更豐富 (情緒/風格)，成本相近 |
| 呼叫方式 | REST API (不用 SDK) | 高 — 零依賴、體積小、Edge 相容 |
| 是否保留 Google fallback | 是 (Phase 1)，後續可選擇移除 | 中 — 降低風險但增加維護 |
| 前端是否需要改動 | Phase 1 不需要 | 高 — API 契約不變 |
| 是否新增情緒滑桿 | Phase 2 再做 | 高 — 先穩定基礎切換 |
| Azure Region | East Asia (eastasia) | 高 — 對台灣延遲最低 |
| Pricing Tier | F0 (Free) 起步 | 高 — 50 萬字元/月免費 |

## 附錄 B: 影響檔案總覽

### 必須修改
- `/workspaces/VocalCanvas/src/app/api/tts/route.ts` — 核心改動：重寫 TTS 呼叫邏輯
- `/workspaces/VocalCanvas/package.json` — 移除 Google SDK 依賴
- `/workspaces/VocalCanvas/.env.local` — 新增 Azure 金鑰，移除/保留 Google 金鑰

### 建議新增（雙引擎架構）
- `/workspaces/VocalCanvas/src/lib/tts/types.ts` — TTS adapter 介面定義
- `/workspaces/VocalCanvas/src/lib/tts/azure-adapter.ts` — Azure TTS 實作
- `/workspaces/VocalCanvas/src/lib/tts/google-adapter.ts` — Google TTS 實作 (從現有 route 抽出)
- `/workspaces/VocalCanvas/src/lib/tts/index.ts` — Factory，根據環境變數選擇引擎

### 不需修改
- `/workspaces/VocalCanvas/src/app/(app)/new/page.tsx` — API 契約不變
- `/workspaces/VocalCanvas/src/app/(app)/voices/page.tsx` — API 契約不變
- `/workspaces/VocalCanvas/src/lib/audio-mixer.ts` — 接收 Blob 格式不變
