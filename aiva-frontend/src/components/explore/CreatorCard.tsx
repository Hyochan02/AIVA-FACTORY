import React from 'react'
import { formatPlays, gradColor } from '../../utils/format'

interface Creator {
  id: string
  name: string
  track_count: number
  followers: number
  avatar_url?: string
  is_following: number
}

interface CreatorCardProps {
  creator: Creator
  onFollow: (id: string) => void
  isLoading?: boolean
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  onFollow,
  isLoading = false,
}) => {
  const isFollowing = !!creator.is_following
  const initial = [...creator.name][0]?.toUpperCase() ?? '?'

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-[#080c2a]/60 border border-white/5 hover:border-indigo-500/30 transition-all">
      <div className={`w-10 h-10 rounded-full bg-linear-to-br ${gradColor(creator.id)} flex items-center justify-center text-white font-bold shrink-0`}>
        {initial}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">@{creator.name}</div>
        <div className="text-xs text-slate-400">
          {creator.track_count}개 트랙 · 팔로워 {formatPlays(creator.followers)}
        </div>
      </div>

      <button
        onClick={() => onFollow(creator.id)}
        disabled={isLoading}
        className={`px-2.5 py-1 mr-1 text-xs font-semibold rounded-full border transition-all ${
          isFollowing
            ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300'
            : 'border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/20'
        } ${isLoading ? 'opacity-50' : ''}`}
      >
        {isLoading ? '...' : isFollowing ? '팔로잉' : '팔로우'}
      </button>
    </div>
  )
}
