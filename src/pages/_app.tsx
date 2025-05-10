import React, { ReactNode } from "react"
import { Chart, Colors, Legend, CategoryScale, LinearScale, PointElement, LineElement, ArcElement } from 'chart.js'
import { SessionProvider } from "next-auth/react"
import { AppProps } from 'next/app'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import '@elilillyco/ux-lds-react/src/css/lds.css'
import "../scss/main.scss"

import Head from "next/head"
import TopHeaderLayout from '@/components/layouts/topHeader'

Chart.register(Colors, Legend, CategoryScale, LinearScale, PointElement, LineElement, ArcElement)

interface Component extends React.FC {
  getLayout ?: (page: ReactNode) => ReactNode;
}

interface Props extends AppProps {
  Component: Component;
}

export default function MyApp({ Component, pageProps }: Props) {
  // If the component has a layout specified in its getLayout method, use that layout
  // Otherwise, use the default layout for all pages.
  const getLayout = Component.getLayout || ((page) => <TopHeaderLayout>{page}</TopHeaderLayout>);
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <title>AI Ops Anomaly Detection</title>
        <meta
          name="description"
          content="AI Ops Anomaly Detection Tool User Interface"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {getLayout(<Component {...pageProps} />)}
    </SessionProvider>
  )
}
