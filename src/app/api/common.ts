import axios, { AxiosHeaders, AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders } from "axios"
import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"
import createAuthRefreshInterceptor from "axios-auth-refresh"
import { NextApiRequest } from "next"
import { refreshAcessToken, verifyToken } from "./auth"
import { CFG } from "@/envConfig"

const { API_URL, NEXTAUTH_SECRET: secret } = CFG

export type AnyNextRequest = NextRequest | NextApiRequest

const getAxiosInstance = (req: AnyNextRequest) => {
  const axiosInstance = axios.create({
    withCredentials: true,
  })

  createAuthRefreshInterceptor(axiosInstance, async failedRequest => {
    const refreshToken = await getRefreshToken(req)
    try {
      const refreshTokenIsValid = await verifyToken(req, refreshToken)

      if (!refreshTokenIsValid) {
        throw new Error("Refresh Token Expired")
      }
      const newAccessToken = await refreshAcessToken(req, refreshToken)
      if (!newAccessToken) {
        throw new Error("Failed to refresh access token")
      }

      // Update the original request with the new access token
      failedRequest.response.config.headers.Authorization = `Bearer ${newAccessToken}`

      return Promise.resolve()
    } catch (err) {
      console.log(err)
    }
  })

  return axiosInstance
}

const BASE_HEADERS = {
  'Content-Type': 'application/json'
}

const getAuthHeaders = (accessToken: string): (RawAxiosRequestHeaders) | AxiosHeaders => ({
  ...BASE_HEADERS,
  Authorization: `Bearer ${accessToken}`
})

async function handleAxiosResponse(promise: Promise<AxiosResponse>) {
  try {
    const response = await promise

    return response
  } catch (err) {
    console.log(err)
    return null
  }
}

export const getApiUrl = (url: string) => (url.indexOf("://") < 0 ? `${API_URL}${url}` : url)

export const getHeaders = (accessToken?: string) => accessToken ? getAuthHeaders(accessToken) : BASE_HEADERS

export async function apiPost(req: AnyNextRequest, url: string, data: object, accessToken?: string, config?: AxiosRequestConfig) {
  return handleAxiosResponse(getAxiosInstance(req).post(getApiUrl(url), data, {
    ...(config ?? {}),
    headers: getHeaders(accessToken)
  }))
}

export async function apiUpload(req: AnyNextRequest, url: string, data: FormData, accessToken: string, config?: AxiosRequestConfig) {
  return handleAxiosResponse(getAxiosInstance(req).post(getApiUrl(url), data, {
    ...(config ?? {}),
    headers: {
      ...getAuthHeaders(accessToken),
      "Content-Type": 'multipart/form-data',
    }
  }))
}

export async function apiGet(req: AnyNextRequest, url: string, params?: object, accessToken?: string, config?: AxiosRequestConfig ) {
  return handleAxiosResponse(getAxiosInstance(req).get(getApiUrl(url), {
    ...(config ?? {}),
    headers: getHeaders(accessToken),
    params,
  }))
}

export const getJwtToken = (req: AnyNextRequest) => getToken({
  req, secret, secureCookie:
    CFG.NEXTAUTH_URL?.startsWith("https://") ??
    !!CFG.VERCEL_URL,
})

export async function getAccessToken(req: AnyNextRequest): Promise<string> {
  const token = await getJwtToken(req)

  return token?.accessToken as string ?? ''
}

export async function getRefreshToken(req: AnyNextRequest): Promise<string> {
  const token = await getJwtToken(req)

  return token?.refreshToken as string ?? ''
}

export interface ApiListParams {
  ordering?: string;
  page?: number;
  search?: string;
}

export function getStandardListParams(request: NextRequest): ApiListParams {
  const { nextUrl: { searchParams } } = request

  let page = parseInt(searchParams.get('page') ?? '1')
  if (isNaN(page)) page = 1
  const search = searchParams.get('search') ?? undefined
  const ordering = searchParams.get('ordering') ?? undefined

  return {
    page,
    search,
    ordering
  }
}
