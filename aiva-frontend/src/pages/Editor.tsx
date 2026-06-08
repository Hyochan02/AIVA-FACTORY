import React, { useState, useEffect, useRef } from 'react'
import { Music2, FileText, Mic, HardDrive, Film, ChevronDown } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { getTracks } from '../api/tracks'
import {
  extendTrack, pollExtend,
  generateLyrics, pollLyrics,
  separateVocals, pollSeparate,
  convertWav, pollWav,
  createVideo, pollVideo,
  getJobHistory,
} from '../api/editor'
import type { LyricsResult, SeparateResult, JobHistory } from '../api/editor'
import { useApi } from '../hooks/useApi'
import { formatDate } from '../utils/format'

type Tab = 'extend' | 'lyrics' | 'separate' | 'wav' | 'video'

interface TrackItem { id: string; title: string; genre?: string; status: string }

// ── 폴링 훅 ─────────────────────────────────────────────────
function usePoller<T>(
  pollFn: (jobId: string) => Promise<unknown>,
  onDone: (data: T) => void,
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [jobId, setJobId]   = useState<string | null>(null)
  const [polling, setPolling] = useState(false)

  const start = (id: string) => {
    setJobId(id)
    setPolling(true)
  }

  useEffect(() => {
    if (!jobId || !polling) return
    const check = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await pollFn(jobId) as any
        const data = res.data as { status: string } & T
        if (data.status === 'done') {
          setPolling(false)
          if (intervalRef.current) clearInterval(intervalRef.current)
          onDone(data as T)
        }
      } catch { /* ignore polling errors */ }
    }
    check()
    intervalRef.current = setInterval(check, 3000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, polling])

  return { start, polling }
}

// ──────────────────────────────────────────────────────────
const TAB_INFO: { id: Tab; label: string; icon: React.ReactNode; desc: string; credit: number }[] = [
  { id: 'extend',   label: '음악 연장',    icon: React.createElement(Music2,    { size: 15 }), desc: '기존 트랙을 이어서 연장합니다',    credit: 4  },
  { id: 'lyrics',   label: '가사 생성',    icon: React.createElement(FileText,  { size: 15 }), desc: 'AI로 가사를 자동 생성합니다',      credit: 2  },
  { id: 'separate', label: '보컬 분리',    icon: React.createElement(Mic,       { size: 15 }), desc: '보컬과 반주를 분리합니다',         credit: 10 },
  { id: 'wav',      label: 'WAV 변환',     icon: React.createElement(HardDrive, { size: 15 }), desc: '고음질 WAV 파일로 변환합니다',     credit: 2  },
  { id: 'video',    label: '뮤직비디오',   icon: React.createElement(Film,      { size: 15 }), desc: 'MP4 비디오를 자동 생성합니다',     credit: 5  },
]

