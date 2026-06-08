import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Toggle } from '../components/common/Toggle'

const GENRES = ['Lo-Fi','City Pop','Ambient','Synthwave','K-Pop','EDM','Jazz','Acoustic','Hip-Hop','Classical','R&B','Drum & Bass']
const MOODS = ['밝고 경쾌','차분하고 서정','어둡고 강렬','몽환적','에너제틱','슬프고 감성적']
const INSTRUMENTS = ['피아노','기타','드럼','베이스','신스','바이올린','색소폰','보컬']
const DURATIONS = ['30초','1분','2분','3분','4분','커스텀']

const Create: React.FC = () => {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedMood, setSelectedMood] = useState('')
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([])
  const [bpm, setBpm] = useState(120)
  const [duration, setDuration] = useState('2분')
  const [instrumental, setInstrumental] = useState(false)
  const [generating, setGenerating] = useState(false)

  const toggle = <T,>(setArr: React.Dispatch<React.SetStateAction<T[]>>, val: T) =>
    setArr(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val])

  const handleGenerate = () => {
    if (!prompt.trim()) return
    setGenerating(true)
    setTimeout(() => { setGenerating(false); navigate('/generating') }, 400)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

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
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 무드 */}
        <div className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">분위기</h3>
          <div className="flex flex-col gap-2">
            {MOODS.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMood(m)}
                className={`text-left px-4 py-2.5 rounded-sm text-sm border transition-all ${
                  selectedMood === m
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-semibold'
                    : 'border-[rgba(129,140,248,0.15)] text-slate-400 hover:border-indigo-700/50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* 악기 */}
        <div className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">악기 (복수 선택)</h3>
          <div className="flex flex-wrap gap-2">
            {INSTRUMENTS.map(ins => (
              <button
                key={ins}
                onClick={() => toggle(setSelectedInstruments, ins)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  selectedInstruments.includes(ins)
                    ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                    : 'border-[rgba(129,140,248,0.15)] text-slate-400 hover:border-violet-700/50'
                }`}
              >
                {ins}
              </button>
            ))}
          </div>
        </div>

        {/* 세부 설정 */}
        <div className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-white">세부 설정</h3>

          {/* BPM */}
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">BPM</span>
              <span className="font-bold text-indigo-300">{bpm}</span>
            </div>
            <input
              type="range" min={60} max={200} value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>60 (느림)</span><span>200 (빠름)</span>
            </div>
          </div>

          {/* 길이 */}
          <div>
            <div className="text-xs text-slate-400 mb-2">길이</div>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                    duration === d
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                      : 'border-[rgba(129,140,248,0.15)] text-slate-400 hover:border-indigo-700/50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* 보컬 토글 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">인스트루멘탈 (보컬 없음)</span>
            <Toggle checked={instrumental} onChange={setInstrumental} />
          </div>
        </div>
      </div>

      {/* 생성 버튼 */}
      <div className="flex items-center justify-between bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl p-5">
        <div>
          <div className="text-sm font-bold text-white">2개 버전이 생성됩니다</div>
          <div className="text-xs text-slate-400 mt-0.5">크레딧 4개 사용 · 약 30초 소요</div>
        </div>
        <Button
          variant="primary" size="lg"
          loading={generating}
          onClick={handleGenerate}
          disabled={!prompt.trim()}
        >
          🎵 음악 생성하기
        </Button>
      </div>
    </div>
  )
}

export default Create
