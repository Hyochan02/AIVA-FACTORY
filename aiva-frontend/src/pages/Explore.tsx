import React, { useState, useEffect, useRef } from 'react'
import { Music2, Play, Heart, Flame, Mic, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/common/Badge'
import { useApi } from '../hooks/useApi'
import { getTrending, getRecent, getCreators, searchExplore } from '../api/explore'
import { formatPlays, formatDuration, gradColor } from '../utils/format'
import type { Track, PaginatedResponse } from '../types'

interface Creator {
  id:        string
  name:      string
  trackCount: number
  followers:  number
  avatar?:   string
}

const GENRES = ['전체','Lo-Fi','City Pop','Ambient','Synthwave','K-Pop','EDM','Acoustic','Hip-Hop']

// ── 스켈레톤 ─────────────────────────────────────────────
const TrackSkeleton = () => (
  <div className="flex items-center gap-4 p-3 rounded-xl animate-pulse">
    <div className="w-5 h-3 bg-navy-700 rounded shrink-0" />
    <div className="w-11 h-11 rounded-xl bg-navy-700 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-navy-700 rounded w-32" />
      <div className="h-2 bg-navy-800 rounded w-20" />
    </div>
  </div>
)

const CardSkeleton = () => (
  <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl overflow-hidden animate-pulse">
    <div className="h-28 bg-navy-700" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-navy-700 rounded w-24" />
      <div className="h-2 bg-navy-800 rounded w-16" />
    </div>
  </div>
)

const Explore: React.FC = () => {
  const navigate   = useNavigate()
  const [genre, setGenre]   = useState('전체')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── 검색어 디바운싱 (300ms) ────────────────────────────
  // 타이핑할 때마다 API를 호출하면 부하가 크므로 300ms 딜레이를 줍니다.
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [search])

  const activeGenre = genre === '전체' ? undefined : genre

  // ── API 호출 ────────────────────────────────────────────
  // 검색어가 있으면 search API, 없으면 trending API 사용
  const isSearching = debouncedSearch.trim().length > 0

  const { data: trendingData, loading: trendingLoading } = useApi<PaginatedResponse<Track>>(
    () => getTrending({ genre: activeGenre, limit: 5 }),
    [activeGenre],
    !isSearching
  )

  const { data: recentData, loading: recentLoading } = useApi<PaginatedResponse<Track>>(
    () => getRecent({ genre: activeGenre, limit: 4 }),
    [activeGenre],
    !isSearching
  )

  const { data: searchData, loading: searchLoading } = useApi<PaginatedResponse<Track>>(
    () => searchExplore(debouncedSearch, { genre: activeGenre }),
    [debouncedSearch, activeGenre],
    isSearching
  )

  const { data: creatorsData } = useApi<{ items: Creator[] }>(
    () => getCreators(6),
    []
  )

  const trending  = trendingData?.items ?? []
  const recent    = recentData?.items   ?? []
  const searched  = searchData?.items   ?? []
  const creators  = creatorsData?.items ?? []

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ── 검색 ────────────────────────────────────────── */}
      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="트랙, 아티스트, 장르 검색..."
          className="flex-1 bg-[#0d1340] border border-(--border-color) rounded-[12px] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* ── 장르 필터 ────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {GENRES.map(g => (
          <button key={g} onClick={() => setGenre(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${genre === g ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'border-(--border-color) text-slate-400 hover:border-indigo-700/40'}`}>
            {g}
          </button>
        ))}
      </div>

      {/* ── 검색 결과 ────────────────────────────────────── */}
      {isSearching && (
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6">
          <h2 className="flex items-center gap-2 font-bold text-white mb-5">
            <Search size={18} className="text-slate-400" /> &quot;{debouncedSearch}&quot; 검색 결과
            {!searchLoading && <span className="text-slate-400 font-normal text-sm ml-2">({searched.length}개)</span>}
          </h2>
          {searchLoading
            ? Array(3).fill(0).map((_, i) => <TrackSkeleton key={i} />)
            : searched.length === 0
              ? <p className="text-sm text-slate-400 text-center py-6">검색 결과가 없습니다.</p>
              : <div className="flex flex-col gap-3">
                  {searched.map((t, i) => (
                    <TrackRow key={t.id} track={t} rank={i + 1} onPlay={() => navigate(`/player/${t.id}`)} />
                  ))}
                </div>
          }
        </div>
      )}

      {/* ── 트렌딩 ──────────────────────────────────────── */}
      {!isSearching && (
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6">
          <h2 className="flex items-center gap-2 font-bold text-white mb-5"><Flame size={18} className="text-orange-400" /> 트렌딩</h2>
          {trendingLoading
            ? Array(5).fill(0).map((_, i) => <TrackSkeleton key={i} />)
            : trending.length === 0
              ? <p className="text-sm text-slate-400 text-center py-6">트렌딩 트랙이 없습니다.</p>
              : <div className="flex flex-col gap-3">
                  {trending.map((t, i) => (
                    <TrackRow key={t.id} track={t} rank={i + 1} onPlay={() => navigate(`/player/${t.id}`)} />
                  ))}
                </div>
          }
        </div>
      )}

      {!isSearching && (
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          {/* ── 최신 공개 트랙 ───────────────────────────── */}
          <div className="space-y-4">
            <h2 className="font-bold text-white">최신 공개 트랙</h2>
            {recentLoading
              ? <div className="grid sm:grid-cols-2 gap-4">{Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)}</div>
              : recent.length === 0
                ? <p className="text-sm text-slate-400">최신 트랙이 없습니다.</p>
                : <div className="grid sm:grid-cols-2 gap-4">
                    {recent.map(t => (
                      <div key={t.id}
                        className="bg-[#0d1340] border border-(--border-color) rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform group"
                        onClick={() => navigate(`/player/${t.id}`)}>
                        <div className={`h-28 bg-linear-to-br ${gradColor(t.id)} flex items-center justify-center relative`}>
                          <Music2 size={36} className="opacity-60 text-white" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <Play size={16} fill="white" className="text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="text-sm font-semibold text-white truncate">{t.title}</div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-slate-400">{formatDuration(t.duration)}</span>
                            <Badge variant="info">{t.genre}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
            }
          </div>

          {/* ── 인기 크리에이터 ──────────────────────────── */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 font-bold text-white"><Mic size={18} className="text-indigo-300" /> 인기 크리에이터</h2>
            <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-3 flex flex-col gap-1">
              {creators.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">크리에이터 정보를 불러오는 중...</p>
              )}
              {creators.map(c => (
                <div key={c.id} className="flex items-center gap-3 cursor-pointer hover:bg-navy-800/40 rounded-xl p-2 transition-colors">
                  <div className={`w-10 h-10 rounded-full bg-linear-to-br ${gradColor(c.id)} flex items-center justify-center text-white font-bold shrink-0`}>
                    {c.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">@{c.name}</div>
                    <div className="text-xs text-slate-400">
                      {c.trackCount}개 트랙 · 팔로워 {formatPlays(c.followers)}
                    </div>
                  </div>
                  <button className="px-2.5 py-1 text-xs font-semibold rounded-full border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/20 transition-all">
                    팔로우
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 트랙 행 컴포넌트 (Trending + Search에서 공용) ─────────
interface TrackRowProps {
  track:  Track
  rank:   number
  onPlay: () => void
}
const TrackRow: React.FC<TrackRowProps> = ({ track, rank, onPlay }) => (
  <div
    className="flex items-center gap-4 p-3 rounded-xl hover:bg-navy-800/40 transition-colors cursor-pointer group"
    onClick={onPlay}
  >
    <span className="w-5 text-sm font-black text-slate-500 text-center">{rank}</span>
    <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${gradColor(track.id)} flex items-center justify-center text-white shrink-0`}>
      <Play size={16} fill="currentColor" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-white truncate">{track.title}</div>
      <div className="text-xs text-slate-400">{track.mood}</div>
    </div>
    <Badge variant="info">{track.genre}</Badge>
    <span className="text-xs text-slate-500">▶ {formatPlays(track.plays)}</span>
    <span className="text-xs text-slate-500 hidden sm:block">{formatDuration(track.duration)}</span>
    <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-400 transition-all">
      <Heart size={14} />
    </button>
  </div>
)

export default Explore
