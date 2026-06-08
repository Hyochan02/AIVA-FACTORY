import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Waveform } from '../components/common/Waveform'

const TRACKS = [
  { id:'1', title:'Rainy Tokyo Night', genre:'Lo-Fi', dur:'2:34', date:'2026-05-20', color:'from-indigo-700 to-violet-700', plays:142 },
  { id:'2', title:'Midnight Seoul', genre:'City Pop', dur:'2:43', date:'2026-05-19', color:'from-navy-700 to-indigo-800', plays:89 },
  { id:'3', title:'Deep Ocean', genre:'Ambient', dur:'3:12', date:'2026-05-18', color:'from-violet-800 to-navy-700', plays:201 },
  { id:'4', title:'Iron Signal', genre:'Industrial', dur:'2:58', date:'2026-05-17', color:'from-indigo-800 to-violet-900', plays:67 },
  { id:'5', title:'Cherry Bloom', genre:'Acoustic', dur:'3:45', date:'2026-05-15', color:'from-navy-600 to-indigo-700', plays:315 },
  { id:'6', title:'Neon Grid', genre:'Synthwave', dur:'4:02', date:'2026-05-14', color:'from-violet-700 to-navy-700', plays:158 },
]

const FILTERS = ['전체', 'Lo-Fi', 'City Pop', 'Ambient', 'Synthwave', 'Acoustic']

type ViewMode = 'grid' | 'list'

const Library: React.FC = () => {
  const navigate = useNavigate()
  const [view, setView] = useState<ViewMode>('grid')
  const [filter, setFilter] = useState('전체')
  const [search, setSearch] = useState('')

  const filtered = TRACKS.filter(t =>
    (filter === '전체' || t.genre === filter) &&
    (search === '' || t.title.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
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
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
              }
            </button>
          ))}
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === f ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'border-(--border-color) text-slate-400 hover:border-indigo-700/40'}`}>
            {f}
          </button>
        ))}
        <span className="px-3 py-1.5 text-xs text-slate-500 self-center">{filtered.length}개</span>
      </div>

      {/* 그리드 뷰 */}
      {view === 'grid' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <div key={t.id} className="bg-[#0d1340] border border-(--border-color) rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-200 cursor-pointer group" onClick={() => navigate('/player')}>
              <div className={`h-32 bg-linear-to-br ${t.color} flex items-center justify-center relative`}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="white" opacity="0.6"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="white"/><circle cx="18" cy="16" r="3" fill="white"/></svg>
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="font-semibold text-white text-sm truncate">{t.title}</div>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="info">{t.genre}</Badge>
                  <span className="text-xs text-slate-400">{t.dur}</span>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                  <span>▶ {t.plays}</span>
                  <span>{t.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 리스트 뷰 */}
      {view === 'list' && (
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl overflow-hidden">
          {filtered.map((t, i) => (
            <div key={t.id} className={`flex items-center gap-4 p-4 hover:bg-navy-800/40 transition-colors cursor-pointer ${i < filtered.length - 1 ? 'border-b border-(--border-color)' : ''}`} onClick={() => navigate('/player')}>
              <span className="w-5 text-xs text-slate-500 text-center">{i+1}</span>
              <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${t.color} flex items-center justify-center text-white shrink-0`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{t.title}</div>
                <div className="text-xs text-slate-400">{t.genre}</div>
              </div>
              <Waveform className="w-20 hidden md:flex" />
              <span className="text-xs text-slate-500 hidden sm:block">▶ {t.plays}</span>
              <span className="text-xs text-slate-400">{t.dur}</span>
              <Button variant="secondary" size="sm" onClick={e => { e.stopPropagation(); navigate('/editor') }}>편집</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Library
