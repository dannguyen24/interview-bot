import { useState, useRef, useEffect } from 'react'

interface AudioRecorderProps {
  onAudioData: (audioBlob: Blob) => void
  onRecordingStateChange: (isRecording: boolean) => void
  disabled?: boolean
}

export const AudioRecorder = ({ onAudioData, onRecordingStateChange, disabled = false }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Request microphone permission on component mount
    requestMicrophonePermission()
    
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      setHasPermission(true)
      streamRef.current = stream
    } catch (error) {
      console.error('❌ Microphone permission denied:', error)
      setHasPermission(false)
    }
  }

  const startRecording = async () => {
    if (!streamRef.current || disabled) return

    try {
      audioChunksRef.current = []
      
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        onAudioData(audioBlob)
      }

      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      onRecordingStateChange(true)
      
      // Start timer
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('❌ Failed to start recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      onRecordingStateChange(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (hasPermission === false) {
    return (
      <div className="audio-recorder-error">
        <p>❌ Microphone access denied</p>
        <button onClick={requestMicrophonePermission}>
          Grant Permission
        </button>
      </div>
    )
  }

  if (hasPermission === null) {
    return (
      <div className="audio-recorder-loading">
        <p>🎤 Requesting microphone access...</p>
      </div>
    )
  }

  return (
    <div className="audio-recorder">
      <div className="recording-controls">
        <button
          className={`record-button ${isRecording ? 'recording' : 'ready'}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
        >
          {isRecording ? '🛑 Stop Recording' : '🎤 Start Recording'}
        </button>
        
        {isRecording && (
          <div className="recording-indicator">
            <div className="pulse-dot"></div>
            <span>Recording: {formatTime(recordingTime)}</span>
          </div>
        )}
      </div>
      
      <div className="recording-status">
        {isRecording ? (
          <p className="recording-text">🎙️ Listening...</p>
        ) : (
          <p className="ready-text">Ready to record your answer</p>
        )}
      </div>
    </div>
  )
}
