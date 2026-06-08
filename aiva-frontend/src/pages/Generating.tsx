import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { pollGenerateStatus } from '../api/generate'
import type { StatusResponse, TrackVersion } from '../api/generate'
import { Button } from '../components/common/Button'

const STEP_LABELS: Record<string, string> = {
  pending:    '요청 접수 중',
  generating: '오디오 합성 중',
  done:       '완료!',
  error:      '오류 발생',
}

const Generating: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const trackId = searchParams.get('trackId')

  const [status, setStatus]     = useState<StatusResponse | null>(null)
  const [error, setError]       = useState('')
  const [picked, setPicked]     = useState<TrackVersion | null>(null)
  const intervalRef             = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!trackId) { navigate('/create'); return }

    const poll = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await pollGenerateStatus(trackId) as any
        const data: StatusResponse = res.data
        setStatus(data)

        if (data.status === 'done' || data.status === 'error') {
          if (intervalRef.current) clearInterval(intervalRef.current)
        }
      } catch {
        setError('상태 확인 중 오류가 발생했습니다.')
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }

    poll()
    intervalRef.current = setInterval(poll, 3000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [trackId, navigate])

  // 버전 선택 후 플레이어로 이동
  const goToPlayer = (version?: TrackVersion) => {
    const vNum = version?.version_num ?? 1
    navigate(`/player/${trackId}?v=${vNum}`)
  }

  const progress = status?.progress ?? 0
  const isDone   = status?.status === 'done'
  const isError  = status?.status === 'error'
  const versions = status?.versions ?? []

  return (
    <div className="max-w-lg mx-auto text-center space-y-10 py-8">
      {/* 애니메이션 아이콘 */}
      <div className="relative w-32 h-32 mx-auto">
        {!isDone && !isError && (
          <div className="absolute inset-0 rounded-full bg-indigo-600/20 animate-ping" />
        )}
        <div className="absolute inset-3 rounded-full bg-indigo-700/30 animate-pulse" />
        <div className={`relative w-full h-full rounded-full flex items-center justify-center shadow-2xl shadow-indigo-900/60 ${
          isDone  ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
          isError ? 'bg-gradient-to-br from-red-700 to-rose-800'     :
                    'bg-gradient-to-br from-indigo-600 to-violet-600'
        }`}>
          <span className="text-4xl">
            {isDone ? '✅' : isError ? '❌' : '🎵'}
          </span>
        </div>
      </div>

      {/* 제목 & 설명 */}
      <div>
        <h1 className="text-2xl font-black text-white mb-2">
          {isDone  ? 'AI 음악이 완성됐어요!' :
           isError ? '생성에 실패했습니다' :
                     'AI가 음악을 만들고 있어요'}
        </h1>
        <p className="text-slate-400 text-sm">
          {isDone  ? '버전을 선택해 플레이어에서 감상하세요' :
           isError ? (error || '잠시 후 다시 시도해주세요') :
                     (status?.step ?? '잠시만 기다려주세요. 약 30초 소요됩니다.')}
        </p>
      </div>

      {/* 진행 바 */}
      {!isDone && !isError && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>{status?.step ?? STEP_LABELS[status?.status ?? 'pending']}</span>
            <span className="font-bold text-indigo-400">{progress}%</span>
          </div>
          <div className="h-2 bg-[#0d1340] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 완료: 버전 선택 */}
      {isDone && versions.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm font-bold text-white">버전을 선택하세요</div>
          <div className="flex flex-col gap-3">
            {versions.map((v) => (
              <button
                key={v.id}
                onClick={() => setPicked(v)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  picked?.id === v.id
                    ? 'border-indigo-500 bg-indigo-600/20'
                    : 'border-[rgba(129,140,248,0.15)] bg-[#0d1340] hover:border-indigo-700/50'
                }`}
              >
                {v.image_url ? (
                  <img src={v.image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-700 to-violet-800 shrink-0 flex items-center justify-center text-2xl">🎵</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">
                    {v.title || `버전 ${v.version_num}`}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    버전 {v.version_num}
                    {v.duration ? ` · ${Math.floor(v.duration / 60)}:${String(v.duration % 60).padStart(2,'0')}` : ''}
                  </div>
                </div>
                {picked?.id === v.id && (
                  <div className="text-indigo-400 shrink-0">✓</div>
                )}
              </button>
            ))}
          </div>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => goToPlayer(picked ?? versions[0])}
          >
            {picked ? '선택한 버전으로 감상하기' : '버전 1로 감상하기'} →
          </Button>
        </div>
      )}

      {/* 완료인데 버전이 없는 경우 (개발 모드) */}
      {isDone && versions.length === 0 && (
        <Button variant="primary" size="lg" fullWidth onClick={() => goToPlayer()}>
          플레이어로 이동 →
        </Button>
      )}

      {/* 오류 상태 */}
      {isError && (
        <div className="flex flex-col gap-3">
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/create')}>
            다시 시도하기
          </Button>
        </div>
      )}

      {/* 생성 중 안내 */}
      {!isDone && !isError && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2 text-xs text-slate-500">
            <span>🎹 Suno AI 엔진</span>
            <span>·</span>
            <span>2개 버전 생성</span>
            <span>·</span>
            <span>크레딧 4개 소모</span>
          </div>
          <button
            onClick={() => navigate('/create')}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            취소하고 돌아가기
          </button>
        </div>
      )}
    </div>
  )
}

export default Generating
