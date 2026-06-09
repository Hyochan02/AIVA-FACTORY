import React from 'react'
import { Button } from '../common/Button'

interface SubscribePlanModalProps {
  planId: string
  billing: 'monthly' | 'yearly'
  error?: string
  isPending: boolean
  onConfirm: () => void
  onClose: () => void
}

export const SubscribePlanModal: React.FC<SubscribePlanModalProps> = ({
  planId,
  error,
  isPending,
  onConfirm,
  onClose,
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-8 max-w-sm w-full space-y-5 shadow-2xl">
      <div>
        <h2 className="text-xl font-black text-white">
          {planId === 'pro' ? 'Pro' : 'Enterprise'} 플랜 시작
        </h2>
        <p className="text-sm text-slate-400 mt-1">결제 정보를 입력하세요.</p>
      </div>

      <div className="space-y-3">
        {['카드 번호', '만료일', 'CVV'].map((l) => (
          <div key={l}>
            <label className="block text-xs font-bold text-slate-300 mb-1">{l}</label>
            <input
              className="w-full bg-[#080c2a] border border-(--border-color) rounded-sm px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder={l === '카드 번호' ? '1234 5678 9012 3456' : l === '만료일' ? 'MM / YY' : '•••'}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="bg-amber-900/30 border border-amber-700/40 rounded-xl p-3 text-xs text-amber-300">
        🛠️ 결제 모듈 (Toss Payments) 연동 준비 중입니다. 지금은 테스트 구독이 적용됩니다.
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" fullWidth onClick={onClose} disabled={isPending}>취소</Button>
        <Button variant="primary" fullWidth loading={isPending} onClick={onConfirm}>구독하기</Button>
      </div>

      <p className="text-[10px] text-slate-600 text-center">SSL 암호화로 안전하게 보호됩니다</p>
    </div>
  </div>
)
