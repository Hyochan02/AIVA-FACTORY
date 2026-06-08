import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    credits: 100,
    badge: null,
    features: [
      '100 크레딧 / 월',
      'MP3 다운로드',
      '기본 에디터',
      '워터마크 포함',
      '커뮤니티 탐색',
    ],
    missing: ['WAV/스템 다운로드', '상업적 이용', '무제한 생성', '우선 처리'],
    cta: '현재 플랜',
    ctaVariant: 'secondary' as const,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 19000, yearly: 15000 },
    credits: 500,
    badge: '가장 인기',
    features: [
      '500 크레딧 / 월',
      'WAV · 24bit/48kHz',
      '스템 ZIP 다운로드',
      '워터마크 없음',
      '상업적 이용 가능',
      '고급 에디터',
      '우선 처리',
    ],
    missing: ['무제한 API 접근'],
    cta: 'Pro 시작하기',
    ctaVariant: 'primary' as const,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: { monthly: 79000, yearly: 65000 },
    credits: -1,
    badge: null,
    features: [
      '무제한 크레딧',
      '모든 Pro 기능',
      'API 무제한 접근',
      '팀 계정 (5인)',
      '전담 CS',
      'SLA 99.9%',
      '커스텀 모델',
    ],
    missing: [],
    cta: '문의하기',
    ctaVariant: 'secondary' as const,
  },
]

const Pricing: React.FC = () => {
  const navigate = useNavigate()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [showModal, setShowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')

  const handleSelect = (planId: string) => {
    if (planId === 'free') return
    setSelectedPlan(planId)
    setShowModal(true)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-white mb-2">심플한 요금제</h1>
        <p className="text-slate-400">처음엔 무료로, 필요할 때 업그레이드하세요.</p>

        {/* 빌링 토글 */}
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
      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map(plan => (
          <div key={plan.id} className={`bg-[#0d1340] border rounded-2xl p-6 flex flex-col relative ${plan.id === 'pro' ? 'border-indigo-500/50 shadow-lg shadow-indigo-900/30' : 'border-(--border-color)'}`}>
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="new">{plan.badge}</Badge>
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  {f}
                </div>
              ))}
              {plan.missing.map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  {f}
                </div>
              ))}
            </div>

            <Button variant={plan.ctaVariant} fullWidth onClick={() => handleSelect(plan.id)}>
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>

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
                {PLANS.map(p => <th key={p.id} className="p-4 text-center font-bold text-white">{p.name}</th>)}
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
                  <input className="w-full bg-[#080c2a] border border-(--border-color) rounded-sm px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors" placeholder={l === '카드 번호' ? '1234 5678 9012 3456' : l === '만료일' ? 'MM / YY' : '•••'} />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" fullWidth onClick={() => setShowModal(false)}>취소</Button>
              <Button variant="primary" fullWidth onClick={() => { setShowModal(false); navigate('/dashboard') }}>결제하기</Button>
            </div>
            <p className="text-[10px] text-slate-600 text-center">SSL 암호화로 안전하게 보호됩니다</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pricing
