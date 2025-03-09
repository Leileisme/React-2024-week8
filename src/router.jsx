import FrontLayout from './FrontLayout.jsx'
import AdminLayout from './AdminLayout.jsx'
import LoginPage from './page/LoginPage.jsx'
import HomePage from './page/front/HomePage.jsx'
import AboutPage from './page/front/AboutPage.jsx'
import ProductPage from './page/front/ProductPage.jsx'
import ProductDetail from './page/front/ProductDetail.jsx'
import CartPage from './page/front/CartPage.jsx'
import ProductManagement from './page/admin/ProductManagement.jsx'
import OrderManagement from './page/admin/OrderManagement.jsx'
import CouponManagement from './page/admin/CouponManagement.jsx'
import NotFoundPage from './page/NotFoundPage.jsx'
import AdminRoute from './component/AdminRoute.jsx'

const routes = [
  {
    path:'/',
    element: <FrontLayout />,
    children:[
      {
        path:'',
        element: <HomePage />
      },
      {
        path:'about',
        element:<AboutPage />
      },
      {
        path:'product',
        element:<ProductPage />
      },
      {
        path:'product/:id',
        element:<ProductDetail />
      },
      {
        path:'cart',
        element:<CartPage />
      },
    ]
  },{
    path:'/admin',
    element: <AdminRoute />,
    children:[
      {
        path:'product',
        element: <ProductManagement />
      },
      {
        path:'Order',
        element:<OrderManagement />
      },
      {
        path:'Coupon',
        element:<CouponManagement />
      },
    ]
  },
  {
    path:'/login',
    element:<LoginPage />
  },
  { path: '*', element: <NotFoundPage /> }
]

export default routes