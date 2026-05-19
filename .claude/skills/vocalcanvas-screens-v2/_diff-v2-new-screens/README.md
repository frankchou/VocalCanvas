# Diff v2 — 新增六個畫面

這個 zip 只包含**這次新增 / 修改**過的檔案，請直接覆蓋（merge）到原本的 `vocalcanvas-design/` 資料夾上。

## 📦 包含的檔案

### 🌐 行銷端（全新檔案）
- `ui_kits/vocalcanvas-marketing/signup.html` — 註冊頁
- `ui_kits/vocalcanvas-marketing/forgot.html` — 忘記密碼
- `ui_kits/vocalcanvas-marketing/404.html` — 404 錯誤頁

### 📱 App 端（全新元件）
- `ui_kits/vocalcanvas-app/components/SettingsScreen.jsx` — Settings 完整版
- `ui_kits/vocalcanvas-app/components/AccountScreen.jsx` — Account / 個人資料
- `ui_kits/vocalcanvas-app/components/OnboardingScreen.jsx` — 首次引導 Modal

### ⚠️ App 端（修改 — 會覆蓋舊版）
- `ui_kits/vocalcanvas-app/index.html` — 加入新元件 import + 路由
- `ui_kits/vocalcanvas-app/components/AppShell.jsx` — 側邊欄頭像可點擊進 Account

## 🚀 在 codespaces 解壓的步驟

```bash
# 假設 zip 上傳到 codespaces 工作區
unzip _diff-v2-new-screens.zip
# 用 rsync 把差異檔合併進原本的 skill 資料夾（會覆蓋同名檔）
rsync -av _diff-v2-new-screens/ .claude/skills/vocalcanvas-design/
# 確認檢查 git diff
git status
git add .claude/skills/vocalcanvas-design
git commit -m "Add 6 new screens: signup, forgot, 404, settings, account, onboarding"
```

或者直接拖拉：解壓後的 `ui_kits/` 資料夾整個拖進 `.claude/skills/vocalcanvas-design/`，VS Code / Finder 會問你要不要 merge — 選 merge 即可。
