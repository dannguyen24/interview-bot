import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useWebSocket } from '../contexts/WebSocketContext'
import { isMockMode, enableMockMode } from '../lib/mockData'

export default function DebugInterview() {
  const { socket, isConnected, connectionError } = useWebSocket()
  const [mockMode, setMockMode] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const mockModeStatus = isMockMode()
    setMockMode(mockModeStatus)
    addLog(`Page loaded - Mock mode: ${mockModeStatus}`)
    addLog(`Socket exists: ${!!socket}`)
    addLog(`Connected: ${isConnected}`)
    addLog(`Error: ${connectionError || 'None'}`)
  }, [socket, isConnected, connectionError])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)])
  }

  const handleEnableMockMode = () => {
    enableMockMode()
    setMockMode(true)
    addLog('Mock mode enabled - refresh to test WebSocket context')
  }

  const testInterviewFlow = () => {
    if (!socket) {
      addLog('❌ No socket available')
      return
    }

    // Simulate the interview start
    const mockData = {
      parsedResume: { name: 'Test User' },
      parsedJobDescription: { title: 'Test Job' }
    }

    addLog('🚀 Testing interview start...')
    socket.emit('start_interview', mockData)
  }

  const goToInterview = () => {
    // Set up mock data for interview
    localStorage.setItem('parsedResume', JSON.stringify({ name: 'Test User', skills: ['React'] }))
    localStorage.setItem('parsedJobDescription', JSON.stringify({ title: 'Test Job', company: 'Test Co' }))
    localStorage.setItem('resumeFileName', 'test-resume.pdf')
    
    enableMockMode()
    window.location.href = '/interview'
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <Head>
        <title>Debug Interview - Interview Bot</title>
      </Head>

      <h1>🔍 Interview Debug Page</h1>
      
      <div style={{ marginBottom: '20px', background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
        <p><strong>Current State:</strong></p>
        <p>Mock Mode: {mockMode ? '✅ Enabled' : '❌ Disabled'}</p>
        <p>Socket: {socket ? '✅ Available' : '❌ Not available'}</p>
        <p>Connected: {isConnected ? '✅ Yes' : '❌ No'}</p>
        <p>Error: {connectionError || 'None'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleEnableMockMode} 
          style={{ marginRight: '10px', padding: '10px', background: mockMode ? '#ddd' : '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
          disabled={mockMode}
        >
          Enable Mock Mode
        </button>
        
        <button 
          onClick={testInterviewFlow} 
          style={{ marginRight: '10px', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
          disabled={!socket}
        >
          Test Interview Start
        </button>
        
        <button 
          onClick={goToInterview} 
          style={{ padding: '10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Go to Interview Page
        </button>
      </div>

      <div style={{ border: '1px solid #ccc', height: '200px', overflow: 'auto', padding: '10px' }}>
        <h3>Debug Logs:</h3>
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: '5px', fontSize: '14px' }}>
            {log}
          </div>
        ))}
        {logs.length === 0 && <div style={{ color: '#666' }}>No logs yet...</div>}
      </div>
    </div>
  )
}
