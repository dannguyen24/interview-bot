import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [jobDescription, setJobDescription] = useState('')
  const [resume, setResume] = useState('')

  const handleStartInterview = () => {
    // TODO: Connect to backend API
    console.log('Starting interview with:', { jobDescription, resume })
  }

  return (
    <div className="container">
      <Head>
        <title>Interview Bot</title>
        <meta name="description" content="AI-powered interview practice tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <h1 className="title">
          Welcome to Interview Bot
        </h1>

        <p className="description">
          Practice your interview skills with AI-powered feedback
        </p>

        <div className="form-container">
          <div className="input-group">
            <label htmlFor="job-description">
              Job Description:
            </label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={6}
            />
          </div>

          <div className="input-group">
            <label htmlFor="resume">
              Your Resume:
            </label>
            <textarea
              id="resume"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume or experience bullets here..."
              rows={6}
            />
          </div>

          <button 
            className="start-button"
            onClick={handleStartInterview}
            disabled={!jobDescription || !resume}
          >
            Start Interview
          </button>
        </div>
      </main>
    </div>
  )
}
