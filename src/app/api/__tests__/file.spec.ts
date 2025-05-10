/**
 * @jest-environment node
 */

import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import papa from 'papaparse'
import * as listHandler from '@/app/api/file/route'
import * as getFileHandler from '@/app/api/file/[id]/route'
import * as downloadHandler from '@/app/api/file/[id]/download/route'
import { stationaryData } from '@/components/__tests__/testData'
import { NextRequest } from 'next/server'
import { CFG } from '../../../envConfig'
import { FileData, FileList } from '../file'

const mockAxios = new AxiosMockAdapter(axios)

describe("File API Tests", () => {
  test("Get file list", async () => {
    const mockedResponse = {
      count: 1,
      next: '',
      previous: '',
      results: [
        {
          id: 1,
          file: "test.csv",
          file_name: "test.csv",
        }
      ]
    }

    const fileList: FileList = {
      count: 1,
      next: '',
      previous: '',
      results: [
        {
          id: 1,
          file: "test.csv",
          fileName: "test.csv",
        }
      ]
    }

    mockAxios.onGet().replyOnce(200, mockedResponse)

    const res = await listHandler.GET(new NextRequest(`${CFG.NEXTAUTH_URL}/api/file`))

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual(fileList)
  })

  test("Get file data returns full data with anomalies", async () => {
    const mockedResponse = {
      id: 1,
      file: "test.csv",
      file_name: "test.csv",
      extra_data: {
        session: "session-id",
        special_characters: [],
        missing_values: [],
        special_characters_percentage: {},
        missing_values_percentage: {},
      }
    }

    mockAxios.onGet().replyOnce(200, mockedResponse)
    mockAxios.onGet().replyOnce(200, papa.unparse(stationaryData))

    const response = await getFileHandler.GET(new NextRequest(`${CFG.NEXTAUTH_URL}/api/file/1`), { params: Promise.resolve({ id: 1 }) })

    expect(response.status).toBe(200)
    const data = await response.json() as FileData
    expect(data).toHaveProperty('id', 1)
    expect(data).toHaveProperty('file', "test.csv")
    expect(data).toHaveProperty('fileName', 'test.csv')
    expect(data.anomalyData).toHaveLength(data.data.length)
    expect(data.anomalyData.length).toBeGreaterThan(0)
  })

  test("Download file downloads a file", async () => {
    const mockedResponse = {
      id: 1,
      file: "test.csv",
      file_name: "test.csv",
      extra_data: {
        session: "session-id",
        special_characters: [],
        missing_values: [],
        special_characters_percentage: {},
        missing_values_percentage: {},
      }
    }

    mockAxios.onGet().replyOnce(200, mockedResponse)
    mockAxios.onGet().replyOnce(200, papa.unparse(stationaryData))

    const response = await downloadHandler.GET(new NextRequest(`${CFG.NEXTAUTH_URL}/api/file/1/download`), { params: Promise.resolve({ id: 1 }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/csv')
    expect(response.headers.get('Content-Disposition')).toBe('attachment;filename=test.csv')
    expect(response.body).toBeInstanceOf(ReadableStream)
  })
})
