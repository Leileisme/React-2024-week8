import axios from "axios"
import { useDispatch } from "react-redux"
import { Link, Outlet, useNavigate } from "react-router"
import { NavLink } from "react-router"
import { ToastContainer } from 'react-toastify'
import { setIsLogin } from "./slice/stateReducer"
import { showDangerToast, showErrorToast, showSuccessToast } from "./utils/toastUtils"
import ReactLoading from 'react-loading'
import { useSelector } from "react-redux"




const api = import.meta.env.VITE_BASE_URL

const AdminLayout = () => { 
  const isLoading = useSelector((state) => state.cart.isLoading)

  const navigate = useNavigate()
  const routes = [
    {
      path:'/admin/product',
      name:'產品管理'
    },
    {
      path:'/admin/order',
      name:'訂單管理'
    },
    {
      path:'/admin/coupon',
      name:'優惠券管理'
    }
  ]
  const dispatch = useDispatch()

  async function handleLogout() {
    try {
      await axios.post(`${api}/v2/logout`)
      delete axios.defaults.headers.common.Authorization
      dispatch(setIsLogin(false))
      showSuccessToast('登出成功')

      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (error) {
      console.error('登出錯誤', error)
      showDangerToast('登出失敗')
    }
  }

  return(<>
  <header className="fixed-top bg-white">
    <nav className="navbar navbar-expand bg-body-tertiary p-2">
      <div className="container-fluid">
        <Link className="navbar-brand" to='/admin'>控制台</Link>
        <div className="collapse navbar-collapse d-flex justify-content-between" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-0">
            {
              routes.map((route) => (
                <li className="nav-item" key={route.path}>
                    <NavLink className={({isActive})=> isActive ? 'nav-link active set-nav-active ' : 'nav-link'} aria-current="page" to={route.path} >{route.name}</NavLink>
                </li>
              ))
            }
          </ul>
          <ul className="navbar-nav  mb-0">
            <li className="nav-item">
            <NavLink className="btn btn-outline-secondary"  aria-current="page"  onClick={handleLogout}>登出</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
  
  <div className="m-3 mt-0">
    <Outlet />
  </div>

  <ToastContainer />


    {
      isLoading &&
      <div className="loading-contain d-flex justify-content-center align-items-center">
        <ReactLoading type={'cylon'} color={'#0d6efd'} height={120} width={100} />
      </div>
    }
  </>)
}

export default AdminLayout