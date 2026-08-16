# Prompts 索引

## 用途

本目錄提供六個循序漸進的 Dashboard 練習提示詞。每個練習檔都依「目的 → 操作流程 → 提示詞區塊 → 驗收標準」排列，開啟檔案後可直接先理解練習目標，再複製需要的提示詞。

## 讀取順序

開始任何練習前，先讀取：

1. `README.md`：技術棧、專案範圍、資料限制與啟動方式。
2. `AGENTS.md`：Agent 操作流程、修改原則與驗證方式。
3. `data/data_dictionary.md`：資料欄位、資料粒度與指標口徑。
4. 對應的 `EXERCISE_*.md`：依練習順序操作。

README.md 與 AGENTS.md 是主要規範；資料、指標與部署細節再依 AGENTS.md 指定的資料字典與模板確認。若提示詞與專案文件不一致，以專案文件為準，不要自行新增外部服務或改變資料邊界。

## 六個練習

| 練習 | 重點 | 主要產出 |
|---|---|---|
| `EXERCISE_01_project_data.md` | 建立 React 19 + Vite + TypeScript 專案並載入合成 CSV | 可啟動的前端 prototype |
| `EXERCISE_02_dashboard_brief.md` | 定義使用者、決策、核心問題與資料限制 | `dashboard-brief.md` |
| `EXERCISE_03_quantitative_indicators.md` | 建立量化指標與兩種 `recharts` 圖表 | 3–5 個指標與圖表 |
| `EXERCISE_04_filter_drilldown.md` | 加入同步篩選、清除篩選與選做下鑽 | 學年度與第二維度篩選 |
| `EXERCISE_05_ui_iteration.md` | 改善資訊層級、狀態處理與手機版體驗 | UI 改善與視覺誠實檢查 |
| `EXERCISE_06_deploy_check.md` | 完成 build、公開前檢查與部署驗證 | 公開網址與完成的 `predeploy-check.md` |

## 主線規則

- 只使用合成資料；不放入真實校務資料、個資、mapping table、API key、密碼或 token。
- CSV 不得放入 `public/`；依 README.md 與現有專案結構載入。
- 這是純前端展示型 prototype，不實作正式後端、API、資料庫、ORM、登入或權限系統。
- 儀表板只描述資料觀察與待驗證假設，不進行因果推論，也不把相關性寫成因果性。
- 沒有匯出功能時，公開前檢查表將匯出項目標記為 `N/A`。
- 每個練習結束時，逐條對照該檔案的驗收標準。

## 課堂資產

- `README.md`：技術棧、專案範圍與啟動方式。
- `AGENTS.md`：Agent 操作流程與驗證規則。
- `data/ir_registration_synthetic.csv`：合成校務彙總資料；列數以檔案實際內容為準。
- `data/data_dictionary.md`：欄位定義、資料粒度與建議指標。
- `templates/dashboard-brief.md`：Dashboard Brief 範本。
- `templates/predeploy-check.md`：部署前檢查表。
- `prompts/`：六個練習檔與本索引。
