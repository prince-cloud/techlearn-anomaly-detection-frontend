import React, { useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { LdsLoadingSpinner } from "@elilillyco/ux-lds-react"

export default function Logout() {
  const { data: session } = useSession()
  const router = useRouter()
  const { next } = router.query

  useEffect(() => {
    if (session) {
      signOut({
        redirect: false,
      }).then(() => {
        router.push(`/api/auth/globalLogout${next ? `?next=${next}` : ''}`)
        return undefined
      })
    }
  }, [ session ])

  if (session) {
    return (
      <div className="logout-container">
        <h1>Redirecting to logout...</h1>
        <LdsLoadingSpinner />
      </div>
    )
  } else {
    return (
      <>
        <div className="lds-card flex-container">
          <div className="content-container">
            <h1>You have been signed out.</h1>
          </div>
          <div className="h2-container">
            <h2>
              To continue using this site, you will need to sign in again.
            </h2>
          </div>
        </div>
      </>
    );
  }
}
