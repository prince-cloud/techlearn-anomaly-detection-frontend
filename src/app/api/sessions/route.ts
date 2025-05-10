import { NextRequest, NextResponse } from "next/server"
import { apiGet, getAccessToken, getStandardListParams } from "../common"
import { SESSIONS_URL } from "."
import { underscoreJsonToCamelCase } from "../camelCase"

export async function GET(req: NextRequest) {
  const accessToken = await getAccessToken(req)

  const reqSearch = req.nextUrl.searchParams

  const searchParams = getStandardListParams(req)

  const response = await apiGet(
    req,
    SESSIONS_URL,
    {
      ...searchParams,
      file: reqSearch.get('file') ?? undefined
    }, accessToken
  )

  if (!response) {
    return NextResponse.json({
      message: "Unable to get sessions"}
    , {
      status: 500
    })
  }

  return NextResponse.json(underscoreJsonToCamelCase(response.data))
}
