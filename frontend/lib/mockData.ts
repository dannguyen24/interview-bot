// Mock data for testing without backend

export const mockParsedResume = {
  name: "John Doe",
  email: "john.doe@email.com",
  phone: "(555) 123-4567",
  summary: "Software Engineer with 5 years of experience in full-stack development. Expertise in React, Node.js, Python, and cloud technologies.",
  experience: [
    {
      company: "Tech Corp Inc.",
      position: "Senior Software Engineer",
      duration: "2020 - Present",
      description: "Led development of scalable web applications serving 100k+ users. Implemented microservices architecture using Python and Docker. Mentored 3 junior developers."
    },
    {
      company: "StartupXYZ",
      position: "Software Engineer",
      duration: "2019 - 2020",
      description: "Developed React frontend components for e-commerce platform. Collaborated with 5-person agile team using Scrum methodology."
    }
  ],
  education: [
    {
      institution: "University of Technology",
      degree: "Bachelor of Science in Computer Science",
      year: "2019",
      field: "Computer Science"
    }
  ],
  skills: ["React", "Node.js", "Python", "JavaScript", "TypeScript", "AWS", "Docker", "PostgreSQL"],
  projects: [
    {
      name: "E-commerce Platform",
      description: "Built full-stack e-commerce application with React and Node.js",
      technologies: ["React", "Node.js", "MongoDB", "Stripe API"],
      duration: "6 months"
    }
  ]
}

export const mockParsedJobDescription = {
  title: "Senior Software Engineer",
  company: "Tech Innovations Inc.",
  location: "San Francisco, CA",
  country: "United States",
  employment_type: "Full-time",
  date_posted: "2025-10-01T00:00:00Z",
  valid_through: "2025-11-01T00:00:00Z",
  description: "We're looking for a senior software engineer to join our team. You will be responsible for developing scalable web applications using React, Node.js, and Python. Requirements: 5+ years experience, strong problem-solving skills, excellent communication. Work with cross-functional teams in agile environment."
}

export const mockQuestions = [
  {
    id: "q1_behavioral_challenge",
    text: "Tell me about a time when you faced a significant technical challenge in a project. How did you approach it and what was the outcome?",
    type: "behavioral" as const,
    difficulty: "medium" as const,
    estimatedTime: 120
  },
  {
    id: "q2_technical_algorithms",
    text: "Explain how you would optimize a slow database query. Walk me through your debugging and optimization process.",
    type: "technical" as const,
    difficulty: "hard" as const,
    estimatedTime: 180
  },
  {
    id: "q3_behavioral_teamwork",
    text: "Describe a situation where you had to work with a difficult team member. How did you handle it?",
    type: "behavioral" as const,
    difficulty: "medium" as const,
    estimatedTime: 120
  },
  {
    id: "q4_technical_architecture",
    text: "How would you design a scalable microservices architecture for an e-commerce platform?",
    type: "technical" as const,
    difficulty: "hard" as const,
    estimatedTime: 180
  },
  {
    id: "q5_leadership_conflict",
    text: "Tell me about a time when you had to make a difficult decision that affected your team. What was your thought process?",
    type: "leadership" as const,
    difficulty: "hard" as const,
    estimatedTime: 150
  },
  {
    id: "q6_behavioral_failure",
    text: "Describe a project that didn't go as planned. What did you learn from the experience?",
    type: "behavioral" as const,
    difficulty: "medium" as const,
    estimatedTime: 120
  },
  {
    id: "q7_technical_debugging",
    text: "Walk me through how you would debug a production issue where users are reporting intermittent errors.",
    type: "technical" as const,
    difficulty: "hard" as const,
    estimatedTime: 150
  },
  {
    id: "q8_leadership_growth",
    text: "How do you approach mentoring junior developers? Give me an example of someone you've helped grow.",
    type: "leadership" as const,
    difficulty: "medium" as const,
    estimatedTime: 120
  }
]

