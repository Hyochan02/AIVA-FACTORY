import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Sparkles, Library, SlidersHorizontal,
  Compass, CreditCard, User, LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'

const NAV_ITEMS = [
  {
    section: '메뉴',
    items: [
      { key: 'dashboard', label: '대시보드',    path: '/dashboard', icon: <LayoutDashboard   size={18} /> },
      { key: 'create',    label: '음악 생성',   path: '/create',    icon: <Sparkles          size={18} />, badge: 'NEW' },
      { key: 'library',   label: '내 라이브러리', path: '/library',  icon: <Library           size={18} /> },
      { key: 'editor',    label: '에디터',       path: '/editor',   icon: <SlidersHorizontal size={18} /> },
      { key: 'explore',   label: '탐색',         path: '/explore',  icon: <Compass           size={18} /> },
    ],
  },
  {
    section: '계정',
    items: [
      { key: 'pricing', label: '요금제', path: '/pricing', icon: <CreditCard size={18} /> },
      { key: 'profile', label: '프로필', path: '/profile', icon: <User       size={18} /> },
    ],
  },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all duration-150',
    isActive
      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30'
      : 'text-[var(--color-text-muted)] hover:bg-navy-700/60 hover:text-[var(--color-text)]',
  ].join(' ')

export const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col bg-[var(--color-bg-elev)] border-r border-(--border-color)"
      style={{ width: 'var(--sidebar-w)' }}
      aria-label="주요 메뉴"
    >
      {/* 로고 */}
      <NavLink
        to="/dashboard"
        className="flex items-center gap-2.5 px-5 py-4 font-black text-lg text-[var(--color-text)] border-b border-(--border-color)"
        style={{ height: 'var(--topbar-h)' }}
      >
        <span className="w-8 h-8 rounded-sm bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-900/50">
          A
        </span>
        <span>AIVA FACTORY</span>
      </NavLink>

      {/* 네비게이션 */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6">
        {NAV_ITEMS.map(({ section, items }) => (
          <div key={section}>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-subtle)]">
              {section}
            </div>
            <div className="flex flex-col gap-0.5">
              {items.map(({ key, label, path, icon, badge }) => (
                <NavLink key={key} to={path} className={navLinkClass}>
                  {icon}
                  <span className="flex-1">{label}</span>
                  {badge && <Badge variant="new">{badge}</Badge>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* 사용자 정보 + 로그아웃 */}
      <div className="px-3 py-2 border-t border-(--border-color) flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white truncate">{user?.name ?? '사용자'}</div>
          <div className="text-[10px] text-slate-500 truncate">{user?.email ?? ''}</div>
        </div>
        <button
          onClick={logout}
          title="로그아웃"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-900/20 transition-all shrink-0"
          aria-label="로그아웃"
        >
          <LogOut size={14} />
        </button>
      </div>

      {/* 업그레이드 CTA */}
      <div className="p-3 border-t border-(--border-color)">
        <div className="rounded-[14px] p-4 bg-linear-to-br from-navy-700 to-indigo-900/60 border border-indigo-700/30">
          <div className="text-sm font-bold text-[var(--color-text)] mb-1">Pro로 업그레이드</div>
          <div className="text-xs text-[var(--color-text-muted)] mb-3">무제한 생성과 고품질 다운로드</div>
          <Button variant="primary" size="sm" fullWidth onClick={() => navigate('/pricing')}>
            업그레이드
          </Button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
