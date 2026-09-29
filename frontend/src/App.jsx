import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RoleSelect from './pages/RoleSelect'
import FarmerDashboard from './pages/FarmerDashboard'
import OfficerDashboard from './pages/OfficerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import SysAdminDashboard from './pages/SysAdminDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<RoleSelect />} />
        <Route path='/farmer' element={<FarmerDashboard />} />
        <Route path='/officer' element={<OfficerDashboard />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/sysadmin' element={<SysAdminDashboard />} />
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </BrowserRouter>
  )
}
