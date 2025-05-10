import { NextRequest, NextResponse } from "next/server"
import { apiGet, getAccessToken } from "../../common"
import { AnomalyDataRow, GenericData, getFileDataFromApi, getFileUrl } from ".."
import Papa from 'papaparse'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: number }>}) {
  const { id } = await params
  const accessToken = await getAccessToken(req)

  const fileData = await getFileDataFromApi(req, id, accessToken)

  const res = await apiGet(req, getFileUrl(fileData), {}, accessToken, {
    responseType: "text"
  })

  if (!res) {
    return NextResponse.json({
      message: "Unable to get file data"
    }, {
      status: 500
    })
  }

  fileData.data = Papa.parse(res.data, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  }).data as GenericData[]

  fileData.anomalyData = []

  const { data, extraData: { missingValues, specialCharacters } } = fileData

  data.forEach((rowData, rowIndex) => {
    const fields = Object.keys(rowData)
    const row: AnomalyDataRow = {
      totalIndex: rowIndex,
      columns: fields.map(field => ({
        fieldName: field,
        value: rowData[field],
        anomalies: {
          missingValue: false,
          specialCharacters: false
        }
      }))
    }

    fileData.anomalyData.push(row)
  })

  // Populate anomalies
  missingValues.forEach(missingValue => {
    const { field, rows } = missingValue

    rows.forEach(rowIndex => {
      const column = fileData.anomalyData[rowIndex].columns.find(column => column.fieldName === field)

      if (column) {
        column.anomalies.missingValue = true
      }
    })
  })

  specialCharacters.forEach(specialCharacter => {
    const { field, rows } = specialCharacter

    rows.forEach(rowIndex => {
      const column = fileData.anomalyData[rowIndex].columns.find(column => column.fieldName === field)

      if (column) {
        column.anomalies.specialCharacters = true
      }
    })
  })

  return NextResponse.json(fileData)
}
