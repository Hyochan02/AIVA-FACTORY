import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { useAuthStore } from '../stores/authStore'

const Login: React.FC = () => {
  const navigate           = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail]  = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c2a] flex">
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center relative overflow-hidden bg-linear-to-br from-navy-900 to-indigo-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.2),transparent_60%)]" />
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-2xl shadow-indigo-900/60">A</div>
          <h2 className="text-3xl font-black mb-3">AIVA FACTORY</h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs mx-auto">
            텍스트 한 줄로 완성되는 AI 음악 플랫폼.<br/>지금 로그인하고 창작을 시작하세요.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-3 max-w-xs mx-auto">
            {['Synthwave','Lo-Fi','City Pop','K-Pop Ballad','Ambient','Drum & Bass'].map(g => (
              <span key={g} className="px-3 py-1.5 text-xs font-semibold rounded-full bg-indigo-900/40 border border-indigo-700/30 text-indigo-300">{g}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 font-black text-lg mb-6 lg:hidden">
              <span className="w-8 h-8 rounded-sm bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm">A</span>
              AIVA FACTORY
            </Link>
            <h1 className="text-2xl font-black text-white">로그인</h1>
            <p className="text-sm text-slate-400 mt-1">계정이 없으신가요? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold">무료 가입</Link></p>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            {[
              { icon: 'G', label: 'Google로 계속하기', bg: 'bg-white', text: 'text-gray-800' },
              { icon: '\u{1F535}', label: 'Facebook으로 계속하기', bg: 'bg-[#1877F2]', text: 'text-white' },
            ].map(s => (
              <button key={s.label} disabled
                className={`${s.bg} ${s.text} w-full py-2.5 px-4 rounded-[12px] text-sm font-semibold flex items-center justify-center gap-3 border border-(--border-color) opacity-50 cursor-not-allowed`}>
                <span className="font-black">{s.icon}</span> {s.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[var(--border-color)]" />
            <span className="text-xs text-slate-500">또는 이메일로</span>
            <div className="flex-1 h-px bg-[var(--border-color)]" />
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-[12px] bg-red-900/30 border border-red-700/40 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">이메일</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full bg-[#0d1340] border border-(--border-color) rounded-[12px] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">비밀번호</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="........"
                className="w-full bg-[#0d1340] border border-(--border-color) rounded-[12px] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <div className="flex justify-end mt-1.5">
                <a href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">비밀번호 찾기</a>
              </div>
            </div>
            <Button type="submit" variant="primary" size="md" fullWidth loading={loading} className="mt-2">
              로그인
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
