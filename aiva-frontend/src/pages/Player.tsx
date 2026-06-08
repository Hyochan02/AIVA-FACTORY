import { Globe, Lock, Music2, SkipBack, Play, Pause, SkipForward } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { getTrack, likeTrack, unlikeTrack, updateTrack, getComments, postComment } from '../api/tracks'

interface Version {
  id: string; version_num: number; audio_url: string
  stream_url?: string; image_url?: string; title?: string; duration?: number
}
interface Comment { id: string; user: { name: string }; content: string; created_at: string }

const Player: React.FC = () => {
  const { id: trackId } = useParams<{ id: string }>()
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const { user }        = useAuth()
  const initVersion     = Number(searchParams.get('v') ?? 1)

  // 트랙 데이터
  const [track, setTrack]         = useState<Record<string, unknown> | null>(null)
  const [versions, setVersions]   = useState<Version[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  // 플레이어 상태
  const audioRef                  = useRef<HTMLAudioElement>(null)
  const durationRef               = useRef(0)   // 클로저 문제 없이 항상 최신 duration 참조
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration]   = useState(0)
  const [volume, setVolume]       = useState(0.8)
  const [currentVersion, setCurrentVersion] = useState(initVersion)

  // 인터랙션
  const [liked, setLiked]         = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isPublic, setIsPublic]   = useState(true)
  const [togglingVis, setTogglingVis] = useState(false)
  const [comments, setComments]   = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [commenting, setCommenting]   = useState(false)

  // 트랙 로드
  useEffect(() => {
    if (!trackId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getTrack(trackId).then((res: any) => {
      const t = res.data
      setTrack(t)
      setLiked(!!t.isLiked)
      setLikeCount(t.like_count ?? 0)
      setIsPublic(!!t.is_public)
      setVersions(t.versions ?? [])
      setLoading(false)
    }).catch(() => { setError('트랙을 불러올 수 없습니다.'); setLoading(false) })
  }, [trackId])

  // 댓글 로드
  useEffect(() => {
    if (!trackId) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getComments(trackId).then((res: any) => setComments(res.data?.items ?? [])).catch(() => {})
  }, [trackId])

  // duration 변경 시 ref 동기화
  useEffect(() => { durationRef.current = duration }, [duration])

  // 오디오 이벤트 — loading 끝난 후 <audio>가 DOM에 마운트된 시점에 연결
  useEffect(() => {
    if (loading) return
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => {
      setCurrentTime(audio.currentTime)
      if (audio.duration && isFinite(audio.duration) && audio.duration !== durationRef.current) {
        durationRef.current = audio.duration
        setDuration(audio.duration)
      }
    }
    const onDuration = () => {
      if (audio.duration && isFinite(audio.duration)) {
        durationRef.current = audio.duration
        setDuration(audio.duration)
      }
    }
    const onEnd = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onDuration)
    audio.addEventListener('durationchange', onDuration)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onDuration)
      audio.removeEventListener('durationchange', onDuration)
      audio.removeEventListener('ended', onEnd)
    }
  }, [loading])

  // 볼륨 동기화
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume }, [volume])

  const currentVersion_ = versions.find(v => v.version_num === currentVersion)
  const currentAudioUrl = currentVersion_?.audio_url ?? (track?.audio_url as string | undefined) ?? ''
  const currentImageUrl = currentVersion_?.image_url ?? (track?.cover_url as string | undefined)

  // Version 데이터에 duration이 있으면 audio 로드 전에도 표시
  useEffect(() => {
    const vDuration = currentVersion_?.duration ?? (track?.duration as number | undefined)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (vDuration && vDuration > 0 && !duration) setDuration(vDuration)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVersion_, track]) // duration 의도적으로 제외: 오디오 이벤트로 갱신된 값을 덮지 않기 위함

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) { audio.pause(); setIsPlaying(false) }
    else           { audio.play(); setIsPlaying(true) }
  }

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const dur = durationRef.current
    if (!audio || !dur) return
    const rect = e.currentTarget.getBoundingClientRect()
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * dur
  }

  const handleVersionChange = (v: number) => {
    const wasPlaying = isPlaying
    if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); setCurrentTime(0) }
    setCurrentVersion(v)
    if (wasPlaying) setTimeout(() => { audioRef.current?.play(); setIsPlaying(true) }, 100)
  }

  const handleVisibilityToggle = async () => {
    if (!trackId || togglingVis) return
    setTogglingVis(true)
    try {
      await updateTrack(trackId, { isPublic: !isPublic })
      setIsPublic(p => !p)
    } catch {
      // 실패 시 원래 상태 유지
    } finally {
      setTogglingVis(false)
    }
  }

  const handleLike = async () => {
    if (!trackId) return
    try {
      if (liked) { await unlikeTrack(trackId); setLiked(false); setLikeCount(p => p - 1) }
      else       { await likeTrack(trackId);   setLiked(true);  setLikeCount(p => p + 1) }
    } catch { /* ignore like/unlike errors */ }
  }

  const handleComment = async () => {
    if (!trackId || !commentText.trim()) return
    setCommenting(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await postComment(trackId, commentText.trim()) as any
      setComments(p => [res.data, ...p])
      setCommentText('')
    } catch { /* ignore comment errors */ } finally { setCommenting(false) }
  }

  const progress = duration > 0 ? currentTime / duration : 0

  const fmtDate = (raw: string) => {
    const d = new Date(raw.replace(' ', 'T'))
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('ko-KR')
  }

  const fmtTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error || !track) return (
    <div className="max-w-xl mx-auto text-center py-16">
      <p className="text-slate-400 mb-4">{error || '트랙을 찾을 수 없습니다.'}</p>
      <Button variant="secondary" onClick={() => navigate('/library')}>라이브러리로</Button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ─ 히든 오디오 엘리먼트 ─ */}
      <audio ref={audioRef} src={currentAudioUrl} preload="metadata" />

      {/* ─ 트랙 정보 + 플레이어 ─ */}
      <div className="bg-[#0d1340] border border-primary-soft rounded-2xl overflow-hidden">
        {/* 커버 영역 */}
        <div className="relative h-48 bg-linear-to-br from-indigo-700 to-violet-800 flex items-center justify-center overflow-hidden">
          {currentImageUrl ? (
            <img src={currentImageUrl} alt="cover" className="absolute inset-0 w-full h-full object-cover opacity-70" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.08),transparent_50%)]" />
          )}
          <Music2 size={72} className="relative z-10 opacity-60 text-white" />
        </div>

        <div className="p-6 space-y-5">
          {/* 제목 & 메타 */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-black text-white truncate">
                {track?.title as string || '제목 없음'}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {(track?.genre as string) && <Badge variant="info">{track?.genre as string}</Badge>}
                {(track?.mood as string)  && <Badge variant="info">{track?.mood as string}</Badge>}
                {(track?.bpm as number)   && <span className="text-xs text-slate-400">{track?.bpm as number} BPM</span>}
                {duration > 0 && <span className="text-xs text-slate-400">· {fmtTime(duration)}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  liked
                    ? 'bg-rose-900/30 border-rose-700/40 text-rose-400'
                    : 'border-primary-soft text-slate-400 hover:border-rose-700/40'
                }`}
              >
                ♥ {likeCount}
              </button>
              {/* 공개/비공개 토글 — 본인 트랙일 때만 표시 */}
              {user && track?.user_id === user.id && (
                <button
                  onClick={handleVisibilityToggle}
                  disabled={togglingVis}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all disabled:opacity-50 ${
                    isPublic
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      : 'border-primary-soft text-slate-400 hover:border-slate-500/50 hover:text-slate-300'
                  }`}
                >
                  {isPublic
                    ? <><Globe size={12} className="shrink-0" />&nbsp;공개</>
                    : <><Lock size={12} className="shrink-0" />&nbsp;비공개</>
                  }
                </button>
              )}
              <Button variant="secondary" size="sm" onClick={() => navigate(`/editor?trackId=${trackId}`)}>
                편집
              </Button>
            </div>
          </div>

          {/* 버전 탭 */}
          {versions.length > 1 && (
            <div className="flex gap-2">
              {versions.map(v => (
                <button
                  key={v.version_num}
                  onClick={() => handleVersionChange(v.version_num)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    currentVersion === v.version_num
                      ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300'
                      : 'border-primary-soft text-slate-400 hover:border-indigo-700/50'
                  }`}
                >
                  v{v.version_num} {v.title ? `· ${v.title.slice(0,20)}` : ''}
                </button>
              ))}
            </div>
          )}

          {/* 시크 바 */}
          <div className="space-y-1.5">
            <div
              className="relative h-2 bg-[#080c2a] rounded-full cursor-pointer group"
              onClick={seekTo}
            >
              <div
                className="h-full bg-linear-to-r from-indigo-500 to-violet-500 rounded-full transition-none"
                style={{ width: `${progress * 100}%` }}
              />
              {/* 드래그 핸들 */}
              {progress > 0 && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ left: `calc(${progress * 100}% - 6px)` }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{fmtTime(currentTime)}</span>
              <span>{fmtTime(duration)}</span>
            </div>
          </div>

          {/* 컨트롤 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 볼륨 */}
              <span className="text-slate-400 text-sm">🔊</span>
              <input
                type="range" min={0} max={1} step={0.05} value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className="w-20 accent-indigo-500"
              />
            </div>
            <div className="flex items-center gap-3">
              {/* 뒤로 5초 */}
              <button
                onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5) }}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-900/40 transition-all"
              >
                <SkipBack size={16} fill="currentColor" />
              </button>
              {/* 재생/일시정지 */}
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40 hover:scale-105 transition-transform"
                aria-label={isPlaying ? '일시정지' : '재생'}
              >
                {isPlaying
                  ? <Pause size={18} fill="currentColor" />
                  : <Play size={18} fill="currentColor" />
                }
              </button>
              {/* 앞으로 5초 */}
              <button
                onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5) }}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-900/40 transition-all"
              >
                <SkipForward size={16} fill="currentColor" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {currentAudioUrl && (
                <a
                  href={currentAudioUrl}
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-soft text-xs font-semibold text-slate-400 hover:border-indigo-700/50 hover:text-white transition-all"
                >
                  ↓ 다운로드
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─ 댓글 ─ */}
      <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-white">댓글 {comments.length > 0 ? `(${comments.length})` : ''}</h2>

        {/* 댓글 입력 */}
        <div className="flex gap-3">
          <input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment() } }}
            placeholder="댓글을 입력하세요..."
            className="flex-1 bg-[#080c2a] border border-primary-soft rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <Button variant="primary" size="sm" onClick={handleComment} disabled={commenting || !commentText.trim()}>
            {commenting ? '...' : '등록'}
          </Button>
        </div>

        {/* 댓글 목록 */}
        {comments.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">아직 댓글이 없습니다. 첫 번째로 댓글을 남겨보세요!</p>
        ) : (
          <div className="space-y-4">
            {comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-800/60 shrink-0 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {(c.user?.name?.[0] ?? '?').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-white">{c.user?.name ?? '익명'}</span>
                    <span className="text-xs text-slate-500">{fmtDate(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-0.5 wrap-break-word">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Player
