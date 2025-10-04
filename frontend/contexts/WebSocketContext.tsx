import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { mockQuestions, mockInterviewResults, isMockMode } from '../lib/mockData'
import { Question, AnswerAnalysis } from '../types/api'

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectionError: string | null
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  connectionError: null
})

interface WebSocketProviderProps {
  children: ReactNode
}

// Mock WebSocket class that simulates socket.io behavior
class MockWebSocket {
  private listeners: Map<string, Function[]> = new Map()
  private isConnected: boolean = false
  private currentQuestionIndex: number = 0
  private questions: Question[] = []
  private interviewStarted: boolean = false

  constructor() {
    // Simulate connection after a short delay
    setTimeout(() => {
      this.isConnected = true
      this.triggerCallbacks('connect')
      console.log('🧪 Mock WebSocket connected')
    }, 500)
  }

  emit(event: string, data?: any) {
    console.log(`🧪 Mock WebSocket emit (client->server): ${event}`, data)
    
    // Handle outgoing events (client to server)
    switch (event) {
      case 'start_interview':
        this.handleStartInterview(data)
        break
      case 'request_question_audio':
        this.handleRequestQuestionAudio(data)
        break
      case 'submit_answer':
        this.handleSubmitAnswer(data)
        break
      case 'complete_interview':
        this.handleCompleteInterview()
        break
      default:
        console.log(`🧪 Mock WebSocket: Unknown emit event: ${event}`)
    }
    
    // Return this for chaining (like socket.io does)
    return this
  }

  on(event: string, callback: Function) {
    console.log(`🧪 Mock WebSocket listening for: ${event}`)
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
    return this
  }

  off(event: string, callback?: Function) {
    console.log(`🧪 Mock WebSocket removing listener for: ${event}`)
    if (this.listeners.has(event)) {
      if (callback) {
        const callbacks = this.listeners.get(event)!
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      } else {
        this.listeners.delete(event)
      }
    }
    return this
  }

  private triggerCallbacks(event: string, data?: any) {
    console.log(`🧪 Mock WebSocket trigger (server->client): ${event}`, data)
    const callbacks = this.listeners.get(event) || []
    console.log(`🧪 Found ${callbacks.length} callback(s) for ${event}`)
    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in mock WebSocket callback for ${event}:`, error)
      }
    })
  }

  private handleStartInterview(data: any) {
    console.log('🧪 Starting mock interview with:', data)
    this.interviewStarted = true
    this.questions = mockQuestions
    this.currentQuestionIndex = 0

    // Simulate question generation delay
    setTimeout(() => {
      this.triggerCallbacks('questions_generated', this.questions)
    }, 2000)
  }

  private handleRequestQuestionAudio(data: any) {
    const questionId = data.questionId
    const question = this.questions.find(q => q.id === questionId)
    
    if (question) {
      console.log(`🧪 Generating mock audio for question: ${questionId}`)
      
      // Simulate TTS generation delay
      setTimeout(() => {
        // Create a mock audio blob (empty but valid)
        const mockAudioBlob = new Blob(['mock audio data'], { type: 'audio/wav' })
        this.triggerCallbacks('question_audio', {
          questionId,
          audioBlob: mockAudioBlob
        })
      }, 1500)
    }
  }

  private handleSubmitAnswer(data: any) {
    const { questionId, audioBlob } = data
    console.log(`🧪 Processing mock answer for question: ${questionId}`)
    
    // Simulate answer analysis delay
    setTimeout(() => {
      const question = this.questions.find(q => q.id === questionId)
      if (question) {
        const mockAnalysis: AnswerAnalysis = {
          score: Math.floor(Math.random() * 40) + 60, // Random score 60-100
          feedback: `Great answer! You demonstrated strong ${question.type.toLowerCase()} skills. Consider providing more specific examples next time.`,
          keywordsFound: ['experience', 'team', 'project', 'leadership'],
          fillerWords: Math.floor(Math.random() * 5),
          timeSpent: Math.floor(Math.random() * 30) + 30, // 30-60 seconds
          star: {
            situation: Math.random() > 0.3,
            task: Math.random() > 0.2,
            action: Math.random() > 0.4,
            result: Math.random() > 0.3
          }
        }
        
        this.triggerCallbacks('answer_analyzed', mockAnalysis)
      }
    }, 3000)
  }

  private handleCompleteInterview() {
    console.log('🧪 Completing mock interview')
    
    // Simulate final analysis delay
    setTimeout(() => {
      this.triggerCallbacks('interview_complete', mockInterviewResults)
    }, 2000)
  }

  // Mock connection status
  get connected() {
    return this.isConnected
  }

  // Mock disconnect
  disconnect() {
    this.isConnected = false
    this.triggerCallbacks('disconnect')
    console.log('🧪 Mock WebSocket disconnected')
  }
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    let newSocket: Socket | MockWebSocket

    const mockModeStatus = isMockMode()
    console.log('🔍 WebSocket useEffect - Mock mode:', mockModeStatus)

    // Check if we're in mock mode
    if (mockModeStatus) {
      console.log('🧪 Using Mock WebSocket for testing')
      newSocket = new MockWebSocket() as any
      console.log('🔍 Mock WebSocket created:', newSocket)
      
      // Mock connection handlers
      newSocket.on('connect', () => {
        console.log('✅ Mock WebSocket connected')
        setIsConnected(true)
        setConnectionError(null)
      })

      newSocket.on('disconnect', () => {
        console.log('❌ Mock WebSocket disconnected')
        setIsConnected(false)
      })

      newSocket.on('connect_error', (error: any) => {
        console.error('❌ Mock WebSocket connection error:', error)
        setConnectionError(error.message)
        setIsConnected(false)
      })

      setSocket(newSocket)
    } else {
      // Real WebSocket connection
      newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000', {
        transports: ['websocket'],
        autoConnect: true
      })

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Connected to WebSocket server')
        setIsConnected(true)
        setConnectionError(null)
      })

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from WebSocket server')
        setIsConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error)
        setConnectionError(error.message)
        setIsConnected(false)
      })

      setSocket(newSocket)
    }

    // Cleanup on unmount
    return () => {
      if (newSocket && typeof newSocket.close === 'function') {
        newSocket.close()
      } else if (newSocket && typeof newSocket.disconnect === 'function') {
        newSocket.disconnect()
      }
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, connectionError }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}
