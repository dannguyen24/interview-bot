# 🎤 Audio Implementation Guide

## Overview

This document explains how audio recording, playback, and processing are implemented in the Interview Bot application.

## 🎯 Audio Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     AUDIO FLOW                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Backend (TTS) → Question Audio → Frontend (Playback)   │
│                                                             │
│  2. Frontend (Recording) → Answer Audio → Backend (STT)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔊 Part 1: Question Audio (TTS - Text to Speech)

### **Backend Responsibilities:**

#### **1. Generate TTS Audio**
```python
# Backend generates audio from question text
from elevenlabs import generate  # or OpenAI TTS

question_text = "Tell me about a time when you faced a challenge..."

# Generate audio
audio_blob = generate(
    text=question_text,
    voice="Rachel",  # Professional voice
    model="eleven_monolingual_v1"
)

# Send to frontend via WebSocket
await websocket.send_json({
    "event": "question_audio",
    "questionId": "q1_behavioral_challenge",
    "audioBlob": audio_blob  # Binary audio data
})
```

#### **2. Audio Specifications**
- **Format**: MP3 or WebM
- **Bitrate**: 128kbps minimum
- **Sample Rate**: 44.1kHz
- **Channels**: Mono (1 channel)
- **Quality**: High (natural-sounding voice)

### **Frontend Implementation:**

#### **Component: `AudioPlayer.tsx`**

**Location**: `frontend/components/AudioPlayer.tsx`

**Purpose**: Plays TTS audio received from backend

**Code Structure**:
```typescript
import React, { useRef, useEffect } from 'react'

interface AudioPlayerProps {
  audioBlob: Blob | null      // Audio data from backend
  onEnded?: () => void        // Callback when audio finishes
  isPlaying: boolean          // Playback state
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioBlob, 
  onEnded, 
  isPlaying 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioBlob && audioRef.current) {
      // Create object URL from blob
      const url = URL.createObjectURL(audioBlob)
      audioRef.current.src = url
      
      // Play audio
      audioRef.current.play().catch(e => 
        console.error("Error playing audio:", e)
      )
      
      // Cleanup URL when done
      return () => URL.revokeObjectURL(url)
    }
  }, [audioBlob])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      if (onEnded) onEnded()
    }

    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [onEnded])

  return (
    <div className="audio-player">
      <audio ref={audioRef} controls={false} hidden />
      {isPlaying && <div className="playing-indicator">🔊 Playing...</div>}
    </div>
  )
}
```

#### **Usage in Interview Page**:
```typescript
// pages/interview.tsx

// State management
const [currentQuestionAudio, setCurrentQuestionAudio] = useState<Blob | null>(null)
const [isPlayingQuestion, setIsPlayingQuestion] = useState(false)

// Receive audio from backend
socket.on('question_audio', (data: { questionId: string; audioBlob: Blob }) => {
  console.log('✅ Received question audio for:', data.questionId)
  setCurrentQuestionAudio(data.audioBlob)
  setIsPlayingQuestion(true)
})

// Render AudioPlayer
<AudioPlayer
  audioBlob={currentQuestionAudio}
  onEnded={() => setIsPlayingQuestion(false)}
  isPlaying={isPlayingQuestion}
/>
```

#### **HTML5 Audio API**

**Key Features Used**:
- `<audio>` element for playback
- `URL.createObjectURL()` for blob handling
- Event listeners for playback control
- Auto-cleanup of object URLs

---

## 🎙️ Part 2: Answer Audio (Recording)

### **Frontend Implementation:**

#### **Component: `AudioRecorder.tsx`**

**Location**: `frontend/components/AudioRecorder.tsx`

**Purpose**: Records user's audio answers

