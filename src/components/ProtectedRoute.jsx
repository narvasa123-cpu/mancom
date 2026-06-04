import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'

export function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-600">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-100 border-t-red-700" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return <Outlet />
}
