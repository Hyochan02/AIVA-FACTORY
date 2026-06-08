import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Toggle } from '../components/common/Toggle'
import { startGenerate } from '../api/generate'

const GENRES = ['Lo-Fi','City Pop','Ambient','Synthwave','K-Pop','EDM','Jazz','Acoustic','Hip-Hop','Classical','R&B','Drum & Bass']
const MOODS  = ['밝고 경쾌','차분하고 서정','어둡고 강렬','몽환적','에너제틱','슬프고 감성적']
const INSTRUMENTS = ['피아노','기타','드럼','베이스','신스','바이올린','색소폰','보컬']

const EXAMPLE_PROMPT = '비 오는 도쿄 밤, 시티팝 분위기의 잔잔한 LoFi 트랙. 색소폰 솔로와 부드러운 신스 패드'

const Create: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initGenre = searchParams.get('genre') ?? ''

  const [prompt, setPrompt]                           = useState('')
  const [selectedGenres, setSelectedGenres]           = useState<string[]>(initGenre ? [initGenre] : [])
  const [selectedMood, setSelectedMood]               = useState('')
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([])
  const [instrumental, setInstrumental]               = useState(false)
  const [isPublic, setIsPublic]                         = useState(true)
  const [title, setTitle]                             = useState('')
  const [loading, setLoading]                         = useState(false)
  const [error, setError]                             = useState('')

  const toggleArr = <T,>(setArr: React.Dispatch<React.SetStateAction<T[]>>, val: T) =>
    setArr(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val])

  const handleGenerate = async () => {
    if (!prompt.trim()) { setError('프롬프트를 입력해주세요.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await startGenerate({
        prompt,
        genre:       selectedGenres[0],
        mood:        selectedMood || undefined,
        instruments: selectedInstruments.length > 0 ? selectedInstruments : undefined,
        instrumental,
        title:       title.trim() || undefined,
        isPublic,
      }) as { data: { trackId: string } }
      navigate(`/generating?trackId=${res.data.trackId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '생성 요청에 실패했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* 제목 (선택) */}
      <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-6">
        <label className="block text-sm font-bold text-white mb-3">
          트랙 제목 <span className="text-slate-500 font-normal text-xs">(선택 — 비워두면 프롬프트 앞부분으로 자동 설정)</span>
        </label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="예: Rainy Tokyo Night"
          maxLength={80}
          className="w-full bg-[#080c2a] border border-primary-soft rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* 프롬프트 */}
      <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-6">
        <label className="block text-sm font-bold text-white mb-3">
          어떤 음악을 만들고 싶으세요? <span className="text-indigo-400">*</span>
        </label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={`"${EXAMPLE_PROMPT}"`}
          rows={4}
          maxLength={500}
          className="w-full bg-[#080c2a] border border-primary-soft rounded-[12px] px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-slate-500">{prompt.length} / 500자</span>
          <button
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            onClick={() => setPrompt(EXAMPLE_PROMPT)}
          >
            예시 불러오기
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 장르 */}
        <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">
            장르 <span className="text-slate-500 font-normal text-xs">(선택)</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(g => (
              <button key={g} onClick={() => toggleArr(setSelectedGenres, g)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  selectedGenres.includes(g)
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                    : 'border-primary-soft text-slate-400 hover:border-indigo-700/50'
                }`}>{g}</button>
            ))}
          </div>
        </div>

        {/* 분위기 */}
        <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">
            분위기 <span className="text-slate-500 font-normal text-xs">(선택)</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {MOODS.map(m => (
              <button key={m} onClick={() => setSelectedMood(p => p === m ? '' : m)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  selectedMood === m
                    ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                    : 'border-primary-soft text-slate-400 hover:border-violet-700/50'
                }`}>{m}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 악기 */}
      <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4">
          악기 <span className="text-slate-500 font-normal text-xs">(선택, 다중)</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {INSTRUMENTS.map(i => (
            <button key={i} onClick={() => toggleArr(setSelectedInstruments, i)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                selectedInstruments.includes(i)
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                  : 'border-primary-soft text-slate-400 hover:border-indigo-700/50'
              }`}>{i}</button>
          ))}
        </div>
      </div>

      {/* 반주 전용 */}
      <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">반주 전용 (Instrumental)</div>
            <div className="text-xs text-slate-400 mt-0.5">보컬 없이 순수 악기 연주로만 생성합니다</div>
          </div>
          <Toggle checked={instrumental} onChange={setInstrumental} />
        </div>
      </div>

      {/* 공개 설정 */}
      <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-bold text-white">공개 트랙</div>
              {isPublic
                ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PUBLIC</span>
                : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/30">PRIVATE</span>
              }
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {isPublic ? 'Explore 피드에 노출되고 다른 사용자가 들을 수 있습니다' : '나만 들을 수 있는 비공개 트랙입니다'}
            </div>
          </div>
          <Toggle checked={isPublic} onChange={setIsPublic} />
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pb-6">
        <span className="text-xs text-slate-500 self-center">크레딧 4개 소모</span>
        <Button variant="primary" size="lg" onClick={handleGenerate} disabled={loading || !prompt.trim()}>
          {loading ? '요청 중...' : '음악 생성하기'}
        </Button>
      </div>
    </div>
  )
}

export default Create
