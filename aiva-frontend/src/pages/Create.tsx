import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Toggle } from '../components/common/Toggle'
import { startGenerate } from '../api/generate'

const GENRES = ['Lo-Fi','City Pop','Ambient','Synthwave','K-Pop','EDM','Jazz','Acoustic','Hip-Hop','Classical','R&B','Drum & Bass']
const MOODS  = ['밝고 경쾌','차분하고 서정','어둡고 강렬','몽환적','에너제틱','슬프고 감성적']
const INSTRUMENTS = ['피아노','기타','드럼','베이스','신스','바이올린','색소폰','보컬']
const DURATION_MAP: Record<string, number> = { '30초': 30, '1분': 60, '2분': 120, '3분': 180, '4분': 240 }

const Create: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initGenre = searchParams.get('genre') ?? ''
  const [prompt, setPrompt]               = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initGenre ? [initGenre] : [])
  const [selectedMood, setSelectedMood]   = useState('')
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([])
  const [bpm, setBpm]                     = useState(120)
  const [duration, setDuration]           = useState('2분')
  const [customDuration, setCustomDuration] = useState(120)
  const [instrumental, setInstrumental]   = useState(false)
  const [title, setTitle]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')

  const toggle = <T,>(setArr: React.Dispatch<React.SetStateAction<T[]>>, val: T) =>
    setArr(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val])

  const handleGenerate = async () => {
    if (!prompt.trim()) { setError('프롬프트를 입력해주세요.'); return }
    setError('')
    setLoading(true)
    try {
      const durationSec = duration === '커스텀' ? customDuration : (DURATION_MAP[duration] ?? 120)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await startGenerate({
        prompt,
        genre:        selectedGenres[0],
        mood:         selectedMood || undefined,
        instruments:  selectedInstruments.length > 0 ? selectedInstruments : undefined,
        bpm:          bpm,
        duration:     durationSec,
        instrumental,
        title:        title.trim() || undefined,
      }) as any
      const { trackId } = res.data
      navigate(`/generating?trackId=${trackId}`)
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? '생성 요청에 실패했습니다.'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* 제목 (선택) */}
      <div className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl p-6">
        <label className="block text-sm font-bold text-white mb-3">
          트랙 제목 <span className="text-slate-500 font-normal">(선택)</span>
        </label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="예: Rainy Tokyo Night"
          maxLength={80}
          className="w-full bg-[#080c2a] border border-[rgba(129,140,248,0.15)] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* 프롬프트 */}
      <div className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl p-6">
        <label className="block text-sm font-bold text-white mb-3">
          어떤 음악을 만들고 싶으세요? <span className="text-indigo-400">*</span>
        </label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder='"비 오는 도쿄 밤, 시티팝 분위기의 잔잔한 LoFi 트랙. 색소폰 솔로와 부드러운 신스 패드"'
          rows={4}
          maxLength={500}
          className="w-full bg-[#080c2a] border border-[rgba(129,140,248,0.15)] rounded-[12px] px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-slate-500">{prompt.length} / 500자</span>
          <button
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            onClick={() => setPrompt('"비 오는 도쿄 밤, 시티팝 분위기의 잔잔한 LoFi 트랙. 색소폰 솔로와 부드러운 신스 패드"')}
          >
            예시 불러오기
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 장르 */}
        <div className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">장르</h3>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(g => (
              <button
                key={g}
                onClick={() => toggle(setSelectedGenres, g)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  selectedGenres.includes(g)
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                    : 'border-[rgba(129,140,248,0.15)] text-slate-400 hover:border-indigo-700/50'
                }`}
              >{g}</button>
            ))}
          </div>
        </div>

        {/* 분위기 */}
        <div className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">분위기</h3>
          <div className="flex flex-wrap gap-2">
            {MOODS.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMood(p => p === m ? '' : m)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  selectedMood === m
                    ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                    : 'border-[rgba(129,140,248,0.15)] text-slate-400 hover:border-violet-700/50'
                }`}
              >{m}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 악기 */}
      <div className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4">악기 <span className="text-slate-500 font-normal text-xs">(다중 선택)</span></h3>
        <div className="flex flex-wrap gap-2">
          {INSTRUMENTS.map(i => (
            <button
              key={i}
              onClick={() => toggle(setSelectedInstruments, i)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                selectedInstruments.includes(i)
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                  : 'border-[rgba(129,140,248,0.15)] text-slate-400 hover:border-indigo-700/50'
              }`}
            >{i}</button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* BPM */}
        <div className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">BPM <span className="text-indigo-400 ml-2">{bpm}</span></h3>
          <input
            type="range" min={60} max={200} value={bpm}
            onChange={e => setBpm(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>60 (느림)</span><span>130 (보통)</span><span>200 (빠름)</span>
          </div>
        </div>

        {/* 길이 + 반주 전용 */}
        <div className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white mb-3">길이</h3>
            <div className="flex flex-wrap gap-2">
              {['30초','1분','2분','3분','4분','커스텀'].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                    duration === d
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                      : 'border-[rgba(129,140,248,0.15)] text-slate-400 hover:border-indigo-700/50'
                  }`}
                >{d}</button>
              ))}
            </div>
            {duration === '커스텀' && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number" min={30} max={240} value={customDuration}
                  onChange={e => setCustomDuration(Number(e.target.value))}
                  className="w-24 bg-[#080c2a] border border-indigo-700/40 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                />
                <span className="text-xs text-slate-400">초 (30~240)</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">반주 전용</div>
              <div className="text-xs text-slate-400">보컬 없이 순수 악기 연주</div>
            </div>
            <Toggle checked={instrumental} onChange={setInstrumental} />
          </div>
        </div>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* 생성 버튼 */}
      <div className="flex justify-end gap-3 pb-4">
        <span className="text-xs text-slate-500 self-center">크레딧 4개 소모</span>
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
        >
          {loading ? '요청 중...' : '🎵 음악 생성하기'}
        </Button>
      </div>
    </div>
  )
}

export default Create
