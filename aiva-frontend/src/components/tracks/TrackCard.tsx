import React from 'react'
import { Globe, Lock, Music2, Play } from 'lucide-react'
import { Badge } from '../common/Badge'
import { formatDuration, gradColor } from '../../utils/format'
import type { Track } from '../../types/track'

type TrackWithPublic = Track & { is_public?: number }

interface TrackCardProps {
  track: Track
  onClick: () => void
  onVisibilityToggle: (e: React.MouseEvent, track: Track) => void
  isToggling?: boolean
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  onClick,
  onVisibilityToggle,
  isToggling = false,
}) => {
  const t = track as TrackWithPublic

  return (
    <div
      className="bg-[#0d1340] border border-(--border-color) rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className={`h-32 bg-linear-to-br ${gradColor(t.id)} flex items-center justify-center relative`}>
        <Music2 size={40} className="opacity-60 text-white" />
        {t.status !== 'done' && (
          <div className="absolute top-2 right-2 px-2 py-0.5 text-xs font-bold bg-amber-500/80 text-white rounded-full">
            {t.status === 'generating' ? '생성 중' : t.status === 'error' ? '오류' : '대기'}
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play size={16} fill="white" className="text-white" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="font-semibold text-white text-sm truncate mb-2">{t.title}</div>
        <div className="flex items-center gap-2">
          {t.version_num && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 shrink-0">
              V{t.version_num}
            </span>
          )}
          <Badge variant="info">{t.genre}</Badge>
          <button
            onClick={(e) => onVisibilityToggle(e, track)}
            disabled={isToggling}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
              t.is_public
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-slate-800/80 border-slate-600/40 text-slate-400 hover:bg-slate-700/80'
            } ${isToggling ? 'opacity-50' : ''}`}
          >
            {t.is_public ? <><Globe size={9} />PUBLIC</> : <><Lock size={9} />PRIVATE</>}
          </button>
          <span className="ml-auto text-xs text-slate-400 shrink-0">{formatDuration(t.duration)}</span>
        </div>
      </div>
    </div>
  )
}
