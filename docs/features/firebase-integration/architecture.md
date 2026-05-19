# Firebase Integration Architecture

> 設計日期：2026-05-19 · 設計者：Architect Agent

---

## 1. SDK 初始化

| 檔案 | 用途 | 環境 |
|------|------|------|
| `src/lib/firebase.ts` | Client SDK（Auth / Firestore / Storage） | 瀏覽器 |
| `src/lib/firebase-admin.ts` | Admin SDK（TTS API route / custom operations） | Node.js API routes |

兩者皆使用 `getApps()` singleton guard，避免 Next.js hot-reload 重複初始化。

---

## 2. Firestore Schema

```
users/{uid}
├── name: string
├── email: string
├── avatarUrl: string | null
├── plan: 'free' | 'pro'
├── createdAt: Timestamp
├── preferences: {
│   ├── lang: 'zh' | 'en'
│   ├── readingLang: 'zh-TW' | 'en-US' | 'ja-JP'
│   ├── outputFormat: 'mp3-240' | 'mp3-320' | 'wav-16'
│   ├── autoSave: boolean
│   ├── emailNotif: boolean
│   └── productNews: boolean
│ }
├── usage: {
│   ├── rendered: number (seconds)
│   ├── total: number (seconds, plan-based: free=1800, pro=14400)
│   ├── takes: number
│   ├── storage: string
│   └── resetAt: Timestamp
│ }
└── library/ (subcollection)
    └── {docId}
        ├── title: string
        ├── voice: string
        ├── duration: string
        ├── audioUrl: string (Firebase Storage path)
        ├── favorite: boolean
        ├── scenarioId: string
        ├── bgmTrack: string
        ├── createdAt: Timestamp
        └── script: ScriptNode[]
```

### Usage 欄位說明
- `rendered`：已使用秒數（每次 render 後累加）
- `total`：方案總額度（free = 1800 秒 = 30 分鐘，pro = 14400 秒 = 240 分鐘）
- `resetAt`：下次重置日期（每月 1 號）
- 顯示給使用者時轉換為分鐘（`Math.round(seconds / 60)`）

---

## 3. AuthContext 改寫方案

### 3.1 三態模型

```typescript
type AuthState = 'loading' | 'authenticated' | 'unauthenticated';
```

取代現有的 `user: User | null` 二態，解決頁面載入時的閃爍問題。

### 3.2 向後相容的 AppUser 型別

新的 `AppUser` 保持與現有 UI 元件（AppShell、LibraryPage、AccountPage）相容的欄位：

```typescript
interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar: string;          // 姓名首字（從 name 計算）
  avatarUrl: string | null; // Firebase Storage URL
  plan: string;             // 'Free' | 'Pro'（顯示用，首字大寫）
  usage: {
    rendered: number;       // 分鐘（從秒轉換）
    total: number;          // 分鐘
    takes: number;
    storage: string;
  };
  library: LibraryItem[];   // Phase 2 改為 Firestore subcollection
  emailVerified: boolean;
}
```

### 3.3 Auth 方法

| 方法 | Firebase API |
|------|-------------|
| Email 登入 | `signInWithEmailAndPassword` |
| Email 註冊 | `createUserWithEmailAndPassword` → 建立 `users/{uid}` 文件 → `sendEmailVerification` |
| Google 登入 | `signInWithPopup(new GoogleAuthProvider())` |
| 登出 | `signOut` |
| 忘記密碼 | `sendPasswordResetEmail` |
| 保持登入 | `setPersistence(browserLocalPersistence / browserSessionPersistence)` |

### 3.4 Auth Guard

`(app)/layout.tsx` 改為監聽 `onAuthStateChanged`：
- `loading` → 顯示 loading spinner
- `unauthenticated` → `router.replace('/login')`
- `authenticated` → render children

---

## 4. Security Rules

### Firestore
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /library/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

### Storage
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /audio/{uid}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /avatars/{uid}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /bgm/{allPaths=**} {
      allow read: if true;
    }
  }
}
```

---

## 5. 受影響檔案

### 新增
- `src/lib/firebase.ts` ✅ 已建立
- `src/lib/firebase-admin.ts` ✅ 已建立
- `firestore.rules`
- `storage.rules`

### 修改
- `src/contexts/AuthContext.tsx`（整個改寫）
- `src/app/(app)/layout.tsx`（Auth Guard 改用 onAuthStateChanged）
- `src/app/(marketing)/login/page.tsx`（串 Firebase Auth）
- `src/app/(marketing)/signup/page.tsx`（串 Firebase Auth）
- `src/app/(marketing)/forgot/page.tsx`（串 Firebase Auth）
- `src/components/app/AppShell.tsx`（讀取 Firestore user data）

---

## 6. 風險

| 風險 | 影響 | 緩解 |
|------|------|------|
| usage 欄位客戶端可寫 | 使用者可竄改使用量 | Phase 6 移至 Cloud Function server-side 累加 |
| 首次 Google 登入無 Firestore 文件 | 讀取 user data 失敗 | 登入時偵測文件不存在則自動建立 |
