import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import '../styles/globals.css'
import { WebSocketProvider } from '../contexts/WebSocketContext'

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <WebSocketProvider>
        <Component {...pageProps} />
      </WebSocketProvider>
    </SessionProvider>
  )
}
