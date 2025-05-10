import React, { useEffect, useState } from "react"
import { LdsBottomDrawer, LdsButton, LdsModal, LdsTable, LdsTabPanel, LdsTabs, LdsTextField, LdsLoadingSpinner } from "@elilillyco/ux-lds-react"
import Chatbot from "@/components/Chatbot"
import { ChartData } from "chart.js"
import { FileData, getFileData, getFileList, FileList, uploadFile, AnomalyList, AcceptedMimeTypes } from "@/app/api/file"
import { useSession } from "next-auth/react"
import Toast, { ToastSeverity } from "../components/Toast"
import { clickToDownload, determineFieldTypes, printFieldValue } from "@/utils"
import LoadingSpinner from "../components/LoadingSpinner"
import ChartGenerator, { Statistic } from "../components/ChartGenerator"
import PieChart from "../components/charts/PieChart"
import EmptyTableRow from "../components/EmptyTableRow"
import { CancelRounded, Info } from "@mui/icons-material"
import { LdsPagination } from "@elilillyco/ux-lds-react"
import type { ExtendedSession } from "./api/auth/[...nextauth]"
import { useDebounce } from "../utils/debounce"

type ColumnFilters = Record<string, string>

interface PageSort {
  column: string;
  direction: 'asc' | 'desc';
}

