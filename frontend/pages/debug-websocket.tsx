import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useWebSocket } from '../contexts/WebSocketContext'
import { isMockMode } from '../lib/mockData'

export default function DebugWebSocket() {
  const { socket, isConnected, connectionError } = useWebSocket()
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]) // Keep last 20 logs
  }

  useEffect(() => {
    addLog(`🔍 Debug page loaded - Mock mode: ${isMockMode()}`)
    addLog(`🔍 Socket exists: ${!!socket}`)
    addLog(`🔍 Is connected: ${isConnected}`)
    addLog(`🔍 Connection error (${!!connectionError}): ${connectionError}`)
  }, [socket, isConnected, connectionError])

  const testStartInterview = () => {
    if (!socket) {
      addLog('❌ No socket available')
      return
    }

    addLog('🚀 Sending start_interview...')
    
    const mockData = {
      parsedResume: { name: 'Test User', skills: ['React', 'Node.js'] },
      parsedJobDescription: { title: 'Test Job', company: 'Test Company' }
    }

    socket.emit('start_interview', mockData)
    addLog('✅ start_interview sent')
  }

  const testRequestAudio = () => {
    if (!socket) {
      addLog('❌ No socket available')
      return
    }

    addLog('🎵 Requesting question audio...')
    socket.emit('request_question_audio', { questionId: 'test-q-1' })
    addLog('✅ Audio request sent')
  }

  useEffect(() => {
    if (!socket) return

    const handleQuestionsGenerated = (questions: any[]) => {
      addLog(`✅ Received ${questions.length} questions: ${questions.map(q => q.text).join(', ')}`)
    }

    const handleQuestionAudio = (data: any) => {
      addLog(`🎵 Received audio for question ${data.questionId}`)
    }

    const handleAnswerAnalyzed = (analysis: any) => {
      addLog(`📊 Answer analyzed - Score: ${analysis.score}`)
    }

    const handleInterviewComplete = (results: any) => {
      addLog(`🎉 Interview complete - Overall score: ${results.overallScore}`)
    }

    socket.on('questions_generated', handleQuestionsGenerated)
    socket.on('question_audio', handleQuestionAudio)
    socket.on('answer_analyzed', handleAnswerAnalyzed)
    socket.on('interview_complete', handleInterviewComplete)

    return () => {
      socket.off('questions_generated', handleQuestionsGenerated)
      socket.off('question_audio', handleQuestionAudio)
      socket.off('answer_analyzed', handleAnswerAnalyzed)
      socket.off('interview_complete', handleInterviewComplete)
    }
  }, [socket])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <Head>
        <title>WebSocket Debug - Interview Bot</title>
      </Head>

      <h1>🧪 WebSocket Debug Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Mock Mode:</strong> {isMockMode() ? '✅ Enabled' : '❌ Disabled'}</p>
        <p><strong>Socket:</strong> {socket ? '✅ Available' : '❌ Not available'}</p>
        <p><strong>Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Error:</strong> {connectionError || 'None'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={testStartInterview} style={{ marginRight: '10px', padding: '10px' }}>
          Test Start Interview
        </button>
        <button onClick={testRequestAudio} style={{ marginRight: '10px', padding: '10px' }}>
          Test Request Audio
        </button>
        <button onClick={() => setLogs([])} style={{ padding: '10px' }}>
          Clear Logs
        </button>
      </div>

      <div style={{ border: '1px solid #ccc', height: '400px', overflow: 'auto', padding: '10px' }}>
        <h3>Logs:</h3>
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            {log}
          </div>
        ))}
        {logs.length === 0 && <div style={{ color: '#666' }}>No logs yet...</div>}
      </div>
    </div>
  )
}
