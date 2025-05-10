import axios from 'axios'
import { getFileList } from '@/app/api/file'
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe("File Page Tests", () => {
  test("Get file list", async () => {
    const mockedResponse = {
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            file: "test.csv",
            file_name: "test.csv",
          }
        ]
      }
    }

    mockedAxios.get.mockResolvedValueOnce(mockedResponse)

    const fileList = await getFileList(1)
    expect(fileList).toEqual(mockedResponse.data)
    expect(fileList.results.length).toBe(1)
  })
})
