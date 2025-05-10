import { NextRequest, NextResponse } from "next/server"
import { apiGet, getAccessToken } from "../../../common"

export async function GET(req: NextRequest, { params }: { params: Promise<{ session: string }> }) {
  const { session } = await params
  const accessToken = await getAccessToken(req)

  const response = await apiGet(req, `/generate-pdf/${session}/file/`, {}, accessToken, {
    responseType: "stream"
  })

  if (!response) {
    return NextResponse.json({
      message: "Unable to get validation report"
    }, {
      status: 500
    })
  }

  const stream = response.data

  const headers = new Headers()
  headers.set("Content-Type", "application/pdf")
  headers.set("Content-Disposition", `attachment`)

  return new NextResponse(stream, { status: 200, statusText: "OK", headers })
}
