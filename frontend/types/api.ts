// API Type Definitions for Interview Bot

/**
 * Parsed Resume Data Structure
 * Returned from: POST /api/parse-resume
 */
export interface ParsedResume {
  name: string
  email: string
  phone: string
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string[]
  projects: Project[]
}

export interface Experience {
  company: string
  position: string
  duration: string
  description: string
}

export interface Education {
  institution: string
  degree: string
  year: string
  field?: string
}

export interface Project {
  name: string
  description: string
  technologies: string[]
  duration?: string
}

/**
 * Parsed Job Description Data Structure
 * Returned from: POST /api/parse_job_description/
 */
export interface ParsedJobDescription {
  title: string              // Job title
  company: string            // Company name
  location: string           // Job location (city, state)
  country: string            // Country
  employment_type: string    // Full-time, Part-time, Contract, etc.
  date_posted: string        // ISO 8601 date string
  valid_through: string      // ISO 8601 date string
  description: string        // Full job description text
}

/**
 * Resume Upload Response
 * Returned from: POST /api/upload-resume
 */
export interface ResumeUploadResponse {
  success: boolean
  parsedResume: ParsedResume
  fileName: string
  fileSize: number
}

/**
 * Job Description Parse Response
 * Returned from: POST /api/parse_job_description/
 */
export interface JobDescriptionParseResponse extends ParsedJobDescription {
  // Response is the ParsedJobDescription object directly
}

/**
 * Interview Question Structure
 * Received via WebSocket: questions_generated
 */
export interface Question {
  id: string                           // Unique question identifier (e.g., "q1_behavioral_challenge")
  text: string                         // Question text
  type: 'behavioral' | 'technical' | 'leadership'  // Question category
  difficulty?: 'easy' | 'medium' | 'hard'          // Optional difficulty level
  estimatedTime?: number               // Estimated answer time in seconds
}

/**
 * STAR Method Analysis
 */
export interface StarAnalysis {
  situation: boolean
  task: boolean
  action: boolean
  result: boolean
}

/**
 * Answer Analysis Structure
 * Received via WebSocket: answer_analyzed
 */
export interface AnswerAnalysis {
  questionId: string
  score: number                        // Score 0-100
  star: StarAnalysis                   // STAR method analysis
  keywordsFound: string[]              // Array of relevant keywords found
  fillerWords: number                  // Count of filler words
  timeSpent: number                    // Answer duration in seconds
  feedback: string                     // Detailed feedback text
  suggestions?: string[]               // Optional improvement suggestions
  painPoints?: PainPoint[]             // Optional timestamp-based feedback
}

/**
 * Pain Point Structure (for video/audio timestamp jumping)
 */
export interface PainPoint {
  type: 'filler_word' | 'unclear' | 'off_topic' | 'incomplete_star'
  timestamp: number          // Seconds into recording
  duration?: number          // Duration of the issue
  context: string           // What was said
  feedback: string          // Specific feedback for this point
}

/**
 * Interview Results Structure
 * Received via WebSocket: interview_complete
 */
export interface InterviewResults {
  overallScore: number
  questions: QuestionAnalysis[]
  strengths: string[]
  improvements: string[]
  microDrills: string[]
  followUpQuestion: string
}

export interface QuestionAnalysis {
  question: Question
  answer: string                       // Transcribed answer text
  analysis: AnswerAnalysis
}

/**
 * Interview History Item (for dashboard)
 */
export interface InterviewHistoryItem {
  id: string
  date: string                         // ISO 8601 date string
  jobTitle: string
  company: string
  overallScore: number
  completed: boolean
}

/**
 * WebSocket Message Types
 */

// Frontend → Backend
export interface StartInterviewMessage {
  parsedResume: ParsedResume
  parsedJobDescription: ParsedJobDescription
}

export interface SubmitAnswerMessage {
  questionId: string
  audioBlob: Blob
}

// Backend → Frontend
export interface QuestionsGeneratedMessage {
  questions: Question[]
}

export interface QuestionAudioMessage {
  questionId: string
  audioBlob: Blob
}

export interface AnswerAnalyzedMessage extends AnswerAnalysis {
  // Same as AnswerAnalysis
}

export interface InterviewCompleteMessage extends InterviewResults {
  // Same as InterviewResults
}