export default function OpenFile() {
  const session = useSession().data as ExtendedSession
  const [ currentTab, setCurrentTab ] = useState(0)
  const [ isFileModalOpen, setIsFileModalOpen ] = useState(false)
  const [ openFileData, setOpenFileData ] = useState<FileData>()
  const [ isLoadingFile, setIsLoadingFile ] = useState(false)
  const [ fileList, setFileList ] = useState<FileList>()
  const [ isLoadingFileList, setIsLoadingFileList ] = useState(false)
  const [ missingData, setMissingData ] = useState<ChartData<"pie">>()
  const [ specialCharactersData, setSpecialCharactersData ] = useState<ChartData<"pie">>()
  const [ statisticsData, setStatisticsData ] = useState<Statistic[]>([])
  const [ dataColumns, setDataColumns ] = useState<string[]>([])
  const [ toastMessage, setToastMessage ] = useState('')
  const [ toastSeverity, setToastSeverity ] = useState<ToastSeverity>('error')
  const [ sessionGuid, setSessionGuid ] = useState('')

  const [ currentFilesPage, setCurrentFilesPage ] = useState(1)

  const [ currentDataPage, setCurrentDataPage ] = useState(1)
  const [ fullAnomalyData, setFullAnomalyData ] = useState<AnomalyList>([])
  const [ dataPage, setDataPage ] = useState<AnomalyList>([])
  const [ pageSort, setPageSort ] = useState<PageSort>()
  const [ itemsPerPage ] = useState(10)
  const [ columnFilters, setColumnFilters ] = useState<ColumnFilters>({})
  const [ dataPageTotalItems, setDataPageTotalItems ] = useState(0)

  const [ isUploadModalOpen, setIsUploadModalOpen ] = useState(false)
  const [ fileToUpload, setFileToUpload ] = useState<File | null>(null)
  const [ isFileUploading, setIsFileUploading ] = useState(false)

  const [ isDownloadingVR, setIsDownloadingVR ] = useState(false)
  const [ isDownloadingCSV, setIsDownloadingCSV ] = useState(false)

  const acceptedFileExtensions = Object.keys(AcceptedMimeTypes)
  const acceptedMimeTypes = Object.values(AcceptedMimeTypes)

  useEffect(() => {
    if (!openFileData) return

    loadFileData(openFileData)
  }, [ openFileData ])

  useEffect(() => {
    getDataPage(currentDataPage)
  }, [ currentDataPage, pageSort, fullAnomalyData ])

  function toastError(message: string) {
    setToastMessage(message)
    setToastSeverity('error')
  }

  function toastSuccess(message: string) {
    setToastMessage(message)
    setToastSeverity('success')
  }

  useEffect(() => {
    if (!session || !session.accessToken) return
    if (!isFileModalOpen) return

    setIsLoadingFileList(true)

    getFileList(currentFilesPage).then(fileList => {
      setFileList(fileList)
    }).catch(err => toastError(err.message))
    .finally(() => setIsLoadingFileList(false))
  }, [ session, isFileModalOpen, currentFilesPage ])

  function loadFileData(file: FileData) {
    const { data } = file

    const rowCount = data.length
    const fieldTypes = determineFieldTypes(data)
    const columnCount = Object.keys(fieldTypes).length

    const totalCells = columnCount * rowCount

    const { extraData: { missingValues, specialCharacters } } = file
    let missingValuesCount = 0
    missingValues.forEach(missingValue => {
      missingValuesCount += (missingValue.rows.length)
    })
    setMissingData({
      labels: [ "Missing", "Valid" ],
      datasets: [
        {
          label: "Missing Data",
          data: [ missingValuesCount, (totalCells - missingValuesCount) ],
        }
      ]
    })

    let specialCharactersCount = 0
    specialCharacters.forEach(specialCharacter => {
      specialCharactersCount += specialCharacter.rows.length
    })
    setSpecialCharactersData({
      labels: [ "Special Characters", "Normal" ],
      datasets: [
        {
          label: "Special Characters",
          data: [ specialCharactersCount, (totalCells - specialCharactersCount) ]
        }
      ]
    })

    setDataPageTotalItems(data.length)
    setPageSort(undefined)
    setColumnFilters({})
    setCurrentDataPage(1)
  }

  async function openFile(id: number) {
    setIsFileModalOpen(false)
    setIsLoadingFile(true)
    const data = await getFileData(id)
    const { anomalyData } = data
    setSessionGuid(data.extraData.session)
    setOpenFileData(data)
    setFullAnomalyData(anomalyData)
    setIsLoadingFile(false)
  }

  const downloadCsv = async () => {
    if (!openFileData) return

    setIsDownloadingCSV(true)

    await clickToDownload(`/api/file/${openFileData.id}/download`, openFileData.fileName)

    setIsDownloadingCSV(false)
  }

  const downloadValidationReport = async () => {
    if (!openFileData || !sessionGuid) return

    setIsDownloadingVR(true)

    await clickToDownload(
      `/api/sessions/${sessionGuid}/generate-report`,
      `${openFileData.fileName}-validation-report.pdf`
    )

    setIsDownloadingVR(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileToUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!fileToUpload) return

    setIsFileUploading(true)

    const formData = new FormData()
    formData.append('file', fileToUpload)

    try {
      const uploadResponse = await uploadFile(formData)

      openFile(uploadResponse.id)

      toastSuccess('File Uploaded Successfully')
    } catch (err: unknown) {
      if (err instanceof Error) {
        toastError(`Unable to upload file: ${err.message}`)
      } else {
        toastError(`Unable to upload file: ${err}`)
      }
    } finally {
      setIsFileUploading(false)
      setIsUploadModalOpen(false)
    }
  }

  const getDataPage = (page?: number) => {
    if (!openFileData) return

    let anomalyData = fullAnomalyData

    if (pageSort) {
      const { column, direction } = pageSort

      anomalyData = anomalyData.toSorted((a, b) => {
        const aValue = a.columns.find(col => col.fieldName === column)?.value
        const bValue = b.columns.find(col => col.fieldName === column)?.value

        if (!aValue && bValue) return direction === 'asc' ? -1 : 1
        if (aValue && !bValue) return direction === 'asc' ? 1 : -1
        if (!aValue || !bValue) return 0 // We use || here instead of && so TypeScript knows they will both be defined below.

        if (aValue < bValue) {
          return direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    const columnFilterFields = Object.keys(columnFilters)
    if (columnFilterFields.length) {
      anomalyData = anomalyData.filter((row) => columnFilterFields.every(filterKey => {
          const column = row.columns.find(column => column.fieldName === filterKey)
          const filterValue = columnFilters[filterKey]

          if (!filterValue.trim()) return true

          if (!column || !column.value) return false

          return column.value.toString().toLowerCase().includes(filterValue.toLowerCase())
        })
      )
    }

    const startingIndex = ((page ?? currentDataPage) - 1) * itemsPerPage
    const endingIndex = Math.min((startingIndex + itemsPerPage - 1),  anomalyData.length - 1)

    const dataPage = anomalyData.slice(startingIndex, endingIndex + 1)

    setDataPageTotalItems(anomalyData.length)
    setDataPage(dataPage)
  }

  const debounceFilter = useDebounce(() => {
    getDataPage(currentDataPage)
  })

  const applyFilter = (column: string, value: string) => {
    const newFilters = {
      ...columnFilters,
    }

    newFilters[column] = value
    setColumnFilters(newFilters)
    debounceFilter()
  }

  const toggleSort = (column: string) => {
    if (!pageSort) {
      setPageSort({
        column,
        direction: 'asc'
      })
      return
    }

    if (pageSort.column === column) {
      if (pageSort.direction === 'asc') {
        setPageSort({
          column,
          direction: 'desc'
        })
      } else {
        setPageSort(undefined)
      }
    } else {
      setPageSort({
        column,
        direction: 'asc'
      })
    }
  }

  return (
    <>
      <LdsModal
        modalId="fileModal"
        open={isFileModalOpen}
        closeModal={() => setIsFileModalOpen(false)}
        setModalOpen={(value: boolean) => setIsFileModalOpen(value)}
        heading="Open File"
      >
        { fileList && !isLoadingFileList ?
          <>
            <LdsTable
              id="FileTable"
              caption="Files"
            >
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Filename</th>
                </tr>
              </thead>

              <tbody>
                {
                  fileList.results.map((file, index) =>
                    <tr key={index} className="file-row clickable" onClick={() => openFile(file.id)}>
                      <td>{file.id}</td>
                      <td>{file.fileName}</td>
                    </tr>
                  )
                }
              </tbody>
            </LdsTable>
            <LdsPagination
              currentPage={currentFilesPage}
              setCurrentPage={setCurrentFilesPage}
              totalItems={fileList.count}
              itemsPerPage={20} // This is hard-coded in the API
            />
          </>
          : <LoadingSpinner />
        }
      </LdsModal>

      <LdsModal
        modalId="fileUploadModal"
        open={isUploadModalOpen}
        closeModal={() => setIsUploadModalOpen(false)}
        setModalOpen={(value: boolean) => setIsUploadModalOpen(value)}
        heading="Upload File"
      >
        <form id="file-upload-form" onSubmit={handleFileUpload}>
          <label htmlFor="file">Accepted File Types: {acceptedFileExtensions.join(', ')}</label>
          <br />
          <input id="file" name="file" type="file" onChange={handleFileChange} accept={acceptedMimeTypes.join(', ')} />

          <br />
          <br />

          <LdsButton type="submit" title="Upload File" disabled={!fileToUpload || isFileUploading}>Upload File</LdsButton>
        </form>
      </LdsModal>

      <section id="files" className="app-content">
        <div className="wrapper">
          <div className="row">
            <div className="col-3" style={{ marginBottom: '10px' }}>
              <LdsButton type="submit" title="Open File" icon="Files" onClick={() => setIsFileModalOpen(true)} aria-label="Open File">
                Open File
              </LdsButton>
            </div>
            <div className="col-6 filename">
              <h4>
                {
                  openFileData && <><strong>File: </strong>{openFileData?.fileName}</>
                }
              </h4>
            </div>
            <div className="col-3" style={{ textAlign: 'right' }}>
              <LdsButton type="submit" title="Upload File" icon="UploadSimple" onClick={() => setIsUploadModalOpen(true)}>
                Upload File
              </LdsButton>
            </div>
          </div>

          {openFileData && missingData && specialCharactersData && dataPage && !isLoadingFile ?
            <div className="row data-area">
              <div className="col-3 content-block">
                <Chatbot sessionGuid={sessionGuid} />
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
                    {
                      label: 'Anomalies',
                      tabId: 2
                    },
                    {
                      label: 'Report',
                      tabId: 3
                    }
                  ]}
                >
                  <LdsTabPanel
                    activeTab={currentTab}
                    tabId={0}
                    >
                      <div className="row anomalous-charts">
                        <h2>Anomalous Data</h2>
                        <div className="col-6">
                          <PieChart chartData={missingData} label="Missing Data" description="Missing Data" />
                        </div>
                        <div className="col-6">
                          <PieChart chartData={specialCharactersData} label="Special Characters" description="Special Characters" />
                        </div>
                      </div>

                      <br />
                      <br />

                      <ChartGenerator
                        data={openFileData.data}
                        setAlert={toastError}
                        setStatisticsData={setStatisticsData}
                        setDataColumns={setDataColumns}
                      />
                  </LdsTabPanel>

                  <LdsTabPanel
                    activeTab={currentTab}
                    tabId={1}
                  >
                    <LdsTable id="data-display" caption="">
                      <thead>
                        <tr>
                          {dataColumns.map((column, index) =>
                            <th key={index}>
                              <button onClick={() => toggleSort(column)}>
                                {column}
                                {pageSort && pageSort.column === column && (
                                  pageSort.direction === 'asc' ? '↑' : '↓')}
                              </button>
                              <LdsTextField type="text" placeholder="Filter" onChange={(e: React.ChangeEvent<HTMLInputElement>) => applyFilter(column, e.target.value)} />
                            </th>
                          )}
                        </tr>
                      </thead>

                      <tbody>
                        {dataPage.map((data, rowIndex) => {
                          const { totalIndex } = data
                          return (
                            <tr key={rowIndex}>
                              {data.columns.map((column, columnIndex) => {
                                const { anomalies } = column

                                return (
                                  <td key={columnIndex}>
                                    {anomalies.missingValue && <span className="missing-value" title={`Missing Value [Row ${totalIndex}]`}><CancelRounded /></span>}
                                    {anomalies.specialCharacters && <span className="special-characters" title={`Special Characters [Row ${totalIndex}]`}><Info /></span>}
                                    {printFieldValue(column.value)}
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                      </tbody>
                    </LdsTable>
                    <LdsPagination
                      currentPage={currentDataPage}
                      setCurrentPage={setCurrentDataPage}
                      totalItems={dataPageTotalItems}
                      itemsPerPage={itemsPerPage}
                    />
                  </LdsTabPanel>

                  <LdsTabPanel
                    activeTab={currentTab}
                    tabId={2}
                  >
                    <div className="row">
                      <div className="col-12">
                        <LdsTable id="special-characters" caption="Special Characters Percentage">
                          <thead>
                            <tr>
                              <th>Field</th>
                              <th>Percentage</th>
                            </tr>
                          </thead>

                          <tbody>
                            {
                              Object.keys(openFileData.extraData.specialCharactersPercentage).length ?
                                Object.keys(openFileData.extraData.specialCharactersPercentage).map((key, index) => (
                                  <tr key={index}>
                                    <td>{key}</td>
                                    <td>{openFileData.extraData.specialCharactersPercentage[key]}%</td>
                                  </tr>
                                ))
                              : <EmptyTableRow colSpan={2} />
                            }
                          </tbody>
                        </LdsTable>

                        <LdsTable id="missing-values" caption="Missing Values Percentage">
                          <thead>
                            <tr>
                              <th>Field</th>
                              <th>Percentage</th>
                            </tr>
                          </thead>

                          <tbody>
                            {
                              Object.keys(openFileData.extraData.missingValuesPercentage).length ?
                                Object.keys(openFileData.extraData.missingValuesPercentage).map((key, index) => (
                                  <tr key={index}>
                                    <td>{key}</td>
                                    <td>{openFileData.extraData.missingValuesPercentage[key]}%</td>
                                  </tr>
                                ))
                              : <EmptyTableRow colSpan={2} />
                            }
                          </tbody>
                        </LdsTable>
                      </div>
                    </div>
                  </LdsTabPanel>

                  <LdsTabPanel
                    activeTab={currentTab}
                    tabId={3}
                  >
                    <div className="row">
                      <div className="col-12" style={{ marginBottom: "10px" }}>
                        <LdsButton type="button" onClick={downloadCsv} disabled={isDownloadingCSV} icon="DownloadSimple">
                          Download CSV {isDownloadingCSV && <LdsLoadingSpinner size={20} />}
                        </LdsButton>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <LdsButton type="button" onClick={downloadValidationReport} disabled={isDownloadingVR} icon="DownloadSimple">
                          Download Validation Report {isDownloadingVR && <LdsLoadingSpinner size={20} />}
                        </LdsButton>
                      </div>
                    </div>
                  </LdsTabPanel>
                </LdsTabs>
              </div>

              <div className="col-2">
                <LdsBottomDrawer
                  drawerHeading="Statistics Info"
                  content={
                    <>
                      {statisticsData.map((data, index) => <div key={index}><strong>{data.name}:</strong> {data.value}</div>)}
                    </>
                  }
                  hiddenDrawerPanelExpandText="View Statistics Info"
                  hiddenDrawerPanelCollapseText="Hide Statistics Info"
                />
              </div>
            </div>
            : (isLoadingFile ? <LoadingSpinner /> : <div><h2 style={{ textAlign: "center" }}>No File Opened</h2></div>)
          }
        </div>

        <Toast message={toastMessage} severity={toastSeverity} />
      </section>
    </>
  );
}
