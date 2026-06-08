import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'

type Step = 1 | 2 | 3
const USE_CASES = ['개인 창작', '유튜브/콘텐츠', '광고/상업용', '게임 OST', '앱/서비스', '그냥 재미로']

const Signup: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [selectedUse, setSelectedUse] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleStep1 = (e: React.FormEvent) => { e.preventDefault(); setStep(2) }
  const handleStep2 = (e: React.FormEvent) => { e.preventDefault(); setStep(3) }
  const handleFinish = () => {
    setLoading(true)
    // TODO: 2차 - POST /api/auth/register
    setTimeout(() => { setLoading(false); navigate('/dashboard') }, 800)
  }
  const toggleUse = (u: string) => setSelectedUse(p => p.includes(u) ? p.filter(x => x !== u) : [...p, u])

  return (
    <div className="min-h-screen bg-[#080c2a] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <Link to="/" className="flex items-center justify-center gap-2.5 font-black text-lg mb-8">
          <span className="w-8 h-8 rounded-sm bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm">A</span>
          AIVA FACTORY
        </Link>

        {/* 진행 스텝 */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {([1,2,3] as Step[]).map(s => (
            <React.Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s <= step ? 'bg-indigo-600 text-white' : 'bg-navy-700 text-slate-500'}`}>{s}</div>
              {s < 3 && <div className={`h-0.5 w-12 transition-all ${s < step ? 'bg-indigo-600' : 'bg-navy-700'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-8">
          {/* Step 1: 계정 정보 */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="flex flex-col gap-5">
              <div>
                <h1 className="text-xl font-black text-white">계정 만들기</h1>
                <p className="text-sm text-slate-400 mt-1">이미 계정이 있으신가요? <Link to="/login" className="text-indigo-400 font-semibold">로그인</Link></p>
              </div>
              {[
                { label: '이름', val: name, set: setName, type: 'text', ph: '홍길동' },
                { label: '이메일', val: email, set: setEmail, type: 'email', ph: 'hello@example.com' },
                { label: '비밀번호', val: password, set: setPassword, type: 'password', ph: '8자 이상' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">{f.label}</label>
                  <input
                    type={f.type} required value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                    className="w-full bg-[#080c2a] border border-(--border-color) rounded-[12px] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              ))}
              <Button type="submit" variant="primary" fullWidth>다음 →</Button>
            </form>
          )}

          {/* Step 2: 용도 선택 */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="flex flex-col gap-5">
              <div>
                <h1 className="text-xl font-black text-white">어떻게 사용하실 건가요?</h1>
                <p className="text-sm text-slate-400 mt-1">맞춤 추천을 위해 선택해주세요. (복수 선택 가능)</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {USE_CASES.map(u => (
                  <button
                    key={u} type="button" onClick={() => toggleUse(u)}
                    className={`px-3 py-2.5 rounded-[12px] text-sm font-semibold text-left border transition-all ${selectedUse.includes(u) ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'border-(--border-color) text-slate-400 hover:border-indigo-700/50 hover:text-slate-200'}`}
                  >
                    {u}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(1)} className="whitespace-nowrap shrink-0">← 이전</Button>
                <Button type="submit" variant="primary" fullWidth>다음 →</Button>
              </div>
            </form>
          )}

          {/* Step 3: 완료 */}
          {step === 3 && (
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-3xl shadow-2xl shadow-indigo-900/50">🎵</div>
              <div>
                <h1 className="text-xl font-black text-white">모든 준비 완료!</h1>
                <p className="text-sm text-slate-400 mt-1">{name}님께 100 크레딧이 지급됩니다.</p>
              </div>
              <div className="w-full bg-[#080c2a] rounded-xl p-4 text-left border border-(--border-color)">
                <div className="text-xs font-bold text-slate-300 mb-2">가입 정보</div>
                <div className="text-sm text-slate-400">{email}</div>
                {selectedUse.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedUse.map(u => <span key={u} className="px-2 py-0.5 text-xs rounded-full bg-indigo-900/40 text-indigo-300">{u}</span>)}
                  </div>
                )}
              </div>
              <Button variant="primary" fullWidth loading={loading} onClick={handleFinish}>
                AIVA 시작하기 🚀
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Signup