const Editor: React.FC = () => {
  const [searchParams]          = useSearchParams()
  const initTrackId             = searchParams.get('trackId') ?? ''

  const [activeTab, setActiveTab]   = useState<Tab>('extend')

  // ── 히스토리 (activeTab 변경 시 자동 재조회) ────────────
  const { data: historyData, loading: historyLoading, refetch: refetchHistory } =
    useApi<{ jobs: JobHistory[] }>(() => getJobHistory(activeTab), [activeTab])
  const jobHistory = historyData?.jobs ?? []
  const [tracks, setTracks]         = useState<TrackItem[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState(initTrackId)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // ── extend ────
  const [extendPrompt, setExtendPrompt]   = useState('')
  const [extendStyle, setExtendStyle]     = useState('')
  const [continueAt, setContinueAt]       = useState(60)
  const [extendResult, setExtendResult]   = useState<{ audioUrl: string } | null>(null)
  const extendPoller = usePoller<{ audioUrl: string }>(pollExtend, (d) => {
    setExtendResult(d); setLoading(false); setSuccessMsg('음악이 연장되었습니다!'); refreshHistory()
  })

  // ── lyrics ────
  const [lyricsPrompt, setLyricsPrompt] = useState('')
  const [lyricsResult, setLyricsResult] = useState<LyricsResult | null>(null)
  const lyricsPoller = usePoller<LyricsResult>(
    (id) => pollLyrics(id),
    (d) => { setLyricsResult(d); setLoading(false); setSuccessMsg('가사가 생성되었습니다!'); refreshHistory() }
  )

  // ── separate ──
  const [separateType, setSeparateType] = useState<'separate_vocal' | 'split_stem'>('separate_vocal')
  const [separateResult, setSeparateResult] = useState<SeparateResult | null>(null)
  const separatePoller = usePoller<SeparateResult>(
    (id) => pollSeparate(id),
    (d) => { setSeparateResult(d); setLoading(false); setSuccessMsg('보컬/악기가 분리되었습니다!'); refreshHistory() }
  )

  // ── wav ───────
  const [wavVersion, setWavVersion]     = useState(1)
  const [wavUrl, setWavUrl]             = useState('')
  const wavPoller = usePoller<{ wavUrl: string }>(
    (id) => pollWav(id),
    (d) => { setWavUrl(d.wavUrl ?? ''); setLoading(false); setSuccessMsg('WAV 변환이 완료되었습니다!'); refreshHistory() }
  )

  // ── video ─────
  const [videoUrl, setVideoUrl]         = useState('')
  const videoPoller = usePoller<{ videoUrl: string }>(
    (id) => pollVideo(id),
    (d) => { setVideoUrl(d.videoUrl ?? ''); setLoading(false); setSuccessMsg('뮤직비디오가 생성되었습니다!'); refreshHistory() }
  )

  // 완료된 트랙 목록
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getTracks({ limit: 50 }).then((res: any) => {
      const items: TrackItem[] = (res.data?.items ?? []).filter((t: TrackItem) => t.status === 'done')
      setTracks(items)
      if (!selectedTrackId && items.length > 0) setSelectedTrackId(items[0].id)
    }).catch(() => {})
  }, [selectedTrackId])

  const clearMessages = () => { setError(''); setSuccessMsg('') }

  const handleAction = async () => {
    if (!selectedTrackId && activeTab !== 'lyrics') {
      setError('트랙을 선택해주세요.')
      return
    }
    clearMessages()
    setLoading(true)

    try {
      if (activeTab === 'extend') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await extendTrack({ trackId: selectedTrackId, prompt: extendPrompt, style: extendStyle, continueAt }) as any
        extendPoller.start(res.data.jobId)
      } else if (activeTab === 'lyrics') {
        if (!lyricsPrompt.trim()) { setError('가사 주제를 입력하세요.'); setLoading(false); return }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await generateLyrics({ prompt: lyricsPrompt }) as any
        lyricsPoller.start(res.data.jobId)
      } else if (activeTab === 'separate') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await separateVocals({ trackId: selectedTrackId, type: separateType }) as any
        separatePoller.start(res.data.jobId)
      } else if (activeTab === 'wav') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await convertWav({ trackId: selectedTrackId, versionNum: wavVersion }) as any
        wavPoller.start(res.data.jobId)
      } else if (activeTab === 'video') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await createVideo({ trackId: selectedTrackId }) as any
        videoPoller.start(res.data.jobId)
      }
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.error ?? '요청에 실패했습니다.'
      setError(msg)
      setLoading(false)
    }
  }

  // 작업 완료 후 히스토리 갱신
  const refreshHistory = () => setTimeout(() => refetchHistory(), 1000)

  const tabInfo = TAB_INFO.find(t => t.id === activeTab)!
  const isPolling = (
    (activeTab === 'extend'   && extendPoller.polling)   ||
    (activeTab === 'lyrics'   && lyricsPoller.polling)   ||
    (activeTab === 'separate' && separatePoller.polling) ||
    (activeTab === 'wav'      && wavPoller.polling)      ||
    (activeTab === 'video'    && videoPoller.polling)
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ─ 탭 바 ─ */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TAB_INFO.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); clearMessages() }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border transition-all shrink-0 ${
              activeTab === t.id
                ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300'
                : 'border-primary-soft text-slate-400 hover:border-indigo-700/50'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            <span className="text-xs opacity-60">({t.credit}크)</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ─ 왼쪽: 설정 패널 ─ */}
        <div className="lg:col-span-2 space-y-5">
          {/* 설명 카드 */}
          <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-indigo-300">{tabInfo.icon}</span>
              <div>
                <h2 className="text-base font-black text-white">{tabInfo.label}</h2>
                <p className="text-xs text-slate-400">{tabInfo.desc} · 크레딧 {tabInfo.credit}개 소모</p>
              </div>
            </div>
          </div>

          {/* 트랙 선택 (lyrics 제외) */}
          {activeTab !== 'lyrics' && (
            <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5">
              <label className="block text-sm font-bold text-white mb-3">대상 트랙 선택</label>
              {tracks.length === 0 ? (
                <p className="text-slate-500 text-sm">완료된 트랙이 없습니다. 먼저 음악을 생성해주세요.</p>
              ) : (
                <div className="relative">
                  <select
                    value={selectedTrackId}
                    onChange={e => setSelectedTrackId(e.target.value)}
                    className="w-full appearance-none bg-[#080c2a] border border-primary-soft rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    {tracks.map(t => (
                      <option key={t.id} value={t.id}>{t.title} {t.genre ? `(${t.genre})` : ''}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              )}
            </div>
          )}

          {/* ── 탭별 옵션 ── */}

          {/* Extend */}
          {activeTab === 'extend' && (
            <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  연장 시작 위치 (초)
                </label>
                <input
                  type="number" min={0} max={300} value={continueAt}
                  onChange={e => setContinueAt(Number(e.target.value))}
                  className="w-32 bg-[#080c2a] border border-primary-soft rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <p className="text-xs text-slate-500 mt-1">기존 트랙의 이 위치부터 이어서 생성합니다</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">추가 프롬프트 (선택)</label>
                <textarea
                  value={extendPrompt}
                  onChange={e => setExtendPrompt(e.target.value)}
                  placeholder="예: 더 신나게, 기타 솔로 추가..."
                  rows={3}
                  className="w-full bg-[#080c2a] border border-primary-soft rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">스타일 (선택)</label>
                <input
                  value={extendStyle}
                  onChange={e => setExtendStyle(e.target.value)}
                  placeholder="예: jazz, upbeat, electronic..."
                  className="w-full bg-[#080c2a] border border-primary-soft rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Lyrics */}
          {activeTab === 'lyrics' && (
            <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5">
              <label className="block text-sm font-bold text-white mb-2">
                가사 주제 / 컨셉 <span className="text-indigo-400">*</span>
              </label>
              <textarea
                value={lyricsPrompt}
                onChange={e => setLyricsPrompt(e.target.value)}
                placeholder="예: 비 오는 서울 밤, 이별의 감성, 재즈 발라드 스타일..."
                rows={4}
                className="w-full bg-[#080c2a] border border-primary-soft rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          )}

          {/* Separate */}
          {activeTab === 'separate' && (
            <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5 space-y-3">
              <label className="block text-sm font-bold text-white mb-2">분리 모드</label>
              {([
                { value: 'separate_vocal', label: '보컬 + 반주 분리', credit: '10크레딧', desc: '2개 파일 반환: 보컬, 반주' },
                { value: 'split_stem',     label: '전체 악기 분리',   credit: '50크레딧', desc: '최대 12개 파일: 보컬, 드럼, 베이스, 기타, 키보드 등' },
              ] as const).map(opt => (
                <button key={opt.value} type="button" onClick={() => setSeparateType(opt.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${separateType === opt.value ? 'border-indigo-500/60 bg-indigo-600/10' : 'border-primary-soft hover:border-indigo-700/40'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${separateType === opt.value ? 'border-indigo-400' : 'border-slate-600'}`}>
                    {separateType === opt.value && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{opt.label} <span className="font-normal text-slate-400">({opt.credit})</span></div>
                    <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* WAV */}
          {activeTab === 'wav' && (
            <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5">
              <label className="block text-sm font-bold text-white mb-3">변환할 버전</label>
              <div className="flex gap-3">
                {[1, 2].map(v => (
                  <button
                    key={v}
                    onClick={() => setWavVersion(v)}
                    className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                      wavVersion === v
                        ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300'
                        : 'border-primary-soft text-slate-400'
                    }`}
                  >버전 {v}</button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">WAV 파일은 15일간 보관됩니다</p>
            </div>
          )}

          {/* Video - 추가 설정 없음 */}
          {activeTab === 'video' && (
            <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5">
              <p className="text-sm text-slate-400">선택한 트랙으로 비주얼 이펙트가 포함된 MP4 뮤직비디오를 생성합니다.</p>
              <p className="text-xs text-slate-500 mt-2">생성된 비디오는 15일간 보관됩니다.</p>
            </div>
          )}

          {/* 오류 / 성공 메시지 */}
          {error && (
            <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-4 text-sm text-red-300">{error}</div>
          )}
          {successMsg && (
            <div className="bg-green-900/30 border border-green-700/40 rounded-xl p-4 text-sm text-green-300">{successMsg}</div>
          )}

          {/* 실행 버튼 */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleAction}
            disabled={loading || isPolling || (activeTab !== 'lyrics' && !selectedTrackId)}
          >
            {isPolling ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                처리 중... (완료까지 30~120초)
              </span>
            ) : loading ? '요청 중...' : <span className="flex items-center gap-1.5">{tabInfo.icon}{tabInfo.label} 시작</span>}
          </Button>
        </div>

        {/* ─ 오른쪽: 편집 히스토리 (사이드) ─ */}
        <div className="space-y-3">
          <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5 flex flex-col gap-3">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-300"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {TAB_INFO.find(t => t.id === activeTab)?.label} 히스토리
              </h3>
              {jobHistory.length > 0 && (
                <span className="text-xs text-slate-500">{jobHistory.length}건</span>
              )}
            </div>

            {historyLoading && (
              <div className="space-y-2">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-14 bg-navy-800/40 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {!historyLoading && jobHistory.length === 0 && (
              <div className="flex flex-col items-center gap-1.5 py-8 text-slate-600">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <p className="text-xs text-center">{TAB_INFO.find(t => t.id === activeTab)?.label} 기록이 없습니다</p>
              </div>
            )}

            {!historyLoading && jobHistory.length > 0 && (() => {
              const TYPE_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
                extend:   { label: '음악 연장',  color: 'text-violet-300',  icon: <Music2 size={13} /> },
                lyrics:   { label: '가사 생성',  color: 'text-blue-300',    icon: <FileText size={13} /> },
                separate: { label: '보컬 분리',  color: 'text-pink-300',    icon: <Mic size={13} /> },
                wav:      { label: 'WAV 변환',   color: 'text-emerald-300', icon: <HardDrive size={13} /> },
                video:    { label: '뮤직비디오', color: 'text-orange-300',  icon: <Film size={13} /> },
              }
              const STATUS_DOT: Record<string, string> = {
                pending: 'bg-amber-400 animate-pulse',
                done:    'bg-emerald-400',
                error:   'bg-red-400',
              }
              const STATUS_LABEL: Record<string, string> = { pending: '처리 중', done: '완료', error: '오류' }
              return (
                <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1">
                  {jobHistory.map(job => {
                    const meta = TYPE_META[job.type] ?? { label: job.type, color: 'text-slate-300', icon: null }
                    return (
                      <div key={job.id}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-navy-800/50 transition-colors group">
                        {/* 타입 아이콘 */}
                        <span className={`shrink-0 ${meta.color}`}>{meta.icon}</span>
                        {/* 내용 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[job.status] ?? 'bg-slate-400'}`} />
                            <span className="text-[10px] text-slate-500">{STATUS_LABEL[job.status] ?? job.status}</span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">{job.track_title ?? '—'}</p>
                          <p className="text-[10px] text-slate-600">{formatDate(job.created_at)}</p>
                        </div>
                        {/* 다운로드 */}
                        {job.result_url && (
                          <a href={job.result_url} download onClick={e => e.stopPropagation()}
                             className="opacity-0 group-hover:opacity-100 text-indigo-400 hover:text-indigo-300 transition-opacity shrink-0">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
      {/* ── 결과 ──────────────────────────────────────────────── */}
      {(
        (activeTab === 'extend' && extendResult) ||
        (activeTab === 'lyrics' && lyricsResult?.status === 'done') ||
        (activeTab === 'separate' && separateResult?.status === 'done') ||
        (activeTab === 'wav' && wavUrl) ||
        (activeTab === 'video' && videoUrl)
      ) && (
        <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-6">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            결과
          </h3>

          {/* Extend */}
          {activeTab === 'extend' && extendResult && (
            <div className="space-y-3">
              <p className="text-xs text-emerald-400 font-semibold">✓ 음악 연장 완료</p>
              <audio controls src={extendResult.audioUrl} className="w-full" />
              <a href={extendResult.audioUrl} download
                 className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                다운로드
              </a>
            </div>
          )}

          {/* Lyrics */}
          {activeTab === 'lyrics' && lyricsResult?.status === 'done' && (
            <div className="space-y-3">
              {lyricsResult.title && <p className="text-base font-bold text-white">{lyricsResult.title}</p>}
              <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-navy-800/30 rounded-xl p-4 max-h-80 overflow-y-auto">{lyricsResult.text}</pre>
              <button onClick={() => navigator.clipboard.writeText(lyricsResult.text ?? '')}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                클립보드에 복사
              </button>
            </div>
          )}

          {/* Separate */}
          {activeTab === 'separate' && separateResult?.status === 'done' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: '보컬',    url: separateResult.vocalUrl },
                { label: '반주',    url: separateResult.instrumentalUrl },
                { label: '드럼',    url: separateResult.drumsUrl },
                { label: '베이스',  url: separateResult.bassUrl },
              ].filter(t => t.url).map(track => (
                <div key={track.label} className="bg-navy-800/30 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-300">{track.label}</p>
                  <audio controls src={track.url!} className="w-full" />
                </div>
              ))}
            </div>
          )}

          {/* WAV */}
          {activeTab === 'wav' && wavUrl && (
            <div className="space-y-3">
              <p className="text-xs text-emerald-400 font-semibold">✓ WAV 변환 완료</p>
              <a href={wavUrl} download
                 className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-indigo-500/60 text-sm font-bold text-indigo-300 hover:bg-indigo-600/20 transition-all">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                WAV 파일 다운로드
              </a>
            </div>
          )}

          {/* Video */}
          {activeTab === 'video' && videoUrl && (
            <div className="space-y-3">
              <p className="text-xs text-emerald-400 font-semibold">✓ 뮤직비디오 생성 완료</p>
              <video controls src={videoUrl} className="w-full rounded-xl" />
              <a href={videoUrl} download
                 className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                다운로드
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Editor