# Interview Bot - Deployment Guide 🚀

HI DAN <3 

## Overview
This project supports **dual deployment strategies**:
1. **Docker + Docker Compose** (Development & Production)
2. **Direct Node.js via Replit** (Simple Production)

## 🐳 Method 1: Docker Development & Deployment

### 📋 Prerequisites
- Docker Desktop installed
- Environment variables in `.env` file

### 🚀 Running Locally (Docker)
```bash
# Start frontend only 
make frontend-up

# Start both frontend + backend 
make dev-up

# Stop all services
make dev-down

# Clean everything (nuclear option)
make clean
```

### 🌐 Access Application
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000 

### 🔧 Troubleshooting Docker
```bash
# If Docker fails, try individual services:
docker-compose up frontend --build  # Frontend only
docker-compose up backend --build   # Backend only 

# Clean rebuild:
make clean-frontend                 # Nuclear rebuild
make build-frontend                 # Test Docker build
```

## 🎯 Method 2: Direct Node.js Development

### 🚀 Running Locally (Node.js)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

### 🌐 Access Application
- **Frontend**: http://localhost:3000

## ☁️ Method 3: Replit Deployment

### 📋 Prerequisites
- GitHub repository with code
- Replit account (mine!)

### 🚀 Deploy to Replit
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Replit deployment"
   git push origin main
   ```

2. **Import to Replit**
   - Go to https://replit.com
   - Click "Import from GitHub"
   - Select your repository
   - Wait for import to complete

3. **Automatic Setup**
   Replit will automatically:
   - Detect Node.js project
   - Run `npm install` in frontend directory
   - Start development server
   - Make your site live at `yourname.repl.co`

### 🧪 Frontend-Only Testing Commands
```bash
# Docker approach
make frontend-up

# Node.js approach  
cd frontend && npm run dev

# Both should show:
# ✅ Ready - started server on 0.0.0.0:3000
# ✅ Local: http://localhost:3000
```
