import axios from "axios"
import { useDispatch } from "react-redux"
import { Link, Outlet, useLocation, useNavigate } from "react-router"
import { NavLink } from "react-router"
import { ToastContainer } from 'react-toastify'
import { setIsLogin } from "./slice/stateReducer"
import { showDangerToast, showErrorToast, showSuccessToast } from "./utils/toastUtils"
import { useEffect } from "react"



const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH

const AdminLayout = () => { 
  const navigate = useNavigate()
  const location = useLocation()
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

  async function checkLogin(){
    try {
      await axios.post(`${api}/v2/api/user/check`)
      dispatch(setIsLogin(true))
    } catch (error) {
      // console.log(error)
      navigate('/login')
    }
  }

  useEffect(()=>{
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    if (token) {
      axios.defaults.headers.common.Authorization = token;
      checkLogin()
    } else {
      // console.log('Token not found);
      showDangerToast('Token not found')
      navigate('/login')
    }

  },[location.pathname])

  const dispatch = useDispatch()

  // 登出
  // function handleLogout(){
  //   try {
  //     // 設定 Cookie 過期來刪除 token
  //     document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  //     // 移除 Axios 預設的授權標頭
  //     delete axios.defaults.headers.common.Authorization
  //     // 更新 Redux 登入狀態（如果有使用 Redux）
  //     dispatch(setIsLogin(false))
  //     showSuccessToast('登出成功')

  //     setTimeout(()=>{
  //       navigate('/')
  //     },1000)
  //   } catch (error) {
  //     showDangerToast('登出失敗')
  //   }
    
  // }
  async function handleLogout() {
    try {
      // 調用 API 進行登出
      await axios.post(`${api}/v2/logout`)

      // 移除 Axios 預設的授權標頭
      delete axios.defaults.headers.common.Authorization

      // 更新 Redux 狀態
      dispatch(setIsLogin(false))

      // 顯示成功訊息
      showSuccessToast('登出成功')

      // 1 秒後跳轉到首頁
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
        <Link className="navbar-brand" to='/admin'>管理員控制台</Link>
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
  
  <div className="m-3">
    <Outlet />
  </div>

  <ToastContainer />
  </>)
}

export default AdminLayout