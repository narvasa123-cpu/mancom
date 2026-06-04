import {
  Bell,
  CalendarDays,
  FilePlus2,
  Files,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/authContext'
import { roles } from '../data/mockData'
import { cn } from '../lib/utils'

const menuItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'File Repository', to: '/files', icon: Files },
  { label: 'Upload Files', to: '/upload', icon: FilePlus2, roles: [roles.ADMIN, roles.SECRETARY] },
  { label: 'Categories', to: '/categories', icon: FolderTree, roles: [roles.ADMIN, roles.SECRETARY] },
  { label: 'Activity Calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Activity Logs', to: '/logs', icon: ScrollText, roles: [roles.ADMIN, roles.SECRETARY] },
  { label: 'Users', to: '/users', icon: Users, roles: [roles.ADMIN] },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export function Layout({ data }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const unreadCount = data.notifications.filter((item) => item.status === 'Unread').length

  const visibleItems = menuItems.filter((item) => !item.roles || item.roles.includes(user.role))

  async function handleLogout() {
    data.addActivity('Logout', `${user.fullname || user.email} signed out.`, user.id)
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-red-950 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-white/30">
            <img src="/logo.jpg" alt="IBA College of Mindanao logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-100">MANCOM</p>
            <p className="text-lg font-bold leading-tight">Secretary Files</p>
          </div>
          <button className="ml-auto rounded-lg p-2 text-red-100 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-50 transition hover:bg-red-800/80',
                  isActive && 'bg-red-600 text-white shadow-lg shadow-red-950/30',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-600 font-bold">
                {(user.fullname || user.email).slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.fullname || user.email}</p>
                <p className="truncate text-xs text-red-100">{user.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && <button className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu backdrop" />}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
          <div className="flex min-h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button className="rounded-xl border border-slate-200 p-2 text-slate-700 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="hidden h-14 w-14 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-red-100 sm:grid">
                <img src="/logo.jpg" alt="IBA College of Mindanao logo" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold text-slate-950 sm:text-2xl">MANCOM Secretary File System</h1>
                <p className="truncate text-sm text-slate-500">Welcome back, {user.fullname || user.email}. Secure government document management console.</p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setNotificationsOpen((open) => !open)}
                className="relative rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm transition hover:border-red-200 hover:text-red-700"
                aria-label="Open notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">{unreadCount}</span>}
              </button>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="font-semibold">Notifications</p>
                    <p className="text-xs text-slate-500">New files, updates, and important documents</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {data.notifications.map((item) => (
                      <div key={item.id} className="border-b border-slate-100 px-4 py-3 last:border-0">
                        <div className="flex items-start gap-3">
                          <span className={cn('mt-1 h-2 w-2 rounded-full', item.status === 'Unread' ? 'bg-red-600' : 'bg-slate-300')} />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                            <p className="text-sm text-slate-500">{item.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {data.loading && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
              Loading real Supabase data...
            </div>
          )}
          {data.error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">
              Real Supabase data could not be loaded: {data.error}
            </div>
          )}
          {user?.missingProfile && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              Your Supabase auth account is missing a matching public.users profile. Ask an administrator to create the profile row so role-based access works correctly.
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
