import React from "react"
import { BarElement, Chart, ChartData } from 'chart.js'
Chart.register(BarElement)
import { Bar } from "react-chartjs-2"

export type BarData = ChartData<"bar">

interface Props {
  chartData: BarData;
  label: string;
  description: string;
}

export default function BarChart({ chartData, label, description }: Props) {
  return (
    <div className="chart-container">
      <h4 className="chart-label">{label}</h4>
      <Bar
        data={chartData}
        options={{
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
