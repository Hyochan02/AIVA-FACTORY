import React, { type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppLayout } from './components/layout/AppLayout'

const Landing        = React.lazy(() => import('./pages/Landing'))
const Login          = React.lazy(() => import('./pages/Login'))
const Signup         = React.lazy(() => import('./pages/Signup'))
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'))
const ResetPassword  = React.lazy(() => import('./pages/ResetPassword'))
const Dashboard      = React.lazy(() => import('./pages/Dashboard'))
const Create         = React.lazy(() => import('./pages/Create'))
const Generating     = React.lazy(() => import('./pages/Generating'))
const Editor         = React.lazy(() => import('./pages/Editor'))
const Library        = React.lazy(() => import('./pages/Library'))
const Player         = React.lazy(() => import('./pages/Player'))
const Explore        = React.lazy(() => import('./pages/Explore'))
const Pricing        = React.lazy(() => import('./pages/Pricing'))
const Profile        = React.lazy(() => import('./pages/Profile'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#080c2a]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-[12px] bg-linear-to-br from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black animate-pulse">A</div>
      <div className="text-sm text-slate-400">로딩 중...</div>
    </div>
  </div>
)

const PrivateRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        {/* 퍼블릭 라우트 */}
        <Route path="/"                element={<Landing />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/signup"          element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
        <Route path="/pricing"         element={<AppLayout title="요금제"><Pricing /></AppLayout>} />

        {/* 프라이빗 라우트 */}
        <Route path="/dashboard" element={<PrivateRoute><AppLayout title="대시보드"><Dashboard /></AppLayout></PrivateRoute>} />
        <Route path="/create"    element={<PrivateRoute><AppLayout title="음악 생성"><Create /></AppLayout></PrivateRoute>} />
        <Route path="/generating" element={<PrivateRoute><AppLayout title="생성 중"><Generating /></AppLayout></PrivateRoute>} />
        <Route path="/editor/:trackId" element={<PrivateRoute><AppLayout title="에디터"><Editor /></AppLayout></PrivateRoute>} />
        <Route path="/editor"    element={<PrivateRoute><AppLayout title="에디터"><Editor /></AppLayout></PrivateRoute>} />
        <Route path="/library"   element={<PrivateRoute><AppLayout title="내 라이브러리"><Library /></AppLayout></PrivateRoute>} />
        <Route path="/player/:id" element={<PrivateRoute><AppLayout title="플레이어"><Player /></AppLayout></PrivateRoute>} />
        <Route path="/player"    element={<PrivateRoute><AppLayout title="플레이어"><Player /></AppLayout></PrivateRoute>} />
        <Route path="/explore"   element={<PrivateRoute><AppLayout title="탐색"><Explore /></AppLayout></PrivateRoute>} />
        <Route path="/profile"   element={<PrivateRoute><AppLayout title="프로필 & 설정"><Profile /></AppLayout></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
