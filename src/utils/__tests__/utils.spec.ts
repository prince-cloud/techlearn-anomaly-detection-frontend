import { describe, test } from "@jest/globals"
import { determineFieldTypes, printFieldValue, sumDataPerString, tryDateSort } from ".."
import type { GenericData, GenericFieldValue } from "@/app/api/file"

describe("Utils tests", () => {
  const testData: GenericData[] = [
    {
      type: 'dove',
      name: 'Dave',
      age: 23,
    },
    {
      type: 'dove',
      name: 'Bippy',
      age: 40,
    },
    {
      type: 'pigeon',
      name: 'Pippy',
      age: 30,
    },
    {
      type: 'pigeon',
      name: 'Dippy',
      age: null,
    },
    {
      type: 'duck',
      name: 'Froggy',
      age: null,
    }
  ]

  test("SumDataPerString", () => {
    const summedData = sumDataPerString(testData, 'age', 'type')

    expect(summedData['dove']).toBe(63)
    expect(summedData['pigeon']).toBe(30)
    expect(summedData['duck']).toBe(null)
  })

  test("Try Date Sort", () => {
    const testData = [
      '2022-01-01',
      '2022-01-02',
      '2022-01-06',
      '2022-01-04',
      '2022-01-05',
    ]

    const sortedData = tryDateSort(testData)

    expect(sortedData[0]).toBe('2022-01-01')
    expect(sortedData[1]).toBe('2022-01-02')
    expect(sortedData[2]).toBe('2022-01-04')
    expect(sortedData[3]).toBe('2022-01-05')
    expect(sortedData[4]).toBe('2022-01-06')
  })

  test("Determine field types", () => {
    const fieldTypes = determineFieldTypes(testData)

    expect(fieldTypes['type']).toBe('string')
    expect(fieldTypes['name']).toBe('string')
    expect(fieldTypes['age']).toBe('number')
  })

  test("Print Field Values", () => {
    const value1: GenericFieldValue = 'test'
    const value2: GenericFieldValue = 1
    const value3: GenericFieldValue = null
    const value4: GenericFieldValue = new Date()
    const value5: GenericFieldValue = true

    const printedValue1 = printFieldValue(value1)
    const printedValue2 = printFieldValue(value2)
    const printedValue3 = printFieldValue(value3)
    const printedValue4 = printFieldValue(value4)
    const printedValue5 = printFieldValue(value5)

    expect(printedValue1).toBe('test')
    expect(printedValue2).toBe('1')
    expect(printedValue3).toBe('')
    expect(printedValue4).toBe(value4.toDateString())
    expect(printedValue5).toBe('true')
  })
})
