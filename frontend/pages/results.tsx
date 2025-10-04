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

  useEffect(() => {
    // Get results from localStorage
    const savedResults = localStorage.getItem('interviewResults')
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults))
      } catch (error) {
        console.error('Failed to parse results:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const handleStartNewInterview = () => {
    // Clear stored data
    localStorage.removeItem('jobDescription')
    localStorage.removeItem('resume')
    localStorage.removeItem('interviewResults')
    
    // Navigate back to home
    router.push('/')
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
            {results.questions.map((q, index) => (
              <div key={index} className="question-analysis">
                <div className="question-header">
                  <h3>Question {index + 1}</h3>
                  <div 
                    className="question-score"
                    style={{ color: getScoreColor(q.score) }}
                  >
                    {q.score}/100
                  </div>
                </div>
                
                <div className="question-content">
                  <p className="question-text">"{q.question}"</p>
                  
                  <div className="star-analysis">
                    <h4>STAR Method Analysis:</h4>
                    <div className="star-elements">
                      <span className={`star-element ${q.starElements.situation ? 'present' : 'missing'}`}>
                        {q.starElements.situation ? '✅' : '❌'} Situation
                      </span>
                      <span className={`star-element ${q.starElements.task ? 'present' : 'missing'}`}>
                        {q.starElements.task ? '✅' : '❌'} Task
                      </span>
                      <span className={`star-element ${q.starElements.action ? 'present' : 'missing'}`}>
                        {q.starElements.action ? '✅' : '❌'} Action
                      </span>
                      <span className={`star-element ${q.starElements.result ? 'present' : 'missing'}`}>
                        {q.starElements.result ? '✅' : '❌'} Result
                      </span>
                    </div>
                  </div>

                  <div className="metrics">
                    <div className="metric">
                      <span className="metric-label">Keywords Found:</span>
                      <span className="metric-value">{q.keywordsFound.length}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Filler Words:</span>
                      <span className="metric-value">{q.fillerWords}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Time Spent:</span>
                      <span className="metric-value">{q.timeSpent}s</span>
                    </div>
                  </div>

                  <div className="feedback">
                    <h4>AI Feedback:</h4>
                    <p>{q.feedback}</p>
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
