import React from "react"
import { BarElement, Chart, ChartData } from 'chart.js'
Chart.register(BarElement)
import { Scatter } from "react-chartjs-2"

export type ScatterData = ChartData<"scatter">

interface Props {
  chartData: ScatterData;
  label: string;
  description: string;
}

export default function ScatterChart({ chartData, label, description }: Props) {
  return (
    <div className="chart-container">
      <h4 className="chart-label">{label}</h4>
      <Scatter
        data={chartData}
        options={{
          parsing: false,
          normalized: true,
          plugins: {
            title: {
              display: true,
              text: description
            },
            legend: {
              display: true,
              position: "right"
            }
          }
        }}
      />
    </div>
  )
}
