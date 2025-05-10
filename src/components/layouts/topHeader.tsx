import React, { ReactNode, useEffect, useState } from "react"
import { LdsHeader, LdsSticky } from "@elilillyco/ux-lds-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { usePathname } from "next/navigation"

interface NavbarItem {
  text: string;
  href: string;
}

const defaultNavbarItems: NavbarItem[] = [
  {
    text: "Home",
    href: "/",
  },
]

interface Props {
  children: ReactNode;
  hasSidenav?: boolean;
}

export default function Layout({ children }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [ navbarItems, setNavbarItems ] = useState<NavbarItem[]>([])
  const currentRoute = usePathname()

  useEffect(() => {
    if (session) {
      setNavbarItems([
        ...defaultNavbarItems,
        {
          text: "Logout",
          href: `/auth/logout/?next=${router.pathname}`,
        }
      ])
    } else {
      setNavbarItems([
        {
          text: "Login",
          href: '/auth/login'
        }
      ])
    }
  }, [ session, router.pathname ])

  return (
    <div>
      <LdsSticky>
        <LdsHeader
          currentRoute={currentRoute}

        >
          {navbarItems.map((item, index) => <LdsHeader.Link href={item.href} key={index}>{item.text}</LdsHeader.Link>)}
        </LdsHeader>
      </LdsSticky>

      <div className='page-wrapper'>
        <main className='main-content-container'>{children}</main>
      </div>
    </div>
  )
}
