import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/auth/Login.jsx'
import CDashboard from './pages/customer/Dashboard.jsx'
import CAccount from './pages/customer/Account.jsx'
import CTransactions from './pages/customer/Transactions.jsx'
import Transfer from './pages/customer/Transfer.jsx'
import Profile from './pages/customer/Profile.jsx'
import ADashboard from './pages/admin/Dashboard.jsx'
import Customers from './pages/admin/Customers.jsx'
import AAccounts from './pages/admin/Accounts.jsx'
import Failed from './pages/admin/Failed.jsx'
import Reports from './pages/admin/Reports.jsx'

function Guard({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />
  return children
}
function Guest({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to={`/${user.role}/dashboard`} replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Guest><Login /></Guest>} />

      <Route path="/customer" element={<Guard role="customer"><Layout role="customer" /></Guard>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CDashboard />} />
        <Route path="account" element={<CAccount />} />
        <Route path="transactions" element={<CTransactions />} />
        <Route path="transfer" element={<Transfer />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/admin" element={<Guard role="admin"><Layout role="admin" /></Guard>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ADashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="account" element={<AAccounts />} />
        <Route path="failed" element={<Failed />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
