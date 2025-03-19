import { Outlet } from "react-router"
import { NavLink } from "react-router"
import { ToastContainer } from 'react-toastify'
import ReactLoading from 'react-loading'
import { useEffect, useRef } from "react"
import * as bootstrap from "bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { setIsLoading, setCart } from './slice/cartReducer'
import { showErrorToast } from './utils/toastUtils'
import axios from "axios"
import { useCallback } from "react"

const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH

const FrontLayout = () => {

  const routes = [
    {
      path:'/',
      name:'首頁'
    },
    {
      path:'/product',
      name:'線上商城'
    },
    {
      path:'/cart',
      name:'購物車'
    },
  ]
  const dispatch = useDispatch()
  const navCollapseRef = useRef(null) // 參考 nav 折疊區域
  const toggleButtonRef = useRef(null) // 參考折疊按鈕
  const cart = useSelector(state=> state.cart.cart)
  const isLoading = useSelector(state => state.cart.isLoading)

  // 漢堡
  const toggleNav = () => {
    toggleButtonRef.current = new bootstrap.Collapse(navCollapseRef.current)
  }

  function handleCloseNav() {
    if (toggleButtonRef.current) {
      toggleButtonRef.current.hide()
    }
  }

  // 取得購物車列表
  const getCart = useCallback(async () => {
    dispatch(setIsLoading(true)); // 需要 dispatch，不能直接用 setIsLoading
    try {
      const res = await axios.get(`${api}/v2/api/${path}/cart`);
      dispatch(setCart(res.data.data));
    } catch (error) {
      showErrorToast(error?.response?.data?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch])

  useEffect(()=>{
    getCart()
  },[getCart])
  

  return(<>
  <header className="fixed-top bg-white">
    <nav className="navbar navbar-expand-lg bg-body-tertiary p-2">
      <div className="container-fluid">
        <NavLink className="navbar-brand d-flex align-items-center" to={'/'}>
        <i class="bi bi-eyeglasses me-2 fs-1"></i>
        有型眼鏡
        </NavLink>
        
        {/* 折疊按鈕 */}
        <button 
          ref={toggleButtonRef}
          className="navbar-toggler" 
          type="button" 
          aria-controls="navbarSupportedContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
          onClick={toggleNav} // 手動觸發折疊
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div 
          ref={navCollapseRef}
          className="collapse navbar-collapse" 
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {
              routes.map((route) => (
                <li className="nav-item" key={route.path}>
                  <NavLink 
                    className={({ isActive }) => 
                      ` ${isActive ? 'active set-nav-active' : ''} position-relative nav-link`}
                    aria-current="page" 
                    to={route.path}
                    onClick={handleCloseNav}
                  >

                    { route.name === "購物車" 
                      ?
                      <div>
                        {/* <i className="bi bi-bag me-2"></i> */}
                        <span>{route.name}</span>
                          {
                            cart?.carts?.length > 0
                            ?
                            <span className="position-absolute top-10 start-100 translate-middle badge rounded-pill bg-danger">
                              { cart?.carts?.reduce((total, item)=> total+item.qty, 0) }
                              <span className="visually-hidden">購物車數量</span>
                            </span>
                            :
                            ""
                          }
                      </div>
                      
                      :

                      <span>{route.name}</span>
                    }
                  </NavLink>
                </li>
              ))
            }
          </ul>

          <ul className="navbar-nav mb-0">
            <li className="nav-item">
              <NavLink className="btn btn-outline-secondary" aria-current="page" to={'/login'} >
                登入管理員
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
  
  <main>
    <Outlet />
  </main>

  <footer className="footer-bg  text-secondary  text-center py-3">
    <div className="container">
      <p className="mb-2 mt-3">© {new Date().getFullYear()} 有型眼鏡 | All Rights Reserved</p>
      <p className="mb-2">聯絡我們: contact@glassesstore.com</p>
      <p className="mb-0 text-secondary mb-2">@copyright leilei hus 2025.03</p>
    </div>
  </footer>

  <ToastContainer />

  {
      isLoading &&
      <div className="loading-contain d-flex justify-content-center align-items-center">
        <ReactLoading type={'cylon'} color={'#0d6efd'} height={120} width={100} />
      </div>
    }
  </>)
}

export default FrontLayout