**Code Structure**:
```typescript
import React, { useState, useRef, useEffect } from 'react'

interface AudioRecorderProps {
  onAudioData: (audioBlob: Blob) => void          // Callback with recorded audio
  onRecordingStatusChange: (isRecording: boolean) => void  // Status updates
  disabled?: boolean                               // Disable recording
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onAudioData, 
  onRecordingStatusChange, 
  disabled 
}) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,   // Remove echo
          noiseSuppression: true,   // Remove background noise
          sampleRate: 44100,        // High quality
        }
      })

      // Create MediaRecorder
      const recorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm;codecs=opus'  // WebM with Opus codec
      })

      // Collect audio chunks
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // Handle recording stop
      recorder.onstop = () => {
        // Combine chunks into single blob
        const audioBlob = new Blob(
          audioChunksRef.current, 
          { type: 'audio/webm;codecs=opus' }
        )
        
        // Send to parent component
        onAudioData(audioBlob)
        
        // Reset chunks
        audioChunksRef.current = []
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      setMediaRecorder(recorder)
      setPermissionGranted(true)
      setPermissionError(null)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setPermissionError('Microphone access denied')
      setPermissionGranted(false)
    }
  }

  // Request permission on mount
  useEffect(() => {
    requestMicrophonePermission()
  }, [])

  // Update recording status
  useEffect(() => {
    onRecordingStatusChange(isRecording)
  }, [isRecording, onRecordingStatusChange])

  // Start recording
  const startRecording = () => {
    if (mediaRecorder && permissionGranted) {
      audioChunksRef.current = []
      mediaRecorder.start(1000)  // Collect data every 1 second
      setIsRecording(true)
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  return (
    <div className="audio-recorder">
      {!permissionGranted && !permissionError && (
        <p>Requesting microphone permission...</p>
      )}
      
      {permissionError && (
        <div className="error">
          <p>{permissionError}</p>
          <button onClick={requestMicrophonePermission}>
            Retry Microphone Access
          </button>
        </div>
      )}
      
      {permissionGranted && (
        <div className="recording-controls">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`record-button ${isRecording ? 'recording' : 'ready'}`}
            disabled={disabled}
          >
            {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
          </button>
          
          {isRecording && (
            <div className="recording-indicator">
              <span className="pulse-dot"></span>
              <span>Recording...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

#### **Usage in Interview Page**:
```typescript
// pages/interview.tsx

// Handle recorded audio
const handleAudioData = (audioBlob: Blob) => {
  if (socket && currentQuestion) {
    // Send to backend for STT processing
    socket.emit('submit_answer', {
      questionId: currentQuestion.id,
      audioBlob: audioBlob
    })
    
    setIsProcessingAnswer(true)
  }
}

// Render AudioRecorder
<AudioRecorder
  onAudioData={handleAudioData}
  onRecordingStatusChange={(recording) => setIsRecording(recording)}
  disabled={isPlayingQuestion || isProcessingAnswer}
/>
```

### **MediaRecorder API**

**Key Features**:
- Browser-native audio recording
- Real-time audio capture from microphone
- Configurable audio quality
- Chunk-based data collection

**Audio Settings**:
```typescript
{
  audio: {
    echoCancellation: true,     // Remove echo/feedback
    noiseSuppression: true,     // Reduce background noise
    autoGainControl: true,      // Normalize volume
    sampleRate: 44100,          // CD-quality sample rate
  }
}
```

**Output Format**:
- **Container**: WebM
- **Codec**: Opus
- **Bitrate**: Variable (adaptive)
- **Channels**: Mono (1 channel)

---

## 🔄 Part 3: Backend Audio Processing (STT)

### **Backend Responsibilities:**

#### **1. Receive Audio from Frontend**
```python
# WebSocket handler
@socketio.on('submit_answer')
async def handle_answer(data):
    question_id = data['questionId']
    audio_blob = data['audioBlob']  # WebM/Opus audio
    
    # Process audio
    await process_answer_audio(question_id, audio_blob)
```

#### **2. Convert Audio to Text (STT)**
```python
import whisper  # OpenAI Whisper

# Load Whisper model
model = whisper.load_model("base")

# Transcribe audio
result = model.transcribe(audio_file_path)
transcript = result["text"]

