import React, { useState } from "react"
import { LdsBottomDrawer, LdsTable, LdsTabPanel, LdsTabs } from "@elilillyco/ux-lds-react"
import Chatbot from "@/components/Chatbot"
import Toast from "@/components/Toast"
import LoadingSpinner from "../components/LoadingSpinner"
import ChartGenerator, { Statistic } from "../components/ChartGenerator"
import { printFieldValue } from "../utils"
import { stationaryData } from "../components/__tests__/testData"

const file = {
  data: stationaryData,
}

export default function Home() {
  const [ currentTab, setCurrentTab ] = useState(0)
  const [ alert, setAlert ] = useState('')
  const [ statisticsData, setStatisticsData ] = useState<Statistic[]>([])
  const [ dataColumns, setDataColumns ] = useState<string[]>([])

  if (!dataColumns) {
    return <LoadingSpinner />
  }

  return (
    <>
      <section id="big-data" className="app-content">
        <div className="wrapper">
          <div className="row data-area" style={{ marginTop: "20px" }}>
            <div className="col-3 content-block">
              <Chatbot sessionGuid="test" />
            </div>
            <div className="col-7 content-block data-display-area">
              <LdsTabs
                activeTab={currentTab}
                onChange={setCurrentTab}
                displayClass="contained"
                tabAlign="center"
                tabClass="solid"
                tabLabels={[
                  {
                    label: 'Charts',
                    tabId: 0
                  },
                  {
                    label: 'Data',
                    tabId: 1
                  },
                ]}
              >
                <LdsTabPanel
                  activeTab={currentTab}
                  tabId={0}
                >
                  <ChartGenerator data={file.data} setAlert={setAlert} setStatisticsData={setStatisticsData} setDataColumns={setDataColumns} />
                </LdsTabPanel>
                <LdsTabPanel
                  activeTab={currentTab}
                  tabId={1}
                >
                  <LdsTable id="data-display" caption="">
                    <thead>
                      <tr>
                        {dataColumns.map((column, index) => <th key={index}>{column}</th>)}
                      </tr>
                    </thead>

                    <tbody>
                      {file.data.map((data, index) => (
                        <tr key={index}>
                          {dataColumns.map((column, index) => <td key={index}>{printFieldValue(data[column])}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </LdsTable>
                </LdsTabPanel>
              </LdsTabs>
            </div>
            <div className="col-2 stats-panel">
              <LdsBottomDrawer
                drawerHeading="Statistics Info"
                content={
                  <div>
                    {statisticsData.map((data, index) => <div key={index}><strong>{data.name}:</strong> {data.value}</div>)}
                  </div>
                }
                hiddenDrawerPanelExpandText="View Statistics Info"
                hiddenDrawerPanelCollapseText="Hide Statistics Info"
              />
            </div>
          </div>

          <Toast message={alert} severity="error" />
        </div>
      </section>
    </>
  )
}
