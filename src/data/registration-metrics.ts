import type { RegistrationRecord } from "@/data/registration"

export const countFields = ["報名人數", "錄取人數", "報到人數", "註冊人數", "休學人數"] as const
export type CountField = (typeof countFields)[number]
export type GroupDimension = "系所" | "招生管道"

export type RegistrationAggregate = {
  rowCount: number
  applicants: number | null
  admitted: number | null
  reported: number | null
  registered: number | null
  leaveCount: number | null
}

export type RateSummary = {
  numerator: number | null
  denominator: number | null
  value: number | null
}

export type TrendPoint = {
  academicYear: string
  registered: number | null
  admitted: number | null
  reported: number | null
  registeredRate: number | null
  reportedRate: number | null
}

export type GroupComparison = {
  label: string
  rowCount: number
  registered: number | null
  admitted: number | null
  rate: number | null
  gapFromOverall: number | null
}

export function calculateRate(numerator: number | null, denominator: number | null) {
  if (numerator === null || denominator === null || denominator === 0) {
    return null
  }

  return numerator / denominator
}

export function calculatePercentagePointDifference(current: number | null, baseline: number | null) {
  if (current === null || baseline === null) {
    return null
  }

  return (current - baseline) * 100
}

/**
 * 資料字典的聚合規則：先在目前篩選範圍內加總原始人數，再由 calculateRate
 * 用總分子除以總分母。不可先計算各列、各系所或各招生管道的比例再取平均。
 */
function sumCountField(rows: RegistrationRecord[], field: CountField) {
  if (rows.length === 0) {
    return null
  }

  let total = 0

  for (const row of rows) {
    const value = row[field]
    if (value === null) {
      return null
    }
    total += value
  }

  return total
}

export function aggregateRecords(rows: RegistrationRecord[]): RegistrationAggregate {
  return {
    rowCount: rows.length,
    applicants: sumCountField(rows, "報名人數"),
    admitted: sumCountField(rows, "錄取人數"),
    reported: sumCountField(rows, "報到人數"),
    registered: sumCountField(rows, "註冊人數"),
    leaveCount: sumCountField(rows, "休學人數"),
  }
}

export function createRateSummary(numerator: number | null, denominator: number | null): RateSummary {
  // 所有比例的唯一入口：SUM(分子) / SUM(分母)；分母為 0 或資料無效時不補值。
  return { numerator, denominator, value: calculateRate(numerator, denominator) }
}

export function getAcademicYears(rows: RegistrationRecord[]) {
  return [...new Set(rows.map((row) => row.學年度))].sort((a, b) => Number(a) - Number(b))
}

export function getLatestAcademicYear(rows: RegistrationRecord[]) {
  return getAcademicYears(rows).at(-1) ?? null
}

export function filterRows(
  rows: RegistrationRecord[],
  filters: { academicYear?: string; department?: string },
) {
  return rows.filter((row) => {
    const matchesAcademicYear =
      !filters.academicYear || filters.academicYear === "全部" || row.學年度 === filters.academicYear
    const matchesDepartment = !filters.department || filters.department === "全部" || row.系所 === filters.department

    return matchesAcademicYear && matchesDepartment
  })
}

export function buildTrend(rows: RegistrationRecord[], years: string[]): TrendPoint[] {
  return years.map((academicYear) => {
    const aggregate = aggregateRecords(filterRows(rows, { academicYear }))
    return {
      academicYear,
      registered: aggregate.registered,
      admitted: aggregate.admitted,
      reported: aggregate.reported,
      registeredRate: calculateRate(aggregate.registered, aggregate.admitted),
      reportedRate: calculateRate(aggregate.registered, aggregate.reported),
    }
  })
}

export function buildGroupComparison(
  rows: RegistrationRecord[],
  academicYear: string,
  dimension: GroupDimension,
) {
  // 群組率與同年度整體率各自先聚合人數，再比較百分點差異，避免平均群組比例。
  const yearRows = filterRows(rows, { academicYear })
  const overall = aggregateRecords(yearRows)
  const overallRate = calculateRate(overall.registered, overall.admitted)
  const groups = new Map<string, RegistrationRecord[]>()

  for (const row of yearRows) {
    const label = row[dimension]
    const groupRows = groups.get(label) ?? []
    groupRows.push(row)
    groups.set(label, groupRows)
  }

  return [...groups.entries()]
    .map(([label, groupRows]): GroupComparison => {
      const aggregate = aggregateRecords(groupRows)
      const rate = calculateRate(aggregate.registered, aggregate.admitted)
      return {
        label,
        rowCount: aggregate.rowCount,
        registered: aggregate.registered,
        admitted: aggregate.admitted,
        rate,
        gapFromOverall: calculatePercentagePointDifference(rate, overallRate),
      }
    })
    .sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1))
}
