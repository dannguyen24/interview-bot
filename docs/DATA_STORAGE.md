# 💾 Data Storage Strategy

## Overview

The Interview Bot uses a **hybrid storage approach** combining browser storage and MongoDB for optimal performance and persistence.

## 🗄️ Storage Breakdown

### **1. MongoDB (Persistent Storage)**

**Purpose**: Long-term storage of user data and interview history

**What's Stored**:
- ✅ User accounts (email, password, profile)
- ✅ Interview history (all completed interviews)
- ✅ Interview results (scores, feedback, analysis)
- ✅ User preferences and settings

**Database**: `interviewbot`

**Collections**:
```typescript
users: {
  _id: ObjectId,
  email: string,
  password: string (hashed),
  name: string,
  createdAt: Date,
  interviewHistory: [
    {
      id: string,
      date: string (ISO 8601),
      jobTitle: string,
      company: string,
      location: string,
      country: string,
      employmentType: string,
      overallScore: number,
      completed: boolean,
      results: InterviewResults,  // Full results object
      parsedResume: ParsedResume,
      parsedJobDescription: ParsedJobDescription,
      createdAt: Date
    }
  ]
}

sessions: {
  sessionToken: string,
  userId: ObjectId,
  expires: Date
}
```

---

### **2. localStorage (Temporary Session Data)**

**Purpose**: Store data during active interview session (before MongoDB save)

**What's Stored**:
- ✅ `jobDescriptionUrl` - Current job URL
- ✅ `parsedResume` - Parsed resume data (JSON)
- ✅ `parsedJobDescription` - Parsed job data (JSON)
- ✅ `resumeFileName` - Original filename

**Lifetime**: Cleared after interview completes and saves to MongoDB

**Usage Pattern**:
```typescript
// Upload page - Store after parsing
localStorage.setItem('parsedResume', JSON.stringify(resumeData))
localStorage.setItem('parsedJobDescription', JSON.stringify(jobData))

// Interview page - Read for WebSocket
const parsedResume = JSON.parse(localStorage.getItem('parsedResume'))

// Results page - Clear after saving to MongoDB
localStorage.removeItem('parsedResume')
localStorage.removeItem('parsedJobDescription')
```

---

### **3. sessionStorage (Ultra-Temporary Data)**

**Purpose**: Store data only for current browser tab/session

**What's Stored**:
- ✅ `currentInterviewResults` - Fresh interview results (before MongoDB save)

**Lifetime**: Cleared when tab closes or after save to MongoDB

**Usage Pattern**:
```typescript
// Interview page - Store when interview completes
sessionStorage.setItem('currentInterviewResults', JSON.stringify(results))

// Results page - Read and save to MongoDB
const results = JSON.parse(sessionStorage.getItem('currentInterviewResults'))
await saveToMongoDB(results)
sessionStorage.removeItem('currentInterviewResults')
```

---

### **4. IndexedDB (Video Storage)**

**Purpose**: Store large video files locally (NOT sent to backend/MongoDB)

**What's Stored**:
- ✅ Video recordings for each question (Blob data)
- ✅ Video metadata (interview ID, question ID, timestamp)

**Database**: `InterviewBotVideos`

**Object Store**:
```typescript
videos: {
  id: string,              // Format: "${interviewId}_${questionId}"
  interviewId: string,
  questionId: string,
  videoBlob: Blob,
  timestamp: string
}
```

**Why Not MongoDB**:
- ❌ Video files are too large (50-100MB per interview)
- ❌ Expensive to store on cloud database
- ❌ Slow to upload/download
- ✅ Only needed for user reference (local playback)

---

## 🔄 Data Flow

### **During Interview Session:**

```
1. Upload Page:
   User uploads resume + enters job URL
   ↓
   Backend parses both
   ↓
   Frontend stores in localStorage:
   - parsedResume
   - parsedJobDescription
   - resumeFileName
   - jobDescriptionUrl

2. Ready Page:
   Reads from localStorage (display confirmation)
   ↓
   User clicks "Start Interview"

3. Interview Page:
   Reads from localStorage
   ↓
   Sends to backend via WebSocket:
   - parsedResume
   - parsedJobDescription
   ↓
   Backend generates questions
   ↓
   User records answers (audio + video)
   ↓
   Video saved to IndexedDB
   Audio sent to backend
   ↓
   Interview completes
   ↓
   Results stored in sessionStorage

4. Results Page:
   Reads from sessionStorage
   ↓
   Automatically saves to MongoDB (if authenticated)
   ↓
   Clears sessionStorage
   ↓
   User views results with video playback (from IndexedDB)
```

