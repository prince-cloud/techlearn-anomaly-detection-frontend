import { AnyNextRequest, apiPost } from "./common"

const AUTH_URL = '/authentication'
const TOKEN_URL = `${AUTH_URL}/token`

export const login = (req: AnyNextRequest, email: string, password: string) => {
  const usernameRegex = /(.*)@(.*)/gm

  const usernameGroups = usernameRegex.exec(email)
  if (!usernameGroups) {
    throw new Error("Username could not be extracted from email")
  }

  const username = usernameGroups[1]

  return apiPost(req, `${AUTH_URL}/login/`, {
    username,
    email,
    password
  })
}

export const refreshAcessToken = async (req: AnyNextRequest, refresh: string): Promise<string> => {
  const response = await apiPost(req, `${TOKEN_URL}/refresh/`, {
    refresh,
  })

  if (!response) {
    return ''
  }

  return response.data.access
}

export const verifyToken = async (req: AnyNextRequest, token: string): Promise<boolean> => {
  const response = await apiPost(req, `${TOKEN_URL}/verify/`, { token })

  if (!response) return false

  return true
}
