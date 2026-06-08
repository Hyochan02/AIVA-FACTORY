import React from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

// ──────────────────────────────────────────────────────────
// Best Practice: Layout 컴포넌트를 분리하여 페이지 컴포넌트가
// 레이아웃 관심사를 몰라도 되도록 설계 (Separation of Concerns)
// ──────────────────────────────────────────────────────────
interface AppLayoutProps {
  children: React.ReactNode
  title?: string
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <TopBar title={title} />

      <main
        className="min-h-screen"
        style={{
          paddingLeft: 'var(--sidebar-w)',
          paddingTop: 'var(--topbar-h)',
        }}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AppLayout
