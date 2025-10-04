import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { mockInterviewHistory, isMockMode } from '../lib/mockData'

interface InterviewHistoryItem {
  id: string
  date: string
  jobTitle: string
  company: string
  overallScore: number
  completed: boolean
}

export default function Dashboard() {
  const router = useRouter()
  const [interviewHistory, setInterviewHistory] = useState<InterviewHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load interview history from MongoDB or mock data
    const loadHistory = async () => {
      try {
        // Check if in mock mode
        if (isMockMode()) {
          console.log('🧪 Mock mode - using mock interview history')
          setInterviewHistory(mockInterviewHistory)
          setIsLoading(false)
          return
        }

        // Real API call
        const response = await fetch('/api/user/get-interviews')
        
        if (response.ok) {
          const data = await response.json()
          setInterviewHistory(data.interviews || [])
        } else if (response.status === 401) {
          // Not authenticated, redirect to landing
          router.push('/landing')
          return
        }
      } catch (error) {
        console.error('Failed to load interview history:', error)
      }
      setIsLoading(false)
    }

    loadHistory()
  }, [router])

  const handleViewResult = async (interviewId: string) => {
    // Load specific interview from MongoDB or use mock data
    try {
      // Check if in mock mode
      if (isMockMode()) {
        console.log('🧪 Mock mode - loading mock interview results')
        const { mockInterviewResults } = await import('../lib/mockData')
        sessionStorage.setItem('currentInterviewResults', JSON.stringify(mockInterviewResults))
        router.push(`/results?interviewId=${interviewId}`)
        return
      }

      // Real API call
      const response = await fetch(`/api/user/get-interview?interviewId=${interviewId}`)
      
      if (response.ok) {
        const data = await response.json()
        // Store in sessionStorage for results page (temporary)
        sessionStorage.setItem('currentInterviewResults', JSON.stringify(data.interview.results))
        router.push(`/results?interviewId=${interviewId}`)
      }
    } catch (error) {
      console.error('Failed to load interview:', error)
      alert('Failed to load interview details')
    }
  }

  const handleNewInterview = () => {
    router.push('/upload')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50'
    if (score >= 60) return '#FFC107'
    return '#F44336'
  }

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Head>
        <title>Dashboard - Interview Bot</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon-16x16.svg" />
      </Head>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Your Interview Dashboard</h1>
          <button className="new-interview-button" onClick={handleNewInterview}>
            + New Interview
          </button>
        </div>

        {interviewHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No Interviews Yet</h2>
            <p>Start your first interview to see your progress here</p>
            <button className="start-first-button" onClick={handleNewInterview}>
              Start Your First Interview
            </button>
          </div>
        ) : (
          <div className="history-grid">
            {interviewHistory.map((interview) => (
              <div 
                key={interview.id} 
                className="history-card"
                onClick={() => handleViewResult(interview.id)}
              >
                <div className="history-header">
                  <div>
                    <h3 className="history-job-title">{interview.jobTitle}</h3>
                    <p className="history-company">{interview.company}</p>
                  </div>
                  <div 
                    className="history-score"
                    style={{ background: getScoreColor(interview.overallScore) }}
                  >
                    {interview.overallScore}
                  </div>
                </div>
                
                <div className="history-meta">
                  <span className="history-date">
                    📅 {new Date(interview.date).toLocaleDateString()}
                  </span>
                  <span className={`history-status ${interview.completed ? 'completed' : 'incomplete'}`}>
                    {interview.completed ? '✅ Completed' : '⏸️ Incomplete'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .dashboard-main {
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dashboard-title {
          color: white;
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0;
        }

        .new-interview-button {
          background: white;
          color: #667eea;
          border: none;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .new-interview-button:hover {
          transform: scale(1.05);
        }

        .empty-state {
          background: white;
          border-radius: 16px;
          padding: 4rem 2rem;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 1rem;
        }

        .empty-state h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .empty-state p {
          color: #666;
          font-size: 1.25rem;
          margin-bottom: 2rem;
        }

        .start-first-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          font-size: 1.125rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .start-first-button:hover {
          transform: scale(1.05);
        }

        .history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .history-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .history-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .history-job-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 0.25rem 0;
        }

        .history-company {
          color: #666;
          margin: 0;
        }

        .history-score {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .history-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }

        .history-date {
          color: #666;
          font-size: 0.875rem;
        }

        .history-status {
          font-size: 0.875rem;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .history-status.completed {
          background: #e8f5e9;
          color: #4CAF50;
        }

        .history-status.incomplete {
          background: #fff3e0;
          color: #FF9800;
        }

        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 50vh auto 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .dashboard-title {
            font-size: 2rem;
          }

          .history-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

