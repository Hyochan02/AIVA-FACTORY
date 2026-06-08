import React, { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Waveform } from '../components/common/Waveform'
import { getTrack, likeTrack, unlikeTrack, getComments, postComment } from '../api/tracks'

interface Version {
  id: string; version_num: number; audio_url: string
  stream_url?: string; image_url?: string; title?: string; duration?: number
}
interface Comment { id: string; user: { name: string }; content: string; created_at: string }

const Player: React.FC = () => {
  const { id: trackId } = useParams<{ id: string }>()
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const initVersion     = Number(searchParams.get('v') ?? 1)

  // 트랙 데이터
  const [track, setTrack]         = useState<Record<string, unknown> | null>(null)
  const [versions, setVersions]   = useState<Version[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  // 플레이어 상태
  const audioRef                  = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress]   = useState(0)    // 0~1
  const [duration, setDuration]   = useState(0)
  const [volume, setVolume]       = useState(0.8)
  const [currentVersion, setCurrentVersion] = useState(initVersion)

  // 인터랙션
  const [liked, setLiked]         = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments]   = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [commenting, setCommenting]   = useState(false)

  // 트랙 로드
  useEffect(() => {
    if (!trackId) return
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getTrack(trackId).then((res: any) => {
      const t = res.data
      setTrack(t)
      setLiked(!!t.isLiked)
      setLikeCount(t.like_count ?? 0)
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

  // 오디오 이벤트
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime  = () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0)
    const onLoad  = () => setDuration(audio.duration)
    const onEnd   = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoad)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onLoad)
      audio.removeEventListener('ended', onEnd)
    }
  }, [])

  // 볼륨 동기화
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume }, [volume])

  const currentAudioUrl = versions.find(v => v.version_num === currentVersion)?.audio_url
    ?? (track?.audio_url as string | undefined)
    ?? ''
  const currentImageUrl = versions.find(v => v.version_num === currentVersion)?.image_url
    ?? (track?.cover_url as string | undefined)

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) { audio.pause(); setIsPlaying(false) }
    else           { audio.play(); setIsPlaying(true) }
  }

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * duration
  }

  const handleVersionChange = (v: number) => {
    const wasPlaying = isPlaying
    if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); setProgress(0) }
    setCurrentVersion(v)
    if (wasPlaying) setTimeout(() => { audioRef.current?.play(); setIsPlaying(true) }, 100)
  }

  const handleLike = async () => {
    if (!trackId) return
    try {
      if (liked) { await unlikeTrack(trackId); setLiked(false); setLikeCount(p => p - 1) }
      else       { await likeTrack(trackId);   setLiked(true);  setLikeCount(p => p + 1) }
    } catch {}
  }

  const handleComment = async () => {
    if (!trackId || !commentText.trim()) return
    setCommenting(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await postComment(trackId, commentText.trim()) as any
      setComments(p => [res.data, ...p])
      setCommentText('')
    } catch {} finally { setCommenting(false) }
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
      <div className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl overflow-hidden">
        {/* 커버 영역 */}
        <div className="relative h-48 bg-gradient-to-br from-indigo-700 to-violet-800 flex items-center justify-center overflow-hidden">
          {currentImageUrl ? (
            <img src={currentImageUrl} alt="cover" className="absolute inset-0 w-full h-full object-cover opacity-70" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.08),transparent_50%)]" />
          )}
          <svg className="relative z-10 opacity-60" width="72" height="72" viewBox="0 0 24 24" fill="white">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="white"/><circle cx="18" cy="16" r="3" fill="white"/>
          </svg>
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
                    : 'border-[rgba(129,140,248,0.15)] text-slate-400 hover:border-rose-700/40'
                }`}
              >
                ♥ {likeCount}
              </button>
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
                      : 'border-[rgba(129,140,248,0.15)] text-slate-400 hover:border-indigo-700/50'
                  }`}
                >
                  v{v.version_num} {v.title ? `· ${v.title.slice(0,20)}` : ''}
                </button>
              ))}
            </div>
          )}

          {/* 파형 */}
          <Waveform
            bars={Array.from({ length: 60 }, () => 0.2 + Math.random() * 0.8)}
            progress={progress}
            onSeek={(ratio) => { if (audioRef.current && duration) audioRef.current.currentTime = ratio * duration }}
          />

          {/* 시크 바 */}
          <div
            className="h-2 bg-[#080c2a] rounded-full cursor-pointer overflow-hidden"
            onClick={seekTo}
          >
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-none"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>{fmtTime(duration * progress)}</span>
            <span>{fmtTime(duration)}</span>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
              </button>
              {/* 재생/일시정지 */}
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40 hover:scale-105 transition-transform"
                aria-label={isPlaying ? '일시정지' : '재생'}
              >
                {isPlaying
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                }
              </button>
              {/* 앞으로 5초 */}
              <button
                onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5) }}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-900/40 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              {currentAudioUrl && (
                <a
                  href={currentAudioUrl}
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(129,140,248,0.15)] text-xs font-semibold text-slate-400 hover:border-indigo-700/50 hover:text-white transition-all"
                >
                  ↓ 다운로드
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─ 댓글 ─ */}
      <div className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-white">댓글 {comments.length > 0 ? `(${comments.length})` : ''}</h2>

        {/* 댓글 입력 */}
        <div className="flex gap-3">
          <input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment() } }}
            placeholder="댓글을 입력하세요..."
            className="flex-1 bg-[#080c2a] border border-[rgba(129,140,248,0.15)] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
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
                    <span className="text-xs text-slate-500">
                      {new Date(c.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mt-0.5 break-words">{c.content}</p>
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
