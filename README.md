# 資料視覺化與儀表板製作

以 React 19 建立的校務註冊率資料儀表板 prototype，從合成招生資料呈現註冊率的結果、趨勢、診斷與待驗證假設，以及後續行動與追蹤方向。

## 技術棧

本節定義本專案的技術棧；Agent 的 codebase 操作流程請讀 [`AGENTS.md`](AGENTS.md)：

- React 19 + Vite：前端框架與建置工具。
- TypeScript：所有前端原始碼、React 元件與 Vite 設定使用 `.ts` / `.tsx`，不使用 JavaScript。
- Tailwind CSS 4：使用 CSS-first 設定與專案 design tokens。
- shadcn/ui：透過 `components.json` 管理元件設定，搭配 Radix UI primitives 與 `lucide-react` icons。
- recharts：資料視覺化圖表。
- papaparse：瀏覽器端 CSV 解析。
- Node.js 20 LTS：本機執行環境。

## 功能範圍

- 以註冊率下降的校務問題作為分析情境。
- 依序呈現結果、趨勢、診斷與待驗證假設、行動與追蹤四層資訊。
- 以量化指標、年度趨勢圖、類別比較圖與篩選互動支援資料探索。
- 以清楚的分子、分母、期間與比較基準說明指標口徑。

## 資料

- 主要資料：[`data/ir_registration_synthetic.csv`](data/ir_registration_synthetic.csv)
- 欄位定義：[`data/data_dictionary.md`](data/data_dictionary.md)
- 所有資料皆為合成的學年度、系所與招生管道彙總資料。
- CSV 不得放入 `public/`；前端應透過 TypeScript 模組 `import` 或 `fetch` 載入。
- 不得加入真實校務資料、個資、API key、密碼、token 或 mapping table。

## 開始使用

### 需求

- Node.js 20 LTS
- npm 或其他相容的 Node.js 套件管理工具

### 安裝與啟動

```bash
npm install
npm run dev
```

啟動後依終端機顯示的網址開啟瀏覽器。

### 建置與預覽

```bash
npm run build
npm run preview
```

## 專案結構

```text
.
├── data/          # 合成資料與資料字典
├── extensions/    # 延伸設計與系統邊界說明
├── prompts/       # 操作 Prompt 與驗收標準
├── templates/     # Dashboard Brief 與部署前檢查表
├── AGENTS.md      # Agent 操作流程與交付規則
└── package.json   # 套件與 npm scripts
```

## 部署

- 部署平台：Vercel。
- 部署前請依 [`templates/predeploy-check.md`](templates/predeploy-check.md) 完成檢查。
- 公開網址必須明確標示這是合成資料 prototype。

## 專案限制

這是純前端展示型 prototype，不實作正式後端、API、資料庫、ORM、登入或權限系統。儀表板只描述資料觀察與待驗證假設，不進行因果推論，也不把相關性寫成因果性。
