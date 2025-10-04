import { useRouter } from 'next/router'
import Head from 'next/head'
import { 
  mockParsedResume, 
  mockParsedJobDescription, 
  mockInterviewResults,
  mockInterviewHistory,
  enableMockMode,
  disableMockMode,
  isMockMode
} from '../lib/mockData'
import { useState, useEffect } from 'react'

export default function TestPage() {
  const router = useRouter()
  const [mockEnabled, setMockEnabled] = useState(false)

  useEffect(() => {
    setMockEnabled(isMockMode())
  }, [])

  const toggleMockMode = () => {
    if (mockEnabled) {
      disableMockMode()
      setMockEnabled(false)
    } else {
      enableMockMode()
      setMockEnabled(true)
    }
  }

  const setupMockDataAndNavigate = (page: string) => {
    // Enable mock mode
    enableMockMode()

    // Setup localStorage with mock data
    localStorage.setItem('parsedResume', JSON.stringify(mockParsedResume))
    localStorage.setItem('parsedJobDescription', JSON.stringify(mockParsedJobDescription))
    localStorage.setItem('jobDescriptionUrl', 'https://www.linkedin.com/jobs/view/mock-123456')
    localStorage.setItem('resumeFileName', 'mock-resume.pdf')

    // Navigate to requested page
    router.push(page)
  }

  const setupMockResults = () => {
    enableMockMode()
    sessionStorage.setItem('currentInterviewResults', JSON.stringify(mockInterviewResults))
    router.push('/results')
  }

  const setupMockDashboard = () => {
    enableMockMode()
    // For dashboard, you'll need to be "logged in" or implement guest mock
    alert('Note: Dashboard requires authentication. For now, it will show empty state or redirect to login.')
    router.push('/dashboard')
  }

  return (
    <div className="test-container">
      <Head>
        <title>Test Page - Interview Bot</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Head>

      <main className="test-main">
        <div className="test-card">
          <h1 className="test-title">🧪 Test Mode</h1>
          <p className="test-subtitle">Navigate to any page with mock data (no backend required)</p>

          <div className="mock-mode-toggle">
            <button 
              onClick={toggleMockMode}
              className={`toggle-button ${mockEnabled ? 'enabled' : 'disabled'}`}
            >
              Mock Mode: {mockEnabled ? '✅ ENABLED' : '❌ DISABLED'}
            </button>
            <p className="toggle-hint">
              {mockEnabled 
                ? 'Mock data will be used instead of real API calls' 
                : 'Click to enable mock mode for testing'}
            </p>
          </div>

          <div className="test-sections">
            <section className="test-section">
              <h2>📄 Page Navigation</h2>
              <div className="button-grid">
                <button onClick={() => router.push('/landing')}>
                  Landing Page
                </button>
                <button onClick={() => router.push('/upload')}>
                  Upload Page
                </button>
                <button onClick={() => setupMockDataAndNavigate('/ready')}>
                  Ready Page (with mock data)
                </button>
                <button onClick={() => setupMockDataAndNavigate('/interview')}>
                  Interview Page (with mock data)
                </button>
                <button onClick={setupMockResults}>
                  Results Page (with mock data)
                </button>
                <button onClick={setupMockDashboard}>
                  Dashboard Page
                </button>
              </div>
            </section>

            <section className="test-section">
              <h2>📦 Mock Data Available</h2>
              <div className="data-preview">
                <div className="data-item">
                  <strong>Resume:</strong> John Doe - Senior Software Engineer
                </div>
                <div className="data-item">
                  <strong>Job:</strong> {mockParsedJobDescription.title} at {mockParsedJobDescription.company}
                </div>
                <div className="data-item">
                  <strong>Questions:</strong> 8 interview questions ready
                </div>
                <div className="data-item">
                  <strong>Results:</strong> Overall Score: {mockInterviewResults.overallScore}/100
                </div>
                <div className="data-item">
                  <strong>History:</strong> {mockInterviewHistory.length} past interviews
                </div>
              </div>
            </section>

            <section className="test-section">
              <h2>🔧 Quick Actions</h2>
              <div className="button-grid">
                <button onClick={() => {
                  localStorage.clear()
                  sessionStorage.clear()
                  alert('All browser storage cleared!')
                }}>
                  Clear All Storage
                </button>
                <button onClick={() => {
                  console.log('localStorage:', localStorage)
                  console.log('sessionStorage:', sessionStorage)
                  alert('Check console for storage contents')
                }}>
                  Inspect Storage
                </button>
                <button onClick={() => router.push('/')}>
                  Go to Home
                </button>
              </div>
            </section>

            <section className="test-section">
              <h2>📝 Testing Notes</h2>
              <div className="notes">
                <p><strong>What Works Without Backend:</strong></p>
                <ul>
                  <li>✅ Landing page (fully functional)</li>
                  <li>✅ Upload page UI (no actual parsing)</li>
                  <li>✅ Ready page (with mock data)</li>
                  <li>⚠️ Interview page (WebSocket will fail, but UI visible)</li>
                  <li>✅ Results page (with mock data)</li>
                  <li>⚠️ Dashboard (requires auth or mock)</li>
                </ul>
                <p><strong>What Needs Backend:</strong></p>
                <ul>
                  <li>❌ Actual resume parsing (PDF/DOC to JSON)</li>
                  <li>❌ Job URL scraping</li>
                  <li>❌ AI question generation</li>
                  <li>❌ TTS audio generation</li>
                  <li>❌ STT transcription</li>
                  <li>❌ Answer analysis and scoring</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>

      <style jsx>{`
        .test-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .test-main {
          max-width: 900px;
          margin: 0 auto;
        }

        .test-card {
          background: white;
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .test-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #333;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .test-subtitle {
          text-align: center;
          color: #666;
          margin-bottom: 2rem;
          font-size: 1.125rem;
        }

        .mock-mode-toggle {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .toggle-button {
          padding: 1rem 2rem;
          font-size: 1.125rem;
          font-weight: 700;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 0.75rem;
        }

        .toggle-button.enabled {
          background: #4CAF50;
          color: white;
        }

        .toggle-button.disabled {
          background: #95a5a6;
          color: white;
        }

        .toggle-button:hover {
          transform: scale(1.05);
        }

        .toggle-hint {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }

        .test-sections {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .test-section {
          border-top: 2px solid #e0e0e0;
          padding-top: 1.5rem;
        }

        .test-section h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1rem;
        }

        .button-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .button-grid button {
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          border: 2px solid #667eea;
          background: white;
          color: #667eea;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .button-grid button:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .data-preview {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .data-item {
          padding: 0.75rem 0;
          border-bottom: 1px solid #e0e0e0;
          color: #333;
        }

        .data-item:last-child {
          border-bottom: none;
        }

        .data-item strong {
          color: #667eea;
          margin-right: 0.5rem;
        }

        .notes {
          background: #fff9e6;
          border-radius: 8px;
          padding: 1.5rem;
          border-left: 4px solid #FFC107;
        }

        .notes ul {
          margin: 0.5rem 0 1rem 1.5rem;
          line-height: 1.8;
        }

        .notes p {
          margin: 0.75rem 0;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .test-container {
            padding: 1rem;
          }

          .test-card {
            padding: 2rem 1.5rem;
          }

          .test-title {
            font-size: 2rem;
          }

          .button-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

