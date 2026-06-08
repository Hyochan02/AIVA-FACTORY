import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// ── 레이아웃 ──
import { AppLayout } from './components/layout/AppLayout'

// ── 페이지 (React.lazy 코드 스플리팅 → 초기 번들 크기 최소화) ──
const Landing    = React.lazy(() => import('./pages/Landing'))
const Login      = React.lazy(() => import('./pages/Login'))
const Signup     = React.lazy(() => import('./pages/Signup'))
const Dashboard  = React.lazy(() => import('./pages/Dashboard'))
const Create     = React.lazy(() => import('./pages/Create'))
const Generating = React.lazy(() => import('./pages/Generating'))
const Editor     = React.lazy(() => import('./pages/Editor'))
const Library    = React.lazy(() => import('./pages/Library'))
const Player     = React.lazy(() => import('./pages/Player'))
const Explore    = React.lazy(() => import('./pages/Explore'))
const Pricing    = React.lazy(() => import('./pages/Pricing'))
const Profile    = React.lazy(() => import('./pages/Profile'))

// 로딩 폴백 UI
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#080c2a]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-[12px] bg-linear-to-br from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black animate-pulse">
        A
      </div>
      <div className="text-sm text-slate-400">로딩 중...</div>
    </div>
  </div>
)

// ──────────────────────────────────────────────────────────
// 라우트를 두 그룹으로 분리:
//   1) Public  - 사이드바/탑바 없음 (Landing, Login, Signup)
//   2) Private - AppLayout(사이드바+탑바) 포함
//
// Best Practice: 추후 인증 검사는 PrivateRoute 컴포넌트 한 곳에서
// 처리하면 되므로, 모든 보호 라우트가 자동으로 보호됩니다.
// ──────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public 라우트 */}
          <Route path="/"       element={<Landing />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* App 라우트 (AppLayout 래핑) */}
          <Route path="/dashboard"  element={<AppLayout title="대시보드"><Dashboard /></AppLayout>} />
          <Route path="/create"     element={<AppLayout title="음악 생성"><Create /></AppLayout>} />
          <Route path="/generating" element={<AppLayout title="생성 중"><Generating /></AppLayout>} />
          <Route path="/editor"     element={<AppLayout title="에디터"><Editor /></AppLayout>} />
          <Route path="/library"    element={<AppLayout title="내 라이브러리"><Library /></AppLayout>} />
          <Route path="/player/:id" element={<AppLayout title="플레이어"><Player /></AppLayout>} />
          <Route path="/player"     element={<AppLayout title="플레이어"><Player /></AppLayout>} />
          <Route path="/explore"    element={<AppLayout title="탐색"><Explore /></AppLayout>} />
          <Route path="/pricing"    element={<AppLayout title="요금제"><Pricing /></AppLayout>} />
          <Route path="/profile"    element={<AppLayout title="프로필 & 설정"><Profile /></AppLayout>} />

          {/* 404 → 랜딩으로 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  )
}

export default App
