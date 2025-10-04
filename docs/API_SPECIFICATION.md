# Interview Bot - API Specification 📡

## 📋 Quick Reference - What Sends What

### **Frontend → Backend**

| Component | Endpoint/Event | Data Sent | When |
|-----------|---------------|-----------|------|
| **Upload Page** | `POST /api/parse-resume` | Resume file (FormData) | User uploads resume |
| **Upload Page** | `POST /api/parse_job_description/` | Job URL (JSON) | User submits job URL |
| **Interview Page** | `start_interview` (WebSocket) | Parsed resume + job data (JSON) | User starts interview |
| **Interview Page** | `submit_answer` (WebSocket) | Question ID + audio/video blob | User finishes recording answer |
| **Interview Page** | `complete_interview` (WebSocket) | Empty object | All 8 questions answered |

### **Backend → Frontend**

| Event/Response | Data Sent | When | Frontend Action |
|----------------|-----------|------|-----------------|
| **Resume Parsing Response** | Structured resume JSON | After file upload | Store in localStorage |
| **Job Parsing Response** | Structured job JSON | After URL submission | Store in localStorage |
| `questions_generated` (WebSocket) | Array of 8 question objects | After interview starts | Display questions |
| `question_audio` (WebSocket) | Question audio blob (TTS) | Per question | Play audio to user |
| `answer_analyzed` (WebSocket) | Analysis JSON with feedback | After each answer | Show feedback (optional) |
| `interview_complete` (WebSocket) | Complete results JSON | After 8th question | Navigate to results page |

### **Data Storage Flow**

```
1. User uploads resume → Backend parses → Frontend stores parsedResume in localStorage
2. User enters job URL → Backend parses → Frontend stores parsedJobDescription in localStorage  
3. User starts interview → Frontend sends both parsed datasets via WebSocket
4. Interview completes → Frontend stores results in localStorage
5. (Future) Results sync to MongoDB via user account
```

### **Authentication Flow**

| Component | Endpoint | Data Sent | Response |
|-----------|----------|-----------|----------|
| **Signup Modal** | `POST /api/auth/signup` | Email, password, name (JSON) | Success + user ID |
| **Login Modal** | `POST /api/auth/signin` (NextAuth) | Email, password (credentials) | Session token |
| **Session Check** | NextAuth automatic | Session token (cookie) | User session data |

---

## Overview

This document specifies the **exact data formats** and **WebSocket messages** between the frontend (Next.js) and backend (Python/FastAPI) for the Interview Bot application.

## 🔌 WebSocket Connection

### **Connection Details**
- **URL**: `ws://localhost:8000` (development)
- **Protocol**: Socket.IO
- **Transport**: WebSocket
- **Auto-reconnect**: Enabled

### **Connection Events**
```typescript
// Frontend connection
const socket = io('ws://localhost:8000', {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
})

// Connection status
socket.on('connect', () => console.log('✅ Connected'))
socket.on('disconnect', () => console.log('❌ Disconnected'))
socket.on('connect_error', (error) => console.error('❌ Connection failed:', error))
```

---

## 📤 Frontend → Backend Messages

### **1. Resume Upload (Pre-Interview)**

**Endpoint**: `POST /api/upload-resume`

**Purpose**: Uploads resume file for backend parsing before starting interview

**Data Format**:
```typescript
FormData {
  resume: File              // Required: Resume file (PDF, DOC, DOCX, TXT)
}
```

**Note**: Job description parsing is handled separately via `/api/parse_job_description/`

---

### **2. Job Description Parsing (Pre-Interview)**

**Endpoint**: `POST /api/parse_job_description/`

**Purpose**: Parses job posting URL and extracts structured job data

**Data Format**:
```typescript
{
  jobDescriptionUrl: string  // Required: Valid job posting URL
}
```

**Response Format**:
```typescript
{
  title: string,                    // Job title
  company: string,                  // Company name
  location: string,                 // Job location
  description: string,              // Full job description
  requirements: string[],           // Required skills/qualifications
  responsibilities: string[],       // Job responsibilities
  benefits: string[],              // Benefits and perks
  salary?: string,                 // Salary range (if available)
  employmentType?: string,         // Full-time, Part-time, Contract, etc.
  experienceLevel?: string,        // Entry, Mid, Senior, etc.
  remote?: boolean                 // Remote work availability
}
```

