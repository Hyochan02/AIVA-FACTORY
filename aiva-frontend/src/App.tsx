import React, { useEffect, type ReactNode } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './stores/authStore'
import { AppLayout } from './components/layout/AppLayout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
})

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
const Pitch          = React.lazy(() => import('./pages/Pitch'))
const Profile        = React.lazy(() => import('./pages/Profile'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#080c2a]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-[12px] bg-linear-to-br from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black animate-pulse">A</div>
      <div className="text-sm text-slate-400">로딩 중...</div>
    </div>
  </div>
)

// createBrowserRouter(data router)에서 인증 초기화 — useBlocker 사용을 위해 필요
const AuthInitWrapper: React.FC = () => {
  const init = useAuthStore((s) => s.init)
  useEffect(() => { init() }, [init])
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Outlet />
    </React.Suspense>
  )
}

const PrivateRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const user    = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

const router = createBrowserRouter([
  {
    element: <AuthInitWrapper />,
    children: [
      { path: '/',                element: <Landing /> },
      { path: '/login',           element: <Login /> },
      { path: '/signup',          element: <Signup /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password',  element: <ResetPassword /> },
      { path: '/pricing',         element: <AppLayout title="요금제"><Pricing /></AppLayout> },
      { path: '/pitch',           element: <Pitch /> },
      { path: '/dashboard',       element: <PrivateRoute><AppLayout title="대시보드"><Dashboard /></AppLayout></PrivateRoute> },
      { path: '/create',          element: <PrivateRoute><AppLayout title="음악 생성"><Create /></AppLayout></PrivateRoute> },
      { path: '/generating',      element: <PrivateRoute><AppLayout title="생성 중"><Generating /></AppLayout></PrivateRoute> },
      { path: '/editor/:trackId', element: <PrivateRoute><AppLayout title="에디터"><Editor /></AppLayout></PrivateRoute> },
      { path: '/editor',          element: <PrivateRoute><AppLayout title="에디터"><Editor /></AppLayout></PrivateRoute> },
      { path: '/library',         element: <PrivateRoute><AppLayout title="내 라이브러리"><Library /></AppLayout></PrivateRoute> },
      { path: '/player/:id',      element: <PrivateRoute><AppLayout title="플레이어"><Player /></AppLayout></PrivateRoute> },
      { path: '/player',          element: <PrivateRoute><AppLayout title="플레이어"><Player /></AppLayout></PrivateRoute> },
      { path: '/explore',         element: <PrivateRoute><AppLayout title="탐색"><Explore /></AppLayout></PrivateRoute> },
      { path: '/profile',         element: <PrivateRoute><AppLayout title="프로필 & 설정"><Profile /></AppLayout></PrivateRoute> },
      { path: '*',                element: <Navigate to="/" replace /> },
    ],
  },
])

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
