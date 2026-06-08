import React from 'react'

interface WaveformProps {
  bars?: number[]
  progress?: number
  color?: string
  playedColor?: string
  className?: string
  onSeek?: (progress: number) => void
}

const DEFAULT_BARS = Array.from({ length: 30 }, () => 0.2 + Math.random() * 0.8)

export const Waveform: React.FC<WaveformProps> = ({
  bars = DEFAULT_BARS,
  progress = 0,
  color = 'rgba(129,140,248,0.3)',
  playedColor = '#818cf8',
  className = '',
  onSeek,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return
    const rect = e.currentTarget.getBoundingClientRect()
    onSeek((e.clientX - rect.left) / rect.width)
  }

  return (
    <div
      className={`flex items-center gap-0.5 h-8 ${className} ${onSeek ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {bars.map((height, i) => {
        const isPlayed = i / bars.length < progress
        return (
          <div
            key={i}
            className="flex-1 rounded-full transition-all duration-150"
            style={{
              height: `${height * 100}%`,
              background: isPlayed ? playedColor : color,
            }}
          />
        )
      })}
    </div>
  )
}

export default Waveform
