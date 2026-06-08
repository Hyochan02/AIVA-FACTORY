import React from 'react'
import { Music2, Zap, Play, Folder, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Waveform } from '../components/common/Waveform'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { getStats, type DashboardStats } from '../api/stats'
import { getTracks } from '../api/tracks'
import { formatDuration, formatPlays, formatDate, gradColor } from '../utils/format'
import type { Track, PaginatedResponse } from '../types'

const QUICK_GENRES = ['Lo-Fi','City Pop','Ambient','Synthwave','K-Pop','EDM','Jazz','Acoustic','Hip-Hop','Classical','R&B','Drum & Bass']

// ── 로딩 스켈레톤 ─────────────────────────────────────────
const StatSkeleton = () => (
  <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-5 animate-pulse">
    <div className="h-4 w-16 bg-navy-700 rounded mb-3" />
    <div className="h-8 w-12 bg-navy-700 rounded mb-1" />
    <div className="h-3 w-20 bg-navy-800 rounded" />
  </div>
)

const Dashboard: React.FC = () => {
  const navigate    = useNavigate()
  const { user }    = useAuth()
  // ── API 호출 ────────────────────────────────────────────
  const { data: statsData, loading: statsLoading } =
    useApi<DashboardStats>(() => getStats())

  const { data: tracksData, loading: tracksLoading } =
    useApi<PaginatedResponse<Track>>(() => getTracks({ limit: 1, sort: 'createdAt', order: 'desc' }))

  // ── 통계 카드 데이터 매핑 ────────────────────────────────
  const stats = statsData
    ? [
        { label: '생성한 트랙', value: String(statsData.totalTracks),         icon: React.createElement(Music2,  { size: 18 }), change: `+${statsData.weeklyChange.tracks} 이번 주` },
        { label: '남은 크레딧',  value: String(statsData.creditsRemaining),   icon: React.createElement(Zap,    { size: 18 }), change: '100에서 시작' },
        { label: '총 재생 수',   value: formatPlays(statsData.totalPlays),    icon: React.createElement(Play,   { size: 18 }), change: `+${formatPlays(statsData.weeklyChange.plays)} 이번 주` },
        { label: '라이브러리',   value: String(statsData.libraryCount),       icon: React.createElement(Folder, { size: 18 }), change: `${statsData.libraryCount}개 저장됨` },
      ]
    : null

  const recentTracks: Track[] = tracksData?.items ?? []
  const credits = statsData?.creditsRemaining ?? user?.credits ?? 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ── 인사 ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">
            안녕하세요, {user?.name ?? '사용자'}님 <Sparkles size={20} className="inline text-yellow-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">오늘도 새로운 음악을 만들어보세요.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/create')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>
          음악 생성하기
        </Button>
      </div>

      {/* ── 통계 카드 ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? Array(4).fill(0).map((_, i) => <StatSkeleton key={i} />)
          : stats?.map(s => (
              <div key={s.label} className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-indigo-300">{s.icon}</span>
                  <Badge variant="info">{s.change}</Badge>
                </div>
                <div className="text-3xl font-black text-white mb-1">{s.value}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))
        }
      </div>

      {/* ── 빠른 생성 ────────────────────────────────────── */}
      <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6">
        <h2 className="font-bold text-white mb-1">빠른 생성</h2>
        <p className="text-xs text-slate-400 mb-4">장르를 선택하면 생성 페이지로 이동합니다.</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_GENRES.map(g => (
            <button key={g}
              onClick={() => navigate(`/create?genre=${encodeURIComponent(g)}`)}
              className="px-3 py-1.5 text-xs font-semibold rounded-full border border-(--border-color) text-slate-400 hover:border-indigo-500/60 hover:text-indigo-300 transition-all">
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-stretch">
        {/* ── 최근 트랙 ──────────────────────────────────── */}
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white">최근 트랙</h2>
            <Link to="/library" className="text-xs text-indigo-400 hover:text-indigo-300">전체 보기 →</Link>
          </div>

          {tracksLoading && (
            <div className="flex flex-col gap-3">
              {Array(1).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                  <div className="w-11 h-11 rounded-xl bg-navy-700 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-navy-700 rounded w-32" />
                    <div className="h-2 bg-navy-800 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!tracksLoading && recentTracks.length === 0 && (
            <div className="text-center py-8">
              <Music2 size={40} className="mx-auto mb-2 text-slate-600" />
              <p className="text-sm text-slate-400">아직 생성한 트랙이 없습니다.</p>
              <Button variant="soft" size="sm" className="mt-3" onClick={() => navigate('/create')}>첫 트랙 만들기</Button>
            </div>
          )}

          {!tracksLoading && recentTracks.length > 0 && (
            <div className="flex flex-col gap-3">
              {recentTracks.map(t => (
                <div key={t.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-navy-800/40 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/player/${t.id}`)}>
                  <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${gradColor(t.id)} flex items-center justify-center text-white shrink-0`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{t.title}</div>
                    <div className="text-xs text-slate-400">{t.genre}</div>
                  </div>
                  <Waveform className="w-24 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="text-xs text-slate-500 shrink-0">{formatDuration(t.duration)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 사이드 위젯 ────────────────────────────────── */}
        <div className="flex flex-col gap-4 h-full">
          <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white">크레딧 현황</h2>
            </div>
            {/* 제목과 컨텐츠 사이 공간 */}
            <div className="flex-1" />
            {/* 크레딧 정보 + 버튼 세트 */}
            <div>
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="text-slate-400">남은 크레딧</span>
                <span className="text-xl font-black text-white">{credits} <span className="text-sm font-normal text-slate-400">/ 100</span></span>
              </div>
              <div className="h-2 bg-navy-800 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-linear-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(credits, 100)}%` }}
                />
              </div>
              <Button variant="ghost" size="sm" fullWidth onClick={() => navigate('/pricing')}>
                크레딧 충전 →
              </Button>
            </div>
          </div>

          {/* 가입일 */}
          {user?.createdAt && (
            <div className="text-xs text-slate-500 text-center">
              가입일 {formatDate(user.createdAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
