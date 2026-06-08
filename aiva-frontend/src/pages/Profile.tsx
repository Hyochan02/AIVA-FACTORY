import { Pencil } from 'lucide-react'
import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Toggle } from '../components/common/Toggle'
import { useAuth } from '../context/AuthContext'
import { updateMe, changePassword } from '../api/auth'
import { getNotificationSettings, updateNotificationSettings } from '../api/notifications'
import type { NotificationSettings } from '../api/notifications'
import { getCredits } from '../api/credits'
import { getCurrentSubscription } from '../api/subscriptions'

type Tab = 'account' | 'notification' | 'security' | 'subscription'

const TABS: { id: Tab; label: string }[] = [
  { id: 'account',      label: '계정 정보' },
  { id: 'notification', label: '알림 설정' },
  { id: 'security',     label: '보안' },
  { id: 'subscription', label: '구독 관리' },
]

const NOTIFICATION_META = [
  { id: 'gen'       as const, label: '생성 완료 알림',   desc: '트랙 생성이 완료되면 알립니다' },
  { id: 'credit'    as const, label: '크레딧 부족 알림',  desc: '크레딧이 20개 미만이면 알립니다' },
  { id: 'like'      as const, label: '커뮤니티 좋아요',   desc: '내 트랙에 좋아요가 달리면 알립니다' },
  { id: 'follow'    as const, label: '새 팔로워',         desc: '누군가 나를 팔로우하면 알립니다' },
  { id: 'marketing' as const, label: '마케팅 이메일',     desc: 'AIVA의 새 기능 및 혜택 소식' },
]

