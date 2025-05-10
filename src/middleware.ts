import { NextRequest, NextResponse } from "next/server"
import { getAccessToken, getJwtToken, getRefreshToken } from "./app/api/common"
import axios from "axios"
import { encode } from "next-auth/jwt"
import { refreshAcessToken, verifyToken } from "./app/api/auth"
import { CFG } from "./envConfig"

const { NEXTAUTH_URL, NEXTAUTH_SECRET } = CFG

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const unprotectedPrefixes = [ "/_next/", "/_error", "/api/", "/LillyLogo.svg" ]

  if (unprotectedPrefixes.find(route => pathname.indexOf(route) >= 0)) {
    return NextResponse.next()
  }

  const jwt = await getJwtToken(req)

  if (jwt && pathname === "/auth/login") {
    return NextResponse.redirect(`${NEXTAUTH_URL}/`)
  }

  const cookieList = req.cookies.getAll()
  const sessionCookie = NEXTAUTH_URL?.startsWith("https://")
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token"

  if (!cookieList.some(cookie => cookie.name.includes(sessionCookie))) {
    let response: NextResponse

    if (pathname !== '/auth/login') {
      response = NextResponse.redirect(`${NEXTAUTH_URL}/auth/login`)
    } else {
      response = NextResponse.next()
    }

    req.cookies.getAll().forEach(cookie => {
      if (cookie.name.includes('next-auth')) {
        response.cookies.delete(cookie.name)
      }
    })

    return response
  }

  const res = await axios.get(`${ NEXTAUTH_URL }/api/auth/session`, {
    headers: {
      "Content-Type": "application/json",
      cookie: req.cookies.toString()
    }
  })

  const accessToken = await getAccessToken(req)
  const refreshToken = await getRefreshToken(req)
  const accessTokenIsValid = await verifyToken(req, accessToken)
  const refreshTokenIsValid = await verifyToken(req, refreshToken)

  if (!accessTokenIsValid && refreshTokenIsValid) {
    const { data: session } = res

    const response = NextResponse.next()

    const newAccessToken = await refreshAcessToken(req, session['refreshToken'])

    if (!newAccessToken) {
      return NextResponse.redirect(`${NEXTAUTH_URL}/auth/logout`)
    }

    // Update the session cookie with the new access token
    const newSessionToken = await encode({
      secret: NEXTAUTH_SECRET ?? '',
      token: {
        ...session,
        accessToken: newAccessToken
      },
      maxAge: 30 * 24 * 60 * 60
    })

    response.cookies.set(sessionCookie, newSessionToken)

    return response
  } else if (!accessTokenIsValid && pathname !== "/auth/logout") {
    return NextResponse.redirect(`${NEXTAUTH_URL}/auth/logout`)
  }

  if (!jwt) {
    if (pathname === "/auth/login") {
      return NextResponse.next()
    }

    if (pathname === "/auth/logout") {
      return NextResponse.redirect(`${NEXTAUTH_URL}`)
    }

    return NextResponse.redirect(`${NEXTAUTH_URL}/auth/login?next=${pathname}`)
  }
}