export const mockInterviewResults = {
  overallScore: 78,
  questions: [
    {
      question: mockQuestions[0],
      answer: "In my previous role at Tech Corp, we faced a critical performance issue where our API response times increased from 200ms to 3 seconds...",
      analysis: {
        questionId: "q1_behavioral_challenge",
        score: 85,
        star: {
          situation: true,
          task: true,
          action: true,
          result: true
        },
        keywordsFound: ["challenge", "performance", "optimization", "team", "solution"],
        fillerWords: 5,
        timeSpent: 95,
        feedback: "Excellent use of the STAR method! You clearly described the situation, outlined your responsibilities, detailed your actions, and provided measurable results. Consider adding more specific metrics to strengthen your answer.",
        suggestions: [
          "Quantify the impact with specific numbers",
          "Mention team size or collaboration details"
        ],
        painPoints: [
          {
            type: "filler_word" as const,
            timestamp: 23,
            duration: 1,
            context: "um, so we decided to",
            feedback: "Filler word 'um' detected"
          },
          {
            type: "filler_word" as const,
            timestamp: 67,
            duration: 1,
            context: "like, the performance was",
            feedback: "Filler word 'like' detected"
          }
        ]
      }
    },
    {
      question: mockQuestions[1],
      answer: "When debugging slow queries, I first use the database's EXPLAIN command to understand the query execution plan...",
      analysis: {
        questionId: "q2_technical_algorithms",
        score: 82,
        star: {
          situation: true,
          task: true,
          action: true,
          result: false
        },
        keywordsFound: ["database", "query", "optimization", "indexing", "performance"],
        fillerWords: 8,
        timeSpent: 142,
        feedback: "Strong technical knowledge demonstrated. You showed a systematic approach to debugging. However, you could strengthen your answer by including a specific example with measurable results.",
        suggestions: [
          "Add a real-world example with before/after metrics",
          "Reduce filler words for more confident delivery"
        ],
        painPoints: [
          {
            type: "filler_word" as const,
            timestamp: 34,
            duration: 1,
            context: "uh, then I would check",
            feedback: "Filler word 'uh' detected"
          }
        ]
      }
    },
    {
      question: mockQuestions[2],
      answer: "There was a time when I was working with a backend developer who consistently missed deadlines...",
      analysis: {
        questionId: "q3_behavioral_teamwork",
        score: 75,
        star: {
          situation: true,
          task: true,
          action: true,
          result: false
        },
        keywordsFound: ["teamwork", "communication", "conflict resolution"],
        fillerWords: 12,
        timeSpent: 98,
        feedback: "Good situation description and clear actions. Missing concrete results - what was the ultimate outcome? Also, try to reduce filler words for a more confident delivery.",
        suggestions: [
          "Include specific outcome and lessons learned",
          "Practice your answer to reduce 'um' and 'like'"
        ]
      }
    }
  ],
  strengths: [
    "Strong use of STAR method in behavioral questions",
    "Clear technical knowledge and systematic thinking",
    "Good communication and storytelling ability",
    "Specific examples from real experience"
  ],
  improvements: [
    "Include more quantifiable results and metrics",
    "Reduce filler words (averaging 8 per answer)",
    "Add results component to all STAR answers",
    "Practice conciseness - some answers were lengthy"
  ],
  microDrills: [
    "Practice 5 STAR stories with quantified results",
    "Record yourself and count filler words - aim for <3 per minute",
    "Prepare metrics for each experience (users served, performance gains, etc.)",
    "Practice technical explanations in 90 seconds or less"
  ],
  followUpQuestion: "Can you tell me about a time when you had to learn a completely new technology on a tight deadline? How did you approach the learning process and what was the outcome?"
}

export const mockInterviewHistory = [
  {
    id: "interview_001",
    date: "2025-10-03T14:30:00Z",
    jobTitle: "Senior Software Engineer",
    company: "Tech Innovations Inc.",
    overallScore: 78,
    completed: true
  },
  {
    id: "interview_002",
    date: "2025-09-28T10:15:00Z",
    jobTitle: "Full Stack Developer",
    company: "StartupXYZ",
    overallScore: 65,
    completed: true
  },
  {
    id: "interview_003",
    date: "2025-09-20T16:45:00Z",
    jobTitle: "Frontend Engineer",
    company: "Design Co.",
    overallScore: 82,
    completed: true
  }
]

// Helper to enable mock mode
export const enableMockMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('MOCK_MODE', 'true')
  }
}

export const disableMockMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('MOCK_MODE')
  }
}

export const isMockMode = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('MOCK_MODE') === 'true'
  }
  return false
}

