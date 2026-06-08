import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Waveform } from '../components/common/Waveform'

const VERSIONS = [
  { id: 'v1', label: 'v1 · 메인', dur: '2:34' },
  { id: 'v2', label: 'v2 · 변형', dur: '2:38' },
]

const COMMENTS = [
  { user: 'minho', text: '이거 진짜 분위기 최고네요', time: '2시간 전' },
  { user: 'sora', text: '색소폰 파트가 너무 좋아요!', time: '5시간 전' },
]

const Player: React.FC = () => {
  const navigate = useNavigate()
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0.3)
  const [selectedVersion, setSelectedVersion] = useState('v1')
  const [liked, setLiked] = useState(false)
  const [volume, setVolume] = useState(80)
  const waveformBars = useMemo(
    () => Array.from({ length: 60 }, () => 0.2 + Math.random() * 0.8),
    []
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 상단: 트랙 정보 + 플레이어 */}
      <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl overflow-hidden">
        {/* 커버 영역 */}
        <div className="relative h-48 bg-linear-to-br from-indigo-700 to-violet-800 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.08),transparent_50%)]" />
          <svg width="72" height="72" viewBox="0 0 24 24" fill="white" opacity="0.6">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="white"/><circle cx="18" cy="16" r="3" fill="white"/>
          </svg>
        </div>

        <div className="p-6 space-y-5">
          {/* 제목 & 메타 */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-black text-white">Rainy Tokyo Night</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="info">Lo-Fi</Badge>
                <Badge variant="info">City Pop</Badge>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-400">120 BPM · 2분 34초</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setLiked(p => !p)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-semibold transition-all ${liked ? 'bg-rose-900/30 border-rose-700/40 text-rose-400' : 'border-(--border-color) text-slate-400'}`}>
                ♥ {liked ? '125' : '124'}
              </button>
              <Button variant="secondary" size="sm">공유</Button>
            </div>
          </div>

          {/* 버전 탭 */}
          <div className="flex gap-2">
            {VERSIONS.map(v => (
              <button key={v.id} onClick={() => setSelectedVersion(v.id)}
                className={`px-4 py-2 rounded-sm text-xs font-semibold border transition-all ${selectedVersion === v.id ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'border-(--border-color) text-slate-400'}`}>
                {v.label} · {v.dur}
              </button>
            ))}
          </div>

          {/* 파형 */}
          <Waveform bars={waveformBars} progress={progress} className="h-12" onSeek={setProgress} />

          {/* 컨트롤 */}
          <div className="space-y-2">
            {/* 재생 + 진행바 */}
            <div className="flex items-center gap-4">
              <button onClick={() => setIsPlaying(p => !p)}
                className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/50 hover:scale-105 transition-transform shrink-0">
                {isPlaying
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                }
              </button>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{Math.floor(progress * 154)}초</span>
                  <span>2:34</span>
                </div>
                <input type="range" min={0} max={100} value={progress * 100} onChange={e => setProgress(+e.target.value / 100)}
                  className="w-full accent-indigo-500" />
              </div>
            </div>

            {/* 볼륨 — 재생 버튼 너비(w-12) + gap(gap-4) = pl-16 으로 진행바와 시작점 맞춤 */}
            <div className="flex items-center gap-2 pl-16">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
              <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(+e.target.value)}
                className="flex-1 accent-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* 다운로드 & 액션 */}
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-white">다운로드</h2>
          {[
            { fmt: 'MP3 · 320kbps', size: '8.2 MB', badge: 'Free' },
            { fmt: 'WAV · 24bit/48kHz', size: '48.1 MB', badge: 'Pro' },
            { fmt: '스템 ZIP (4트랙)', size: '92.3 MB', badge: 'Pro' },
          ].map(d => (
            <div key={d.fmt} className="flex items-center justify-between p-3 rounded-xl bg-[#080c2a] border border-(--border-color)">
              <div>
                <div className="text-sm font-semibold text-white">{d.fmt}</div>
                <div className="text-xs text-slate-400">{d.size}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={d.badge === 'Pro' ? 'new' : 'success'}>{d.badge}</Badge>
                <Button variant="secondary" size="sm">⬇</Button>
              </div>
            </div>
          ))}
          <Button variant="soft" size="sm" fullWidth onClick={() => navigate('/editor')}>에디터에서 열기 →</Button>
        </div>

        {/* 댓글 */}
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-white">댓글 <span className="text-slate-500 font-normal text-sm">({COMMENTS.length})</span></h2>
          {COMMENTS.map(c => (
            <div key={c.user} className="flex gap-3 text-sm">
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-700 to-violet-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {c.user[0].toUpperCase()}
              </div>
              <div>
                <span className="font-semibold text-white">{c.user}</span>
                <span className="text-slate-400 ml-2">{c.text}</span>
                <div className="text-xs text-slate-600 mt-0.5">{c.time}</div>
              </div>
            </div>
          ))}
          <input placeholder="댓글을 입력하세요..."
            className="w-full bg-[#080c2a] border border-(--border-color) rounded-sm px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors mt-2"
          />
        </div>
      </div>
    </div>
  )
}

export default Player
