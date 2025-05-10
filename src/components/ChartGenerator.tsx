import React, { useEffect, useState } from "react"
import SelectBox, { SelectOption } from "./forms/SelectBox"
import PieChart, { PieData } from "@/components/charts/PieChart"
import ScatterChart, { ScatterData } from "./charts/ScatterChart"
import LineChart, { LineData } from "./charts/LineChart"
import BarChart, { BarData } from "./charts/BarChart"
import { determineFieldTypes, sumDataPerString, tryDateSort } from "../utils"
import LoadingSpinner from "./LoadingSpinner"
import type { GenericData } from "../app/api/file"
import { isNumber } from "lodash"

export interface Statistic {
  name: string;
  value: number | string;
}

interface Props {
  data: GenericData[];
  setAlert: (message: string) => void;
  setStatisticsData: (data: Statistic[]) => void;
  setDataColumns: (value: string[]) => void;
}

export default function ChartGenerator({ data, setAlert, setStatisticsData, setDataColumns }: Props) {
  const [ pieData, setPieData ] = useState<Record<string, PieData>>({})
  const [ breakdownField, setBreakdownField ] = useState('')
  const [ numericField, setNumericField ] = useState('')
  const [ barData, setBarData ] = useState<Record<string, BarData>>({})
  const [ lineData, setLineData ] = useState<Record<string, LineData>>({})
  const [ scatterData, setScatterData ] = useState<Record<string, ScatterData>>({})
  const [ dataPointField, setDataPointField ] = useState('')
  const [ stringField, setStringField ] = useState('')
  const [ stringFieldOptions, setStringFieldOptions ] = useState<SelectOption[]>([])
  const [ numericFieldOptions, setNumericFieldOptions ] = useState<SelectOption[]>([])
  const [ breakdownFieldOptions, setBreakdownFieldOptions ] = useState<SelectOption[]>([])

  useEffect(() => {
    loadFileData(data)
  }, [ dataPointField, stringField, numericField, breakdownField, data ])

  function loadFileData(Data: GenericData[]) {
    const breakdown: Record<string, GenericData[]> = {}

    if (breakdownField) {
      // Get breakdown data
      Data.forEach(data => {
        const fieldValue = data[breakdownField]?.toString()

        if (!fieldValue) return

        if (!breakdown[fieldValue]) {
          breakdown[fieldValue] = []
        }

        breakdown[fieldValue].push(data)
      })
    } else {
      breakdown['Data'] = Data
    }

    const segments = Object.keys(breakdown)

    if (segments.length > 50) {
      setAlert(`${breakdownField} results in too many unique datasets. Please choose another field.`)
      return
    }

    const barData: Record<string, BarData> = {}
    const lineData: Record<string, LineData> = {}
    const scatterData: Record<string, ScatterData> = {}
    const pieData: Record<string, PieData> = {}
    segments.forEach(segment => {
      const Data = breakdown[segment]

      const summedData = sumDataPerString(Data, dataPointField, stringField)
      const summedKeys = tryDateSort(Object.keys(summedData))
      barData[segment] = {
        labels: summedKeys,
        datasets: [
          {
            label: dataPointField,
            data: summedKeys.map(key => summedData[key]),
          }
        ]
      }

      lineData[segment] = {
        labels: summedKeys,
        datasets: [
          {
            label: dataPointField,
            data: summedKeys.map(key => summedData[key]),
          }
        ]
      }

      scatterData[segment] = {
        datasets: [{
          label: `${numericField} per ${dataPointField}`,
          data: Data.filter(data => {
            const x = data[numericField]
            const y = data[dataPointField]

            if (!isNumber(x) || !isNumber(y)) { // Nulls do not work in scatter charts
              return false
            }

            return true
          }).map(data => ({ x: data[numericField] as number, y: data[dataPointField] as number }))
        }]
      }

      // Pie Chart
      const pieRawData: Record<string, number> = {}
      Data.forEach(data => {
        const fieldData = data[stringField]?.toString() ?? 'null'

        if (!pieRawData[fieldData]) {
          pieRawData[fieldData] = 0
        }

        const a = pieRawData[fieldData]
        const b = data[dataPointField]

        if (!isNumber(a) || !isNumber(b)) return

        pieRawData[fieldData] = a + b
      })
      const pieKeys = Object.keys(pieRawData).sort()
      pieData[segment] = {
        labels: pieKeys,
        datasets: [{
          data: pieKeys.map(key => pieRawData[key])
        }]
      }
    })

    setBarData(barData)
    setLineData(lineData)
    setScatterData(scatterData)
    setPieData(pieData)

    const fieldTypes = determineFieldTypes(Data)

    const columns = Object.keys(fieldTypes)
    setDataColumns(columns)

    const numericColumns = columns.filter(column => fieldTypes[column] === 'number')
    setNumericFieldOptions(numericColumns.map(column => ({
      label: column,
      value: column
    })))

    if (!dataPointField) {
      const firstNumericField = numericColumns.at(0)

      if (firstNumericField) setDataPointField(firstNumericField)
    }

    if (!numericField) {
      const secondNumericField = numericColumns.at(1)

      if (secondNumericField) setNumericField(secondNumericField)
    }

    const stringColumns = columns.filter(column => fieldTypes[column] === 'string')
    const stringFieldOptions = stringColumns.map(column => ({
      label: column,
      value: column
    }))
    setStringFieldOptions(stringFieldOptions)

    setBreakdownFieldOptions([{
      label: 'None',
      value: ''
    } as SelectOption].concat(stringFieldOptions))

    if (!stringField) {
      const firstStringColumn = stringColumns.at(0)

      if (firstStringColumn) setStringField(firstStringColumn)
    }

    let total = 0
    Data.forEach((data) => total += (data[dataPointField] as number))

    setStatisticsData([
      {
        name: "Rows",
        value: Data.length
      },
      {
        name: "Columns",
        value: columns.length
      },
    ])
  }

  if (!barData || !lineData || !pieData || !scatterData) {
    return <LoadingSpinner />
  }

  return (
    <div className="chart-generator">
      <h2>Charts</h2>
      <div className="row">
        <div className="col-4">
          <SelectBox
            id="select-breakdown-field"
            label="Select a Breakdown Field"
            onChange={(event) => setBreakdownField(event.target.value)}
            options={breakdownFieldOptions}
            value={breakdownField}
          />
        </div>
        <div className="col-4">
          <SelectBox
            id="select-numeric-field"
            label="Select a Numeric Field"
            onChange={(event) => setDataPointField(event.target.value)}
            options={numericFieldOptions}
            value={dataPointField}
          />
          <SelectBox
            id="select-numeric-field"
            label="Select a Second Numeric Field"
            onChange={(event) => setNumericField(event.target.value)}
            options={numericFieldOptions}
            value={numericField}
          />
        </div>
        <div className="col-4">
          <SelectBox
            id="select-string-field"
            label="Select a Text Field"
            onChange={(event) => setStringField(event.target.value)}
            options={stringFieldOptions}
            value={stringField}
          />
        </div>
      </div>
      {Object.keys(barData).sort().map((label, index) => {
        return (
          <div key={index} className="row chart-area">
            <h3>{label}</h3>
            {(pieData[label].labels?.length ?? 0) <= 20 ?
              <div className="col-12 chart-container pie-container">
                <PieChart
                  chartData={pieData[label]}
                  label={`${dataPointField} per ${stringField}`}
                  description=""
                  valueFormatter={(value) => Intl.NumberFormat('en-US', {
                    style: 'decimal',
                  }).format(value)}
                />
              </div>
              : <></>}
            <div className="col-12 chart-container line-container">
              <LineChart chartData={lineData[label]} label={`${dataPointField} over ${stringField}`} description="Data" />
            </div>
            <div className="col-12 chart-container scatter-container">
              <ScatterChart chartData={scatterData[label]} label={`${dataPointField} vs ${numericField}`} description="Data" />
            </div>
            <div className="col-12 chart-container bar-container">
              <BarChart chartData={barData[label]} label={`${dataPointField} over ${stringField}`} description="Data" />
            </div>
          </div>
        )
      })
      }
    </div>
  )
}
