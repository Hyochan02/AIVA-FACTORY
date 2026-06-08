import React, { useState, useEffect, useRef } from 'react'
import { Music2, FileText, Mic, HardDrive, Film } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { getTracks } from '../api/tracks'
import {
  extendTrack, pollExtend,
  generateLyrics, pollLyrics,
  separateVocals, pollSeparate,
  convertWav, pollWav,
  createVideo, pollVideo,
} from '../api/editor'
import type { LyricsResult, SeparateResult } from '../api/editor'

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
    setExtendResult(d); setLoading(false); setSuccessMsg('음악이 연장되었습니다!')
  })

  // ── lyrics ────
  const [lyricsPrompt, setLyricsPrompt] = useState('')
  const [lyricsResult, setLyricsResult] = useState<LyricsResult | null>(null)
  const lyricsPoller = usePoller<LyricsResult>(
    (id) => pollLyrics(id),
    (d) => { setLyricsResult(d); setLoading(false); setSuccessMsg('가사가 생성되었습니다!') }
  )

  // ── separate ──
  const [separateType, setSeparateType] = useState<'separate_vocal' | 'split_stem'>('separate_vocal')
  const [separateResult, setSeparateResult] = useState<SeparateResult | null>(null)
  const separatePoller = usePoller<SeparateResult>(
    (id) => pollSeparate(id),
    (d) => { setSeparateResult(d); setLoading(false); setSuccessMsg('보컬/악기가 분리되었습니다!') }
  )

  // ── wav ───────
  const [wavVersion, setWavVersion]     = useState(1)
  const [wavUrl, setWavUrl]             = useState('')
  const wavPoller = usePoller<{ wavUrl: string }>(
    (id) => pollWav(id),
    (d) => { setWavUrl(d.wavUrl ?? ''); setLoading(false); setSuccessMsg('WAV 변환이 완료되었습니다!') }
  )

  // ── video ─────
  const [videoUrl, setVideoUrl]         = useState('')
  const videoPoller = usePoller<{ videoUrl: string }>(
    (id) => pollVideo(id),
    (d) => { setVideoUrl(d.videoUrl ?? ''); setLoading(false); setSuccessMsg('뮤직비디오가 생성되었습니다!') }
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
                <select
                  value={selectedTrackId}
                  onChange={e => setSelectedTrackId(e.target.value)}
                  className="w-full bg-[#080c2a] border border-primary-soft rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {tracks.map(t => (
                    <option key={t.id} value={t.id}>{t.title} {t.genre ? `(${t.genre})` : ''}</option>
                  ))}
                </select>
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

        {/* ─ 오른쪽: 결과 패널 ─ */}
        <div className="space-y-5">
          <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">결과</h3>

            {/* Extend 결과 */}
            {activeTab === 'extend' && extendResult && (
              <div className="space-y-3">
                <p className="text-xs text-green-400">✓ 연장 완료</p>
                <audio controls src={extendResult.audioUrl} className="w-full" />
                <a href={extendResult.audioUrl} download className="block text-center text-xs text-indigo-400 hover:text-indigo-300">다운로드</a>
              </div>
            )}

            {/* Lyrics 결과 */}
            {activeTab === 'lyrics' && lyricsResult?.status === 'done' && (
              <div className="space-y-2">
                {lyricsResult.title && <p className="text-sm font-bold text-white">{lyricsResult.title}</p>}
                <pre className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">{lyricsResult.text}</pre>
                <button
                  onClick={() => navigator.clipboard.writeText(lyricsResult.text ?? '')}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >복사하기</button>
              </div>
            )}

            {/* Separate 결과 */}
            {activeTab === 'separate' && separateResult?.status === 'done' && (
              <div className="space-y-3">
                {separateResult.vocalUrl && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">보컬</p>
                    <audio controls src={separateResult.vocalUrl} className="w-full" />
                  </div>
                )}
                {separateResult.instrumentalUrl && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">반주</p>
                    <audio controls src={separateResult.instrumentalUrl} className="w-full" />
                  </div>
                )}
                {separateResult.drumsUrl && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">드럼</p>
                    <audio controls src={separateResult.drumsUrl} className="w-full" />
                  </div>
                )}
                {separateResult.bassUrl && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">베이스</p>
                    <audio controls src={separateResult.bassUrl} className="w-full" />
                  </div>
                )}
              </div>
            )}

            {/* WAV 결과 */}
            {activeTab === 'wav' && wavUrl && (
              <div className="space-y-2">
                <p className="text-xs text-green-400">✓ WAV 변환 완료</p>
                <a
                  href={wavUrl}
                  download
                  className="block w-full text-center py-2.5 rounded-xl border border-indigo-500/60 text-sm font-bold text-indigo-300 hover:bg-indigo-600/20 transition-all"
                >
                  ↓ WAV 파일 다운로드
                </a>
              </div>
            )}

            {/* Video 결과 */}
            {activeTab === 'video' && videoUrl && (
              <div className="space-y-2">
                <p className="text-xs text-green-400">✓ 뮤직비디오 생성 완료</p>
                <video controls src={videoUrl} className="w-full rounded-lg" />
                <a href={videoUrl} download className="block text-center text-xs text-indigo-400 hover:text-indigo-300">다운로드</a>
              </div>
            )}

            {/* 빈 상태 */}
            {!(
              (activeTab === 'extend' && extendResult) ||
              (activeTab === 'lyrics' && lyricsResult?.status === 'done') ||
              (activeTab === 'separate' && separateResult?.status === 'done') ||
              (activeTab === 'wav' && wavUrl) ||
              (activeTab === 'video' && videoUrl)
            ) && (
              <div className="flex flex-col items-center gap-2 py-8 text-slate-600">
                <div className="[&>svg]:w-8 [&>svg]:h-8">{tabInfo.icon}</div>
                <p className="text-xs">결과가 여기에 표시됩니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Editor
