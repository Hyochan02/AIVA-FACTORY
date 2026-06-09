import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { postForgotPassword } from '../api/auth/postForgotPassword'

const ForgotPassword: React.FC = () => {
  const [email, setEmail]         = useState('')
  const [sent, setSent]           = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [devToken, setDevToken]   = useState('')  // 개발 환경 전용

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('이메일을 입력해주세요.'); return }
    setError('')
    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await postForgotPassword(email) as any
      setSent(true)
      if (res.data?._devToken) setDevToken(res.data._devToken)
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.response?.data?.error ?? '요청에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c2a] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* 로고 */}
        <Link to="/" className="flex items-center justify-center gap-2 font-black text-lg text-white">
          <span className="w-9 h-9 rounded-lg bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-900/50">
            A
          </span>
          AIVA FACTORY
        </Link>

        <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-8 space-y-6">
          {!sent ? (
            <>
              <div className="text-center">
                <h1 className="text-xl font-black text-white">비밀번호 찾기</h1>
                <p className="text-sm text-slate-400 mt-2">
                  가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">이메일</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                    className="w-full bg-[#080c2a] border border-primary-soft rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <Button type="submit" variant="primary" size="md" fullWidth disabled={loading}>
                  {loading ? '전송 중...' : '재설정 링크 전송'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="text-5xl">📬</div>
              <h2 className="text-lg font-black text-white">이메일을 확인해주세요</h2>
              <p className="text-sm text-slate-400">
                <strong className="text-white">{email}</strong>로 비밀번호 재설정 링크를 전송했습니다.
                링크는 1시간 후 만료됩니다.
              </p>
              {devToken && (
                <div className="bg-yellow-900/30 border border-yellow-700/40 rounded-xl p-3 text-xs text-yellow-300 text-left">
                  <p className="font-bold mb-1">🛠️ 개발 모드 토큰:</p>
                  <code className="break-all">{devToken}</code>
                  <p className="mt-1 opacity-70">실제 배포 시에는 이메일로 발송됩니다.</p>
                </div>
              )}
              <button
                onClick={() => { setSent(false); setEmail(''); setDevToken('') }}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                다른 이메일로 재시도
              </button>
            </div>
          )}
        </div>

        <div className="text-center space-y-2">
          <Link to="/login" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            ← 로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
