import { useState, useRef, useEffect } from 'react'

interface AudioPlayerProps {
  audioUrl?: string
  audioBlob?: Blob
  onPlaybackComplete?: () => void
  autoPlay?: boolean
}

export const AudioPlayer = ({ audioUrl, audioBlob, onPlaybackComplete, autoPlay = false }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current

      const handleLoadedMetadata = () => {
        setDuration(audio.duration)
        setIsLoading(false)
      }

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime)
      }

      const handleEnded = () => {
        setIsPlaying(false)
        setCurrentTime(0)
        onPlaybackComplete?.()
      }

      const handlePlay = () => setIsPlaying(true)
      const handlePause = () => setIsPlaying(false)

      audio.addEventListener('loadedmetadata', handleLoadedMetadata)
      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('play', handlePlay)
      audio.addEventListener('pause', handlePause)

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audio.removeEventListener('timeupdate', handleTimeUpdate)
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('play', handlePlay)
        audio.removeEventListener('pause', handlePause)
      }
    }
  }, [onPlaybackComplete])

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      if (audioRef.current) {
        audioRef.current.src = url
        setIsLoading(true)
      }
      return () => URL.revokeObjectURL(url)
    } else if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl
      setIsLoading(true)
    }
  }, [audioBlob, audioUrl])

  useEffect(() => {
    if (autoPlay && audioRef.current && !isLoading) {
      audioRef.current.play()
    }
  }, [autoPlay, isLoading])

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!audioUrl && !audioBlob) {
    return null
  }

  return (
    <div className="audio-player">
      <audio ref={audioRef} preload="metadata" />
      
      <div className="player-controls">
        <button
          className={`play-button ${isPlaying ? 'playing' : 'paused'}`}
          onClick={togglePlayPause}
          disabled={isLoading}
        >
          {isLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
      
      {isLoading && (
        <div className="loading-indicator">
          <span>Loading audio...</span>
        </div>
      )}
    </div>
  )
}
