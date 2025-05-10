import { NextRequest, NextResponse } from "next/server"
import { CHATBOT_URL } from "../.."
import { apiGet, getAccessToken } from "../../../common"
import { underscoreJsonToCamelCase } from '../../../camelCase'

export async function GET(req: NextRequest, { params }: { params: Promise<{ session: string }>}) {
  const { session } = await params
  const accessToken = await getAccessToken(req)

  const response = await apiGet(req, `${CHATBOT_URL}${session}/history/`, {}, accessToken)

  if (!response) {
    return NextResponse.json({
      message: "Unable to fetch Chatbot history"
    }, {
      status: 500
    })
  }

  return NextResponse.json(underscoreJsonToCamelCase(response.data))
}