**File Requirements**:
- **Supported formats**: PDF, DOC, DOCX, TXT
- **Maximum size**: 5MB (5 * 1024 * 1024 bytes)
- **Frontend validation**: File type and size checked before upload
- **Backend validation**: Additional security validation and parsing

**Frontend Upload Process**:
```typescript
// File validation on frontend
const validateFile = (file: File) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }
  
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size too large')
  }
  
  return true
}

// Upload to Next.js API route
const uploadResume = async (file: File, jobUrl: string) => {
  const formData = new FormData()
  formData.append('resume', file)
  formData.append('jobDescriptionUrl', jobUrl)
  
  const response = await fetch('/api/upload-resume', {
    method: 'POST',
    body: formData
  })
  
  return await response.json()
}
```

**Next.js API Route** (`pages/api/upload-resume.ts`):
```typescript
// Handles file upload and forwards to backend
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const form = formidable({
    uploadDir: '/tmp',
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  })

  const [fields, files] = await form.parse(req)
  const resumeFile = files.resume?.[0]
  const jobDescriptionUrl = fields.jobDescriptionUrl?.[0]

  // Validate file type on frontend side
  // Send to backend for parsing
  const backendFormData = new FormData()
  backendFormData.append('resume', fileContent)
  backendFormData.append('jobDescriptionUrl', jobDescriptionUrl)

  const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/parse-resume`, {
    method: 'POST',
    body: backendFormData,
  })

  return res.json({ success: true, parsedResume: backendData })
}
```

**Backend Resume Parsing Endpoint**:
```python
# Backend endpoint: POST /api/parse-resume
# Required Python libraries:
# - PyPDF2 or pdfplumber for PDF parsing
# - python-docx for DOCX parsing  
# - python-docx2txt for DOC parsing
# - docx2txt for alternative DOCX parsing

