import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { mockParsedResume, mockParsedJobDescription, isMockMode } from '../lib/mockData'

export default function Upload() {
  const router = useRouter()
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return url.includes('linkedin.com') || url.includes('indeed.com') || url.includes('glassdoor.com') || url.includes('ziprecruiter.com') || url.includes('monster.com') || url.includes('careerbuilder.com') || url.includes('angel.co') || url.includes('wellfound.com') || url.includes('jobs.lever.co') || url.includes('greenhouse.io') || url.includes('workday.com') || url.includes('smartrecruiters.com')
    } catch {
      return false
    }
  }

  const handleUrlChange = (url: string) => {
    setJobDescriptionUrl(url)
    setIsValidUrl(validateUrl(url))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, DOC, DOCX, or TXT file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      setResumeFile(file)
    }
  }

  const handleContinue = async () => {
    if (!resumeFile) {
      alert('Please upload your resume')
      return
    }

    setIsUploading(true)
    
    try {
      // Check if in mock mode
      if (isMockMode()) {
        console.log('🧪 Mock mode enabled - using mock data')
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Use mock data
        localStorage.setItem('jobDescriptionUrl', jobDescriptionUrl)
        localStorage.setItem('parsedResume', JSON.stringify(mockParsedResume))
        localStorage.setItem('parsedJobDescription', JSON.stringify(mockParsedJobDescription))
        localStorage.setItem('resumeFileName', resumeFile.name)
        
        router.push('/ready')
        return
      }

      // Real backend calls (when not in mock mode)
      // Step 1: Upload resume file to backend for parsing
      const resumeFormData = new FormData()
      resumeFormData.append('resume', resumeFile)
      
      const resumeResponse = await fetch('/api/upload-resume', {
        method: 'POST',
        body: resumeFormData
      })
      
      if (!resumeResponse.ok) {
        throw new Error('Failed to upload resume')
      }
      
      const resumeResult = await resumeResponse.json()
      
      // Step 2: Parse job description separately
      const jobResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/parse_job_description/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescriptionUrl: jobDescriptionUrl
        })
      })
      
      if (!jobResponse.ok) {
        throw new Error('Failed to parse job description')
      }
      
      const jobResult = await jobResponse.json()
      
      // Store parsed data for confirmation page
      localStorage.setItem('jobDescriptionUrl', jobDescriptionUrl)
      localStorage.setItem('parsedResume', JSON.stringify(resumeResult.parsedResume))
      localStorage.setItem('parsedJobDescription', JSON.stringify(jobResult))
      localStorage.setItem('resumeFileName', resumeFile.name)
      
      // Navigate to confirmation page
      router.push('/ready')
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to process data. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="upload-container">
      <Head>
        <title>Upload Resume - Interview Bot</title>
        <meta name="description" content="Upload your resume and job description" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon-16x16.svg" />
      </Head>

      {/* Dashboard Navigation Button */}
      <button 
        className="dashboard-nav-button"
        onClick={() => router.push('/dashboard')}
        title="View Dashboard"
      >
        📊 Dashboard
      </button>

      <main className="upload-main">
        <div className="upload-card">
          <h1 className="upload-title">
            Setup Your Interview
          </h1>
          <p className="upload-subtitle">
            Upload your resume and provide the job posting URL
          </p>

          <div className="upload-form">
            <div className="input-group">
              <label htmlFor="job-description-url">
                Job Description URL
              </label>
              <input
                type="url"
                id="job-description-url"
                value={jobDescriptionUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://linkedin.com/jobs/view/..."
                className={`url-input ${isValidUrl ? 'valid' : jobDescriptionUrl ? 'invalid' : ''}`}
              />
              {jobDescriptionUrl && !isValidUrl && (
                <div className="url-error">
                  ❌ Please enter a valid job posting URL
                </div>
              )}
              {isValidUrl && (
                <div className="url-success">
                  ✅ Valid job posting URL detected
                </div>
              )}
              <div className="supported-sites">
                <small>Supported: LinkedIn, Indeed, Glassdoor, ZipRecruiter, Monster, and more</small>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="resume-upload">
                Upload Your Resume
              </label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="file-input"
                />
                <label htmlFor="resume-upload" className="file-upload-label">
                  {resumeFile ? (
                    <div className="file-selected">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{resumeFile.name}</span>
                      <span className="file-size">({(resumeFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </div>
                  ) : (
                    <div className="file-placeholder">
                      <span className="upload-icon">📁</span>
                      <span>Click to upload resume</span>
                      <small>PDF, DOC, DOCX, or TXT (max 5MB)</small>
                    </div>
                  )}
                </label>
              </div>
              {resumeFile && (
                <div className="file-success">
                  ✅ Resume uploaded successfully
                </div>
              )}
            </div>

            <button 
              className="continue-button"
              onClick={handleContinue}
              disabled={!isValidUrl || !resumeFile || isUploading}
            >
              {isUploading ? 'Processing...' : 'Continue to Review'}
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        .upload-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
          position: relative;
        }

        .dashboard-nav-button {
          position: absolute;
          top: 2rem;
          right: 2rem;
          background: white;
          color: #667eea;
          border: none;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dashboard-nav-button:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .upload-main {
          max-width: 700px;
          margin: 3rem auto;
        }

        .upload-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .upload-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #667eea;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .upload-subtitle {
          color: #666;
          text-align: center;
          margin-bottom: 2.5rem;
          font-size: 1.125rem;
        }

        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .input-group label {
          font-weight: 700;
          color: #333;
          font-size: 1rem;
        }

        .url-input {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .url-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .url-input.valid {
          border-color: #4CAF50;
          background: #f0f9f4;
        }

        .url-input.invalid {
          border-color: #f44336;
          background: #ffebee;
        }

        .url-error {
          color: #f44336;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .url-success {
          color: #4CAF50;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          font-weight: 500;
        }

        .supported-sites {
          color: #999;
          font-size: 0.8rem;
          margin-top: 0.5rem;
          line-height: 1.4;
        }

        .file-upload-container {
          position: relative;
          width: 100%;
        }

        .file-input {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
          z-index: 10;
        }

        .file-upload-label {
          display: block;
          width: 100%;
          padding: 2.5rem;
          border: 2px dashed #e0e0e0;
          border-radius: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .file-upload-label:hover {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .file-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          color: #666;
        }

        .upload-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .file-placeholder span {
          font-size: 1.05rem;
          font-weight: 500;
        }

        .file-placeholder small {
          font-size: 0.875rem;
          color: #999;
        }

        .file-selected {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1rem;
          background: #f0f8f0;
          border-radius: 8px;
          border: 2px solid #4CAF50;
        }

        .file-icon {
          font-size: 2rem;
        }

        .file-name {
          font-weight: 600;
          color: #4CAF50;
          flex: 1;
          text-align: left;
        }

        .file-size {
          font-size: 0.9rem;
          color: #666;
        }

        .file-success {
          color: #4CAF50;
          font-size: 0.9rem;
          font-weight: 500;
          text-align: center;
          margin-top: 0.5rem;
        }

        .continue-button {
          width: 100%;
          padding: 1.25rem;
          font-size: 1.25rem;
          font-weight: 700;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .continue-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .continue-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .upload-container {
            padding: 1rem;
          }

          .upload-card {
            padding: 2rem 1.5rem;
          }

          .upload-title {
            font-size: 2rem;
          }

          .dashboard-nav-button {
            top: 1rem;
            right: 1rem;
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  )
}

