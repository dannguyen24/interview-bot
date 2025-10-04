# 🤖 AI Interview Bot

AI-powered mock interview platform with personalized questions, real-time audio/video recording, and detailed performance feedback.

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000/test` to explore all features with mock data (no backend required).

## ✨ Features

- **📄 Resume & Job Analysis** - Upload resume, paste job URL
- **🎤 Interactive Interview** - 8 personalized questions with audio/video recording
- **📊 AI Feedback** - STAR method analysis, scores, strengths, improvements
- **📈 Dashboard** - Track interview history and review past performances
- **🔐 Authentication** - MongoDB + NextAuth.js for user accounts

## 🧪 Testing (No Backend Required)

The frontend includes comprehensive mock data for testing:

1. Go to `/test` - Testing hub with shortcuts
2. Mock interview flow - Complete interview simulation with WebSocket mocking
3. View results - See detailed feedback and scoring
4. Dashboard - Browse past interviews

**See [TESTING_GUIDE.md](./TESTING_GUIDE.md)** for complete testing instructions.

## 📁 Project Structure

```
interview-bot/
├── frontend/          # Next.js + React + TypeScript
│   ├── pages/         # Landing, upload, interview, results, dashboard
│   ├── components/    # AudioRecorder, AudioPlayer, modals
│   ├── contexts/      # WebSocket context (with mock support)
│   └── lib/           # Mock data, MongoDB connection
└── docs/              # Documentation
```

## 🔧 Tech Stack

**Frontend:** Next.js 13, React, TypeScript, Socket.io, NextAuth.js  
**Backend:** Python FastAPI (in development)  
**Database:** MongoDB Atlas  
**Audio/Video:** MediaRecorder API, Web Audio API  
**Styling:** CSS modules with gradient design system

## 📚 Documentation

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Test all features without backend
- **[API_SPECIFICATION.md](./docs/API_SPECIFICATION.md)** - Backend API contracts
- **[VIDEO_IMPLEMENTATION.md](./docs/VIDEO_IMPLEMENTATION.md)** - Video recording guide
- **[AUDIO_IMPLEMENTATION.md](./docs/AUDIO_IMPLEMENTATION.md)** - Audio system guide

## 🎯 Expected Data Format

**Resume JSON:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "experience": [...],
  "education": [...],
  "skills": [...]
}
```

**Job Description JSON:**
```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Co",
  "description": "..."
}
```

See mock data in `frontend/lib/mockData.ts` for complete examples.

---

Made with ❤️ for (and by) Dan 
Also made by Abdullah (Abby) :)


