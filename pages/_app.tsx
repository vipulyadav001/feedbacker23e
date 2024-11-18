import type { AppProps } from 'next/app'
import React from 'react'

type NextPageWithLayout = AppProps['Component'] & {
  getLayout?: (page: React.ReactElement) => React.ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function App({ Component, pageProps }: AppPropsWithLayout) {
  // Get the layout function if it exists, otherwise return the page unchanged
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <React.StrictMode>
      {getLayout(<Component {...pageProps} />)}
    </React.StrictMode>
  )
}



export default App
