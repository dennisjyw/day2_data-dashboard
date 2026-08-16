import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  aggregateRecords,
  buildGroupComparison,
  buildTrend,
  calculatePercentagePointDifference,
  createRateSummary,
  filterRows,
  getAcademicYears,
  getLatestAcademicYear,
  type GroupComparison,
  type GroupDimension,
  type RateSummary,
  type TrendPoint,
} from "@/data/registration-metrics"
import { expectedColumns, registrationData, type RegistrationRecord } from "@/data/registration"

const allOption = "全部"
const defaultComparisonDimension: GroupDimension = "系所"

function formatCount(value: number | null) {
  return value === null ? "無法計算" : value.toLocaleString("zh-TW")
}

function formatRate(value: number | null) {
  return value === null ? "無法計算" : `${(value * 100).toFixed(1)}%`
}

function formatPoints(value: number | null) {
  if (value === null) {
    return "無法計算"
  }

  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(1)} 個百分點`
}

function formatCountChange(current: number | null, previous: number | null) {
  if (current === null || previous === null) {
    return "前一學年度無資料"
  }

  const difference = current - previous
  const sign = difference > 0 ? "+" : ""
  return `較前一學年度 ${sign}${difference.toLocaleString("zh-TW")} 人`
}

function formatRateComparison(label: string, value: number | null) {
  return `${label}：${formatPoints(value)}`
}

function needsManualReview(value: number | null) {
  return value !== null && Math.abs(value) >= 2
}

function formatValue(column: (typeof expectedColumns)[number], row: RegistrationRecord) {
  const value = row[column]
  if (value === null) {
    return "—"
  }
  return typeof value === "number" ? value.toLocaleString("zh-TW") : value
}

function getNumber(value: unknown) {
  return typeof value === "number" ? value : null
}

function getUniqueValues(rows: RegistrationRecord[], field: "系所") {
  return [...new Set(rows.map((row) => row[field]))].sort((a, b) => a.localeCompare(b, "zh-Hant"))
}

function formatAcademicYearRange(years: string[]) {
  if (years.length === 0) {
    return "無資料"
  }

  if (years.length === 1) {
    return `${years[0]} 學年度`
  }

  return `${years[0]}–${years.at(-1)} 學年度`
}

type FilterSelectProps = {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

type MetricCardProps = {
  title: string
  value: string
  detail: string
  comparison: string
  formula: string
  numerator: string
  denominator: string
  unit: string
  period: string
  baseline: string
  scope: string
}

function MetricCard({
  title,
  value,
  detail,
  comparison,
  formula,
  numerator,
  denominator,
  unit,
  period,
  baseline,
  scope,
}: MetricCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <CardDescription>{title}</CardDescription>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="shrink-0 rounded border border-dashed border-muted-foreground/60 px-1.5 py-0.5 text-[11px] text-muted-foreground transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring"
              >
                口徑
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[calc(100vw-2rem)] space-y-1.5 break-words leading-5 text-pretty">
              <p className="font-semibold">{title}</p>
              <p>公式：{formula}</p>
              <p>分子：{numerator}</p>
              <p>分母：{denominator}</p>
              <p>單位：{unit}</p>
              <p>期間：{period}</p>
              <p>群體：{scope}</p>
              <p>比較基準：{baseline}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <CardTitle className="font-mono text-3xl tracking-tight tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{detail}</p>
        <p className="leading-5">公式：{formula}</p>
        <p className="leading-5">期間：{period}；群體：{scope}</p>
        <p>{comparison}</p>
      </CardContent>
    </Card>
  )
}

type ChartTooltipProps = {
  active?: boolean
  payload?: ReadonlyArray<{ dataKey?: unknown; name?: unknown; value?: unknown; payload?: unknown }>
  label?: string | number
}

function TrendChartTooltip({ active, payload, label, scope }: ChartTooltipProps & { scope: string }) {
  if (!active || !payload?.length) {
    return null
  }

  const point = payload[0]?.payload as TrendPoint | undefined
  const academicYear = label == null ? "目前" : String(label)
  return (
    <div className="max-w-[calc(100vw-2rem)] break-words rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-foreground">{academicYear} 學年度</p>
      <p>錄取後註冊率：{formatRate(point?.registeredRate ?? null)}</p>
      <p>報到後註冊率：{formatRate(point?.reportedRate ?? null)}</p>
      <p className="mt-1 text-muted-foreground">
        註冊人數：{formatCount(point?.registered ?? null)} ／ 錄取人數：{formatCount(point?.admitted ?? null)} ／ 報到人數：
        {formatCount(point?.reported ?? null)}
      </p>
      <p className="mt-1 text-muted-foreground">錄取後：篩選後 SUM(registered) ÷ SUM(admitted)；報到後：篩選後 SUM(registered) ÷ SUM(reported)。</p>
      <p className="text-muted-foreground">期間：{academicYear} 學年度；群體：{scope}；不平均各列或各組比例。</p>
    </div>
  )
}

type GroupChartTooltipProps = ChartTooltipProps & { dimension: GroupDimension; academicYear: string; filterScope: string }

function GroupChartTooltip({ active, payload, label, dimension, academicYear, filterScope }: GroupChartTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  const point = payload[0]?.payload as GroupComparison | undefined
  return (
    <div className="max-w-[calc(100vw-2rem)] break-words rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-foreground">
        {dimension}：{label}
      </p>
      <p>錄取後註冊率：{formatRate(point?.rate ?? null)}</p>
      <p>註冊人數／招生名額：{formatCount(point?.registered ?? null)} ／ {formatCount(point?.admitted ?? null)}</p>
      <p>與目前篩選整體差距：{formatPoints(point?.gapFromOverall ?? null)}</p>
      <p className="mt-1 text-muted-foreground">公式：該群組先計算 SUM(registered) ÷ SUM(admitted)，不平均各列比例。</p>
      <p className="text-muted-foreground">期間：{academicYear || "目前選定"} 學年度；其他篩選：{filterScope}。</p>
    </div>
  )
}

function ChartStateMessage({ message }: { message: string }) {
  return <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">{message}</div>
}

type DataStatusCardProps = {
  status: "empty" | "error"
}

function DataStatusCard({ status }: DataStatusCardProps) {
  const isError = status === "error"

  return (
    <Card role={isError ? "alert" : "status"} aria-live={isError ? "assertive" : "polite"}>
      <CardHeader>
        <Badge variant="outline" className="w-fit border-primary/40 bg-primary/5 text-primary">
          合成資料 prototype
        </Badge>
        <CardTitle>{isError ? "資料載入失敗" : "目前篩選條件下沒有符合資料"}</CardTitle>
        <CardDescription>
          {isError ? "資料載入失敗，請重新整理或檢查資料來源。" : "請按「清除篩選」或選擇其他學年度／系所；不會產生替代數字。"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          本頁僅展示合成資料 prototype；目前不補值、不捏造資料，也不顯示無法由資料支持的替代數字。
        </p>
      </CardContent>
    </Card>
  )
}

function App() {
  const years = useMemo(() => getAcademicYears(registrationData.rows), [])
  const latestAcademicYear = useMemo(() => getLatestAcademicYear(registrationData.rows), [])
  const [academicYear, setAcademicYear] = useState(allOption)
  const [department, setDepartment] = useState(allOption)
  const [comparisonDimension, setComparisonDimension] = useState<GroupDimension>(defaultComparisonDimension)

  const departments = useMemo(() => getUniqueValues(registrationData.rows, "系所"), [])

  const filteredRows = useMemo(
    () => filterRows(registrationData.rows, { academicYear, department }),
    [academicYear, department],
  )
  const filteredYears = useMemo(() => getAcademicYears(filteredRows), [filteredRows])
  const metricYear = academicYear === allOption ? getLatestAcademicYear(filteredRows) ?? latestAcademicYear ?? "" : academicYear
  const selectedRows = useMemo(() => filterRows(filteredRows, { academicYear: metricYear }), [filteredRows, metricYear])
  const previousAcademicYear = metricYear ? String(Number(metricYear) - 1) : ""
  const previousRows = useMemo(() => filterRows(filteredRows, { academicYear: previousAcademicYear }), [filteredRows, previousAcademicYear])
  const historicalRows = useMemo(
    () => filteredRows.filter((row) => Number(row.學年度) < Number(metricYear)),
    [filteredRows, metricYear],
  )

  const selectedAggregate = useMemo(() => aggregateRecords(selectedRows), [selectedRows])
  const previousAggregate = useMemo(() => aggregateRecords(previousRows), [previousRows])
  const historicalAggregate = useMemo(() => aggregateRecords(historicalRows), [historicalRows])
  const registeredRate = useMemo(
    () => createRateSummary(selectedAggregate.registered, selectedAggregate.admitted),
    [selectedAggregate],
  )
  const reportedRate = useMemo(
    () => createRateSummary(selectedAggregate.registered, selectedAggregate.reported),
    [selectedAggregate],
  )
  const previousRegisteredRate = useMemo(
    () => createRateSummary(previousAggregate.registered, previousAggregate.admitted),
    [previousAggregate],
  )
  const previousReportedRate = useMemo(
    () => createRateSummary(previousAggregate.registered, previousAggregate.reported),
    [previousAggregate],
  )
  const historicalRegisteredRate = useMemo(
    () => createRateSummary(historicalAggregate.registered, historicalAggregate.admitted),
    [historicalAggregate],
  )
  const registrationRateChange = calculatePercentagePointDifference(registeredRate.value, previousRegisteredRate.value)
  const historicalRateChange = calculatePercentagePointDifference(registeredRate.value, historicalRegisteredRate.value)
  const reportedRateChange = calculatePercentagePointDifference(reportedRate.value, previousReportedRate.value)
  const leaveRate = useMemo(
    () => createRateSummary(selectedAggregate.leaveCount, selectedAggregate.registered),
    [selectedAggregate],
  )
  const previousLeaveRate = useMemo(
    () => createRateSummary(previousAggregate.leaveCount, previousAggregate.registered),
    [previousAggregate],
  )
  const trendData = useMemo(() => buildTrend(filteredRows, filteredYears), [filteredRows, filteredYears])
  const groupComparison = useMemo(
    () => buildGroupComparison(filteredRows, metricYear, comparisonDimension),
    [filteredRows, metricYear, comparisonDimension],
  )
  const hasErrors = registrationData.errors.length > 0
  const hasFilteredRows = filteredRows.length > 0
  const selectedPeriod = academicYear === allOption ? `資料中最新學年度（${metricYear || "無資料"}）` : `${metricYear || "目前選定期間"} 學年度`
  const historicalPeriod = metricYear && filteredYears.length > 0 && Number(metricYear) > Number(filteredYears[0])
    ? `${filteredYears[0]}–${Number(metricYear) - 1} 學年度`
    : "無歷史基準"
  const comparisonHeight = Math.max(340, groupComparison.length * 34 + 80)
  const hasGroupComparison = groupComparison.length > 1
  const comparisonTitle = `${metricYear || "目前選定"} 學年度各${comparisonDimension}錄取後註冊率（registered / admitted）`
  const resultHeading = academicYear === allOption ? "最新可用學年度的整體註冊率" : `${metricYear || "目前選定"} 學年度的整體註冊率`
  const metricScope = `系所 ${department}`
  const trendScope = department === allOption ? "所有系所" : `系所：${department}`
  const historicalBaselineNote = historicalRegisteredRate.value === null
    ? "目前沒有可用的歷史加權基準線。"
    : `灰色基準線為所選學年度以前（${historicalPeriod}）的加權基準，不含所選學年度。`
  const previewRows = filteredRows.slice(0, 12)
  const hasClearableState =
    academicYear !== allOption || department !== allOption || comparisonDimension !== defaultComparisonDimension

  function clearFilters() {
    setAcademicYear(allOption)
    setDepartment(allOption)
    setComparisonDimension(defaultComparisonDimension)
  }

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <header className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary">
                合成資料 prototype
              </Badge>
              <div>
                <p className="mb-2 text-sm font-medium tracking-[0.18em] text-primary uppercase">Registration dashboard</p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">校務註冊率資料儀表板</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                  以學年度與系所檢視註冊率差異；所有比例均先加總分子與分母，只描述資料觀察與待驗證假設。
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-sm">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">資料來源</p>
              <p className="mt-1 font-mono text-xs">data/ir_registration_synthetic.csv</p>
            </div>
          </header>

          <Card className="min-w-0">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <CardTitle>分析範圍</CardTitle>
                <CardDescription>
                  學年度與系所採 AND 組合；所有比例共同採用 SUM(分子) ÷ SUM(分母)，不平均各列或各組比例。
                </CardDescription>
              </div>
              <div className="flex flex-col items-start gap-1.5 sm:items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasClearableState}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  清除篩選
                </button>
                <p className="text-xs text-muted-foreground" aria-live="polite">
                  {hasClearableState ? "目前有作用中的篩選或圖表狀態" : "目前已是全部資料，沒有需要清除的篩選"}
                </p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FilterSelect label="學年度" value={academicYear} options={[allOption, ...years]} onChange={setAcademicYear} />
              <FilterSelect label="系所" value={department} options={[allOption, ...departments]} onChange={setDepartment} />
            </CardContent>
          </Card>

          {hasErrors ? (
            <DataStatusCard status="error" />
          ) : !hasFilteredRows ? (
            <DataStatusCard status="empty" />
          ) : (
            <>
          <section aria-labelledby="results-heading" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">結果</p>
                <h2 id="results-heading" className="text-xl font-semibold tracking-tight text-wrap-balance">{resultHeading}</h2>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground text-pretty">
                  先確認錄取後註冊率與報到後註冊率，再查看分子、分母與比較基準；錄取人數在本資料中代表合成招生名額。
                </p>
              </div>
              <Badge variant="secondary" className="w-fit whitespace-nowrap">
                {selectedPeriod}
              </Badge>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
            <MetricCard
              title="錄取後註冊率"
              value={formatRate(registeredRate.value)}
              detail={`註冊人數／招生名額：${formatCount(registeredRate.numerator)} ／ ${formatCount(registeredRate.denominator)}`}
              comparison={`${formatRateComparison("較前一學年度", registrationRateChange)}；${formatRateComparison("較歷史加權基準", historicalRateChange)}`}
              formula="篩選後 SUM(registered) ÷ SUM(admitted)，不平均各列或各組比例"
              numerator="註冊人數（registered）"
              denominator="錄取人數欄位所代表的合成招生名額（admitted）"
              unit="百分比"
              period={selectedPeriod}
              baseline={`前一學年度；${historicalPeriod} 加權基準`}
              scope={metricScope}
            />
            <MetricCard
              title="報到後註冊率"
              value={formatRate(reportedRate.value)}
              detail={`註冊人數／報到人數：${formatCount(reportedRate.numerator)} ／ ${formatCount(reportedRate.denominator)}`}
              comparison={formatRateComparison("較前一學年度", reportedRateChange)}
              formula="篩選後 SUM(registered) ÷ SUM(reported)，不平均各列或各組比例"
              numerator="註冊人數（registered）"
              denominator="報到人數（reported）"
              unit="百分比"
              period={selectedPeriod}
              baseline="前一學年度同口徑比例"
              scope={metricScope}
            />
            </div>

            <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-3">
              <p className="col-span-full text-xs leading-5 text-muted-foreground">
                三項人數皆為目前篩選後資料的 SUM；期間：{selectedPeriod}；群體：{metricScope}。人數指標不使用比例平均。
              </p>
              <div>
                <p className="text-xs text-muted-foreground">錄取人數（合成招生名額）</p>
                <p className="mt-1 font-mono text-xl font-semibold tabular-nums">{formatCount(selectedAggregate.admitted)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">報到人數</p>
                <p className="mt-1 font-mono text-xl font-semibold tabular-nums">{formatCount(selectedAggregate.reported)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">註冊人數</p>
                <p className="mt-1 font-mono text-xl font-semibold tabular-nums">{formatCount(selectedAggregate.registered)}</p>
              </div>
            </div>
          </section>

          <section aria-labelledby="secondary-heading" className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">補充脈絡</p>
              <h2 id="secondary-heading" className="text-lg font-semibold tracking-tight">
                年度變化與次要指標
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground text-pretty">
                這些數值用來定位需要人工查證的變化，不代表統計異常、原因或責任。
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              title="報名人數"
              value={formatCount(selectedAggregate.applicants)}
              detail="報名人數直接加總，單位：人"
              comparison={formatCountChange(selectedAggregate.applicants, previousAggregate.applicants)}
              formula="篩選後 SUM(報名人數)"
              numerator="報名人數（applicants）"
              denominator="不適用；這是人數指標"
              unit="人"
              period={selectedPeriod}
              baseline="前一學年度報名人數"
              scope={metricScope}
            />
            <MetricCard
              title="錄取後註冊率年度變化"
              value={formatPoints(registrationRateChange)}
              detail={`${selectedPeriod} 相較 ${previousAcademicYear || "前一學年度"}`}
              comparison={formatRateComparison("較歷史加權基準", historicalRateChange)}
              formula="本年度篩選後 SUM(registered) ÷ SUM(admitted) − 前一年度篩選後 SUM(registered) ÷ SUM(admitted)"
              numerator="兩個學年度各自加總註冊人數"
              denominator="兩個學年度各自加總合成招生名額"
              unit="百分點"
              period={`${previousAcademicYear || "前一學年度"} → ${selectedPeriod}`}
              baseline="前一學年度同口徑比例"
              scope={metricScope}
            />
            <MetricCard
              title="休學率"
              value={formatRate(leaveRate.value)}
              detail={`休學人數／註冊人數：${formatCount(leaveRate.numerator)} ／ ${formatCount(leaveRate.denominator)}`}
              comparison={formatRateComparison("較前一學年度", calculatePercentagePointDifference(leaveRate.value, previousLeaveRate.value))}
              formula="篩選後 SUM(leave_count) ÷ SUM(registered)，不平均各列或各組比例"
              numerator="休學人數（leave_count）"
              denominator="註冊人數（registered）"
              unit="百分比"
              period={selectedPeriod}
              baseline="前一學年度同口徑比例"
              scope={metricScope}
            />
            </div>
          </section>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>
                <h2 id="trend-heading" className="text-base font-semibold text-wrap-balance">
                  年度趨勢：錄取後註冊率與報到後註冊率（{formatAcademicYearRange(filteredYears)}）
                </h2>
              </CardTitle>
              <CardDescription>
                目前篩選範圍：學年度 {academicYear}／系所 {department}。各年度先加總原始人數再計算比例，不平均各列或各組比例；{historicalBaselineNote}折線只描述年度差異，不代表造成差異的原因。
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendData.length === 0 ? (
                <ChartStateMessage message="目前篩選條件下沒有符合資料。" />
              ) : trendData.length < 2 ? (
                <ChartStateMessage message="目前篩選範圍只有一個學年度，無法判斷年度趨勢；請清除學年度篩選或選擇全部。" />
              ) : (
                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 12, right: 20, left: 8, bottom: 8 }}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                      <XAxis dataKey="academicYear" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                      <YAxis
                        domain={[0, 1]}
                        tickFormatter={(value) => formatRate(getNumber(value))}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                        width={58}
                      />
                      <RechartsTooltip content={(props) => <TrendChartTooltip {...props} scope={trendScope} />} />
                      <Legend />
                      {historicalRegisteredRate.value !== null ? (
                        <ReferenceLine
                          y={historicalRegisteredRate.value}
                          stroke="var(--muted-foreground)"
                          strokeDasharray="5 5"
                          label={{ value: "前期加權基準", fill: "var(--muted-foreground)", position: "insideTopRight" }}
                        />
                      ) : null}
                      <Line type="monotone" dataKey="registeredRate" name="錄取後註冊率" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                      <Line type="monotone" dataKey="reportedRate" name="報到後註冊率" stroke="oklch(0.63 0.13 40)" strokeDasharray="6 4" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <CardTitle>
                    <h2 id="comparison-heading" className="text-base font-semibold text-wrap-balance">
                      {comparisonTitle}
                    </h2>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    目前篩選：學年度 {academicYear}／系所 {department}；依系所或招生管道定位差異群組。群組率與目前篩選整體率都由各自的總註冊人數 ÷ 總合成招生名額計算，標記只代表人工查證順序，不代表統計異常或原因。
                  </CardDescription>
                </div>
                <label className="flex w-full flex-col items-stretch gap-2 text-sm font-medium sm:w-auto sm:flex-row sm:items-center">
                  比較維度
                  <select
                    value={comparisonDimension}
                    onChange={(event) => setComparisonDimension(event.target.value as GroupDimension)}
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 sm:w-auto"
                  >
                    <option value="系所">系所</option>
                    <option value="招生管道">招生管道</option>
                  </select>
                </label>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {groupComparison.length === 0 ? (
                <ChartStateMessage message="目前篩選條件下沒有符合資料。" />
              ) : (
                <>
                  {hasGroupComparison ? (
                    <div style={{ height: comparisonHeight }} className="w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={groupComparison} layout="vertical" margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          domain={[0, 1]}
                          tickFormatter={(value) => formatRate(getNumber(value))}
                          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                        />
                        <YAxis
                          type="category"
                          dataKey="label"
                          width={128}
                          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                        />
                        <RechartsTooltip
                          content={(props) => (
                            <GroupChartTooltip
                              {...props}
                              dimension={comparisonDimension}
                              academicYear={metricYear}
                              filterScope={metricScope}
                            />
                          )}
                        />
                        {registeredRate.value !== null ? (
                          <ReferenceLine
                            x={registeredRate.value}
                            stroke="var(--muted-foreground)"
                            strokeDasharray="5 5"
                            label={{ value: "目前篩選整體", fill: "var(--muted-foreground)", position: "insideTopRight" }}
                          />
                        ) : null}
                        <Bar dataKey="rate" name="錄取後註冊率" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    </div>
                  ) : (
                    <ChartStateMessage message={`目前篩選條件下只有一個${comparisonDimension}，無法進行群組比較；下方表格仍保留該群組資料。`} />
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{comparisonDimension}</TableHead>
                        <TableHead>錄取後註冊率</TableHead>
                        <TableHead>註冊人數</TableHead>
                        <TableHead>合成招生名額</TableHead>
                        <TableHead>目前篩選整體差距</TableHead>
                        <TableHead>人工查證排序</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupComparison.map((group) => (
                        <TableRow key={group.label}>
                          <TableCell className="font-medium">{group.label}</TableCell>
                          <TableCell>{formatRate(group.rate)}</TableCell>
                          <TableCell>{formatCount(group.registered)}</TableCell>
                          <TableCell>{formatCount(group.admitted)}</TableCell>
                          <TableCell>{formatPoints(group.gapFromOverall)}</TableCell>
                          <TableCell>
                            {needsManualReview(group.gapFromOverall) ? (
                              <Badge variant="secondary">
                                需要人工查證
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">未達 2 個百分點</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2 id="follow-up-heading" className="text-base font-semibold">人工查證與追蹤</h2>
              </CardTitle>
              <CardDescription>
                從差異群組逐步回到資料列與背景資料；本 prototype 不保存備註、不分派責任，也不自動產生政策結論。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm leading-6 md:grid-cols-3">
              <div>
                <p className="font-medium text-foreground">1. 先核對口徑</p>
                <p className="mt-1 text-muted-foreground">確認篩選條件、資料列、分子與分母是否符合本次檢視範圍。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">2. 再補問背景</p>
                <p className="mt-1 text-muted-foreground">由校務研究承辦人邀請招生承辦或系所主管提供未納入的背景資料。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">3. 後續追蹤</p>
                <p className="mt-1 text-muted-foreground">以相同指標口徑比較後續學年度，檢視待驗證假設是否獲得新資料支持。</p>
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.35fr)]">
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle>
                  <h2 id="detail-heading" className="text-base font-semibold">資料明細（深入查看）</h2>
                </CardTitle>
                <CardDescription>
                  從目前篩選後的結果下鑽到前 12 列；完整篩選資料共 {filteredRows.length.toLocaleString("zh-TW")} 列。窄螢幕可在表格區域左右滑動查看完整欄位。
                </CardDescription>
              </CardHeader>
              <CardContent>
                {previewRows.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                    目前篩選條件下沒有符合資料。
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {registrationData.columns.map((column) => (
                          <TableHead key={column}>{column}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.map((row, rowIndex) => (
                        <TableRow key={`${row.學年度}-${row.系所}-${row.招生管道}-${rowIndex}`}>
                          {expectedColumns.map((column) => (
                            <TableCell key={column}>{formatValue(column, row)}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>資料邊界與驗證</CardTitle>
                <CardDescription>依 `data/data_dictionary.md` 保留目前定義。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-sm">
                <div className="rounded-lg border border-border bg-muted/30 p-3 leading-6 text-muted-foreground">
                  每列代表學年度 × 系所 × 招生管道的彙總，不是單一學生資料；本 prototype 不補值、不新增日期或其他資料欄位，也不含後端、登入與權限系統。
                </div>
                <div className="rounded-lg border border-emerald-700/20 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
                  CSV 已在瀏覽器端解析，資料列數、欄位名稱與人數欄位基本型別驗證通過。
                </div>
                <div className="flex flex-wrap gap-2">
                  {registrationData.columns.map((column) => (
                    <Badge key={column} variant="secondary" className="font-normal">
                      {column}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
            </>
          )}
        </div>
      </main>
    </TooltipProvider>
  )
}

export default App
