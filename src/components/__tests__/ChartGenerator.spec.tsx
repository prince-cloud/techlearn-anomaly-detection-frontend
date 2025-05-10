import React from "react"
import { fireEvent, render } from "@testing-library/react"
import ChartGenerator, { Statistic } from "../ChartGenerator"
import { stationaryData } from "./testData"

describe("ChartGenerator test", () => {
  let alertMessage = ''
  let statisticsData: Statistic[] = []
  let dataColumns: string[] = []

  function setAlert(message: string) {
    alertMessage = message
  }

  function setStatisticsData(data: Statistic[]) {
    statisticsData = data
  }

  function setDataColumns(value: string[]) {
    dataColumns = value
  }

  test("Generates a Pie Chart, Line Chart, Scatter Chart, and Bar Chart, and populates statistics and columns", () => {
    const { container, getByText } = render(
      <ChartGenerator data={stationaryData} setAlert={setAlert} setStatisticsData={setStatisticsData} setDataColumns={setDataColumns} />
    )

    expect(getByText(/Charts/i)).toBeTruthy()
    expect(container.querySelector('.pie-container')).toBeTruthy()
    expect(container.querySelector('.line-container')).toBeTruthy()
    expect(container.querySelector('.scatter-container')).toBeTruthy()
    expect(container.querySelector('.bar-container')).toBeTruthy()
    expect(alertMessage).toBe('')
    expect(statisticsData.length).toBe(2)
    expect(dataColumns.length).toBe(28)
  })

  test("Generates an alert message when there are too many unique datasets", () => {
    const { container, getByText } = render(
      <ChartGenerator data={stationaryData} setAlert={setAlert} setStatisticsData={setStatisticsData} setDataColumns={setDataColumns} />
    )

    expect(getByText(/Charts/i)).toBeTruthy()
    const breakdownSelect = container.querySelector('#select-breakdown-field')?.nextElementSibling // We need to get the input in the MUI Select

    expect(breakdownSelect).toBeTruthy()

    if (!breakdownSelect) return

    fireEvent.change(breakdownSelect, { target: { value: 'eventstartdt' } })
    expect(alertMessage).toBe('eventstartdt results in too many unique datasets. Please choose another field.')
  })

  test("Generates a breakdown based on selected field", () => {
    const { container, getByText } = render(
      <ChartGenerator data={stationaryData} setAlert={setAlert} setStatisticsData={setStatisticsData} setDataColumns={setDataColumns} />
    )

    const breakdownSelect = container.querySelector('#select-breakdown-field')?.nextElementSibling // We need to get the input in the MUI Select

    expect(breakdownSelect).toBeTruthy()

    if (!breakdownSelect) return

    fireEvent.change(breakdownSelect, { target: { value: 'eventplanningcompany1' } })

    expect(getByText('PlanCo1')).toBeTruthy()
    expect(getByText('PlanCo2')).toBeTruthy()
    expect(getByText('PlanCo3')).toBeTruthy()
    expect(getByText('PlanCo4')).toBeTruthy()
  })

  test("Avoids rendering the Pie Chart if there are too many unique values", () => {
    const { container } = render(
      <ChartGenerator data={stationaryData} setAlert={setAlert} setStatisticsData={setStatisticsData} setDataColumns={setDataColumns} />
    )

    const textFieldSelect = container.querySelector('#select-string-field')?.nextElementSibling

    expect(textFieldSelect).toBeTruthy()

    if (!textFieldSelect) return

    fireEvent.change(textFieldSelect, { target: { value: 'eventstartdt' } })

    expect(container.querySelector('.pie-container')).toBeFalsy()
  })
})
