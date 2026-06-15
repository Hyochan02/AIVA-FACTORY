import React from 'react'
import { Globe, Lock, Music2, Play } from 'lucide-react'
import { Badge } from '../common/Badge'
import { formatDuration, gradColor, trackTitle } from '../../utils/format'
import type { Track } from '../../types/track'

type TrackWithPublic = Track & { is_public?: number; cover_url?: string }

interface TrackCardProps {
  track: Track
  onClick: () => void
  onVisibilityToggle: (e: React.MouseEvent, track: Track) => void
  onEdit?: (e: React.MouseEvent) => void
  isToggling?: boolean
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  onClick,
  onVisibilityToggle,
  onEdit,
  isToggling = false,
}) => {
  const t = track as TrackWithPublic

  return (
    <div
      className="bg-[#0d1340] border border-(--border-color) rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className={`h-32 bg-linear-to-br ${gradColor(t.id)} flex items-center justify-center relative overflow-hidden`}>
        {t.cover_url && (
          <img src={t.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <Music2 size={40} className="relative z-10 opacity-60 text-white" />
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
        <div className="font-semibold text-white text-sm truncate mb-2">{trackTitle(t.title, t.version_num)}</div>
        <div className="flex items-center gap-2">
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
            {t.is_public ? <><Globe size={9} />&nbsp;공개</> : <><Lock size={9} />&nbsp;비공개</>}
          </button>
          <span className="ml-auto text-xs text-slate-400 shrink-0">{formatDuration(t.duration)}</span>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="mt-3 w-full py-1.5 rounded-lg border border-(--border-color) text-xs font-semibold text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300 transition-all"
          >
            편집
          </button>
        )}
      </div>
    </div>
  )
}
