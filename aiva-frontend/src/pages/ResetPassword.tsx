import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { postResetPassword } from '../api/auth/postResetPassword'

const ResetPassword: React.FC = () => {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const token          = searchParams.get('token') ?? ''

  const [pw, setPw]           = useState('')
  const [pw2, setPw2]         = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pw.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return }
    if (pw !== pw2)    { setError('비밀번호가 일치하지 않습니다.'); return }
    setError('')
    setLoading(true)
    try {
      await postResetPassword({ token, newPassword: pw })
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.response?.data?.error ?? '비밀번호 재설정에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c2a] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <Link to="/" className="flex items-center justify-center gap-2 font-black text-lg text-white">
          <span className="w-9 h-9 rounded-lg bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-sm">A</span>
          AIVA FACTORY
        </Link>

        <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-8 space-y-6">
          {!done ? (
            <>
              <div className="text-center">
                <h1 className="text-xl font-black text-white">새 비밀번호 설정</h1>
                <p className="text-sm text-slate-400 mt-2">8자 이상의 새 비밀번호를 입력해주세요.</p>
              </div>

              {!token && (
                <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-3 text-sm text-red-300">
                  유효하지 않은 링크입니다. 비밀번호 찾기를 다시 시도해주세요.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">새 비밀번호</label>
                  <input
                    type="password"
                    value={pw}
                    onChange={e => setPw(e.target.value)}
                    placeholder="8자 이상"
                    autoFocus
                    disabled={!token}
                    className="w-full bg-[#080c2a] border border-primary-soft rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">새 비밀번호 확인</label>
                  <input
                    type="password"
                    value={pw2}
                    onChange={e => setPw2(e.target.value)}
                    placeholder="비밀번호 재입력"
                    disabled={!token}
                    className="w-full bg-[#080c2a] border border-primary-soft rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                  />
                </div>
                {error && (
                  <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-3 text-sm text-red-300">{error}</div>
                )}
                <Button type="submit" variant="primary" size="md" fullWidth disabled={loading || !token}>
                  {loading ? '변경 중...' : '비밀번호 변경'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="text-5xl">✅</div>
              <h2 className="text-lg font-black text-white">비밀번호가 변경됐습니다</h2>
              <p className="text-sm text-slate-400">3초 후 로그인 페이지로 이동합니다...</p>
              <Link to="/login" className="text-sm text-indigo-400 hover:text-indigo-300">바로 이동</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
