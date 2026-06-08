import React, { useState, useMemo } from 'react'
import { Button } from '../components/common/Button'
import { Waveform } from '../components/common/Waveform'

const TRACKS_DATA = [
  { id: 'melody', label: '멜로디', color: '#6366f1', vol: 80, muted: false },
  { id: 'bass',   label: '베이스', color: '#8b5cf6', vol: 70, muted: false },
  { id: 'drums',  label: '드럼',   color: '#a78bfa', vol: 75, muted: false },
  { id: 'synth',  label: '신스',   color: '#4338ca', vol: 60, muted: true  },
]
const EFFECTS = ['리버브', '딜레이', 'EQ', '컴프레서', '코러스']

type TrackState = { vol: number; muted: boolean }

const Editor: React.FC = () => {
  const [isPlaying, setIsPlaying]     = useState(false)
  const [progress, setProgress]       = useState(0.25)
  const [activeEffect, setActiveEffect] = useState('리버브')
  const [trackStates, setTrackStates] = useState<Record<string, TrackState>>(
    Object.fromEntries(TRACKS_DATA.map(t => [t.id, { vol: t.vol, muted: t.muted }]))
  )

  const updateTrack = (id: string, patch: Partial<TrackState>) =>
    setTrackStates(p => ({ ...p, [id]: { ...p[id], ...patch } }))

  const trackBars = useMemo(
    () => Object.fromEntries(
      TRACKS_DATA.map(t => [t.id, Array.from({ length: 60 }, () => 0.15 + Math.random() * 0.85)])
    ),
    []
  )

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── 툴바 ── */}
      <div className="flex items-center gap-3 bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl p-4">
        <div className="font-bold text-white text-sm truncate w-36 shrink-0">Rainy Tokyo Night</div>

        {/* 재생 컨트롤 */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-navy-700 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </button>
          <button
            onClick={() => setIsPlaying(p => !p)}
            className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40 hover:scale-105 transition-transform"
          >
            {isPlaying
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            }
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-navy-700 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
        </div>

        {/* 시크 슬라이더 */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <span className="text-xs text-slate-400 font-mono w-16 shrink-0">
            {Math.floor(progress * 154)}s / 2:34
          </span>
          <input
            type="range" min={0} max={100} value={Math.round(progress * 100)}
            onChange={e => setProgress(Number(e.target.value) / 100)}
            className="flex-1 accent-indigo-500 h-1"
          />
        </div>

        <div className="ml-auto flex gap-2">
          <Button variant="secondary" size="sm">되돌리기</Button>
          <Button variant="primary" size="sm">⬇ 내보내기</Button>
        </div>
      </div>

      {/* ── 타임라인 ── */}
      <div className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl overflow-hidden">
        {/* 타임 룰러 — 컨트롤 패널 너비(w-44)와 동일한 spacer */}
        <div className="flex h-8 bg-[#080c2a] border-b border-[rgba(129,140,248,0.1)]">
          <div className="w-44 shrink-0 border-r border-[rgba(129,140,248,0.1)]" />
          <div className="flex-1 flex">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex-1 text-[10px] text-slate-600 border-l border-navy-800 pl-1 flex items-center">
                {Math.floor(i * 154 / 8)}s
              </div>
            ))}
          </div>
        </div>

        {/* 트랙 레인 — items-stretch 로 컨트롤 패널이 파형 레인과 동일 높이 */}
        {TRACKS_DATA.map(t => {
          const state = trackStates[t.id]
          return (
            <div key={t.id} className="flex items-stretch border-b border-[rgba(129,140,248,0.1)] last:border-0">

              {/* 트랙 컨트롤 — w-44 고정, overflow-hidden 으로 경계 밖 출혈 방지 */}
              <div className="w-44 shrink-0 flex flex-col justify-center gap-2 px-3 py-2 bg-[#0a1035] border-r border-[rgba(129,140,248,0.1)] overflow-hidden">
                <div className="text-xs font-semibold text-white leading-none">{t.label}</div>
                <div className="flex items-center gap-2">
                  {/* M 버튼 — 고정 크기 */}
                  <button
                    onClick={() => updateTrack(t.id, { muted: !state.muted })}
                    className={`w-5 h-5 shrink-0 text-[10px] rounded flex items-center justify-center font-bold transition-all ${
                      state.muted ? 'bg-red-900/40 text-red-400' : 'bg-navy-700 text-slate-400'
                    }`}
                  >
                    M
                  </button>
                  {/* 볼륨 슬라이더 — min-w-0 으로 flex 오버플로우 방지 */}
                  <input
                    type="range" min={0} max={100} value={state.vol}
                    onChange={e => updateTrack(t.id, { vol: Number(e.target.value) })}
                    className="flex-1 min-w-0 h-1 accent-indigo-500"
                  />
                  {/* 볼륨 값 — 우정렬, shrink-0 으로 자리 확보 */}
                  <span className="w-7 shrink-0 text-[10px] text-slate-500 text-right">{state.vol}</span>
                </div>
              </div>

              {/* 파형 레인 — h-16 고정, relative 로 커서 위치 기준 */}
              <div
                className="flex-1 h-16 relative px-2 flex items-center"
                style={{ opacity: state.muted ? 0.3 : 1 }}
              >
                <Waveform
                  bars={trackBars[t.id]}
                  progress={progress}
                  color={`${t.color}30`}
                  playedColor={t.color}
                  className="w-full h-12"
                  onSeek={setProgress}
                />
                {/* 재생 커서 — px-2(8px) 패딩 반영 */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-white/60 pointer-events-none"
                  style={{ left: `calc(8px + ${progress} * (100% - 16px))` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 이펙터 ── */}
      <div className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-bold text-white">이펙터</h3>
          <div className="flex gap-2 flex-wrap">
            {EFFECTS.map(e => (
              <button
                key={e} onClick={() => setActiveEffect(e)}
                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${activeEffect === e ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'border-[rgba(129,140,248,0.15)] text-slate-400'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '믹스',     val: 45 },
            { label: '룸 사이즈', val: 60 },
            { label: '디케이',   val: 70 },
            { label: '프리딜레이', val: 30 },
          ].map(p => (
            <div key={p.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">{p.label}</span>
                <span className="font-bold text-indigo-300">{p.val}%</span>
              </div>
              <input type="range" min={0} max={100} defaultValue={p.val} className="w-full accent-indigo-500 h-1" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Editor
