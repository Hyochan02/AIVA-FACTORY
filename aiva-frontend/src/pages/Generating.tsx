import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  { label: '프롬프트 분석', desc: '의도와 감정 분석 중...' },
  { label: '악기 배치', desc: '멜로디와 코드 구성 중...' },
  { label: '오디오 합성', desc: 'AI 사운드 엔진 가동 중...' },
  { label: '마스터링', desc: '음량 균형 및 EQ 최적화 중...' },
  { label: '완료', desc: '트랙 준비 완료!' },
]

const Generating: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100 }
        return p + 2
      })
    }, 300)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setCurrentStep(Math.min(Math.floor(progress / 25), STEPS.length - 1))
  }, [progress])

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => navigate('/player'), 1200)
      return () => clearTimeout(t)
    }
  }, [progress, navigate])

  return (
    <div className="max-w-lg mx-auto text-center space-y-10 py-8">
      {/* 애니메이션 아이콘 */}
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 rounded-full bg-indigo-600/20 animate-ping" />
        <div className="absolute inset-3 rounded-full bg-indigo-700/30 animate-pulse" />
        <div className="relative w-full h-full rounded-full bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-900/60">
          <span className="text-4xl">🎵</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-black text-white mb-2">AI가 음악을 만들고 있어요</h1>
        <p className="text-slate-400 text-sm">잠시만 기다려주세요. 약 30초 소요됩니다.</p>
      </div>

      {/* 진행 바 */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>{STEPS[currentStep].label}</span>
          <span className="font-bold text-indigo-400">{progress}%</span>
        </div>
        <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-slate-500">{STEPS[currentStep].desc}</div>
      </div>

      {/* 단계 목록 */}
      <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 text-left space-y-3">
        {STEPS.map((s, i) => (
          <div key={i} className={`flex items-center gap-3 text-sm transition-all ${i === currentStep ? 'text-white' : i < currentStep ? 'text-slate-500' : 'text-slate-600'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${i < currentStep ? 'bg-indigo-600 text-white' : i === currentStep ? 'border-2 border-indigo-500 text-indigo-400' : 'border border-navy-600 text-slate-600'}`}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span>{s.label}</span>
            {i === currentStep && (
              <span className="ml-auto">
                <span className="inline-flex gap-1">
                  {[0,1,2].map(d => (
                    <span key={d} className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </span>
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 팁 */}
      <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl px-5 py-3 text-xs text-indigo-300 text-left">
        💡 <strong>Tip:</strong> 더 구체적인 프롬프트일수록 원하는 결과에 가까운 음악이 만들어집니다.
      </div>
    </div>
  )
}

export default Generating
