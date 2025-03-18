import { Outlet } from "react-router"
import { NavLink } from "react-router"
import { ToastContainer } from 'react-toastify'
import ReactLoading from 'react-loading'
import { useSelector } from "react-redux"
import { useEffect, useRef } from "react"
import * as bootstrap from "bootstrap"




const FrontLayout = () => {
  const isLoading = useSelector((state) => state.cart.isLoading)
  useEffect(()=>{
    console.log(isLoading)
  })
  const routes = [
    {
      path:'/',
      name:'首頁'
    },
    {
      path:'/about',
      name:'關於'
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

  const navCollapseRef = useRef(null) // 參考 nav 折疊區域
  const toggleButtonRef = useRef(null) // 參考折疊按鈕

  // 使用 useRef 初始化 Bootstrap Collapse
  const toggleNav = () => {
    const bsCollapse = new bootstrap.Collapse(navCollapseRef.current, {
      toggle: true
    })
    bsCollapse.toggle() // 切換顯示狀態
  }

  return(<>
  <header className="fixed-top bg-white">
    {/* <nav className="navbar navbar-expand-lg bg-body-tertiary p-2">
      <div className="container-fluid">
        <a className="navbar-brand">有型眼鏡</a>
        <div className="collapse navbar-collapse just" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {
              routes.map((route) => (
                <li className="nav-item" key={route.path}>
                    <NavLink 
                      className={({isActive})=> isActive ? 'nav-link active set-nav-active ' : 'nav-link'}  aria-current="page" to={route.path} >{route.name}</NavLink>
                </li>
              ))
            }
          </ul>
          <ul className="navbar-nav  mb-0">
            <li className="nav-item">
            <NavLink className="btn btn-outline-secondary"  aria-current="page" to={'/login'} >登入管理員</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav> */}


<nav className="navbar navbar-expand-lg bg-body-tertiary p-2">
      <div className="container-fluid">
        <a className="navbar-brand">有型眼鏡</a>
        
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
                      isActive ? 'nav-link active set-nav-active' : 'nav-link'}  
                    aria-current="page" 
                    to={route.path}
                  >
                    {route.name}
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

  <footer className="bg-dark text-white text-center py-3 mt-5">
    <div className="container">
      <p className="mb-2 mt-3">© {new Date().getFullYear()} 有型眼鏡 | All Rights Reserved</p>
      <p className="mb-2">聯絡我們: contact@glassesstore.com</p>
      <p className="mb-0 text-secondary mb-2">@copyright leilei hus 2025.03</p>
    </div>
  </footer>

  <ToastContainer />
  </>)
}

export default FrontLayout