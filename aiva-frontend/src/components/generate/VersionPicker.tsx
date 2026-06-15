import React, { useRef, useState } from 'react'
import { Music2, Play, Pause } from 'lucide-react'
import { Button } from '../common/Button'
import type { TrackVersion } from '../../types/generate'

interface VersionPickerProps {
  versions: TrackVersion[]
  picked: TrackVersion | null
  onPick: (version: TrackVersion) => void
  onConfirm: (version: TrackVersion) => void
}

export const VersionPicker: React.FC<VersionPickerProps> = ({
  versions,
  picked,
  onPick,
  onConfirm,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const togglePreview = (v: TrackVersion, e: React.MouseEvent) => {
    e.stopPropagation()
    const url = v.stream_url || v.audio_url
    if (!url) return

    if (playingId === v.id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }
    const audio = new Audio(url)
    audio.onended = () => setPlayingId(null)
    audio.play()
    audioRef.current = audio
    setPlayingId(v.id)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-white">버전을 선택하세요</div>
      <div className="flex flex-col gap-3">
        {versions.map((v) => (
          <button
            key={v.id}
            onClick={() => onPick(v)}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              picked?.id === v.id
                ? 'border-indigo-500 bg-indigo-600/20'
                : 'border-primary-soft bg-[#0d1340] hover:border-indigo-700/50'
            }`}
          >
            {v.image_url ? (
              <img src={v.image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-linear-to-br from-indigo-700 to-violet-800 shrink-0 flex items-center justify-center text-white">
                <Music2 size={24} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">
                {v.title || `버전 ${v.version_num}`}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                버전 {v.version_num}
                {v.duration
                  ? ` · ${Math.floor(v.duration / 60)}:${String(v.duration % 60).padStart(2, '0')}`
                  : ''}
              </div>
            </div>

            {/* 미리듣기 버튼 */}
            {(v.stream_url || v.audio_url) && (
              <button
                onClick={(e) => togglePreview(v, e)}
                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  playingId === v.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-indigo-600/40 hover:text-white'
                }`}
                title={playingId === v.id ? '일시정지' : '미리듣기'}
              >
                {playingId === v.id
                  ? <Pause size={16} />
                  : <Play size={16} className="ml-0.5" />
                }
              </button>
            )}

            {picked?.id === v.id && <div className="text-indigo-400 shrink-0">✓</div>}
          </button>
        ))}
      </div>
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => onConfirm(picked ?? versions[0])}
      >
        {picked ? '선택한 버전으로 감상하기' : '버전 1로 감상하기'} →
      </Button>
    </div>
  )
}