const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const navigate              = useNavigate()
  const [tab, setTab]         = useState<Tab>('account')

  // ── 계정 정보 ───────────────────────────────────────────
  const [name, setName]       = useState(user?.name ?? '')
  const [saving, setSaving]   = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user?.name) setName(user.name)
  }, [user?.name])

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      await updateMe({ name })
      await refreshUser()
      setSaveMsg('저장됨')
      setTimeout(() => setSaveMsg(''), 2000)
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  // ── 알림 설정 (API 연동) ────────────────────────────────
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    gen: true, credit: true, like: false, follow: false, marketing: false,
  })
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifMsg, setNotifMsg]         = useState('')

  const loadNotifications = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await getNotificationSettings() as any
      if (res.data) setNotifSettings(res.data)
    } catch { /* 기본값 유지 */ }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tab === 'notification') loadNotifications()
  }, [tab, loadNotifications])

  const handleToggleNotification = async (id: keyof NotificationSettings) => {
    const updated = { ...notifSettings, [id]: !notifSettings[id] }
    setNotifSettings(updated)
    setNotifLoading(true)
    try {
      await updateNotificationSettings({ [id]: updated[id] })
      setNotifMsg('저장됨')
      setTimeout(() => setNotifMsg(''), 1500)
    } catch {
      // 실패 시 롤백
      setNotifSettings(prev => ({ ...prev, [id]: !updated[id] }))
      setNotifMsg('저장 실패')
    } finally {
      setNotifLoading(false)
    }
  }

  // ── 비밀번호 변경 ────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg]         = useState('')
  const [pwError, setPwError]     = useState('')

  const handleChangePassword = async () => {
    setPwError(''); setPwMsg('')
    if (newPw !== confirmPw) { setPwError('새 비밀번호가 일치하지 않습니다.'); return }
    if (newPw.length < 8)   { setPwError('비밀번호는 8자 이상이어야 합니다.'); return }
    setPwLoading(true)
    try {
      await changePassword({ currentPassword: currentPw, newPassword: newPw })
      setPwMsg('비밀번호가 변경되었습니다.')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => setPwMsg(''), 3000)
    } catch (e) {
      setPwError(e instanceof Error ? e.message : '비밀번호 변경 실패')
    } finally {
      setPwLoading(false)
    }
  }

  // ── 구독 / 크레딧 (API 연동) ─────────────────────────────
  const [creditBalance, setCreditBalance]   = useState<number>(user?.credits ?? 0)
  const [monthlyGrant, setMonthlyGrant]     = useState<number>(100)
  const [subPeriodEnd, setSubPeriodEnd]     = useState<string | null>(null)
  const [subLoading, setSubLoading]         = useState(false)

  const loadSubscription = useCallback(async () => {
    setSubLoading(true)
    try {
      const [creditRes, subRes] = await Promise.all([
        getCredits() as Promise<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
        getCurrentSubscription() as Promise<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
      ])
      if (creditRes.data) {
        setCreditBalance(creditRes.data.balance ?? 0)
        setMonthlyGrant(creditRes.data.monthlyGrant ?? 100)
      }
      if (subRes.data?.currentPeriodEnd) {
        setSubPeriodEnd(new Date(subRes.data.currentPeriodEnd).toLocaleDateString('ko-KR'))
      }
    } catch { /* 기본값 유지 */ }
    finally { setSubLoading(false) }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tab === 'subscription') loadSubscription()
  }, [tab, loadSubscription])

  const planLabel = user?.plan === 'pro' ? 'Pro 플랜' : user?.plan === 'enterprise' ? 'Enterprise' : 'Free 플랜'
  const initial   = (user?.name ?? 'U')[0].toUpperCase()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── 프로필 헤더 ───────────────────────────────────── */}
      <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-900/50">
            {initial}
          </div>
          <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md hover:bg-indigo-700 transition-colors">
            <Pencil size={10} />
          </button>
        </div>
        <div>
          <div className="font-bold text-white text-lg">{user?.name ?? '불러오는 중...'}</div>
          <div className="text-sm text-slate-400">{user?.email ?? ''}</div>
          <Badge variant="info" className="mt-1">{planLabel}</Badge>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-black text-white">{creditBalance}</div>
          <div className="text-xs text-slate-400">남은 크레딧</div>
        </div>
      </div>

      {/* ── 탭 ───────────────────────────────────────────── */}
      <div className="flex gap-1 bg-[#0d1340] border border-(--border-color) rounded-xl p-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${tab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 계정 정보 탭 ─────────────────────────────────── */}
      {tab === 'account' && (
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-white">계정 정보</h2>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">이름</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-[#080c2a] border border-(--border-color) rounded-[12px] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">이메일</label>
            <input type="email" value={user?.email ?? ''} readOnly
              className="w-full bg-navy-900/50 border-transparent rounded-[12px] px-4 py-2.5 text-sm text-slate-400 cursor-default"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">플랜</label>
            <input type="text" value={planLabel} readOnly
              className="w-full bg-navy-900/50 border-transparent rounded-[12px] px-4 py-2.5 text-sm text-slate-400 cursor-default"
            />
          </div>
          {saveMsg && (
            <p className={`text-sm font-semibold ${saveMsg === '저장됨' ? 'text-emerald-400' : 'text-red-400'}`}>
              {saveMsg}
            </p>
          )}
          <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
            변경사항 저장
          </Button>
        </div>
      )}

      {/* ── 알림 설정 탭 (API 연동) ──────────────────────── */}
      {tab === 'notification' && (
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white">알림 설정</h2>
            {notifMsg && <span className={`text-xs font-semibold ${notifMsg === '저장됨' ? 'text-emerald-400' : 'text-red-400'}`}>{notifMsg}</span>}
          </div>
          {NOTIFICATION_META.map(n => (
            <div key={n.id} className="flex items-center justify-between py-2 border-b border-(--border-color) last:border-0">
              <div>
                <div className="text-sm font-semibold text-white">{n.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{n.desc}</div>
              </div>
              <Toggle
                checked={notifSettings[n.id]}
                onChange={() => handleToggleNotification(n.id)}
                disabled={notifLoading}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── 보안 탭 ──────────────────────────────────────── */}
      {tab === 'security' && (
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-white">보안 설정</h2>
          <div className="space-y-3">
            {[
              { label: '현재 비밀번호', val: currentPw, set: setCurrentPw },
              { label: '새 비밀번호',   val: newPw,    set: setNewPw      },
              { label: '새 비밀번호 확인', val: confirmPw, set: setConfirmPw },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">{f.label}</label>
                <input type="password" value={f.val} onChange={e => f.set(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#080c2a] border border-(--border-color) rounded-[12px] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            ))}
            {pwError && <p className="text-sm text-red-400">{pwError}</p>}
            {pwMsg   && <p className="text-sm text-emerald-400">{pwMsg}</p>}
            <Button variant="primary" size="sm" loading={pwLoading} onClick={handleChangePassword}>
              비밀번호 변경
            </Button>
          </div>
          <div className="pt-4 border-t border-(--border-color)">
            <h3 className="text-sm font-bold text-white mb-3">2단계 인증 (2FA)</h3>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">Google Authenticator 사용</div>
              <Button variant="secondary" size="sm">설정하기</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── 구독 탭 (API 연동) ───────────────────────────── */}
      {tab === 'subscription' && (
        <div className="space-y-4">
          <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-white">현재 구독</h2>
            {subLoading ? (
              <div className="h-12 bg-slate-800/50 rounded-xl animate-pulse" />
            ) : (
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#080c2a] border border-(--border-color)">
                <div>
                  <div className="font-bold text-white">{planLabel}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {user?.plan === 'free'
                      ? `월 ${monthlyGrant} 크레딧 · 무료`
                      : user?.plan === 'pro'
                        ? `월 ${monthlyGrant} 크레딧 · ₩19,000${subPeriodEnd ? ` · ${subPeriodEnd} 갱신` : ''}`
                        : `무제한 크레딧 · Enterprise${subPeriodEnd ? ` · ${subPeriodEnd} 갱신` : ''}`
                    }
                  </div>
                </div>
                <Badge variant="success">활성</Badge>
              </div>
            )}
            {user?.plan === 'free' && (
              <Button variant="primary" size="sm" fullWidth onClick={() => navigate('/pricing')}>
                Pro로 업그레이드
              </Button>
            )}
          </div>
          <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">크레딧 현황</h3>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">남은 크레딧</span>
              <span className="font-bold text-white">
                {creditBalance} / {monthlyGrant === -1 ? '∞' : monthlyGrant}
              </span>
            </div>
            {monthlyGrant !== -1 && (
              <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-indigo-600 to-violet-600 rounded-full transition-all"
                  style={{ width: `${Math.min((creditBalance / monthlyGrant) * 100, 100)}%` }}
                />
              </div>
            )}
            <p className="text-xs text-slate-500 mt-2">크레딧은 매월 1일 갱신됩니다.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
