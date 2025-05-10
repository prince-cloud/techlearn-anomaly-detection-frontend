import { isBoolean, isDate, isNull, isNumber, isString } from "lodash"
import type { GenericData, GenericFieldValue } from "../app/api/file"
import axios from "axios"

export function sumDataPerString(data: GenericData[], numericField: string, stringField: string): Record<string, number | null> {
  const summedData: Record<string, number | null> = {}
  data.forEach(data => {
    const fieldData = data[stringField]?.toString() ?? ''

    const b = data[numericField]

    if (!summedData[fieldData] && (isNull(b) || isNumber(b))) {
      summedData[fieldData] = b
    } else if (isNull(summedData[fieldData]) && isNumber(b)) {
      summedData[fieldData] = b
    } else if (isNumber(summedData[fieldData]) && isNumber(b)) {
      summedData[fieldData] += b
    }
  })

  return summedData
}

export function tryDateSort(data: string[]): string[] {
  const sample = data[0]
  const sampleTimestamp = Date.parse(sample)

  if (isNaN(sampleTimestamp)) {
    return data.sort() // Use default sort
  }

  return data.sort((a, b) => (Date.parse(a) - Date.parse(b)))
}

export async function clickToDownload(url: string, filename: string) {
  const { data } = await axios.get(url, {
    responseType: "blob"
  })

  const href = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = href
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
}

export type FieldType = 'null' | 'string' | 'number' | 'date' | 'boolean'

export const determineFieldTypes = <T extends object>(data: T[]): Record<string, FieldType> => {
  const fieldTypes: Record<string, FieldType> = {}

  data.forEach(item => {
    const fields = Object.keys(item) as (keyof T)[]

    fields.forEach(field => {
      if (!isString(field)) return

      if (!fieldTypes[field]) {
        fieldTypes[field] = 'null'
      }

      if (fieldTypes[field] !== 'null') return

      const value = item[field]

      if (isString(value)) {
        fieldTypes[field] = 'string'
      } else if (isNumber(value)) {
        fieldTypes[field] = 'number'
      } else if (isDate(value)) {
        fieldTypes[field] = 'date'
      } else if (isBoolean(value)) {
        fieldTypes[field] = 'boolean'
      }
    })
  })

  return fieldTypes
}

export const printFieldValue = (value: GenericFieldValue): string => {
  if (isDate(value)) {
    return value.toDateString()
  }

  return value ? value.toString() : ''
}
