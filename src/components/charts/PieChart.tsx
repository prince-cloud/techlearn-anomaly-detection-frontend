import React from 'react'
import { ChartData, Plugin } from 'chart.js'
import { Pie } from "react-chartjs-2"
import ChartDataLabels from 'chartjs-plugin-datalabels'

const DataLabels = ChartDataLabels as Plugin<"pie">

export type PieData = ChartData<"pie">

interface Props {
  chartData: PieData;
  label: string;
  description: string;
  valueFormatter?: (value: number) => string;
}

export default function PieChart({ chartData, label, description, valueFormatter }: Props) {
  return (
    <div className="chart-container">
      <h4 className="chart-label">{label}</h4>
      <Pie
        data={chartData}
        options={{
          parsing: false,
          normalized: true,
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: description,
            },
            datalabels: {
              formatter: (value, context) => {
                const dataSetMeta = context.chart.getDatasetMeta(context.datasetIndex) as { total: number }
                const percentage = (value / dataSetMeta.total * 100).toFixed(2)
                const stringValue = valueFormatter ? valueFormatter(value) : `${value}`
                return `${percentage}% \n ${stringValue}`
              }
            }
          }
        }}
        plugins={[ DataLabels ]}
      />
    </div>
  )
}
