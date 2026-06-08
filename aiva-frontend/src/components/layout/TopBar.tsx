import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Coins, Bell, Plus } from 'lucide-react'
import { Button } from '../common/Button'
import { useAuth } from '../../context/AuthContext'

interface TopBarProps {
  title?: string
}

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const credits = user?.credits ?? 0
  const initial = (user?.name ?? 'U')[0].toUpperCase()

  return (
    <header
      className="fixed top-0 right-0 flex items-center gap-4 px-6 bg-[var(--color-bg-elev)]/80 backdrop-blur-md border-b border-(--border-color) z-10"
      style={{ left: 'var(--sidebar-w)', height: 'var(--topbar-h)' }}
    >
      {title && (
        <h1 className="text-base font-bold text-[var(--color-text)]">{title}</h1>
      )}

      <div className="ml-auto flex items-center gap-3">
        {/* 크레딧 */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-indigo-900/30 border border-indigo-700/30">
          <Coins size={14} className="text-indigo-400" />
          <span className="text-xs font-bold text-indigo-300">{credits} 크레딧</span>
        </div>

        {/* 알림 */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-sm hover:bg-navy-700/60 transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full" />
        </button>

        {/* 음악 생성 바로가기 */}
        <Button variant="primary" size="sm" onClick={() => navigate('/create')}>
          <Plus size={14} />
          생성하기
        </Button>

        {/* 아바타 */}
        <button
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-900/50 hover:opacity-80 transition-opacity"
        >
          {initial}
        </button>
      </div>
    </header>
  )
}

export default TopBar