### **Loading Old Interviews:**

```
1. Dashboard Page:
   Fetches interview history from MongoDB
   ↓
   Displays list of past interviews

2. User clicks interview:
   Fetches specific interview from MongoDB
   ↓
   Loads results into Results page
   ↓
   Loads associated video from IndexedDB (if available)
```

---

## 📊 Storage Comparison

| Storage Type | Size Limit | Persistence | Use Case |
|--------------|------------|-------------|----------|
| **MongoDB** | ~512MB free | Permanent | User data, interview history |
| **localStorage** | ~5-10MB | Until cleared | Current session data |
| **sessionStorage** | ~5-10MB | Until tab closes | Temporary results |
| **IndexedDB** | ~50MB-100GB+ | Permanent | Video recordings |

---

## 🔐 Security & Privacy

### **MongoDB**:
- ✅ User authentication required
- ✅ Passwords hashed (bcrypt)
- ✅ HTTPS connection (MongoDB Atlas)
- ✅ Access control (users only see their data)

### **localStorage/sessionStorage**:
- ⚠️ Not encrypted (sensitive data cleared quickly)
- ⚠️ Accessible by any JS on same domain
- ✅ Temporary (cleared after use)

### **IndexedDB**:
- ✅ Stays on user's device (never transmitted)
- ✅ User has full control
- ✅ Can be cleared anytime

---

## 🧹 Cleanup Strategy

### **After Interview Completion:**
```typescript
// Results page (after MongoDB save)
sessionStorage.removeItem('currentInterviewResults')
localStorage.removeItem('parsedResume')
localStorage.removeItem('parsedJobDescription')
localStorage.removeItem('jobDescriptionUrl')
localStorage.removeItem('resumeFileName')
```

### **Starting New Interview:**
```typescript
// Clear previous session data
sessionStorage.clear()
localStorage.removeItem('parsedResume')
localStorage.removeItem('parsedJobDescription')
```

### **User Logout:**
```typescript
// Clear all local data
localStorage.clear()
sessionStorage.clear()
// IndexedDB videos can optionally be kept or cleared
```

---

## 🎯 Best Practices

### **Do's**:
- ✅ Use MongoDB for anything that needs to persist
- ✅ Use localStorage for current session workflow data
- ✅ Use sessionStorage for ultra-temporary data
- ✅ Use IndexedDB for large files (videos)
- ✅ Clear sensitive data after use

### **Don'ts**:
- ❌ Don't store passwords in localStorage
- ❌ Don't store large files in localStorage
- ❌ Don't rely on localStorage for permanent data
- ❌ Don't send videos to MongoDB (use IndexedDB)

---

## 📝 Implementation Checklist

### **For Authenticated Users:**
- [x] Interview results saved to MongoDB
- [x] Interview history loaded from MongoDB
- [x] Dashboard displays MongoDB data
- [x] Old interviews retrievable from database

### **For Non-Authenticated Users (Guest Mode)**:
- [ ] Results shown but not saved
- [ ] Warning message about data loss
- [ ] Option to create account to save results
- [ ] Temporary access to results until page refresh

---

## 🔄 Migration Notes

If you previously used localStorage for interview history, you'll need to migrate:

```typescript
// Migration script (optional)
const migrateLocalStorageToMongoDB = async () => {
  const oldHistory = localStorage.getItem('interviewHistory')
  
  if (oldHistory) {
    const interviews = JSON.parse(oldHistory)
    
    for (const interview of interviews) {
      await fetch('/api/user/save-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewResults: interview })
      })
    }
    
    localStorage.removeItem('interviewHistory')
  }
}
```

---

## 📚 API Endpoints for Data Access

### **Save Interview**:
```
POST /api/user/save-interview
Body: { interviewResults, parsedResume, parsedJobDescription }
Response: { success: true, interviewId: string }
```

### **Get Interview History**:
```
GET /api/user/get-interviews
Response: { success: true, interviews: InterviewHistoryItem[] }
```

### **Get Specific Interview**:
```
GET /api/user/get-interview?interviewId={id}
Response: { success: true, interview: CompleteInterviewRecord }
```

---

**Data storage is now properly structured for scalability and user accounts!** 💾

