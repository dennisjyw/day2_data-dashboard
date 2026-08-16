# 練習 6：部署與公開前檢查

## 目的

理解部署不只是按下發布按鈕，而是要先確認資料、程式碼、指標口徑、功能與公開性風險。本練習完成後，學員應能通過 `templates/predeploy-check.md` 的逐條檢查，使用 README.md 指定的部署方向取得公開網址，並確認公開頁面仍是安全、可理解的合成資料 prototype。

## 操作步驟

1. 先確認 Git、GitHub 與 Vercel 帳號符合課程環境需求。
2. 打開 `templates/predeploy-check.md`，逐條完成檢查並留下必要證據，不依賴固定的條目數量。
3. 執行 `npm run build` 與 `npm run preview`，確認 production build 可使用。
4. 依課程指定流程推送 GitHub、部署到 Vercel，完成公開前檢查。
5. 將部署網址與目前版本填回檢查表，並確認頁面明確標示「合成資料 prototype」。

## 提示詞 1：檢查 Git 忽略規則與目前狀態

```text
請先閱讀 README.md 與 AGENTS.md，再檢查 `.gitignore`、`.env.example` 與目前的 Git 狀態。請不要輸出任何秘密值。

請確認 `.gitignore` 正確排除：
- `.env`
- `.env.*`（但保留可提交的 `.env.example` placeholder）
- `node_modules/`
- `dist/`

請告訴我：
1. 目前 `.gitignore` 是否符合專案需求。
2. `git status` 是否有不應提交的檔案。
3. 若有問題，指出檔案與修正建議；不要刪除檔案、不要執行破壞性的 Git 指令，也不要自行加入新的外部服務。
```

## 提示詞 2：檢查前端 bundle 是否含敏感資訊

```text
請做一次唯讀檢查，搜尋目前前端原始碼與建置設定中是否出現：
- API key、密碼、token 或其他秘密字串。
- `.env` 變數被不當打包到前端。
- 真實校務資料、個資、mapping table 或可回推身分的識別碼。
- 不必要的外部 API 呼叫。

若發現問題，請只回報檔案與行號、問題類型、可能風險與修正方向，不要把完整秘密值貼回回覆。請記住本專案只能使用合成資料，且不實作後端、登入或權限系統；未經我確認前不要直接改檔。
```

## 提示詞 3：排除 Git push 失敗

```text
`git push` 失敗，錯誤訊息是：
[貼上錯誤訊息]

請依 README.md 與 AGENTS.md 判斷這是認證、權限、分支、遠端 URL 或其他問題，並給我下一步的最小安全指令。

請不要使用 `git reset --hard`、刪除遠端或覆寫歷史等破壞性操作；如果需要我先確認 repository 或帳號，請明確指出要確認的資訊。完成後也請提醒我如何再次檢查 `git status`。
```

## 提示詞 4：排除 Vercel build 失敗

```text
Vercel 部署失敗，build error 是：
[貼上錯誤訊息]

請依 README.md、AGENTS.md 與目前 package.json／Vite 設定檢查問題，優先確認：
- Node.js 是否使用 README.md 指定的 20 LTS。
- `npm run build` 是否能在本機重現同一錯誤。
- npm script、TypeScript、import 路徑、CSV 載入方式或 Vite 設定是否有問題。
- 是否不小心加入 Next.js、JavaScript 或 README.md 未指定的服務。

請先說明根因與最小修正方案，再修改必要檔案。修正後執行 `npm run build`，並告訴我如何用 `npm run preview` 驗證 production build。
```

## 驗收標準

- [ ] 公開網址可以在無痕視窗或未登入狀態開啟。
- [ ] `npm run build` 成功，並已用 `npm run preview` 檢查 production build。
- [ ] 手機版在約 375px 寬度下基本可用。
- [ ] 篩選後指標、圖表與明細仍正確，且與本機版一致。
- [ ] 沒有公開真實個資、mapping table、API key、密碼、token 或其他敏感資料。
- [ ] `.env` 與 `.env.*` 沒有提交，`.env.example` 只有 placeholder。
- [ ] 沒有不必要的外部 API 呼叫。
- [ ] `templates/predeploy-check.md` 已逐條完成並留下必要證據。
- [ ] 已記錄部署網址與目前版本。
- [ ] 頁面明確標示「合成資料 prototype」。
- [ ] 沒有把相關性寫成因果性，公開頁面只呈現觀察與待驗證假設。
