import React, { useState } from 'react'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Toggle } from '../components/common/Toggle'

type Tab = 'account' | 'notification' | 'security' | 'subscription'

const TABS: { id: Tab; label: string }[] = [
  { id: 'account', label: '계정 정보' },
  { id: 'notification', label: '알림 설정' },
  { id: 'security', label: '보안' },
  { id: 'subscription', label: '구독 관리' },
]

const Profile: React.FC = () => {
  const [tab, setTab] = useState<Tab>('account')
  const [name, setName] = useState('진효찬')
  const [email] = useState('hyochan02@gmail.com')
  const [saved, setSaved] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 'gen',      label: '생성 완료 알림',  desc: '트랙 생성이 완료되면 알립니다',       on: true },
    { id: 'credit',   label: '크레딧 부족 알림', desc: '크레딧이 20개 미만이면 알립니다',     on: true },
    { id: 'like',     label: '커뮤니티 좋아요',  desc: '내 트랙에 좋아요가 달리면 알립니다', on: false },
    { id: 'follow',   label: '새 팔로워',        desc: '누군가 나를 팔로우하면 알립니다',     on: false },
    { id: 'marketing',label: '마케팅 이메일',    desc: 'AIVA의 새 기능 및 혜택 소식',        on: false },
  ])

  const toggleNotification = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, on: !n.on } : n))

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 프로필 헤더 */}
      <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-900/50">J</div>
          <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md hover:bg-indigo-700 transition-colors">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
        <div>
          <div className="font-bold text-white text-lg">{name}</div>
          <div className="text-sm text-slate-400">{email}</div>
          <Badge variant="info" className="mt-1">Free 플랜</Badge>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-black text-white">76</div>
          <div className="text-xs text-slate-400">남은 크레딧</div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-[#0d1340] border border-(--border-color) rounded-xl p-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${tab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 계정 정보 탭 */}
      {tab === 'account' && (
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-white">계정 정보</h2>
          {[
            { label: '이름', val: name, set: setName, type: 'text', editable: true },
            { label: '이메일', val: email, set: () => {}, type: 'email', editable: false },
            { label: '사용 용도', val: '개인 창작, 콘텐츠 제작', set: () => {}, type: 'text', editable: false },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">{f.label}</label>
              <input type={f.type} value={f.val} onChange={e => f.editable && f.set(e.target.value)} readOnly={!f.editable}
                className={`w-full rounded-[12px] px-4 py-2.5 text-sm text-white border focus:outline-none transition-colors ${f.editable ? 'bg-[#080c2a] border-(--border-color) focus:border-indigo-500' : 'bg-navy-900/50 border-transparent text-slate-400 cursor-default'}`}
              />
            </div>
          ))}
          <Button variant="primary" size="sm" loading={false} onClick={handleSave}>
            {saved ? '✓ 저장됨' : '변경사항 저장'}
          </Button>
        </div>
      )}

      {/* 알림 설정 탭 */}
      {tab === 'notification' && (
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-white">알림 설정</h2>
          {notifications.map(n => (
            <div key={n.id} className="flex items-center justify-between py-2 border-b border-(--border-color) last:border-0">
              <div>
                <div className="text-sm font-semibold text-white">{n.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{n.desc}</div>
              </div>
              <Toggle checked={n.on} onChange={() => toggleNotification(n.id)} />
            </div>
          ))}
        </div>
      )}

      {/* 보안 탭 */}
      {tab === 'security' && (
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-white">보안 설정</h2>
          <div className="space-y-3">
            {['현재 비밀번호','새 비밀번호','새 비밀번호 확인'].map(l => (
              <div key={l}>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">{l}</label>
                <input type="password" placeholder="••••••••"
                  className="w-full bg-[#080c2a] border border-(--border-color) rounded-[12px] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            ))}
            <Button variant="primary" size="sm">비밀번호 변경</Button>
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

      {/* 구독 탭 */}
      {tab === 'subscription' && (
        <div className="space-y-4">
          <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-white">현재 구독</h2>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#080c2a] border border-(--border-color)">
              <div>
                <div className="font-bold text-white">Free 플랜</div>
                <div className="text-xs text-slate-400 mt-0.5">월 100 크레딧 · 무료</div>
              </div>
              <Badge variant="success">활성</Badge>
            </div>
            <Button variant="primary" size="sm" fullWidth>Pro로 업그레이드</Button>
          </div>
          <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">크레딧 이용 내역</h3>
            {[
              { date: '2026-05-20', desc: 'Rainy Tokyo Night 생성', amount: -4 },
              { date: '2026-05-19', desc: 'Midnight Seoul 생성', amount: -4 },
              { date: '2026-05-01', desc: '월간 크레딧 충전', amount: +100 },
            ].map((h, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-(--border-color) last:border-0 text-sm">
                <div>
                  <div className="text-slate-300">{h.desc}</div>
                  <div className="text-xs text-slate-500">{h.date}</div>
                </div>
                <span className={`font-bold ${h.amount > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {h.amount > 0 ? '+' : ''}{h.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