@app.post("/api/parse-resume")
async def parse_resume_file(resume: UploadFile, job_description_url: str):
    try:
        # Read file content
        content = await resume.read()
        
        # Parse based on file type
        if resume.content_type == "application/pdf":
            parsed_data = parse_pdf(content)
        elif resume.content_type in ["application/msword", 
                                   "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
            parsed_data = parse_docx(content)
        elif resume.content_type == "text/plain":
            parsed_data = parse_txt(content.decode('utf-8'))
        
        return {
            "name": parsed_data.get("name", ""),
            "email": parsed_data.get("email", ""),
            "phone": parsed_data.get("phone", ""),
            "summary": parsed_data.get("summary", ""),
            "experience": parsed_data.get("experience", []),
            "education": parsed_data.get("education", []),
            "skills": parsed_data.get("skills", []),
            "projects": parsed_data.get("projects", [])
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse resume: {str(e)}")
```

**Response Format**:
```typescript
{
  success: boolean,
  parsedResume: {
    name: string,                    // Extracted full name
    email: string,                   // Email address
    phone: string,                   // Phone number
    summary: string,                 // Professional summary/objective
    experience: Array<{             // Work experience
      company: string,               // Company name
      position: string,              // Job title
      duration: string,              // Employment period (e.g., "2020-2023")
      description: string            // Job description/responsibilities
    }>,
    education: Array<{              // Education background
      institution: string,           // School/university name
      degree: string,               // Degree type (e.g., "Bachelor of Science")
      year: string,                  // Graduation year
      field?: string                 // Field of study (optional)
    }>,
    skills: string[],               // Technical and soft skills
    projects: Array<{               // Projects and achievements
      name: string,                  // Project name
      description: string,           // Project description
      technologies: string[],       // Technologies used
      duration?: string             // Project duration (optional)
    }>
  },
  fileName: string,                 // Original filename
  fileSize: number                  // File size in bytes
}
```

**Example**:
```typescript
// Frontend upload
const formData = new FormData()
formData.append('resume', resumeFile)
formData.append('jobDescriptionUrl', jobDescriptionUrl)

const response = await fetch('/api/upload-resume', {
  method: 'POST',
  body: formData
})

const result = await response.json()
// result.parsedResume contains structured resume data
```

---

### **3. Start Interview**

**Event**: `start_interview`

**Purpose**: Initiates the interview process with job URL and parsed resume data

**Data Format**:
```typescript
{
  parsedResume: {            // Required: Structured resume data from upload
    name: string,
    email: string,
    phone: string,
    summary: string,
    experience: Array<Experience>,
    education: Array<Education>,
    skills: string[],
    projects: Array<Project>
  },
  parsedJobDescription: {   // Required: Structured job data from parsing
    title: string,
    company: string,
    location: string,
    description: string,
    requirements: string[],
    responsibilities: string[],
    benefits: string[],
    salary?: string,
    employmentType?: string,
    experienceLevel?: string,
    remote?: boolean
  }
}
```

**Example**:
```typescript
socket.emit('start_interview', {
  parsedResume: {
    name: "John Doe",
    email: "john@example.com",
    summary: "Software Engineer with 5 years experience...",
    experience: [
      {
        company: "Tech Corp",
        position: "Senior Software Engineer",
        duration: "2020-2023",
        description: "Led development of scalable applications..."
      }
    ],
    skills: ["React", "Node.js", "Python", "AWS"],
    // ... other structured data
  },
  parsedJobDescription: {
    title: "Senior Software Engineer",
    company: "Tech Corp",
    location: "San Francisco, CA",
    description: "We're looking for a senior software engineer...",
    requirements: ["5+ years Python", "React experience", "AWS knowledge"],
    responsibilities: ["Lead development", "Mentor junior developers"],
    benefits: ["Health insurance", "401k", "Flexible hours"],
    salary: "$120,000 - $150,000",
    employmentType: "Full-time",
    experienceLevel: "Senior",
    remote: true
  }
})
```

**Validation Requirements**:
- `parsedResume`: Must contain structured resume data from successful upload
- `parsedJobDescription`: Must contain structured job data from successful parsing

**Supported Job Sites**:
- LinkedIn (`linkedin.com`)
- Indeed (`indeed.com`)
- Glassdoor (`glassdoor.com`)
- ZipRecruiter (`ziprecruiter.com`)
- Monster (`monster.com`)
- CareerBuilder (`careerbuilder.com`)
- AngelList/Wellfound (`angel.co`, `wellfound.com`)
- Lever (`jobs.lever.co`)
- Greenhouse (`greenhouse.io`)
- Workday (`workday.com`)
- SmartRecruiters (`smartrecruiters.com`)

---

### **3. Submit Answer**

**Event**: `submit_answer`

**Purpose**: Sends user's recorded audio answer for AI analysis

**Data Format**:
```typescript
{
  questionId: string,    // Required: Unique question identifier
  audioBlob: Blob        // Required: Audio recording (WebM format)
}
```

**Example**:
```typescript
socket.emit('submit_answer', {
  questionId: "q1_behavioral_challenge",
  audioBlob: audioBlob  // Blob from MediaRecorder
})
```

**Audio Specifications**:
- **Format**: WebM with Opus codec
- **Sample Rate**: 44.1kHz
- **Channels**: Mono
- **Quality**: High (echo cancellation, noise suppression enabled)
- **Chunk Size**: 1-second intervals during recording

**Question ID Format**:
- Pattern: `q{number}_{type}_{topic}`
- Examples: `q1_behavioral_challenge`, `q2_technical_algorithms`, `q3_leadership_conflict`

---

### **4. Complete Interview**

**Event**: `complete_interview`

**Purpose**: Signals that all questions have been answered

**Data Format**:
```typescript
{}  // Empty object - no additional data needed
```

**Example**:
```typescript
socket.emit('complete_interview', {})
```

**When to Send**:
- After the 8th question has been answered and analyzed
- When user manually exits the interview
- When all questions are complete

---

## 📥 Backend → Frontend Messages

### **1. Questions Generated**

**Event**: `questions_generated`

**Purpose**: Sends 8 AI-generated interview questions

**Data Format**:
```typescript
Array<{
  id: string,                    // Required: Unique question identifier
  text: string,                  // Required: Question text
  type: 'behavioral' | 'technical' | 'leadership',  // Required: Question category
  difficulty?: 'easy' | 'medium' | 'hard',          // Optional: Difficulty level
  estimatedTime?: number         // Optional: Estimated answer time in seconds
}>
```

**Example**:
```typescript
socket.on('questions_generated', (questions) => {
  // questions = [
  //   {
  //     id: "q1_behavioral_challenge",
  //     text: "Tell me about a time when you faced a significant challenge in a project. How did you approach it and what was the outcome?",
  //     type: "behavioral",
  //     difficulty: "medium",
  //     estimatedTime: 120
  //   },
  //   {
  //     id: "q2_technical_algorithms",
  //     text: "Explain how you would optimize a database query that's running slowly. Walk me through your debugging process.",
  //     type: "technical",
  //     difficulty: "hard",
  //     estimatedTime: 180
  //   },
  //   // ... 6 more questions
  // ]
})
```

**Requirements**:
- **Exactly 8 questions** must be generated
- **Mix of types**: At least 2 behavioral, 2 technical, 1 leadership
- **Question IDs**: Must be unique and follow naming convention
- **Text length**: 50-200 characters per question
- **Relevance**: Questions must relate to the job posting and user's background

---

### **2. Question Audio**

**Event**: `question_audio`

**Purpose**: Sends TTS audio for a specific question

**Data Format**:
```typescript
{
  questionId: string,    // Required: Matches question ID from questions_generated
  audioBlob: Blob        // Required: TTS audio file
}
```

**Example**:
```typescript
socket.on('question_audio', (data) => {
  // data = {
  //   questionId: "q1_behavioral_challenge",
  //   audioBlob: audioBlob  // TTS audio for the question
  // }
})
```

**Audio Specifications**:
- **Format**: MP3 or WebM
- **Quality**: High (natural-sounding voice)
- **Language**: English
- **Speed**: Normal conversational pace
- **Volume**: Consistent levels across all questions

**Timing**:
- Should be sent **immediately after** `questions_generated`
- Send audio for **current question only** (not all 8 at once)
- Send next question's audio when user moves to next question

---

### **3. Answer Analyzed**

**Event**: `answer_analyzed`

**Purpose**: Sends AI analysis of user's answer

**Data Format**:
```typescript
{
  questionId: string,                    // Required: Matches submitted question ID
  score: number,                         // Required: Score 0-100
  star: {                               // Required: STAR method analysis
    situation: boolean,                  // Was situation described?
    task: boolean,                       // Was task/objective clear?
    action: boolean,                     // Were actions detailed?
    result: boolean                      // Were results mentioned?
  },
  keywordsFound: string[],              // Required: Array of relevant keywords found
  fillerWords: number,                  // Required: Count of filler words ("um", "uh", "like")
  timeSpent: number,                    // Required: Answer duration in seconds
  feedback: string,                     // Required: Detailed feedback text
  suggestions?: string[]                // Optional: Improvement suggestions
}
```

**Example**:
```typescript
socket.on('answer_analyzed', (analysis) => {
  // analysis = {
  //   questionId: "q1_behavioral_challenge",
  //   score: 85,
  //   star: {
  //     situation: true,
  //     task: true,
  //     action: true,
  //     result: false
  //   },
  //   keywordsFound: ["challenge", "project", "team", "solution", "outcome"],
  //   fillerWords: 8,
  //   timeSpent: 95,
  //   feedback: "Excellent use of the STAR method! You clearly described the situation and task, and provided detailed actions. Consider adding more specific metrics or quantifiable results to strengthen your answer.",
  //   suggestions: [
  //     "Include specific numbers or percentages in your results",
  //     "Mention the impact on team or company goals"
  //   ]
  // }
})
```

**Analysis Requirements**:
- **Score calculation**: Based on STAR completeness, keyword relevance, clarity, and conciseness
- **STAR analysis**: Boolean flags for each component
- **Keywords**: Extract relevant technical terms, soft skills, and job-related terms
- **Filler words**: Count "um", "uh", "like", "you know", "so", "basically"
- **Time tracking**: Measure from start to end of recording
- **Feedback**: 2-3 sentences with specific, actionable advice

---

### **4. Interview Complete**

**Event**: `interview_complete`

**Purpose**: Sends comprehensive interview results and analysis

**Data Format**:
```typescript
{
  overallScore: number,                  // Required: Overall score 0-100
  questions: Array<{                    // Required: Analysis for all questions
    questionId: string,
    question: string,
    answer: string,                     // Transcribed answer text
    score: number,
    star: {
      situation: boolean,
      task: boolean,
      action: boolean,
      result: boolean
    },
    keywordsFound: string[],
    fillerWords: number,
    timeSpent: number,
    feedback: string
  }>,
  strengths: string[],                  // Required: Top 3-5 strengths
  improvements: string[],               // Required: Top 3-5 areas for improvement
  microDrills: string[],               // Required: 3-5 specific practice exercises
  followUpQuestion: string             // Required: Additional practice question
}
```

**Example**:
```typescript
socket.on('interview_complete', (results) => {
  // results = {
  //   overallScore: 78,
  //   questions: [
  //     {
  //       questionId: "q1_behavioral_challenge",
  //       question: "Tell me about a time when you faced a significant challenge...",
  //       answer: "In my previous role as a software engineer, I was tasked with...",
  //       score: 85,
  //       star: { situation: true, task: true, action: true, result: false },
  //       keywordsFound: ["challenge", "project", "team", "solution"],
  //       fillerWords: 8,
  //       timeSpent: 95,
  //       feedback: "Excellent use of STAR method..."
  //     },
  //     // ... 7 more questions
  //   ],
  //   strengths: [
  //     "Clear communication and storytelling",
  //     "Strong technical knowledge demonstration",
  //     "Good use of specific examples",
  //     "Confident delivery and pace"
  //   ],
  //   improvements: [
  //     "Include more quantifiable results and metrics",
  //     "Reduce filler words (currently averaging 12 per answer)",
  //     "Practice STAR method for all behavioral questions",
  //     "Provide more specific technical details"
  //   ],
  //   microDrills: [
  //     "Practice telling stories with specific numbers and percentages",
  //     "Record yourself answering questions and count filler words",
  //     "Prepare 5 STAR examples covering different scenarios",
  //     "Practice explaining technical concepts to non-technical audiences"
  //   ],
  //   followUpQuestion: "Can you give me another example of a time when you had to learn a new technology quickly? How did you approach the learning process and what was the outcome?"
  // }
})
```

**Requirements**:
- **Overall score**: Weighted average of all question scores
- **Complete data**: All 8 questions must be included
- **Actionable feedback**: Specific, measurable improvement suggestions
- **Balanced analysis**: Mix of positive and constructive feedback

---

## 🔄 Message Flow Sequence

### **Complete Interview Flow**
```
1. Frontend → Backend: POST /api/upload-resume
   └── resume: File (PDF/DOC/DOCX/TXT)

2. Backend Processing:
   ├── Parse resume file (PDF/DOC extraction)
   ├── Extract structured data (experience, skills, education)
   └── Return parsed resume object

3. Frontend → Backend: POST /api/parse_job_description/
   └── jobDescriptionUrl: "https://linkedin.com/jobs/view/123"

4. Backend Processing:
   ├── Parse job posting from URL (web scraping)
   ├── Extract requirements, responsibilities, benefits
   └── Return structured job data

5. Frontend → Backend: start_interview (WebSocket)
   ├── parsedResume: { structured resume data }
   └── parsedJobDescription: { structured job data }

6. Backend Processing:
   ├── Generate 8 personalized questions using both datasets
   ├── Create TTS audio for first question
   └── Send questions and audio to frontend

7. Backend → Frontend: questions_generated
   └── Array of 8 question objects

8. Backend → Frontend: question_audio
   └── Audio blob for current question

9. Frontend → Backend: submit_answer
   ├── questionId: "q1_behavioral_challenge"
   └── audioBlob: user's recorded answer

10. Backend Processing:
    ├── Transcribe audio to text
    ├── Analyze answer using AI
    ├── Score STAR method components
    ├── Count keywords and filler words
    └── Generate feedback

11. Backend → Frontend: answer_analyzed
    └── Complete analysis object

12. Repeat steps 8-11 for questions 2-8

13. Backend → Frontend: interview_complete
    └── Comprehensive results object
```

---

## ⚠️ Error Handling

### **Connection Errors**
```typescript
// Frontend handles these automatically
socket.on('connect_error', (error) => {
  // Show "Connection failed" message
  // Retry connection automatically
})

socket.on('disconnect', () => {
  // Show "Disconnected" message
  // Attempt reconnection
})
```

### **Backend Error Responses**
```typescript
// Backend should emit error events
socket.emit('error', {
  type: 'invalid_url' | 'parsing_failed' | 'ai_error' | 'audio_error',
  message: string,
  details?: any
})

// Frontend handles errors
socket.on('error', (error) => {
  console.error('Backend error:', error)
  // Show user-friendly error message
  // Allow retry or redirect to home
})
```

### **Common Error Scenarios**
- **Invalid job URL**: URL not from supported site
- **Parsing failure**: Cannot extract job data from URL
- **AI service error**: OpenAI/Anthropic API failure
- **Audio processing error**: TTS or STT service failure
- **Network timeout**: Long-running operations timeout

---

## 🧪 Testing Data

### **Sample Job URL**
```
https://www.linkedin.com/jobs/view/1234567890
```

### **Sample Resume File**
For testing, create a simple text file with sample resume content:

**resume_sample.txt**:
```
John Doe
john.doe@email.com
(555) 123-4567

PROFESSIONAL SUMMARY
Software Engineer with 5 years of experience in full-stack development. 
Expertise in React, Node.js, Python, and cloud technologies. 
Led development of scalable web applications serving 100k+ users.

WORK EXPERIENCE

Senior Software Engineer
Tech Corp Inc.
2020 - Present
• Led development of scalable web applications serving 100k+ users
• Implemented microservices architecture using Python and Docker
• Mentored 3 junior developers and improved team productivity by 40%
• Built CI/CD pipelines reducing deployment time by 60%

Software Engineer
StartupXYZ
2019 - 2020
• Developed React frontend components for e-commerce platform
• Collaborated with 5-person agile team using Scrum methodology
• Optimized database queries improving page load time by 35%

EDUCATION
Bachelor of Science in Computer Science
University of Technology
2019

SKILLS
React, Node.js, Python, JavaScript, TypeScript, AWS, Docker, 
Kubernetes, PostgreSQL, MongoDB, Git, Scrum, Agile

PROJECTS
E-commerce Platform
Built full-stack e-commerce application using React and Node.js
Technologies: React, Node.js, MongoDB, Stripe API
Duration: 6 months
```

### **Expected Parsed Resume Structure**
```json
{
  "name": "John Doe",
  "email": "john.doe@email.com", 
  "phone": "(555) 123-4567",
  "summary": "Software Engineer with 5 years of experience in full-stack development...",
  "experience": [
    {
      "company": "Tech Corp Inc.",
      "position": "Senior Software Engineer",
      "duration": "2020 - Present", 
      "description": "Led development of scalable web applications serving 100k+ users..."
    },
    {
      "company": "StartupXYZ",
      "position": "Software Engineer", 
      "duration": "2019 - 2020",
      "description": "Developed React frontend components for e-commerce platform..."
    }
  ],
  "education": [
    {
      "institution": "University of Technology",
      "degree": "Bachelor of Science in Computer Science",
      "year": "2019"
    }
  ],
  "skills": ["React", "Node.js", "Python", "JavaScript", "TypeScript", "AWS"],
  "projects": [
    {
      "name": "E-commerce Platform",
      "description": "Built full-stack e-commerce application using React and Node.js",
      "technologies": ["React", "Node.js", "MongoDB", "Stripe API"],
      "duration": "6 months"
    }
  ]
}
```

### **Expected Question Types**
- **Behavioral (3-4 questions)**: STAR method scenarios
- **Technical (2-3 questions)**: Role-specific technical challenges
- **Leadership (1-2 questions)**: Team management and conflict resolution

---

## 📋 Implementation Checklist

### **Backend Requirements**
- [ ] **WebSocket server setup** (Socket.IO)
- [ ] **Resume parsing service** (PyPDF2/pdfplumber, python-docx)
  - [ ] PDF text extraction
  - [ ] DOCX parsing and formatting
  - [ ] DOC file support
  - [ ] Structured data extraction (name, skills, experience)
- [ ] **Job URL parsing service** (web scraping)
- [ ] **AI question generation** (OpenAI/Anthropic)
  - [ ] Personalized questions based on parsed resume
  - [ ] Mix of behavioral, technical, and leadership questions
- [ ] **TTS service integration** (ElevenLabs/OpenAI)
- [ ] **STT service integration** (Whisper)
- [ ] **Answer analysis AI service**
  - [ ] STAR method analysis
  - [ ] Keyword extraction
  - [ ] Filler word counting
  - [ ] Feedback generation
- [ ] **Error handling and validation**
- [ ] **Audio file processing**
- [ ] **Data persistence** (optional)

### **Frontend Expectations**
- [ ] **File upload interface** (drag & drop)
- [ ] **File validation** (type, size, format)
- [ ] **Upload progress indicators**
- [ ] **Next.js API route** for file handling
- [ ] **WebSocket connection management**
- [ ] **Audio recording** (MediaRecorder API)
- [ ] **Audio playback** (HTML5 Audio)
- [ ] **Real-time UI updates**
- [ ] **Error handling and user feedback**
- [ ] **Progress tracking**
- [ ] **Results visualization**

### **Integration Points**
- [ ] **Frontend → Next.js API**: File upload with validation
- [ ] **Next.js API → Backend**: Resume parsing request
- [ ] **Backend → Next.js API**: Parsed resume data
- [ ] **Frontend → WebSocket**: Interview start with parsed data
- [ ] **WebSocket ↔ Backend**) Real-time interview flow

---

**This specification ensures seamless communication between frontend and backend teams!** 🚀
