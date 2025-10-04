import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

interface InterviewResults {
  overallScore: number
  questions: Array<{
    question: string
    answer: string
    score: number
    feedback: string
    starElements: {
      situation: boolean
      task: boolean
      action: boolean
      result: boolean
    }
    keywordsFound: string[]
    fillerWords: number
    timeSpent: number
  }>
  strengths: string[]
  improvements: string[]
  microDrills: string[]
  followUpQuestion: string
}

export default function Results() {
  const router = useRouter()
  const [results, setResults] = useState<InterviewResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Get results from sessionStorage (temporary) or query params (from dashboard)
    const savedResults = sessionStorage.getItem('currentInterviewResults')
    const interviewId = router.query.interviewId as string
    
    const loadResults = async () => {
      if (savedResults) {
        // Fresh interview results from sessionStorage
        try {
          const parsedResults = JSON.parse(savedResults)
          setResults(parsedResults)
          
          // Save to MongoDB if user is authenticated
          if (!interviewId) {
            await saveInterviewToDatabase(parsedResults)
          }
        } catch (error) {
          console.error('Failed to parse results:', error)
        }
      } else if (interviewId) {
        // Loading old interview from dashboard
        try {
          const response = await fetch(`/api/user/get-interview?interviewId=${interviewId}`)
          if (response.ok) {
            const data = await response.json()
            setResults(data.interview.results)
          }
        } catch (error) {
          console.error('Failed to load interview:', error)
        }
      }
      setIsLoading(false)
    }

    loadResults()
  }, [router.query.interviewId])

  const saveInterviewToDatabase = async (interviewResults: InterviewResults) => {
    setIsSaving(true)
    try {
      const parsedResume = localStorage.getItem('parsedResume')
      const parsedJobDescription = localStorage.getItem('parsedJobDescription')

      const response = await fetch('/api/user/save-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewResults,
          parsedResume: parsedResume ? JSON.parse(parsedResume) : null,
          parsedJobDescription: parsedJobDescription ? JSON.parse(parsedJobDescription) : null,
        }),
      })

      if (response.ok) {
        console.log('✅ Interview saved to database')
        // Clear temporary session data
        sessionStorage.removeItem('currentInterviewResults')
      } else if (response.status === 401) {
        console.log('⚠️ User not authenticated - results not saved to database')
      }
    } catch (error) {
      console.error('Failed to save interview:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleStartNewInterview = () => {
    // Clear temporary session data
    sessionStorage.removeItem('currentInterviewResults')
    localStorage.removeItem('parsedResume')
    localStorage.removeItem('parsedJobDescription')
    localStorage.removeItem('jobDescriptionUrl')
    localStorage.removeItem('resumeFileName')
    
    // Navigate to upload page
    router.push('/upload')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50' // Green
    if (score >= 60) return '#FF9800' // Orange
    return '#F44336' // Red
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  if (isLoading) {
    return (
      <div className="results-container">
        <Head>
          <title>Interview Bot - Loading Results</title>
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon-16x16.svg" />
        </Head>
        <div className="loading-message">
          <h2>📊 Loading your interview results...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="results-container">
        <Head>
          <title>Interview Bot - No Results</title>
        </Head>
        <div className="no-results-message">
          <h2>❌ No interview results found</h2>
          <p>It looks like you haven't completed an interview yet.</p>
          <button onClick={() => router.push('/')}>
            Start New Interview
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="results-container">
      <Head>
        <title>Interview Bot - Your Results</title>
        <meta name="description" content="View your AI interview practice results and feedback" />
      </Head>

      <div className="results-header">
        <h1>🎯 Your Interview Results</h1>
        <div className="overall-score">
          <div 
            className="score-circle"
            style={{ 
              background: `conic-gradient(${getScoreColor(results.overallScore)} 0deg ${(results.overallScore / 100) * 360}deg, #e0e0e0 0deg)`
            }}
          >
            <div className="score-inner">
              <span className="score-number">{results.overallScore}</span>
              <span className="score-label">{getScoreLabel(results.overallScore)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="results-content">
        {/* Strengths Section */}
        <section className="strengths-section">
          <h2>💪 Your Strengths</h2>
          <ul className="strengths-list">
            {results.strengths.map((strength, index) => (
              <li key={index} className="strength-item">
                ✅ {strength}
              </li>
            ))}
          </ul>
        </section>

        {/* Improvements Section */}
        <section className="improvements-section">
          <h2>🎯 Areas for Improvement</h2>
          <ul className="improvements-list">
            {results.improvements.map((improvement, index) => (
              <li key={index} className="improvement-item">
                🔧 {improvement}
              </li>
            ))}
          </ul>
        </section>

        {/* Micro Drills Section */}
        <section className="drills-section">
          <h2>🏋️ Micro Drills</h2>
          <p>Practice these specific exercises to improve your interview skills:</p>
          <ul className="drills-list">
            {results.microDrills.map((drill, index) => (
              <li key={index} className="drill-item">
                📝 {drill}
              </li>
            ))}
          </ul>
        </section>

        {/* Question-by-Question Analysis */}
        <section className="questions-analysis">
          <h2>📋 Question Analysis</h2>
          <div className="questions-list">
            {results.questions.map((qa, index) => (
              <div key={index} className="question-analysis">
                <div className="question-header">
                  <h3>Question {index + 1}: {qa.question.type}</h3>
                  <div 
                    className="question-score"
                    style={{ color: getScoreColor(qa.analysis.score) }}
                  >
                    {qa.analysis.score}/100
                  </div>
                </div>
                
                <div className="question-content">
                  <p className="question-text">"{qa.question.text}"</p>
                  
                  <div className="star-analysis">
                    <h4>STAR Method Analysis:</h4>
                    <div className="star-elements">
                      <span className={`star-element ${qa.analysis?.star?.situation ? 'present' : 'missing'}`}>
                        {qa.analysis?.star?.situation ? '✅' : '❌'} Situation
                      </span>
                      <span className={`star-element ${qa.analysis?.star?.task ? 'present' : 'missing'}`}>
                        {qa.analysis?.star?.task ? '✅' : '❌'} Task
                      </span>
                      <span className={`star-element ${qa.analysis?.star?.action ? 'present' : 'missing'}`}>
                        {qa.analysis?.star?.action ? '✅' : '❌'} Action
                      </span>
                      <span className={`star-element ${qa.analysis?.star?.result ? 'present' : 'missing'}`}>
                        {qa.analysis?.star?.result ? '✅' : '❌'} Result
                      </span>
                    </div>
                  </div>

                  <div className="metrics">
                    <div className="metric">
                      <span className="metric-label">Keywords Found:</span>
                      <span className="metric-value">{qa.analysis?.keywordsFound?.length || 0}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Filler Words:</span>
                      <span className="metric-value">{qa.analysis?.fillerWords || 0}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Time Spent:</span>
                      <span className="metric-value">{qa.analysis?.timeSpent || 0}s</span>
                    </div>
                  </div>

                  <div className="feedback">
                    <h4>AI Feedback:</h4>
                    <p>{qa.analysis?.feedback || 'No feedback available'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Follow-up Question */}
        <section className="follow-up-section">
          <h2>🔄 Follow-up Practice</h2>
          <div className="follow-up-question">
            <p><strong>Try this question to improve further:</strong></p>
            <p className="follow-up-text">"{results.followUpQuestion}"</p>
          </div>
        </section>
      </div>

      <div className="results-footer">
        <button 
          className="new-interview-button"
          onClick={handleStartNewInterview}
        >
          🚀 Start New Interview
        </button>
        
        <button 
          className="home-button"
          onClick={() => router.push('/')}
        >
          🏠 Back to Home
        </button>
      </div>
    </div>
  )
}
