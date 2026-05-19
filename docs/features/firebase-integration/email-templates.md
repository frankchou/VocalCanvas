# Firebase Authentication Email Templates

> 設計日期：2026-05-19 · 設計者：Copywriter Agent

---

## 設計原則

- 語氣：溫暖、親切、專業，像一位「有能力的錄音室助手」。
- 不使用驚嘆號（產品介面準則）。
- 不使用 emoji（產品介面準則）。
- 開頭稱呼使用者名稱，結尾署名團隊。
- 每封信底部附安全提示。
- 中英文各一版，中文為主要版本。

---

## 1. Email 驗證信（Email Verification）

### 中文版

**主旨：** 驗證你的 VocalCanvas 帳號

**內文：**

```
%DISPLAY_NAME%，你好

感謝你加入 VocalCanvas。

請點擊下方連結完成 Email 驗證，開始把文字變成聲音：

%LINK%

這個連結將在一段時間後失效，請盡快完成驗證。

如果你沒有註冊 %APP_NAME% 帳號，請忽略這封信，不需要任何操作。

VocalCanvas 團隊
```

### English Version

**Subject:** Verify your VocalCanvas account

**Body:**

```
Hi %DISPLAY_NAME%,

Thanks for joining VocalCanvas.

Click the link below to verify your email and start giving your words a voice:

%LINK%

This link will expire after a while — please verify soon.

If you didn't create a %APP_NAME% account, you can safely ignore this email.

VocalCanvas Team
```

---

## 2. 忘記密碼信（Password Reset）

### 中文版

**主旨：** 重設你的 VocalCanvas 密碼

**內文：**

```
%DISPLAY_NAME%，你好

我們收到了重設密碼的請求。

點擊下方連結設定新密碼：

%LINK%

這個連結將在一段時間後失效。如果連結過期，請重新申請一次。

如果你沒有要求重設密碼，請忽略這封信，你的帳號密碼不會被變更。

VocalCanvas 團隊
```

### English Version

**Subject:** Reset your VocalCanvas password

**Body:**

```
Hi %DISPLAY_NAME%,

We received a request to reset your password.

Click the link below to set a new password:

%LINK%

This link will expire after a while. If it has expired, please request a new one.

If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.

VocalCanvas Team
```

---

## 3. Email 變更確認信（Email Address Change）

### 中文版

**主旨：** 確認你的 VocalCanvas 新 Email 地址

**內文：**

```
%DISPLAY_NAME%，你好

你申請將 VocalCanvas 帳號的 Email 變更為 %EMAIL%。

請點擊下方連結確認這個變更：

%LINK%

如果你沒有提出這項變更，請立即登入帳號檢查設定，或聯繫我們的支援團隊。

VocalCanvas 團隊
```

### English Version

**Subject:** Confirm your new VocalCanvas email address

**Body:**

```
Hi %DISPLAY_NAME%,

You requested to change your VocalCanvas account email to %EMAIL%.

Click the link below to confirm this change:

%LINK%

If you didn't request this change, please sign in to your account to review your settings or contact our support team immediately.

VocalCanvas Team
```

---

## Firebase Console 設定備註

- **Sender name**：`VocalCanvas`
- **Reply-to**：設定為產品支援信箱（如 `support@vocalcanvas.app`）
- Firebase 預設模板只支援基本 HTML。上方文案以純文字撰寫，貼入 Firebase Console 時可直接使用。
- 若日後需要品牌化 HTML 模板（含 logo、品牌色），建議改用 Firebase Extensions 或自建 Cloud Function 搭配 SendGrid / Mailgun 發送。
- `%APP_NAME%` 在 Firebase Console > Authentication > Templates 的「Template language」區段設定，建議填入 `VocalCanvas`。
