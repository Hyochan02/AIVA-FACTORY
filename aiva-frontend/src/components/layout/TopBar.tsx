import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../common/Button'

interface TopBarProps {
  title?: string
}

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const navigate = useNavigate()

  return (
    <header
      className="fixed top-0 right-0 flex items-center gap-4 px-6 bg-[var(--color-bg-elev)]/80 backdrop-blur-md border-b border-(--border-color) z-10"
      style={{
        left: 'var(--sidebar-w)',
        height: 'var(--topbar-h)',
      }}
    >
      {title && (
        <h1 className="text-base font-bold text-[var(--color-text)]">{title}</h1>
      )}

      <div className="ml-auto flex items-center gap-3">
        {/* 크레딧 표시 */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-indigo-900/30 border border-indigo-700/30">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
            <circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>
          </svg>
          <span className="text-xs font-bold text-indigo-300">100 크레딧</span>
        </div>

        {/* 알림 */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-sm hover:bg-navy-700/60 transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full" />
        </button>

        {/* 음악 생성 바로가기 */}
        <Button variant="primary" size="sm" onClick={() => navigate('/create')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>
          </svg>
          생성하기
        </Button>

        {/* 아바타 */}
        <button className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-900/50">
          J
        </button>
      </div>
    </header>
  )
}

export default TopBar
