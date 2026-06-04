import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthProvider'
import { roles } from './data/mockData'
import { useAppData } from './hooks/useAppData'
import { CalendarPage } from './pages/CalendarPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { Dashboard } from './pages/Dashboard'
import { FileDetails } from './pages/FileDetails'
import { FilesPage } from './pages/FilesPage'
import { Login } from './pages/Login'
import { LogsPage } from './pages/LogsPage'
import { SettingsPage } from './pages/SettingsPage'
import { UploadPage } from './pages/UploadPage'
import { UsersPage } from './pages/UsersPage'

function AppRoutes() {
  const data = useAppData()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout data={data} />}>
          <Route index element={<Dashboard data={data} />} />
          <Route path="files" element={<FilesPage data={data} />} />
          <Route path="files/:id" element={<FileDetails data={data} />} />
          <Route element={<ProtectedRoute allowedRoles={[roles.ADMIN, roles.SECRETARY]} />}>
            <Route path="upload" element={<UploadPage data={data} />} />
            <Route path="categories" element={<CategoriesPage data={data} />} />
            <Route path="logs" element={<LogsPage data={data} />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[roles.ADMIN]} />}>
            <Route path="users" element={<UsersPage data={data} />} />
          </Route>
          <Route path="calendar" element={<CalendarPage data={data} />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
