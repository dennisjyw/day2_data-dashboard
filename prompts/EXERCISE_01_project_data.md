# 練習 1：建立專案與驗證資料

## 目的

建立一個可以啟動、可以讀取合成 CSV 的最小前端 prototype，先確認資料來源與技術棧正確，再進入儀表板設計。本練習不追求複雜 UI；完成後，學員應能在瀏覽器看到實際載入的資料列數、欄位名稱與基本資料表，並清楚知道頁面使用的是合成資料。

## 操作步驟

1. 開啟 Codex Desktop，選取本專案資料夾，先讓 AI 讀取 `README.md` 與 `AGENTS.md`。
2. 貼上「提示詞 1」，建立最小可啟動專案並載入 CSV。
3. 若 AI 使用了錯誤的框架或檔案格式，貼上「提示詞 2」修正。
4. 執行 `npm run dev`，開啟終端機顯示的本機網址，確認資料與欄位可見。
5. 若開發伺服器沒有啟動，貼上「提示詞 3」並附上最後 10 行錯誤訊息。

## 提示詞 1：建立最小專案與載入資料

```text
請先閱讀 README.md 與 AGENTS.md，並把這兩份文件當成目前專案的最高優先規則；資料欄位與計算限制請再參考 data/data_dictionary.md。

請在目前專案建立一個最小、可啟動的校務註冊率資料儀表板 prototype，先完成資料載入與驗證，不要先做複雜 UI。

需求：
1. 使用 React 19 + Vite。
2. 所有前端原始碼、React 元件與 Vite 設定使用 TypeScript（`.ts` / `.tsx`），不要使用 JavaScript、Next.js 或其他前端框架。
3. 使用 Tailwind CSS 4 的 CSS-first 設定與 shadcn/ui；元件沿用 Radix UI primitives，icon 使用 `lucide-react`（確實需要時再加入）。
4. 使用 `papaparse` 在瀏覽器端解析 `data/ir_registration_synthetic.csv`。CSV 不得搬到 `public/`；請依目前專案結構使用 TypeScript module import 或可由 Vite 支援的載入方式。
5. 畫面至少顯示：合成資料 prototype 標示、實際載入資料列數、欄位名稱，以及可閱讀的資料表或等價的資料預覽。
6. 依 data/data_dictionary.md 的欄位對應與資料限制處理資料，不要改名、補值、捏造日期或新增不存在的欄位。
7. 這是純前端展示型 prototype，不要加入正式後端、API、資料庫、ORM、登入或權限系統，也不要加入真實校務資料、個資、API key、密碼、token 或 mapping table。
8. 修改前先檢查目前檔案與設定，遵守 AGENTS.md 的操作流程，保留與本練習無關的既有變更。

完成後請：
- 說明修改了哪些檔案，以及每個檔案的用途。
- 執行適用的 npm 安裝與驗證指令，至少確認 `npm run dev` 可以啟動；若已有 build script，也執行 `npm run build`。
- 告訴我如何在瀏覽器確認資料列數、欄位名稱與合成資料標示。
```

## 提示詞 2：修正錯誤技術棧

```text
請再次依 README.md 的「技術棧」與 AGENTS.md 的操作規則檢查目前程式碼，先列出不一致處，再修正必要檔案。

必須符合：
- React 19 + Vite，而不是 Next.js 或其他框架。
- TypeScript；將前端原始碼、React 元件與 Vite 設定維持為 `.ts` / `.tsx`。
- Tailwind CSS 4、shadcn/ui、Radix UI primitives、`lucide-react` 與 `papaparse`。
- `data/ir_registration_synthetic.csv` 只使用合成資料，且不搬到 `public/`。
- 不新增後端、API、資料庫、ORM、登入、權限或真實資料。

請不要以重新建立整個專案的方式覆蓋不相關內容。完成後告訴我修改了哪些檔案，並執行適用的 build 或啟動驗證。
```

## 提示詞 3：排除開發伺服器啟動問題

```text
執行 `npm run dev` 後沒有出現本機網址。以下是終端機最後 10 行錯誤訊息：
[貼上錯誤訊息]

請先依 README.md 與 AGENTS.md 判斷問題原因，再用目前專案既有的 npm scripts 與技術棧排除問題。

請：
1. 說明錯誤屬於依賴、設定、TypeScript、CSV 載入或其他哪一類。
2. 只修改排除問題所需的檔案，不要改用 Next.js、JavaScript 或新增後端服務。
3. 修正後重新執行適用的指令，告訴我應該在瀏覽器驗證哪些結果。
```

## 驗收標準

- [ ] `npm run dev` 可以啟動並開啟本機頁面。
- [ ] 畫面顯示實際載入的資料列數、欄位名稱與資料預覽。
- [ ] 畫面明確標示「合成資料 prototype」。
- [ ] 使用 TypeScript、React 19、Vite、Tailwind CSS 4、shadcn/ui 與 README.md 定義的其他套件。
- [ ] CSV 沒有被放入 `public/`，也沒有加入真實資料或敏感資訊。
- [ ] 沒有建立 README.md 與專案限制禁止的後端、API、資料庫、登入或權限功能。
