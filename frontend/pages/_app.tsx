import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { WebSocketProvider } from '../contexts/WebSocketContext'
import { isMockMode } from '../lib/mockData'

export default function App({ Component, pageProps }: AppProps) {
  const { session, ...restPageProps } = pageProps

  // Skip NextAuth in mock mode to avoid authentication errors
  if (isMockMode()) {
    return (
      <WebSocketProvider>
        <Component {...restPageProps} />
      </WebSocketProvider>
    )
  }

  // Normal mode with authentication - use dynamic import to avoid SSR issues
  const SessionProvider = require('next-auth/react').SessionProvider
  
  return (
    <SessionProvider session={session}>
      <WebSocketProvider>
        <Component {...restPageProps} />
      </WebSocketProvider>
    </SessionProvider>
  )
}
