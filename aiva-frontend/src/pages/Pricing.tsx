import { Check, X } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { getPlans, getCurrentSubscription, subscribePlan } from '../api/subscriptions'
import type { Plan } from '../api/subscriptions'
import { useAuth } from '../context/AuthContext'

// 플랜별 미보유 기능 (UI 전용)
const PLAN_MISSING: Record<string, string[]> = {
  free:       ['WAV/스템 다운로드', '상업적 이용', '무제한 생성', '우선 처리'],
  pro:        ['무제한 API 접근'],
  enterprise: [],
}
const PLAN_BADGES: Record<string, string | null> = {
  free: null, pro: '가장 인기', enterprise: null,
}
const PLAN_CTA: Record<string, string> = {
  free: '현재 플랜', pro: 'Pro 시작하기', enterprise: '문의하기',
}

const Pricing: React.FC = () => {
  const navigate           = useNavigate()
  const { user, refreshUser } = useAuth()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [plans, setPlans]     = useState<Plan[]>([])
  const [currentPlan, setCurrentPlan] = useState<string>(user?.plan ?? 'free')
  const [plansLoading, setPlansLoading] = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [subscribing, setSubscribing]   = useState(false)
  const [subError, setSubError]         = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, subRes] = await Promise.all([
          getPlans() as Promise<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
          user ? getCurrentSubscription() as Promise<any> : Promise.resolve(null), // eslint-disable-line @typescript-eslint/no-explicit-any
        ])
        if (plansRes.data) setPlans(plansRes.data)
        if (subRes?.data?.plan) setCurrentPlan(subRes.data.plan)
      } catch { /* 기본값 유지 */ }
      finally { setPlansLoading(false) }
    }
    load()
  }, [user])

  const handleSelect = (planId: string) => {
    if (planId === 'free' || planId === currentPlan) return
    if (planId === 'enterprise') { window.open('mailto:hello@aiva-factory.com'); return }
    if (!user) { navigate('/login'); return }
    setSelectedPlan(planId)
    setSubError('')
    setShowModal(true)
  }

  const handleSubscribe = async () => {
    setSubscribing(true)
    setSubError('')
    try {
      await subscribePlan({ planId: selectedPlan, billing })
      await refreshUser()
      setCurrentPlan(selectedPlan)
      setShowModal(false)
      navigate('/dashboard')
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setSubError(e?.response?.data?.error ?? '구독 처리 중 오류가 발생했습니다.')
    } finally {
      setSubscribing(false)
    }
  }

  const getCtaVariant = (planId: string): 'primary' | 'secondary' | 'ghost' => {
    if (planId === currentPlan) return 'ghost'
    if (planId === 'pro') return 'primary'
    return 'secondary'
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-white mb-2">심플한 요금제</h1>
        <p className="text-slate-400">처음엔 무료로, 필요할 때 업그레이드하세요.</p>
        <div className="inline-flex items-center gap-3 mt-6 bg-[#0d1340] border border-(--border-color) rounded-full p-1">
          {(['monthly','yearly'] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${billing === b ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
              {b === 'monthly' ? '월간' : '연간'}{b === 'yearly' && <span className="ml-1.5 text-xs text-indigo-300">-20%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* 플랜 카드 */}
      {plansLoading ? (
        <div className="grid md:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-80 bg-[#0d1340] border border-(--border-color) rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map(plan => (
            <div key={plan.id} className={`bg-[#0d1340] border rounded-2xl p-6 flex flex-col relative ${plan.id === 'pro' ? 'border-indigo-500/50 shadow-lg shadow-indigo-900/30' : 'border-(--border-color)'}`}>
              {PLAN_BADGES[plan.id] && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="new">{PLAN_BADGES[plan.id]}</Badge>
                </div>
              )}
              {plan.id === currentPlan && (
                <div className="absolute top-3 right-3">
                  <Badge variant="success">현재 플랜</Badge>
                </div>
              )}
              <div className="mb-5">
                <div className="text-sm font-bold text-slate-400 mb-1">{plan.name}</div>
                <div className="text-4xl font-black text-white">
                  {plan.price[billing] === 0 ? '무료' : `₩${plan.price[billing].toLocaleString()}`}
                  {plan.price[billing] > 0 && <span className="text-sm font-normal text-slate-400 ml-1">/ 월</span>}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {plan.credits === -1 ? '무제한 크레딧' : `${plan.credits} 크레딧 / 월`}
                </div>
              </div>
              <div className="flex-1 space-y-2 mb-6">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check size={14} className="text-indigo-500" strokeWidth={2.5} />
                    {f}
                  </div>
                ))}
                {(PLAN_MISSING[plan.id] ?? []).map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <X size={14} strokeWidth={2} />
                    {f}
                  </div>
                ))}
              </div>
              <Button
                variant={getCtaVariant(plan.id)}
                fullWidth
                disabled={plan.id === currentPlan}
                onClick={() => handleSelect(plan.id)}
              >
                {plan.id === currentPlan ? '현재 플랜' : PLAN_CTA[plan.id] ?? '시작하기'}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* 비교표 */}
      <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-(--border-color)">
          <h2 className="font-bold text-white">상세 비교</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-color)">
                <th className="p-4 text-left text-slate-400 font-medium">기능</th>
                <th className="p-4 text-center font-bold text-white">Free</th>
                <th className="p-4 text-center font-bold text-white">Pro</th>
                <th className="p-4 text-center font-bold text-white">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['크레딧', '100', '500', '무제한'],
                ['MP3 다운로드', '✓','✓','✓'],
                ['WAV 다운로드', '✗','✓','✓'],
                ['스템 다운로드', '✗','✓','✓'],
                ['상업적 이용', '✗','✓','✓'],
                ['API 접근', '✗','✗','✓'],
              ].map(([label,...vals]) => (
                <tr key={label} className="border-b border-(--border-color) last:border-0 hover:bg-navy-800/20 transition-colors">
                  <td className="p-4 text-slate-400">{label}</td>
                  {vals.map((v, i) => (
                    <td key={i} className={`p-4 text-center font-semibold ${v === '✓' ? 'text-indigo-400' : v === '✗' ? 'text-slate-600' : 'text-white'}`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 결제 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-8 max-w-sm w-full space-y-5 shadow-2xl">
            <div>
              <h2 className="text-xl font-black text-white">{selectedPlan === 'pro' ? 'Pro' : 'Enterprise'} 플랜 시작</h2>
              <p className="text-sm text-slate-400 mt-1">결제 정보를 입력하세요.</p>
            </div>
            <div className="space-y-3">
              {['카드 번호', '만료일', 'CVV'].map(l => (
                <div key={l}>
                  <label className="block text-xs font-bold text-slate-300 mb-1">{l}</label>
                  <input className="w-full bg-[#080c2a] border border-(--border-color) rounded-sm px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder={l === '카드 번호' ? '1234 5678 9012 3456' : l === '만료일' ? 'MM / YY' : '•••'} />
                </div>
              ))}
            </div>
            {subError && <p className="text-sm text-red-400">{subError}</p>}
            <div className="bg-amber-900/30 border border-amber-700/40 rounded-xl p-3 text-xs text-amber-300">
              🛠️ 결제 모듈 (Toss Payments) 연동 준비 중입니다. 지금은 테스트 구독이 적용됩니다.
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" fullWidth onClick={() => setShowModal(false)} disabled={subscribing}>취소</Button>
              <Button variant="primary" fullWidth loading={subscribing} onClick={handleSubscribe}>구독하기</Button>
            </div>
            <p className="text-[10px] text-slate-600 text-center">SSL 암호화로 안전하게 보호됩니다</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pricing
