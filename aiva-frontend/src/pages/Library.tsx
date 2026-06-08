import React, { useState } from 'react'
import { LayoutGrid, List, Music2, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Waveform } from '../components/common/Waveform'
import { useApi } from '../hooks/useApi'
import { getTracks } from '../api/tracks'
import { formatDuration, formatPlays, formatDate, gradColor } from '../utils/format'
import type { Track, PaginatedResponse } from '../types'

const FILTERS = ['전체', 'Lo-Fi', 'City Pop', 'Ambient', 'Synthwave', 'K-Pop', 'EDM', 'Jazz', 'Acoustic', 'Hip-Hop', 'Classical', 'R&B', 'Drum & Bass']
type ViewMode = 'grid' | 'list'

// ── 스켈레톤 ─────────────────────────────────────────────
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

  // ── API 호출: 로컬 필터링이 아닌 서버 쿼리 ──────────────
  // Best Practice: 클라이언트 필터링 대신 서버 쿼리로 처리하면
  // 데이터가 많아져도 성능에 영향을 주지 않습니다.
  const queryGenre = filter === '전체' ? undefined : filter
  const querySearch = search.trim() || undefined

  const { data, loading, error, refetch } = useApi<PaginatedResponse<Track>>(
    () => getTracks({ genre: queryGenre, q: querySearch }),
    [filter, search]
  )

  const tracks: Track[] = data?.items ?? []
  const total           = data?.pagination?.total ?? 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── 헤더 ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="트랙 검색..."
          className="flex-1 min-w-48 bg-[#0d1340] border border-(--border-color) rounded-[12px] px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <div className="flex gap-1">
          {(['grid','list'] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${view === v ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              {v === 'grid'
                ? <LayoutGrid size={14} />
                : <List size={14} />
              }
            </button>
          ))}
        </div>
      </div>

      {/* ── 필터 탭 ──────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap items-center">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === f ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'border-(--border-color) text-slate-400 hover:border-indigo-700/40'}`}>
            {f}
          </button>
        ))}
        {!loading && (
          <span className="px-3 py-1.5 text-xs text-slate-500">{total}개</span>
        )}
      </div>

      {/* ── 에러 상태 ────────────────────────────────────── */}
      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <Button variant="secondary" size="sm" onClick={refetch}>다시 시도</Button>
        </div>
      )}

      {/* ── 빈 상태 ──────────────────────────────────────── */}
      {!loading && !error && tracks.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🎵</div>
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

      {/* ── 그리드 뷰 ────────────────────────────────────── */}
      {view === 'grid' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array(6).fill(0).map((_, i) => <GridSkeleton key={i} />)
            : tracks.map(t => (
                <div key={t.id}
                  className="bg-[#0d1340] border border-(--border-color) rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-200 cursor-pointer group"
                  onClick={() => navigate(`/player/${t.id}`)}>
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
                    <div className="font-semibold text-white text-sm truncate">{t.title}</div>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="info">{t.genre}</Badge>
                      <span className="text-xs text-slate-400">{formatDuration(t.duration)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                      <span>▶ {formatPlays(t.plays)}</span>
                      <span>{formatDate(t.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
          }
        </div>
      )}

      {/* ── 리스트 뷰 ────────────────────────────────────── */}
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
                    <div className="text-xs text-slate-400">{t.genre}</div>
                  </div>
                  <Waveform className="w-20 hidden md:flex" />
                  <span className="text-xs text-slate-500 hidden sm:block">▶ {formatPlays(t.plays)}</span>
                  <span className="text-xs text-slate-400">{formatDuration(t.duration)}</span>
                  <Button variant="secondary" size="sm"
                    onClick={e => { e.stopPropagation(); navigate('/editor') }}>
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
