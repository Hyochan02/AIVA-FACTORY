import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { useAuthStore } from '../stores/authStore'

const USE_CASES = [
  { id: 'content',    label: '콘텐츠 제작',   emoji: '🎬' },
  { id: 'study',      label: '공부 배경음악', emoji: '📚' },
  { id: 'game',       label: '게임 OST',      emoji: '🎮' },
  { id: 'podcast',    label: '팟캐스트 BGM',  emoji: '🎙️' },
  { id: 'commercial', label: '광고 음악',     emoji: '📣' },
  { id: 'personal',   label: '개인 취미',     emoji: '🎧' },
]

const Signup: React.FC = () => {
  const navigate          = useNavigate()
  const register = useAuthStore((s) => s.register)
  const [step, setStep]   = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ── step 1 fields ───────────────────────────────────────
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')

  // ── step 2 fields ───────────────────────────────────────
  const [name, setName]           = useState('')
  const [useCases, setUseCases]   = useState<string[]>([])

  const toggleUseCase = (id: string) =>
    setUseCases(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id])

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    if (password.length < 8)  { setError('비밀번호는 8자 이상이어야 합니다.'); return }
    setStep(2)
  }

  const handleFinish = async () => {
    setError('')
    setLoading(true)
    try {
      await register({ email, password, name, useCases })
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c2a] flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* ── 로고 ─────────────────────────────────────── */}
        <Link to="/" className="flex items-center justify-center gap-2 font-black text-lg mb-8">
          <span className="w-8 h-8 rounded-sm bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm">A</span>
          AIVA FACTORY
        </Link>

        {/* ── 스텝 인디케이터 ────────────────────────── */}
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3].map(s => (
            <React.Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= s ? 'bg-indigo-600 text-white' : 'bg-[#0d1340] text-slate-500 border border-(--border-color)'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 transition-all ${step > s ? 'bg-indigo-600' : 'bg-[#0d1340]'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── 에러 메시지 ───────────────────────────── */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-[12px] bg-red-900/30 border border-red-700/40 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ── Step 1: 계정 정보 ─────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-black text-white">계정 만들기</h1>
              <p className="text-sm text-slate-400 mt-1">이미 계정이 있으신가요? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">로그인</Link></p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">이메일</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full bg-[#0d1340] border border-(--border-color) rounded-[12px] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">비밀번호</label>
              <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="8자 이상"
                className="w-full bg-[#0d1340] border border-(--border-color) rounded-[12px] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">비밀번호 확인</label>
              <input type="password" required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="동일하게 입력"
                className="w-full bg-[#0d1340] border border-(--border-color) rounded-[12px] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <Button type="submit" variant="primary" size="md" fullWidth>다음 단계 →</Button>
          </form>
        )}

        {/* ── Step 2: 프로필 설정 ───────────────────── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-black text-white">프로필 설정</h1>
              <p className="text-sm text-slate-400 mt-1">어떻게 불러드릴까요?</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">이름 (닉네임)</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="AIVA 아티스트"
                className="w-full bg-[#0d1340] border border-(--border-color) rounded-[12px] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">주요 사용 목적 (복수 선택)</label>
              <div className="grid grid-cols-2 gap-2">
                {USE_CASES.map(u => (
                  <button key={u.id} type="button" onClick={() => toggleUseCase(u.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${useCases.includes(u.id) ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300' : 'border-(--border-color) text-slate-400 hover:border-indigo-700/40'}`}>
                    <span>{u.emoji}</span> {u.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="md" className="shrink-0 px-5" onClick={() => setStep(1)}>← 이전</Button>
              <Button variant="primary" size="md" fullWidth loading={loading}
                onClick={handleFinish} disabled={!name.trim()}>
                가입 완료
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: 완료 ─────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-3xl shadow-2xl shadow-indigo-900/50">🎵</div>
            <div>
              <h1 className="text-xl font-black text-white">모든 준비 완료!</h1>
              <p className="text-sm text-slate-400 mt-1">{name}님께 100 크레딧이 지급됩니다.</p>
            </div>
            <div className="w-full bg-[#0d1340] rounded-xl p-4 text-left border border-(--border-color)">
              <div className="text-xs font-bold text-slate-300 mb-2">가입 정보</div>
              <div className="text-sm text-slate-400 space-y-1">
                <div>이메일: <span className="text-white">{email}</span></div>
                <div>이름: <span className="text-white">{name}</span></div>
                {useCases.length > 0 && (
                  <div>사용 목적: <span className="text-white">
                    {USE_CASES.filter(u => useCases.includes(u.id)).map(u => u.label).join(', ')}
                  </span></div>
                )}
              </div>
            </div>
            <Button variant="primary" size="md" fullWidth onClick={() => navigate('/dashboard', { replace: true })}>
              대시보드로 이동 →
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Signup
