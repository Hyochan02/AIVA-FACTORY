import React from 'react'
import { Heart, Play } from 'lucide-react'
import { Badge } from '../common/Badge'
import { formatPlays, formatDuration, gradColor } from '../../utils/format'
import type { Track } from '../../types/track'

interface TrackRowProps {
  track: Track
  rank: number
  onPlay: () => void
  isLiked?: boolean
  onLike?: (e: React.MouseEvent, track: Track & { is_liked?: number }) => void
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  rank,
  onPlay,
  isLiked = false,
  onLike,
}) => (
  <div
    className="flex items-center gap-4 p-3 rounded-md bg-[#080c2a]/60 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group"
    onClick={onPlay}
  >
    <span className="w-5 text-sm font-black text-slate-500 text-center shrink-0">{rank}</span>

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-white truncate">{track.title}</span>
        <span className="text-xs text-slate-500 shrink-0">{formatDuration(track.duration)}</span>
        <span className="text-xs text-slate-500 shrink-0">{formatPlays(track.plays)}회 재생</span>
        <button
          className={`transition-all shrink-0 ${isLiked ? 'text-rose-400' : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400'}`}
          onClick={(e) => onLike?.(e, track as Track & { is_liked?: number })}
        >
          <Heart size={13} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <Badge variant="info">{track.genre}</Badge>
        {(track as Track & { mood?: string }).mood && (
          <Badge variant="info">{(track as Track & { mood?: string }).mood}</Badge>
        )}
      </div>
    </div>

    <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${gradColor(track.id)} flex items-center justify-center text-white shrink-0`}>
      <Play size={15} fill="currentColor" />
    </div>
  </div>
)
