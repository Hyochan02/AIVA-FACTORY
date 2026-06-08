import React from 'react'

interface WaveformProps {
  bars?: number[]
  progress?: number   // 0~1
  isPlaying?: boolean
  className?: string
  onSeek?: (progress: number) => void
}

const DEFAULT_BARS = Array.from({ length: 60 }, () => 0.2 + Math.random() * 0.8)

export const Waveform: React.FC<WaveformProps> = ({
  bars = DEFAULT_BARS,
  progress = 0,
  isPlaying = false,
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
      className={`relative flex items-center gap-0.5 h-14 ${onSeek ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      {bars.map((height, i) => {
        const ratio    = i / bars.length
        const isPlayed = ratio < progress
        const isHead   = Math.abs(ratio - progress) < 1.5 / bars.length

        return (
          <div
            key={i}
            className="flex-1 rounded-full"
            style={{
              height: `${Math.max(6, height * 100)}%`,
              background: isHead
                ? 'rgba(165,180,252,1)'
                : isPlayed
                  ? 'rgba(129,140,248,0.9)'
                  : 'rgba(129,140,248,0.3)',
              transition: 'background 0.08s, height 0.15s',
              transform: isPlaying && isHead ? 'scaleY(1.3)' : 'scaleY(1)',
              transformOrigin: 'center',
            }}
          />
        )
      })}

      {/* 재생 커서 */}
      {progress > 0 && (
        <div
          className="absolute top-0 bottom-0 w-px pointer-events-none rounded-full"
          style={{
            left: `${progress * 100}%`,
            background: 'rgba(165,180,252,0.85)',
            boxShadow: isPlaying ? '0 0 8px 2px rgba(129,140,248,0.5)' : 'none',
            transition: 'left 0.25s linear',
          }}
        />
      )}
    </div>
  )
}

export default Waveform
