# 🤖 Interview Bot

AI-powered interview practice tool that provides personalized questions and real-time feedback.

## 🎯 **Quick Start**

### **Development Setup**
```bash
# Start frontend development
make frontend-up

# Access application
http://localhost:3000
```

### **Testing**
- Upload a resume (PDF, DOC, DOCX, TXT)
- Paste a job posting URL
- Complete interactive interview with AI feedback

## 📁 **Project Structure**

```
interview-bot/
├── frontend/          # Next.js React application
├── backend/           # Python FastAPI (to be implemented)
├── docs/              # 📚 Complete documentation
├── docker-compose.yml # Multi-service setup
└── Makefile          # Development commands
```

## 📚 **Complete Documentation**

**[📖 See docs/README.md](./docs/README.md)** for comprehensive guides:

- **[📡 API_SPECIFICATION.md](./docs/API_SPECIFICATION.md)** - Frontend ↔ Backend communication
- **[⚛️ NEXTJS_GUIDE.md](./docs/NEXTJS_GUIDE.md)** - Next.js implementation guide  
- **[🔌 WEBSOCKETS.md](./docs/WEBSOCKETS.md)** - Real-time interview flow
- **[🚀 DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Development & deployment

## 🚧 **Current Status**

- ✅ **Frontend**: Complete with file upload, WebSocket integration, results display
- 🔄 **Backend**: Python FastAPI service (in development)
- ✅ **Docker**: Multi-service development environment
- ✅ **Deployment**: Replit configuration ready

## 🛠️ **Available Commands**

```bash
make dev-up        # Start both frontend & backend
make frontend-up   # Frontend only (backend commented out)
make dev-down      # Stop all services
make clean         # Clean Docker cache
```

## 💡 **What This Does**

1. **Resume Upload**: Parse uploaded resume files (PDF/DOC/DOCX/TXT)
2. **Job Analysis**: Extract requirements from job posting URLs
3. **Personalized Questions**: Generate 8 tailored interview questions
4. **Real-time Interview**: Interactive voice/text interview with progress tracking
5. **AI Analysis**: STAR method scoring with detailed feedback
6. **Results Dashboard**: Comprehensive performance review with improvement suggestions

## 🔧 **Technology Stack**

- **Frontend**: Next.js, React, TypeScript, WebSockets
- **Backend**: Python FastAPI, AI services (OpenAI/Anthropic)
- **Deployment**: Docker, Replit
- **Audio**: TTS, STT for voice-based interviews

---


