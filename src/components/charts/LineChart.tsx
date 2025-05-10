import React from 'react'
import { ChartData } from 'chart.js'
import { Line } from "react-chartjs-2"

export type LineData = ChartData<"line">

interface Props {
  chartData: LineData;
  label: string;
  description: string;
}

export default function LineChart({ chartData, label, description }: Props) {
  return (
    <div className="chart-container">
      <h4 className="chart-label">{label}</h4>
      <Line
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
