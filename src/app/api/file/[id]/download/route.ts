import { NextRequest, NextResponse } from "next/server"
import { getFileDataFromApi, getFileUrl } from "../.."
import { apiGet, getAccessToken } from "../../../common"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: number }>}) {
  const { id } = await params

  try {
    const accessToken = await getAccessToken(req)
    const fileData = await getFileDataFromApi(req, id, accessToken)

    const res = await apiGet(req, getFileUrl(fileData), {}, accessToken, {
      responseType: "stream"
    })

    if (!res) throw new Error('Invalid API Response')

    const stream = res.data

    const headers = new Headers()
    headers.set("Content-Type", "text/csv")
    headers.set("Content-Disposition", `attachment;filename=${fileData.fileName}`)

    return new NextResponse(stream, { status: 200, statusText: "OK", headers })
  } catch (err) {
    console.log(err)
    return NextResponse.json({
      message: "Unable to Download File",
    }, {
      status: 500,
    })
  }
}
