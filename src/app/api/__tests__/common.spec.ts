/**
 * @jest-environment node
 */

import { CFG } from "@/envConfig"
import { apiGet, apiPost, getApiUrl, getHeaders, getStandardListParams } from "../common"
import { NextRequest } from "next/server"
import AxiosMockAdapter from 'axios-mock-adapter'
import axios from "axios"

const mockAxios = new AxiosMockAdapter(axios)

describe('Common API Tests', () => {
  it('Gets Auth Headers when token is passed', () => {
    const headers = getHeaders('test-token')
    expect(headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token'
    })
  })

  it('Gets Base Headers when no token is passed', () => {
    const headers = getHeaders()
    expect(headers).toEqual({
      'Content-Type': 'application/json'
    })
  })

  it('Gets the API URL when the URL does not contain a protocol', () => {
    const apiUrl = getApiUrl('/test-endpoint')
    expect(apiUrl).toBe(`${CFG.API_URL}/test-endpoint`)
  })

  it('Does not modify the API URL when it already contains a protocol', () => {
    const apiUrl = getApiUrl('https://example.com/test-endpoint')
    expect(apiUrl).toBe('https://example.com/test-endpoint')
  })

  it('Gets standard list params from a request', () => {
    const req = new NextRequest(`${CFG.NEXTAUTH_URL}/api/file?page=1`, { method: 'GET' })

    const params = getStandardListParams(req)
    expect(params).toEqual({
      page: 1,
      ordering: undefined,
      search: undefined,
    })
  })

  it('Handles non-numeric page values gracefully', () => {
    const req = new NextRequest(`${CFG.NEXTAUTH_URL}/api/file?page=not-a-number`, { method: 'GET' })

    const params = getStandardListParams(req)
    expect(params).toEqual({
      page: 1,
      ordering: undefined,
      search: undefined,
    })
  })

  it('Handles passing all of the standard list params', () => {
    const req = new NextRequest(`${CFG.NEXTAUTH_URL}/api/file?page=2&ordering=name&search=test`, { method: 'GET' })

    const params = getStandardListParams(req)
    expect(params).toEqual({
      page: 2,
      ordering: 'name',
      search: 'test',
    })
  })

  it('apiGet Returns null when axios request fails', async () => {
    mockAxios.onGet().replyOnce(500)

    const response = await apiGet(new NextRequest(`${CFG.NEXTAUTH_URL}/api/file`), '/api/file', {}, 'test-token')

    expect(response).toBeNull()
  })

  it('apiPost returns null when axios request fails', async () => {
    mockAxios.onPost().replyOnce(500)

    const response = await apiPost(new NextRequest(`${CFG.NEXTAUTH_URL}/api/file`), '/api/file', {}, 'test-token')

    expect(response).toBeNull()
  })

  it('apiUpload returns null when axios request fails', async () => {
    mockAxios.onPost().replyOnce(500)

    const formData = new FormData()
    formData.append('file', new Blob(['test'], { type: 'text/csv' }), 'test.csv')

    const response = await apiPost(new NextRequest(`${CFG.NEXTAUTH_URL}/api/file`), '/api/file/upload', formData, 'test-token')

    expect(response).toBeNull()
  })

  it('apiGet returns data when axios request succeeds', async () => {
    const mockResponse = { data: { id: 1, name: 'test' } }
    mockAxios.onGet().replyOnce(200, mockResponse)

    const response = await apiGet(new NextRequest(`${CFG.NEXTAUTH_URL}/api/file`), '/api/file', {}, 'test-token')

    expect(response).toBeTruthy()

    if (!response) return

    expect(response.data).toEqual(mockResponse)
  })

  it('apiPost returns data when axios request succeeds', async () => {
    const mockResponse = { data: { id: 1, name: 'test' } }
    mockAxios.onPost().replyOnce(200, mockResponse)

    const response = await apiPost(new NextRequest(`${CFG.NEXTAUTH_URL}/api/file`), '/api/file', {}, 'test-token')

    expect(response).toBeTruthy()

    if (!response) return

    expect(response.data).toEqual(mockResponse)
  })

  it('apiUpload returns data when axios request succeeds', async () => {
    const mockResponse = { data: { id: 1, name: 'test' } }
    mockAxios.onPost().replyOnce(200, mockResponse)

    const formData = new FormData()
    formData.append('file', new Blob(['test'], { type: 'text/csv' }), 'test.csv')

    const response = await apiPost(new NextRequest(`${CFG.NEXTAUTH_URL}/api/file`), '/api/file/upload', formData, 'test-token')

    expect(response).toBeTruthy()

    if (!response) return

    expect(response.data).toEqual(mockResponse)
  })
})
