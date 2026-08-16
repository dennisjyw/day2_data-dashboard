import Papa from "papaparse"

import csvText from "../../data/ir_registration_synthetic.csv?raw"

export const expectedColumns = [
  "學年度",
  "學院",
  "系所",
  "招生管道",
  "報名人數",
  "錄取人數",
  "報到人數",
  "註冊人數",
  "休學人數",
  "平均成績",
  "平均修課學分",
] as const

export const expectedRowCount = 342

const integerColumns = ["報名人數", "錄取人數", "報到人數", "註冊人數", "休學人數"] as const
const numberColumns = ["平均成績", "平均修課學分"] as const

export type RegistrationRecord = {
  [column in (typeof expectedColumns)[number]]: column extends "學年度" | "學院" | "系所" | "招生管道"
    ? string
    : number | null
}

export type RegistrationData = {
  columns: string[]
  rows: RegistrationRecord[]
  errors: string[]
}

function isBlank(value: string | undefined) {
  return value === undefined || value.trim() === ""
}

function parseNumber(value: string, rowIndex: number, column: string, errors: string[]) {
  if (isBlank(value)) {
    errors.push(`第 ${rowIndex} 列的「${column}」為空白。`)
    return null
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    errors.push(`第 ${rowIndex} 列的「${column}」不是有效數字。`)
    return null
  }

  return parsed
}

export function parseRegistrationCsv(source = csvText): RegistrationData {
  const result = Papa.parse<Record<string, string>>(source, {
    header: true,
    skipEmptyLines: "greedy",
  })
  const columns = result.meta.fields ?? []
  const errors = result.errors.map((error) => {
    const rowLabel = error.row === undefined ? "未知" : `${error.row + 2}`
    return `CSV 第 ${rowLabel} 列：${error.message}`
  })

  if (columns.length !== expectedColumns.length || columns.some((column, index) => column !== expectedColumns[index])) {
    errors.push(`欄位名稱或順序不符合資料字典，預期 ${expectedColumns.join("、")}。`)
  }

  if (result.data.length !== expectedRowCount) {
    errors.push(`資料列數為 ${result.data.length}，資料字典預期 ${expectedRowCount} 列。`)
  }

  const rows = result.data.map((rawRow, index) => {
    for (const column of expectedColumns) {
      if (isBlank(rawRow[column])) {
        errors.push(`第 ${index + 2} 列的「${column}」為空白。`)
      }
    }

    const row = {
      學年度: rawRow.學年度 ?? "",
      學院: rawRow.學院 ?? "",
      系所: rawRow.系所 ?? "",
      招生管道: rawRow.招生管道 ?? "",
      報名人數: parseNumber(rawRow.報名人數 ?? "", index + 2, "報名人數", errors),
      錄取人數: parseNumber(rawRow.錄取人數 ?? "", index + 2, "錄取人數", errors),
      報到人數: parseNumber(rawRow.報到人數 ?? "", index + 2, "報到人數", errors),
      註冊人數: parseNumber(rawRow.註冊人數 ?? "", index + 2, "註冊人數", errors),
      休學人數: parseNumber(rawRow.休學人數 ?? "", index + 2, "休學人數", errors),
      平均成績: parseNumber(rawRow.平均成績 ?? "", index + 2, "平均成績", errors),
      平均修課學分: parseNumber(rawRow.平均修課學分 ?? "", index + 2, "平均修課學分", errors),
    } satisfies RegistrationRecord

    for (const column of integerColumns) {
      if (row[column] !== null && !Number.isInteger(row[column])) {
        errors.push(`第 ${index + 2} 列的「${column}」不是整數。`)
      }
      if (row[column] !== null && row[column] < 0) {
        errors.push(`第 ${index + 2} 列的「${column}」不可為負數。`)
      }
    }

    for (const column of numberColumns) {
      if (row[column] !== null && row[column] < 0) {
        errors.push(`第 ${index + 2} 列的「${column}」不可為負數。`)
      }
    }

    return row
  })

  return { columns, rows, errors }
}

function loadRegistrationData(): RegistrationData {
  try {
    const data = parseRegistrationCsv()
    if (data.errors.length > 0) {
      console.error("[registration-dashboard] CSV validation failed", data.errors)
    }
    return data
  } catch (error) {
    console.error("[registration-dashboard] CSV loading failed", error)
    return {
      columns: [],
      rows: [],
      errors: ["CSV loading failed"],
    }
  }
}

export const registrationData = loadRegistrationData()
