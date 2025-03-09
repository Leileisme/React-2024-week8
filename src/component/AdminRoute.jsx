// src/components/AdminRoute.jsx
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'
import AdminLayout from '../AdminLayout'

const AdminRoute = () => {
  const isLogin = useSelector(state => state.state.isLogin)
  // return isLogin ? <AdminLayout /> : <Navigate to="/login" replace />
  return <AdminLayout /> 
}

export default AdminRoute
