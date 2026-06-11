import React, { useState } from 'react'
import { Globe, LayoutGrid, List, Lock, Music2, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { TrackCard } from '../components/tracks/TrackCard'
import { Waveform } from '../components/common/Waveform'
import { useGetTracks } from '../hooks/queries/useGetTracks'
import { usePatchTrack } from '../hooks/mutations/usePatchTrack'
import { formatDuration, gradColor } from '../utils/format'
import type { Track } from '../types/track'

const FILTERS = ['전체', 'Lo-Fi', 'City Pop', 'Ambient', 'Synthwave', 'K-Pop', 'EDM', 'Jazz', 'Acoustic', 'Hip-Hop', 'Classical', 'R&B', 'Drum & Bass']
type ViewMode = 'grid' | 'list'

const GridSkeleton = () => (
  <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl overflow-hidden animate-pulse">
    <div className="h-32 bg-navy-700" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-navy-700 rounded w-28" />
      <div className="flex justify-between">
        <div className="h-2 bg-navy-800 rounded w-12" />
        <div className="h-2 bg-navy-800 rounded w-10" />
      </div>
    </div>
  </div>
)

const Library: React.FC = () => {
  const navigate = useNavigate()

  const [view, setView]     = useState<ViewMode>('grid')
  const [filter, setFilter] = useState('전체')
  const [search, setSearch] = useState('')

  const queryGenre  = filter === '전체' ? undefined : filter
  const querySearch = search.trim() || undefined

  const { data, isLoading: loading, isError, refetch } = useGetTracks({ genre: queryGenre, q: querySearch })
  const { mutate: patchTrackMutate, isPending: togglingAny } = usePatchTrack()
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const tracks: Track[] = data?.items ?? []
  const total           = data?.pagination?.total ?? 0

  const handleVisibilityToggle = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation()
    if (togglingId) return
    const currentPublic = !!(track as Track & { is_public?: number }).is_public
    setTogglingId(track.id)
    patchTrackMutate(
      { id: track.id, data: { isPublic: !currentPublic } },
      {
        onSettled: () => setTogglingId(null),
      },
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="트랙 검색..."
          className="flex-1 min-w-48 bg-[#0d1340] border border-(--border-color) rounded-[12px] px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <div className="flex gap-1">
          {(['grid','list'] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${view === v ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              {v === 'grid' ? <LayoutGrid size={14} /> : <List size={14} />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === f ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'border-(--border-color) text-slate-400 hover:border-indigo-700/40'}`}>
            {f}
          </button>
        ))}
        {!loading && <span className="px-3 py-1.5 text-xs text-slate-500">{total}개</span>}
      </div>

      {isError && (
        <div className="text-center py-8">
          <p className="text-sm text-red-400 mb-3">데이터를 불러오지 못했습니다.</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>다시 시도</Button>
        </div>
      )}

      {!loading && !isError && tracks.length === 0 && (
        <div className="text-center py-16">
          <Music2 size={40} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 mb-2">
            {search || filter !== '전체' ? '검색 결과가 없습니다.' : '아직 생성한 트랙이 없습니다.'}
          </p>
          {!search && filter === '전체' && (
            <Button variant="primary" size="sm" onClick={() => navigate('/create')}>
              첫 트랙 만들기 →
            </Button>
          )}
        </div>
      )}

      {view === 'grid' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array(6).fill(0).map((_, i) => <GridSkeleton key={i} />)
            : tracks.map(t => (
                <TrackCard
                  key={t.id}
                  track={t}
                  onClick={() => navigate(`/player/${t.id}`)}
                  onVisibilityToggle={handleVisibilityToggle}
                  isToggling={togglingId === t.id}
                />
              ))
          }
        </div>
      )}

      {view === 'list' && (
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl overflow-hidden">
          {loading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse border-b border-(--border-color)">
                  <div className="w-10 h-10 rounded-xl bg-navy-700 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-navy-700 rounded w-32" />
                    <div className="h-2 bg-navy-800 rounded w-20" />
                  </div>
                </div>
              ))
            : tracks.map((t, i) => (
                <div key={t.id}
                  className={`flex items-center gap-4 p-4 hover:bg-navy-800/40 transition-colors cursor-pointer ${i < tracks.length - 1 ? 'border-b border-(--border-color)' : ''}`}
                  onClick={() => navigate(`/player/${t.id}`)}>
                  <span className="w-5 text-xs text-slate-500 text-center">{i+1}</span>
                  <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${gradColor(t.id)} flex items-center justify-center text-white shrink-0`}>
                    <Play size={14} fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{t.title}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {t.version_num && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 shrink-0">
                          V{t.version_num}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{t.genre}</span>
                      <button
                        onClick={e => handleVisibilityToggle(e, t)}
                        disabled={togglingId === t.id || togglingAny}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border transition-all ${
                          (t as Track & { is_public?: number }).is_public
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-slate-700/40 border-slate-600/30 text-slate-400 hover:bg-slate-700/70'
                        } ${togglingId === t.id ? 'opacity-50' : ''}`}
                      >
                        {(t as Track & { is_public?: number }).is_public
                          ? <><Globe size={8} /><span className="ml-0.5">공개</span></>
                          : <><Lock size={8} /><span className="ml-0.5">비공개</span></>
                        }
                      </button>
                    </div>
                  </div>
                  <Waveform className="w-20 hidden md:flex" />
                  <span className="text-xs text-slate-400">{formatDuration(t.duration)}</span>
                  <Button variant="secondary" size="sm"
                    onClick={e => { e.stopPropagation(); navigate(`/editor?trackId=${t.id}`) }}>
                    편집
                  </Button>
                </div>
              ))
          }
        </div>
      )}
    </div>
  )
}

export default Library
