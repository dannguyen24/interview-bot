# 📹 Video Implementation Guide

## Overview

This document explains how video recording, storage, and playback are implemented in the Interview Bot application. **Note**: Video is for user reference only - it's not sent to backend for processing.

## 🎯 Video Flow

```
┌──────────────────────────────────────────────────────────┐
│                      VIDEO FLOW                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. User grants camera permission                       │
│  2. Frontend records video + audio together             │
│  3. Video stored locally (IndexedDB or File)            │
│  4. Only audio blob sent to backend for STT             │
│  5. Video available for playback in results page        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📹 Part 1: Video Recording

### **Frontend Implementation:**

#### **Component: `VideoAudioRecorder.tsx`** (To Be Created)

**Location**: `frontend/components/VideoAudioRecorder.tsx`

**Purpose**: Records both video and audio simultaneously

**Code Structure**:
```typescript
import React, { useState, useRef, useEffect } from 'react'

interface VideoAudioRecorderProps {
  onRecordingComplete: (videoBlob: Blob, audioBlob: Blob) => void
  onRecordingStatusChange: (isRecording: boolean) => void
  disabled?: boolean
}

export const VideoAudioRecorder: React.FC<VideoAudioRecorderProps> = ({ 
  onRecordingComplete, 
  onRecordingStatusChange, 
  disabled 
}) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoChunksRef = useRef<Blob[]>([])

  // Request camera and microphone permission
  const requestPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })

      setStream(mediaStream)

      // Show video preview
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }

      // Create MediaRecorder for video+audio
      const recorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp8,opus',  // VP8 video + Opus audio
        videoBitsPerSecond: 2500000  // 2.5 Mbps
      })

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = async () => {
        // Create video blob
        const videoBlob = new Blob(
          videoChunksRef.current,
          { type: 'video/webm;codecs=vp8,opus' }
        )

        // Extract audio track separately
        const audioBlob = await extractAudioFromVideo(videoBlob)

        // Send both to parent component
        onRecordingComplete(videoBlob, audioBlob)

        // Cleanup
        videoChunksRef.current = []
      }

      setMediaRecorder(recorder)
      setPermissionGranted(true)
      setPermissionError(null)
    } catch (err) {
      console.error('Error accessing camera/microphone:', err)
      setPermissionError('Camera or microphone access denied')
      setPermissionGranted(false)
    }
  }

  // Extract audio track from video
  const extractAudioFromVideo = async (videoBlob: Blob): Promise<Blob> => {
    // Create audio context
    const audioContext = new AudioContext()
    const arrayBuffer = await videoBlob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    // Create offline context for audio extraction
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    )

    const source = offlineContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(offlineContext.destination)
    source.start()

    const renderedBuffer = await offlineContext.startRendering()

    // Convert to blob
    const audioBlob = await bufferToBlob(renderedBuffer)
    return audioBlob
  }

  // Convert AudioBuffer to Blob
  const bufferToBlob = async (buffer: AudioBuffer): Promise<Blob> => {
    const wav = audioBufferToWav(buffer)
    return new Blob([wav], { type: 'audio/wav' })
  }

  // Request permissions on mount
  useEffect(() => {
    requestPermissions()
    
    return () => {
      // Cleanup on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    onRecordingStatusChange(isRecording)
  }, [isRecording, onRecordingStatusChange])

  const startRecording = () => {
    if (mediaRecorder && permissionGranted) {
      videoChunksRef.current = []
      mediaRecorder.start(1000)
      setIsRecording(true)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  return (
    <div className="video-audio-recorder">
      {/* Video Preview */}
      <div className="video-preview">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`preview-video ${isRecording ? 'recording' : ''}`}
        />
        {isRecording && (
          <div className="recording-badge">
            <span className="recording-dot"></span>
            REC
          </div>
        )}
      </div>

      {/* Permission Requests */}
      {!permissionGranted && !permissionError && (
        <div className="permission-request">
          <p>Requesting camera and microphone access...</p>
          <div className="loading-spinner"></div>
        </div>
      )}

      {permissionError && (
        <div className="permission-error">
          <p>{permissionError}</p>
          <button onClick={requestPermissions}>
            Retry Access
          </button>
        </div>
      )}

      {/* Recording Controls */}
      {permissionGranted && (
        <div className="recording-controls">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`record-button ${isRecording ? 'recording' : 'ready'}`}
            disabled={disabled}
          >
            {isRecording ? (
              <>⏹️ Stop Recording</>
            ) : (
              <>🎥 Start Recording</>
            )}
          </button>

          {isRecording && (
            <div className="recording-timer">
              <RecordingTimer />
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .video-preview {
          position: relative;
          width: 100%;
          max-width: 640px;
          margin: 0 auto 1rem;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
        }

        .preview-video {
          width: 100%;
          height: auto;
          display: block;
        }

        .preview-video.recording {
          border: 3px solid #f44336;
        }

        .recording-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #f44336;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .recording-dot {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .record-button {
          padding: 1rem 2rem;
          font-size: 1.125rem;
          font-weight: 600;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .record-button.ready {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .record-button.recording {
          background: #f44336;
          color: white;
        }

        .record-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .record-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}

// Helper component for recording timer
const RecordingTimer: React.FC = () => {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`
  }

  return <span>{formatTime(seconds)}</span>
}
```

### **Video Recording Specifications**

| Property | Value | Reason |
|----------|-------|--------|
| **Resolution** | 1280x720 (720p) | Balance quality & file size |
| **Frame Rate** | 30 FPS | Smooth playback, reasonable size |
| **Codec** | VP8 | Wide browser support |
| **Container** | WebM | Native browser support |
| **Bitrate** | 2.5 Mbps | Good quality for interviews |
| **Audio Codec** | Opus | Best compression |

---

## 💾 Part 2: Video Storage

### **Why Local Storage?**

Video files are **NOT** sent to the backend because:
- ✅ **Large file sizes** (5-10MB per question)
- ✅ **Bandwidth concerns** (upload would be slow)
- ✅ **Privacy** (users may prefer local-only video)
- ✅ **Cost** (server storage is expensive)
- ✅ **Not analyzed** (only audio is processed by AI)

### **Storage Options**

#### **Option 1: IndexedDB** (Recommended)

**Pros**:
- Large storage capacity (50MB - 100GB+)
- Persistent across sessions
- Structured data storage
- Fast retrieval

**Implementation**:
```typescript
// lib/videoStorage.ts

export const saveVideoToIndexedDB = async (
  interviewId: string,
  questionId: string,
  videoBlob: Blob
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('InterviewBotVideos', 1)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['videos'], 'readwrite')
      const store = transaction.objectStore('videos')

      const videoData = {
        id: `${interviewId}_${questionId}`,
        interviewId,
        questionId,
        videoBlob,
        timestamp: new Date().toISOString()
      }

      const addRequest = store.add(videoData)
      
      addRequest.onsuccess = () => resolve()
      addRequest.onerror = () => reject(addRequest.error)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos', { keyPath: 'id' })
      }
    }
  })
}

export const getVideoFromIndexedDB = async (
  interviewId: string,
  questionId: string
): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('InterviewBotVideos', 1)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['videos'], 'readonly')
      const store = transaction.objectStore('videos')
      const getRequest = store.get(`${interviewId}_${questionId}`)

      getRequest.onsuccess = () => {
        const result = getRequest.result
        resolve(result ? result.videoBlob : null)
      }

      getRequest.onerror = () => reject(getRequest.error)
    }
  })
}
```

#### **Option 2: File System Access API**

**Pros**:
- Direct file system access
- User controls location

**Cons**:
- Limited browser support
- Requires user permission

#### **Option 3: Blob URLs (Temporary)**

**Pros**:
- Simple implementation
- No storage API needed

**Cons**:
- Lost on page refresh
- Memory intensive

---

## 🎬 Part 3: Video Playback

### **Results Page Integration**

**Purpose**: Display video alongside feedback with timestamp jumping

**Implementation**:
```typescript
// pages/results.tsx

interface VideoPlayerWithTimestampsProps {
  videoBlob: Blob
  painPoints: PainPoint[]
  currentPainPoint?: PainPoint
}

const VideoPlayerWithTimestamps: React.FC<VideoPlayerWithTimestampsProps> = ({
  videoBlob,
  painPoints,
  currentPainPoint
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')

  useEffect(() => {
    const url = URL.createObjectURL(videoBlob)
    setVideoUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [videoBlob])

  // Jump to timestamp
  const jumpToTimestamp = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp
      videoRef.current.play()
    }
  }

  // Highlight current pain point
  useEffect(() => {
    if (currentPainPoint) {
      jumpToTimestamp(currentPainPoint.timestamp)
    }
  }, [currentPainPoint])

  return (
    <div className="video-player-container">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="results-video"
      />

      <div className="pain-point-markers">
        {painPoints.map((point, index) => (
          <button
            key={index}
            className="pain-point-marker"
            onClick={() => jumpToTimestamp(point.timestamp)}
            style={{ left: `${(point.timestamp / videoDuration) * 100}%` }}
          >
            ⚠️
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

## 📊 Video Quality vs File Size

| Resolution | FPS | Bitrate | File Size (5min) |
|------------|-----|---------|------------------|
| **480p** | 30 | 1 Mbps | ~37 MB |
| **720p** | 30 | 2.5 Mbps | ~93 MB |
| **1080p** | 30 | 5 Mbps | ~187 MB |
| **1080p** | 60 | 8 Mbps | ~300 MB |

**Recommended**: 720p @ 30fps (good balance for 8 questions = ~750MB total)

---

## 🔄 Integration with Audio

### **Dual Recording Pattern**

```typescript
// pages/interview.tsx

const handleRecordingComplete = async (videoBlob: Blob, audioBlob: Blob) => {
  // Save video locally
  await saveVideoToIndexedDB(interviewId, questionId, videoBlob)

  // Send only audio to backend
  socket.emit('submit_answer', {
    questionId: currentQuestion.id,
    audioBlob: audioBlob  // Only audio sent for STT
  })

  // Store video reference in results
  localStorage.setItem(`video_${questionId}`, 'indexed_db')
}
```

### **Synchronized Timestamps**

When backend returns pain points:
```typescript
interface PainPoint {
  type: 'filler_word' | 'unclear' | 'off_topic'
  timestamp: number  // Seconds into video
  duration?: number  // Duration of issue
  context: string    // What was said
  feedback: string   // Specific feedback
}

// Backend calculates timestamps from audio
// Frontend uses same timestamps for video playback
```

---

## 🐛 Troubleshooting

### **"Camera not detected"**
**Solution**: Check browser permissions, ensure HTTPS, try different browser

### **"Video too large"**
**Solution**: Reduce bitrate, lower resolution, or limit recording time

### **"Video won't play"**
**Solution**: Check codec support, ensure blob URL is valid

### **"IndexedDB quota exceeded"**
**Solution**: Clear old videos, ask for persistent storage permission

---

## 🔐 Privacy & Security

### **User Control**:
- ✅ Explicit permission required
- ✅ Visual recording indicator (red dot)
- ✅ Option to disable video (audio-only mode)
- ✅ Delete videos after viewing results

### **Data Protection**:
- ✅ Videos never leave user's device
- ✅ No server storage or transmission
- ✅ Auto-delete after X days (configurable)
- ✅ Clear privacy policy

---

## 📝 Best Practices

### **UX Recommendations**:
1. **Show camera preview** before recording starts
2. **Display recording indicator** prominently
3. **Allow audio-only mode** for privacy
4. **Provide video deletion** option
5. **Indicate storage usage** to user

### **Performance**:
1. **Limit video length** per question (2-3 minutes max)
2. **Use efficient codecs** (VP8/VP9)
3. **Implement lazy loading** for video playback
4. **Clean up blobs** after use
5. **Compress videos** if storage is limited

---

## 🚀 Future Enhancements

- [ ] **Video compression** before storage
- [ ] **Cloud upload option** for backup
- [ ] **Multiple camera support**
- [ ] **Screen recording** option
- [ ] **Video editing** (trim, crop)
- [ ] **Thumbnail generation**
- [ ] **Video export** (download)

---

## 📚 Resources

- [MediaStream Recording API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API)
- [IndexedDB Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [WebM Format Specification](https://www.webmproject.org/)
- [getUserMedia() Constraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)