# Extract metadata
language = result["language"]
segments = result["segments"]  # Timestamp segments
```

#### **3. Analyze Transcribed Text**
```python
# AI analysis
analysis = await analyze_answer(
    transcript=transcript,
    question=question_text,
    resume_data=parsed_resume,
    job_data=parsed_job
)

# Send analysis back to frontend
await socketio.emit('answer_analyzed', {
    'questionId': question_id,
    'transcript': transcript,
    'score': analysis['score'],
    'feedback': analysis['feedback'],
    'fillerWords': count_filler_words(transcript),
    # ... other analysis data
})
```

#### **4. Recommended STT Services**

| Service | Pros | Cons | Best For |
|---------|------|------|----------|
| **OpenAI Whisper** | Free, high accuracy, local | Slower processing | Self-hosted |
| **Google Cloud STT** | Fast, multilingual | Costs money | Production |
| **AssemblyAI** | Excellent accuracy | Costs money | Production |
| **Deepgram** | Real-time capable | Costs money | Live streaming |

---

## 📊 Audio Quality Metrics

### **Recording Quality**:
- **Sample Rate**: 44.1kHz (CD quality)
- **Bit Depth**: 16-bit
- **Bitrate**: ~96-128kbps (Opus adaptive)
- **Latency**: <100ms (recording start)

### **Playback Quality**:
- **TTS Quality**: Natural, conversational
- **Volume**: Normalized (-14 LUFS target)
- **No Clipping**: Peak < -1dB

---

## 🐛 Troubleshooting

### **"Microphone not working"**
**Cause**: Browser permissions denied
**Solution**: 
- Check browser permission settings
- Use HTTPS (required for mic access)
- Click "Allow" when prompted

### **"Audio playback fails"**
**Cause**: Blob URL not created properly
**Solution**:
- Verify audioBlob is not null
- Check MIME type compatibility
- Use `URL.revokeObjectURL()` cleanup

### **"Recording quality is poor"**
**Cause**: Browser audio constraints
**Solution**:
- Enable `echoCancellation`
- Enable `noiseSuppression`
- Use external microphone
- Test in quiet environment

### **"STT transcription is inaccurate"**
**Cause**: Audio quality issues
**Solution**:
- Ensure minimum 16kHz sample rate
- Reduce background noise
- Use Whisper "medium" or "large" model
- Pre-process audio (noise reduction)

---

## 🔐 Security & Privacy

### **Audio Data Handling**:
- ✅ Audio transmitted over secure WebSocket (WSS in production)
- ✅ No audio stored on frontend (only temporary blobs)
- ✅ Backend processes and discards audio after transcription
- ✅ Transcripts stored (not raw audio files)

### **User Privacy**:
- ⚠️ Request explicit permission before accessing microphone
- ⚠️ Indicate recording status clearly
- ⚠️ Allow users to review/delete recordings
- ⚠️ Don't record without user action

---

## 📝 Best Practices

### **Frontend**:
1. **Always request permission** before accessing microphone
2. **Show visual indicators** during recording (red dot, timer)
3. **Disable recording** during question playback
4. **Handle errors gracefully** with retry options
5. **Clean up resources** (stop tracks, revoke URLs)

### **Backend**:
1. **Use WebSocket** for real-time audio streaming
2. **Process audio asynchronously** (don't block)
3. **Implement timeout** for long audio files
4. **Return timestamps** for pain point analysis
5. **Log errors** but not audio content

---

## 🎯 Performance Optimization

### **Reduce Latency**:
- Use smaller audio chunks (1-2 seconds)
- Stream audio in real-time (optional)
- Use faster STT models (Whisper "tiny" for speed)
- Cache TTS audio for repeat questions

### **Reduce Bandwidth**:
- Use Opus codec (best compression)
- Lower sample rate if quality acceptable
- Don't send video over WebSocket (future: use separate channel)

---

## 📚 Resources

- [MediaRecorder API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [OpenAI Whisper GitHub](https://github.com/openai/whisper)
- [WebRTC Audio Best Practices](https://webrtc.org/getting-started/audio)


