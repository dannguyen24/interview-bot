import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useWebSocket } from '../contexts/WebSocketContext'
import { AudioRecorder } from '../components/AudioRecorder'
import { AudioPlayer } from '../components/AudioPlayer'
import { isMockMode } from '../lib/mockData'

interface Question {
  id: string
  text: string
  type: 'behavioral' | 'technical' | 'leadership'
  audioBlob?: Blob
}

interface InterviewState {
  questions: Question[]
  currentQuestionIndex: number
  answers: { [questionId: string]: Blob }
  isGeneratingQuestions: boolean
  isPlayingQuestion: boolean
  isProcessingAnswer: boolean
  isComplete: boolean
}

export default function Interview() {
  const router = useRouter()
  const { socket, isConnected, connectionError } = useWebSocket()
  
  const [interviewState, setInterviewState] = useState<InterviewState>({
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    isGeneratingQuestions: true,
    isPlayingQuestion: false,
    isProcessingAnswer: false,
    isComplete: false
  })

  const [jobDescriptionUrl, setJobDescriptionUrl] = useState('')
  const [parsedResume, setParsedResume] = useState<any>(null)
  const [parsedJobDescription, setParsedJobDescription] = useState<any>(null)
  const [resumeFileName, setResumeFileName] = useState('')

  // Debug info
  const mockMode = isMockMode()
  console.log('🔍 Interview page loaded:', { mockMode })

  // Interview timer
  const [interviewTime, setInterviewTime] = useState(0)
  const interviewTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Format time as MM:SS
  const formatInterviewTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (interviewTimerRef.current) {
        clearInterval(interviewTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Get job description URL and parsed data from localStorage
    const savedJobDescriptionUrl = router.query.jobDescriptionUrl as string || localStorage.getItem('jobDescriptionUrl') || ''
    const savedParsedResume = localStorage.getItem('parsedResume')
    const savedParsedJobDescription = localStorage.getItem('parsedJobDescription')
    const savedResumeFileName = localStorage.getItem('resumeFileName') || ''
    
    setJobDescriptionUrl(savedJobDescriptionUrl)
    setResumeFileName(savedResumeFileName)
    
    if (savedParsedResume) {
      try {
        setParsedResume(JSON.parse(savedParsedResume))
      } catch (error) {
        console.error('Failed to parse resume data:', error)
        router.push('/')
        return
      }
    }

    if (savedParsedJobDescription) {
      try {
        setParsedJobDescription(JSON.parse(savedParsedJobDescription))
      } catch (error) {
        console.error('Failed to parse job description data:', error)
        router.push('/')
        return
      }
    }

    if (!savedJobDescriptionUrl || !savedParsedResume || !savedParsedJobDescription) {
      router.push('/')
      return
    }
  }, [router])

  useEffect(() => {
    console.log('🔍 Interview useEffect triggered:', { socket: !!socket, isConnected, parsedResume: !!parsedResume, parsedJobDescription: !!parsedJobDescription })
    
    if (!socket || !isConnected) {
      console.log('❌ Missing socket or connection:', { socket: !!socket, isConnected })
      return
    }

    if (!parsedResume || !parsedJobDescription) {
      console.log('❌ Missing data:', { parsedResume: !!parsedResume, parsedJobDescription: !!parsedJobDescription })
      return
    }

    console.log('🚀 Starting interview with data')
    setInterviewState(prev => ({ ...prev, isGeneratingQuestions: true }))
    
    // Send interview start request
    socket.emit('start_interview', {
      parsedResume,
      parsedJobDescription
    })

    // Listen for generated questions
    socket.on('questions_generated', (questions: Question[]) => {
      console.log('✅ Received questions:', questions)
      setInterviewState(prev => ({
        ...prev,
        questions,
        isGeneratingQuestions: false,
        isPlayingQuestion: true
      }))
      
      // Start interview timer
      if (!interviewTimerRef.current) {
        interviewTimerRef.current = setInterval(() => {
          setInterviewTime(prev => prev + 1)
        }, 1000)
      }
      
      // Auto-play first question
      if (questions.length > 0) {
        playQuestionAudio(questions[0])
      }
    })

    // Listen for question audio
    socket.on('question_audio', (data: { questionId: string, audioBlob: Blob }) => {
      setInterviewState(prev => ({
        ...prev,
        questions: prev.questions.map(q => 
          q.id === data.questionId ? { ...q, audioBlob: data.audioBlob } : q
        )
      }))
    })

    // Listen for answer analysis
    socket.on('answer_analyzed', (analysis: any) => {
      console.log('✅ Answer analyzed:', analysis)
      setInterviewState(prev => ({
        ...prev,
        isProcessingAnswer: false
      }))
      
      // Move to next question or complete interview
      setTimeout(() => {
        moveToNextQuestion()
      }, 2000)
    })

    // Listen for interview completion
    socket.on('interview_complete', (results: any) => {
      console.log('✅ Interview complete:', results)
      setInterviewState(prev => ({
        ...prev,
        isComplete: true
      }))
      
      // Store results in sessionStorage (temporary - will be saved to MongoDB on results page)
      sessionStorage.setItem('currentInterviewResults', JSON.stringify(results))
      setTimeout(() => {
        router.push('/results')
      }, 3000)
    })

    // Cleanup listeners
    return () => {
      socket.off('questions_generated')
      socket.off('question_audio')
      socket.off('answer_analyzed')
      socket.off('interview_complete')
    }
  }, [socket, isConnected, parsedResume, parsedJobDescription, router])

  const playQuestionAudio = (question: Question) => {
    if (question.audioBlob) {
      setInterviewState(prev => ({ ...prev, isPlayingQuestion: true }))
    }
  }

  const handleAudioData = (audioBlob: Blob) => {
    const currentQuestion = interviewState.questions[interviewState.currentQuestionIndex]
    if (!currentQuestion) return

    // Send audio to backend for analysis
    socket?.emit('submit_answer', {
      questionId: currentQuestion.id,
      audioBlob: audioBlob
    })

    setInterviewState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: audioBlob
      },
      isProcessingAnswer: true
    }))
  }

  const moveToNextQuestion = () => {
    const nextIndex = interviewState.currentQuestionIndex + 1
    if (nextIndex < interviewState.questions.length) {
      setInterviewState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        isPlayingQuestion: true
      }))
      
      // Play next question audio
      const nextQuestion = interviewState.questions[nextIndex]
      if (nextQuestion) {
        playQuestionAudio(nextQuestion)
      }
    } else {
      // Interview complete
      socket?.emit('complete_interview')
    }
  }

  const currentQuestion = interviewState.questions[interviewState.currentQuestionIndex]
  const progress = interviewState.questions.length > 0 
    ? ((interviewState.currentQuestionIndex + 1) / interviewState.questions.length) * 100 
    : 0

  if (connectionError) {
    return (
      <div className="interview-container">
        <Head>
          <title>Interview Bot - Connection Error</title>
        </Head>
        <div className="error-message">
          <h2>❌ Connection Error</h2>
          <p>{connectionError}</p>
          <button onClick={() => router.push('/')}>
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="interview-container">
        <Head>
          <title>Interview Bot - Connecting...</title>
        </Head>
        <div className="loading-message">
          <h2>🔄 Connecting to Interview Server...</h2>
          <p>Please wait while we establish a connection.</p>
        </div>
      </div>
    )
  }

  if (interviewState.isGeneratingQuestions) {
    return (
      <div className="interview-container">
        <Head>
          <title>Interview Bot - Generating Questions</title>
        </Head>
        
        {/* Debug Panel */}
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          <div>Mock Mode: {mockMode ? '✅' : '❌'}</div>
          <div>Socket: {socket ? '✅' : '❌'}</div>
          <div>Connected: {isConnected ? '✅' : '❌'}</div>
          <div>Resume: {parsedResume ? '✅' : '❌'}</div>
          <div>JobDesc: {parsedJobDescription ? '✅' : '❌'}</div>
          <div>Error: {connectionError || 'None'}</div>
        </div>

        <div className="generating-message">
          <h2>🤖 AI is generating your personalized questions...</h2>
          <div className="loading-spinner"></div>
          <p>This may take a few moments.</p>
        </div>
      </div>
    )
  }

  if (interviewState.isComplete) {
    return (
      <div className="interview-container">
        <Head>
          <title>Interview Bot - Interview Complete</title>
        </Head>
        <div className="complete-message">
          <h2>🎉 Interview Complete!</h2>
          <p>Analyzing your responses...</p>
          <div className="loading-spinner"></div>
          <p>Redirecting to results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="interview-container">
      <Head>
        <title>Interview Bot - Question {interviewState.currentQuestionIndex + 1}</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon-16x16.svg" />
      </Head>

      <div className="interview-header">
        <div className="header-content">
          <h1>AI Interview Practice</h1>
          <div className="interview-timer">
            <span className="timer-icon">⏱️</span>
            <span className="timer-text">{formatInterviewTime(interviewTime)}</span>
            <span className="timer-limit">/ 40:00</span>
          </div>
        </div>
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">
            Question {interviewState.currentQuestionIndex + 1} of {interviewState.questions.length}
          </span>
        </div>
      </div>

      <div className="question-section">
        <div className="question-card">
          <div className="question-type">
            {currentQuestion?.type?.toUpperCase() || 'QUESTION'}
          </div>
          <h2 className="question-text">
            {currentQuestion?.text || 'Loading question...'}
          </h2>
          
          {currentQuestion?.audioBlob && (
            <div className="question-audio">
              <AudioPlayer 
                audioBlob={currentQuestion.audioBlob}
                autoPlay={interviewState.isPlayingQuestion}
                onPlaybackComplete={() => {
                  setInterviewState(prev => ({ ...prev, isPlayingQuestion: false }))
                }}
              />
              
              {interviewState.isPlayingQuestion && (
                <button 
                  className="skip-audio-button"
                  onClick={() => setInterviewState(prev => ({ ...prev, isPlayingQuestion: false }))}
                >
                  Skip Audio & Start Recording
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="recording-section">
        {/* Debug info for recording state */}
        <div style={{ 
          background: 'rgba(0,0,0,0.1)', 
          padding: '10px', 
          marginBottom: '10px',
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          <div>isPlayingQuestion: {interviewState.isPlayingQuestion ? '🔴 TRUE (disabled)' : '✅ FALSE'}</div>
          <div>isProcessingAnswer: {interviewState.isProcessingAnswer ? '🔴 TRUE (disabled)' : '✅ FALSE'}</div>
          <div>Button disabled: {(interviewState.isProcessingAnswer || interviewState.isPlayingQuestion) ? '🔴 YES' : '✅ NO'}</div>
        </div>
        
        {/* Always show skip button when audio is "playing" */}
        {interviewState.isPlayingQuestion && (
          <button 
            className="skip-audio-button"
            onClick={() => {
              console.log('🎯 Skipping audio, enabling recording...')
              setInterviewState(prev => ({ ...prev, isPlayingQuestion: false }))
            }}
            style={{ marginBottom: '1rem' }}
          >
            ⏭️ Skip Audio & Enable Recording
          </button>
        )}
        
        <AudioRecorder
          onAudioData={handleAudioData}
          onRecordingStateChange={(isRecording) => {
            // Update UI based on recording state
          }}
          disabled={interviewState.isProcessingAnswer || interviewState.isPlayingQuestion}
        />
        
        {interviewState.isProcessingAnswer && (
          <div className="processing-message">
            <div className="loading-spinner"></div>
            <p>🤖 AI is analyzing your response...</p>
          </div>
        )}
      </div>

      <div className="interview-footer">
        <button 
          className="exit-button"
          onClick={() => router.push('/')}
        >
          Exit Interview
        </button>
      </div>
    </div>
  )
}
