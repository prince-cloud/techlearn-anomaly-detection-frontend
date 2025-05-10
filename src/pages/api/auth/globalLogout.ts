import { NextApiResponse } from "next"
import { NextRequest } from "next/server"
import { CFG } from "@/envConfig"

const { NEXTAUTH_URL } = CFG

export default async function handler(req: NextRequest, res: NextApiResponse) {
  try {
    // const endSessionURL = `https://login.microsoftonline.com/18a59a81-eea8-4c30-948a-d8824cdc2580/oauth2/v2.0/logout`;
    // const endSessionParams = new URLSearchParams({
    //   post_logout_redirect_uri: `${NEXTAUTH_URL}/auth/logout`,
    //   "client-request-id": CFG.CLIENT_ID ?? '',
    // })
    // res.writeHead(307, {
    //   Location: `${endSessionURL}?${endSessionParams.toString()}`,
    //   "Cache-Control": "no-store",
    // })
  } catch (err) {
    console.log(err)
  } finally {
    const next = req?.nextUrl?.searchParams?.get('next')
    console.dir(req.nextUrl)

    if (next) {
      res.redirect(`${NEXTAUTH_URL}/auth/login?next=${next}`)
    } else {
      res.redirect(`${NEXTAUTH_URL}/auth/login`)
    }
    res.end()
  }
}
