import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'

// ──────────────────────────────────────────────────────────
// Best Practice: 네비게이션 항목을 데이터로 분리
// → 추가/제거 시 JSX를 건드리지 않아도 됨 (데이터 주도 렌더링)
// ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    section: '메뉴',
    items: [
      {
        key: 'dashboard',
        label: '대시보드',
        path: '/dashboard',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12L12 4l9 8"/><path d="M5 10v10h14V10"/>
          </svg>
        ),
      },
      {
        key: 'create',
        label: '음악 생성',
        path: '/create',
        badge: 'NEW',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>
          </svg>
        ),
      },
      {
        key: 'library',
        label: '내 라이브러리',
        path: '/library',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
        ),
      },
      {
        key: 'editor',
        label: '에디터',
        path: '/editor',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12h2M8 8h2M12 4h2M16 8h2M20 12h-2M8 16h2M12 20h2M16 16h2"/>
          </svg>
        ),
      },
      {
        key: 'explore',
        label: '탐색',
        path: '/explore',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6z"/>
          </svg>
        ),
      },
    ],
  },
  {
    section: '계정',
    items: [
      {
        key: 'pricing',
        label: '요금제',
        path: '/pricing',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        ),
      },
      {
        key: 'profile',
        label: '프로필',
        path: '/profile',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
          </svg>
        ),
      },
    ],
  },
]

// NavLink activeClassName → Tailwind 클래스를 콜백으로 적용
const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all duration-150',
    isActive
      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30'
      : 'text-[var(--color-text-muted)] hover:bg-navy-700/60 hover:text-[var(--color-text)]',
  ].join(' ')

export const Sidebar: React.FC = () => {
  const navigate = useNavigate()

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
        {/* 로고 마크 */}
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

      {/* 업그레이드 CTA */}
      <div className="p-3 border-t border-(--border-color)">
        <div className="rounded-[14px] p-4 bg-linear-to-br from-navy-700 to-indigo-900/60 border border-indigo-700/30">
          <div className="text-sm font-bold text-[var(--color-text)] mb-1">Pro로 업그레이드</div>
          <div className="text-xs text-[var(--color-text-muted)] mb-3">무제한 생성과 고품질 다운로드</div>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => navigate('/pricing')}
          >
            업그레이드
          </Button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
