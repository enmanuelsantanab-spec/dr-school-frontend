import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LandingPage from './pages/LandingPage'
import DashboardLayout from './layouts/DashboardLayout'
import Overview from './pages/Overview'
import Students from './pages/Students'
import Staff from './pages/Staff'
import Payments from './pages/Payments'
import Enrollments from './pages/Enrollments'
import Sections from './pages/Sections'
import CreateUser from './pages/CreateUser'
import Subjects from './pages/Subjects'
import Overdue from './pages/Overdue'
import Payroll from './pages/Payroll'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Cargando...</div>
  if (!user) return <Navigate to="/" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Overview />} />
        <Route path="students" element={<Students />} />
        <Route path="staff" element={<Staff />} />
        <Route path="payments" element={<Payments />} />
        <Route path="enrollments" element={<Enrollments />} />
        <Route path="sections" element={<Sections />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="overdue" element={<Overdue />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="create-user" element={<CreateUser />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  )
}
