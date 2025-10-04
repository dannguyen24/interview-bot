import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Ready() {
  const router = useRouter()
  const [resumeFileName, setResumeFileName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load data from localStorage
    const savedResumeFileName = localStorage.getItem('resumeFileName')
    const savedParsedJobDescription = localStorage.getItem('parsedJobDescription')
    const savedParsedResume = localStorage.getItem('parsedResume')

    if (!savedResumeFileName || !savedParsedJobDescription || !savedParsedResume) {
      router.push('/upload')
      return
    }

    try {
      const jobData = JSON.parse(savedParsedJobDescription)
      setResumeFileName(savedResumeFileName)
      setJobTitle(jobData.title || 'Position')
      setCompany(jobData.company || 'Company')
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to parse data:', error)
      router.push('/upload')
    }
  }, [router])

  const handleStartInterview = () => {
    router.push('/interview')
  }

  const handleBack = () => {
    router.push('/upload')
  }

  if (isLoading) {
    return (
      <div className="ready-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="ready-container">
      <Head>
        <title>Ready to Start - Interview Bot</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon-16x16.svg" />
      </Head>

      <main className="ready-main">
        <div className="ready-card">
          <div className="ready-icon">✅</div>
          
          <h1 className="ready-title">
            All Set!
          </h1>
          
          <p className="ready-subtitle">
            Your interview is ready to begin
          </p>

          <div className="ready-details">
            <div className="detail-item">
              <span className="detail-label">Position:</span>
              <span className="detail-value">{jobTitle}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Company:</span>
              <span className="detail-value">{company}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Resume:</span>
              <span className="detail-value">{resumeFileName}</span>
            </div>
          </div>

          <div className="ready-info">
            <h3>What to expect:</h3>
            <ul>
              <li>📝 8 personalized interview questions</li>
              <li>🎤 Audio and video recording of your answers</li>
              <li>⏱️ Real-time AI feedback and analysis</li>
              <li>📊 Detailed performance breakdown</li>
            </ul>
          </div>

          <div className="ready-actions">
            <button 
              className="start-interview-button"
              onClick={handleStartInterview}
            >
              Start Interview
            </button>
            
            <button 
              className="back-button"
              onClick={handleBack}
            >
              ← Go Back
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        .ready-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .ready-main {
          max-width: 600px;
          width: 100%;
        }

        .ready-card {
          background: white;
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
        }

        .ready-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .ready-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .ready-subtitle {
          font-size: 1.25rem;
          color: #666;
          margin-bottom: 2rem;
        }

        .ready-details {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-weight: 600;
          color: #666;
        }

        .detail-value {
          color: #333;
          font-weight: 500;
        }

        .ready-info {
          background: #e8f0fe;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .ready-info h3 {
          margin-bottom: 1rem;
          color: #667eea;
        }

        .ready-info ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .ready-info li {
          padding: 0.5rem 0;
          color: #333;
        }

        .ready-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .start-interview-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1.25rem 2rem;
          font-size: 1.25rem;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .start-interview-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .back-button {
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
          padding: 0.75rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: #667eea;
          color: white;
        }

        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .ready-card {
            padding: 2rem;
          }

          .ready-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  )
}

