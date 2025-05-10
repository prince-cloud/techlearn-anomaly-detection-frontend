import { NextRequest, NextResponse } from "next/server";
import { apiGet, getAccessToken, getStandardListParams } from "../common";
import { FILE_URL } from ".";
import { underscoreJsonToCamelCase } from "../camelCase";

export async function GET(req: NextRequest) {
  const accessToken = await getAccessToken(req)

  const searchParams = getStandardListParams(req)

  const response = await apiGet(req, FILE_URL, searchParams, accessToken)

  if (!response) {
    return NextResponse.error()
  }

  return NextResponse.json(underscoreJsonToCamelCase(response.data))
}
