import { NextRequest, NextResponse } from "next/server"
import { apiPost, getAccessToken } from "../../common"
import { CHATBOT_URL } from ".."
import { underscoreJsonToCamelCase } from "../../camelCase"

export async function POST(req: NextRequest, { params }: { params: Promise<{ session: string }>}) {
  const { session } = await params
  const body = await req.json()
  const accessToken = await getAccessToken(req)

  const response = await apiPost(req, `${CHATBOT_URL}${session}/`, body, accessToken)

  return NextResponse.json(response?.data ? underscoreJsonToCamelCase(response.data) : [{ botMsg: "Unable to connect to chatbot" }])
}
