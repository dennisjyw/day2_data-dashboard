# AGENTS.md

本檔案只定義 Agent 操作本 codebase 的方法。技術棧、產品範圍與公開資料限制請先讀 [`README.md`](README.md)。

## 開始工作

1. 先讀 `README.md` 與本檔案。
2. 依任務讀取最小必要文件：
   - 資料、指標或圖表：[`data/data_dictionary.md`](data/data_dictionary.md)
   - Dashboard 定義：[`templates/dashboard-brief.md`](templates/dashboard-brief.md)
   - 部署或公開檢查：[`templates/predeploy-check.md`](templates/predeploy-check.md)、`.env.example`、`.gitignore`
   - 練習任務：[`prompts/README.md`](prompts/README.md) 與對應的 `prompts/EXERCISE_*.md`
3. 修改前先檢查現有檔案、`package.json`、可用 scripts 與相關設定；保留不相關的既有變更。

## 修改流程

- 先說明目標檔案、範圍與驗收方式，再做最小必要修改。
- 沿用現有結構與依賴；新增套件或改變資料格式前，先確認需求與影響範圍。
- 資料欄位、指標口徑與資料限制以 `data/data_dictionary.md` 為準，不自行補值、改名或捏造欄位。
- 需求若超出 `README.md` 的專案限制，或需要新增外部服務，先停下並回報。
- 使用者可見文字與專案文件使用繁體中文（台灣）；程式碼命名沿用既有風格。

## 執行與驗證

```bash
npm install
npm run dev
npm run build
npm run preview
```

- `npm run dev` 用於本機手動確認畫面與互動；完成後停止開發伺服器。
- `npm run build` 用於程式修改後的基本驗證。
- 文件或設定修改不需要啟動伺服器時，至少檢查 Markdown 連結、路徑與指令是否仍存在。
- 有 Git metadata 時，交付前執行 `git diff --check`，並確認 diff 只包含本次任務範圍。
- 部署前必須完成 [`templates/predeploy-check.md`](templates/predeploy-check.md)；不要跳過公開資料與秘密檢查。

## 交付

完成後回報：

1. 修改了哪些檔案，以及每個檔案的目的。
2. 執行過哪些驗證指令與結果。
3. 尚未處理的問題、風險或需要使用者決定的事項。
