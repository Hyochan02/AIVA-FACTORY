import { Check, X } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { useGetPlans } from '../hooks/queries/useGetPlans'
import { useGetCurrentSubscription } from '../hooks/queries/useGetCurrentSubscription'
import { useAuthStore } from '../stores/authStore'

const PLAN_MISSING: Record<string, string[]> = {
  free:       ['WAV/스템 다운로드', '상업적 이용', '무제한 생성', '우선 처리'],
  pro:        ['무제한 API 접근'],
  enterprise: [],
}
const PLAN_BADGES: Record<string, string | null> = {
  free: null, pro: '가장 인기', enterprise: null,
}

const Pricing: React.FC = () => {
  const user        = useAuthStore((s) => s.user)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  const { data: plans = [], isLoading: plansLoading } = useGetPlans()
  const { data: subData } = useGetCurrentSubscription(!!user)

  const currentPlan = subData?.plan ?? user?.plan ?? 'free'

  const getCtaVariant = (planId: string): 'primary' | 'secondary' | 'ghost' =>
    planId === currentPlan ? 'ghost' : planId === 'pro' ? 'primary' : 'secondary'

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-black text-white mb-2">심플한 요금제</h1>
        <p className="text-slate-400">처음엔 무료로, 필요할 때 업그레이드하세요.</p>

        {/* 준비 중 배너 */}
        <div className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 rounded-xl bg-amber-900/30 border border-amber-700/40 text-sm text-amber-300">
          <span>🚧</span>
          <span>유료 구독 서비스는 현재 준비 중입니다. 곧 만나보실 수 있어요!</span>
        </div>

        <div className="inline-flex items-center gap-3 mt-4 bg-[#0d1340] border border-(--border-color) rounded-full p-1">
          {(['monthly','yearly'] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${billing === b ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
              {b === 'monthly' ? '월간' : '연간'}{b === 'yearly' && <span className="ml-1.5 text-xs text-indigo-300">-20%</span>}
            </button>
          ))}
        </div>
      </div>

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
              {plan.id === currentPlan ? (
                <Button variant="ghost" fullWidth disabled>현재 플랜</Button>
              ) : plan.id === 'enterprise' ? (
                <Button variant="secondary" fullWidth onClick={() => window.open('mailto:hello@aiva-factory.com')}>
                  문의하기
                </Button>
              ) : (
                <Button variant={getCtaVariant(plan.id)} fullWidth disabled>
                  🚧 서비스 준비 중
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

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
    </div>
  )
}

export default Pricing
