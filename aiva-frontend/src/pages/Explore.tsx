import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/common/Badge'

const TRENDING = [
  { rank: 1, title: 'Tokyo Rain', genre: 'Lo-Fi', user: '@yuna', plays: '12.4K', color: 'from-indigo-700 to-violet-700' },
  { rank: 2, title: 'Neon Protocol', genre: 'Synthwave', user: '@rex', plays: '9.8K', color: 'from-navy-700 to-indigo-800' },
  { rank: 3, title: 'Seoul Groove', genre: 'City Pop', user: '@minho', plays: '8.1K', color: 'from-violet-800 to-navy-700' },
  { rank: 4, title: 'Sakura Wind', genre: 'Acoustic', user: '@sora', plays: '7.3K', color: 'from-indigo-800 to-violet-900' },
  { rank: 5, title: 'Deep Current', genre: 'Ambient', user: '@kai', plays: '6.9K', color: 'from-navy-600 to-indigo-700' },
]

const CREATORS = [
  { name: 'yuna', tracks: 42, followers: '2.1K', color: 'from-indigo-600 to-violet-600' },
  { name: 'rex', tracks: 31, followers: '1.8K', color: 'from-navy-600 to-indigo-600' },
  { name: 'minho', tracks: 28, followers: '1.5K', color: 'from-violet-700 to-navy-600' },
  { name: 'sora', tracks: 19, followers: '980', color: 'from-indigo-700 to-violet-800' },
]

const GENRES = ['전체','Lo-Fi','City Pop','Ambient','Synthwave','K-Pop','EDM','Acoustic','Hip-Hop']

const Explore: React.FC = () => {
  const navigate = useNavigate()
  const [genre, setGenre] = useState('전체')
  const [search, setSearch] = useState('')

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 검색 */}
      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="트랙, 아티스트, 장르 검색..."
          className="flex-1 bg-[#0d1340] border border-(--border-color) rounded-[12px] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* 장르 필터 */}
      <div className="flex gap-2 flex-wrap">
        {GENRES.map(g => (
          <button key={g} onClick={() => setGenre(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${genre === g ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'border-(--border-color) text-slate-400 hover:border-indigo-700/40'}`}>
            {g}
          </button>
        ))}
      </div>

      {/* 트렌딩 */}
      <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6">
        <h2 className="font-bold text-white mb-5">🔥 트렌딩</h2>
        <div className="flex flex-col gap-3">
          {TRENDING.map(t => (
            <div key={t.rank} className="flex items-center gap-4 p-3 rounded-xl hover:bg-navy-800/40 transition-colors cursor-pointer group" onClick={() => navigate('/player')}>
              <span className="w-5 text-sm font-black text-slate-500 text-center">{t.rank}</span>
              <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${t.color} flex items-center justify-center text-white shrink-0`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">{t.title}</div>
                <div className="text-xs text-slate-400">{t.user}</div>
              </div>
              <Badge variant="info">{t.genre}</Badge>
              <span className="text-xs text-slate-500">▶ {t.plays}</span>
              <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        {/* 최신 공개 트랙 */}
        <div className="space-y-4">
          <h2 className="font-bold text-white">최신 공개 트랙</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {TRENDING.slice(0,4).map(t => (
              <div key={t.title+'new'} className="bg-[#0d1340] border border-(--border-color) rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform group" onClick={() => navigate('/player')}>
                <div className={`h-28 bg-linear-to-br ${t.color} flex items-center justify-center relative`}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="white" opacity="0.6"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="white"/><circle cx="18" cy="16" r="3" fill="white"/></svg>
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-white">{t.title}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-slate-400">{t.user}</span>
                    <Badge variant="info">{t.genre}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 인기 크리에이터 */}
        <div className="space-y-4">
          <h2 className="font-bold text-white">🎤 인기 크리에이터</h2>
          <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-3 flex flex-col gap-1">
            {CREATORS.map(c => (
              <div key={c.name} className="flex items-center gap-3 cursor-pointer hover:bg-navy-800/40 rounded-xl p-2 transition-colors">
                <div className={`w-10 h-10 rounded-full bg-linear-to-br ${c.color} flex items-center justify-center text-white font-bold shrink-0`}>
                  {c.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">@{c.name}</div>
                  <div className="text-xs text-slate-400">{c.tracks}개 트랙 · 팔로워 {c.followers}</div>
                </div>
                <button className="px-2.5 py-1 text-xs font-semibold rounded-full border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/20 transition-all">
                  팔로우
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Explore
