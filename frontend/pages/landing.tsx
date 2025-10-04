import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import LoginModal from '../components/LoginModal'
import SignupModal from '../components/SignupModal'
import { isMockMode } from '../lib/mockData'

export default function Landing() {
  const router = useRouter()
  
  // Conditionally use session based on mock mode
  let session = null
  if (!isMockMode()) {
    try {
      const { useSession } = require('next-auth/react')
      const sessionData = useSession()
      session = sessionData.data
    } catch (error) {
      console.log('NextAuth not available in mock mode')
    }
  }
  
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  return (
    <div className="landing-container">
      <Head>
        <title>Interview Bot - AI-Powered Interview Practice</title>
        <meta name="description" content="Practice job interviews with AI-powered feedback and personalized coaching" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon-16x16.svg" />
      </Head>

      {/* Auth Buttons */}
      <div className="auth-buttons">
        {session ? (
          <button 
            className="dashboard-link"
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </button>
        ) : (
          <>
            <button 
              className="login-button"
              onClick={() => setShowLoginModal(true)}
            >
              Log In
            </button>
            <button 
              className="signup-button"
              onClick={() => setShowSignupModal(true)}
            >
              Sign Up
            </button>
          </>
        )}
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false)
          setShowSignupModal(true)
        }}
      />
      
      <SignupModal 
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false)
          setShowLoginModal(true)
        }}
      />

      <main className="landing-main">
        <div className="landing-hero">
          <h1 className="landing-title">
            Master Your Interview Skills
          </h1>
          <p className="landing-subtitle">
            Practice with AI, get real-time feedback, and land your dream job
          </p>
          
          <div className="landing-features">
            <div className="feature-card">
              <span className="feature-icon">🎯</span>
              <h3>Personalized Questions</h3>
              <p>AI generates questions based on your resume and target role</p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">🎤</span>
              <h3>Audio & Video Recording</h3>
              <p>Record your answers to review and improve your delivery</p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h3>Detailed Feedback</h3>
              <p>Get STAR method analysis, filler word detection, and improvement tips</p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">📈</span>
              <h3>Track Progress</h3>
              <p>View your interview history and see your improvement over time</p>
            </div>
          </div>

          <button 
            className="landing-cta"
            onClick={() => router.push('/upload')}
          >
            Start Your First Interview
          </button>

          <p className="landing-note">
            Free to use • Instant feedback
          </p>
        </div>
      </main>

      <style jsx>{`
        .auth-buttons {
          position: absolute;
          top: 2rem;
          right: 2rem;
          display: flex;
          gap: 1rem;
          z-index: 10;
        }

        .login-button, .signup-button, .dashboard-link {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .login-button {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .login-button:hover {
          background: white;
          color: #667eea;
        }

        .signup-button, .dashboard-link {
          background: white;
          color: #667eea;
        }

        .signup-button:hover, .dashboard-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .landing-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
        }

        .landing-main {
          max-width: 1200px;
          width: 100%;
        }

        .landing-hero {
          text-align: center;
          color: white;
        }

        .landing-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .landing-subtitle {
          font-size: 1.5rem;
          margin-bottom: 3rem;
          opacity: 0.95;
        }

        .landing-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease, background 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.15);
        }

        .feature-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          opacity: 0.9;
          line-height: 1.6;
        }

        .landing-cta {
          background: white;
          color: #667eea;
          border: none;
          padding: 1.25rem 3rem;
          font-size: 1.25rem;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          margin-bottom: 1rem;
        }

        .landing-cta:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .landing-note {
          opacity: 0.8;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .landing-title {
            font-size: 2.5rem;
          }

          .landing-subtitle {
            font-size: 1.25rem;
          }

          .landing-features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

