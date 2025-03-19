
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { showSuccessToast, showErrorToast,showDangerToast } from '../../utils/toastUtils'
import { useDispatch, useSelector, } from 'react-redux' 
import { setIsLoading,setCartQty, setCart, setCartItemsQty} from '../../slice/cartReducer'
import { useNavigate } from 'react-router'



const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH

const HomePage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const productDetail = useSelector(state=> state.cart.productDetail)
  const cartQty = useSelector(state=> state.cart.cartQty)
  const cartItemsQty = useSelector(state=> state.cart.cartItemsQty)
  const [productsRandom,setProductsRandom]= useState([]) // 隨機產品3個

  // 取全部產品
  const getProductsList = useCallback(async()=> {
    dispatch(setIsLoading(true))
    try {
      const res = await axios.get(`${api}/v2/api/${path}/products/all`)

      // 隨機打亂順序做產品推薦
      const random = res.data.products.sort(()=>{
        return 0.5 - Math.random()
      })
      setProductsRandom(random.slice(0, 3))
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    } finally {
      dispatch(setIsLoading(false))
      
    }
  },[dispatch])

  // 進入產品詳情
  const handleClickProduct = (productId) => {
    // 使用 navigate 進行路由跳轉
    navigate(`/product/${productId}`)
  }

  // 監聽 產品詳情中 加入購物車
  function handleAddCartItem(product_id,isDetail) {
    const _currentCart = cartItemsQty.filter(item => item.id === product_id)  
    if(_currentCart.length === 0) {
      addCartItem(product_id,Number(cartQty))
    } else {
      const _currentCartQty = _currentCart ? _currentCart[0].qty : 0
      const _maxQty = productDetail.stockQty

      let _purchaseQty = isDetail ? Number(cartQty) : 1
      const totalQty = _currentCartQty + _purchaseQty

      if(totalQty > _maxQty){
        _purchaseQty = _maxQty - _currentCartQty
        showDangerToast(`商品${productDetail.title}庫存不足，最多只能購買${_maxQty}個`)
      }

      if(_purchaseQty > 0){
        addCartItem(product_id,_purchaseQty)
      }
    }
    dispatch(setCartQty(1))
  }

    // 加入購物車
    async function addCartItem(product_id,qty) {
      dispatch(setIsLoading(true))
      try {
        await axios.post(`${api}/v2/api/${path}/cart`, {
          data:{
            product_id,
            qty
          }
        })
        getCart()
        showSuccessToast('成功加入購物車')
      } catch (error) {
        showErrorToast(error?.response?.data?.message)
      } finally {
      dispatch(setIsLoading(false))
  
      }
    }

  // 取得購物車列表
  async function getCart() {
    dispatch(setIsLoading(true)) 
    try {
      const res = await axios.get(`${api}/v2/api/${path}/cart`)
      dispatch(setCart(res.data.data))
      const _cart = res.data.data.carts.map((item)=>{
        if(item.qty > item.product.stockQty){
          showDangerToast(`商品${item.product.title}庫存不足，最多只能購買${item.product.stockQty}個`)
          item.qty = item.product.stockQty
          editCartItem(item.id,item.product_id,item.product.stockQty)
        }
        return item
      })
      
      dispatch(
        setCartItemsQty(
          _cart.map(cart=>({
            id: cart.product_id,
            qty:cart.qty
          }))
        )
      )
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    } finally {
      dispatch(setIsLoading(false))
    }
  }

          // 編輯購物車 單獨產品數量
  async function editCartItem(cart_id,product_id,qty) {
    dispatch(setIsLoading(true))
    try {
      await axios.put(`${api}/v2/api/${path}/cart/${cart_id}`,{data:{
        product_id,
        qty
      }})
      
      getCart()
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
      dispatch(setIsLoading(false))

    }
  }

    


  useEffect(()=>{
    getProductsList()
  },[getProductsList])

  return(<>

    <section className="home-carousel">
      <img src="https://images.unsplash.com/photo-1577400983943-874919eca6ce?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="-" alt="眼鏡店首頁" />
      <div className="home-carousel-text">
        <p className="">
        來 有 型
        </p>
        <p className="ms-4">
        讓 您 有 型
        </p>
      </div>
    </section>

    <section className="container mt-3 mb-3">
      <div className="row">
        <div className="col-12 d-flex justify-content-center">
          <h2 className="mb-5 mt-3 h3">有  型  商 品</h2>
        </div>
        {
          productsRandom.length > 0 && productsRandom.map((product)=>(
            <div className="col-12 col-md-4 mb-4 " key={product.id}>
              <div 
                className="card product-card" 
                onClick={
                  ()=>handleClickProduct(product.id)
                }>
              <img src={product.imageUrl}  className="card-img-top product-card-img-home position-relative"  alt="商品主圖" />
              <div className="card-body product-car-body d-flex flex-column justify-content-between">
                <div>
                  <h5 className="card-title product-card-title h6">{product.title}</h5>
                </div>

                <div className="align-items-bottom">
                  <p className="card-text mb-2">
                    <span className="h4 text-danger">$ {product.price}</span>
                    <span className="text-secondary">／</span>
                    <del className="text-secondary">$ {product.origin_price}</del>
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary w-100"
                    onClick={(e)=>{
                      e.stopPropagation()
                      handleAddCartItem(product.id,false) }
                    }>
                    加入購物車
                  </button>
                </div>
              </div>
              </div>
              </div>
          ))
        }
        
      </div>
    </section>

    <section className="home-store mt-3 mb-5">
      <img src="https://images.unsplash.com/photo-1561823202-065ccdb3ae14?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="" alt="型眼鏡" />
      <div className="home-store-title">
        <h2 className="h3">有  型 門 市</h2>
      </div>

      <div className="home-store-text-box">

        <div className="home-store-text-box-border d-flex justify-content-center align-items-center">
          <p>
          我們顛覆了客人對「笨拙感眼鏡」的擔憂。<br/>
          每位客人都有最適合的眼鏡。<br/>
          我們會用盡全力，讓您成為您最愛的樣子。
          </p>
        </div>
      </div>
    </section>

    <section className="container mt-5 mb-3 fs-6">
      <div className="row">
        <div className="col-12 d-flex justify-content-center">
          <h2 className="h3 mb-5 mt-3">有  型  承 諾</h2>
        </div>

        <div className="col-12 col-lg-2 col-md-4 mb-5 d-flex justify-content-center align-items-center flex-column">
            <i className="bi bi-eye home-icon "></i>
            <div>最合適的度數</div>
        </div>

        <div className="col-12 col-lg-2 col-md-4 mb-5 d-flex justify-content-center align-items-center flex-column">
            <i className="bi bi-battery-full home-icon "></i>
            <div>最熱忱的服務</div>
        </div>

        <div className="col-12 col-lg-2 col-md-4 mb-5 d-flex justify-content-center align-items-center flex-column">
            <i className="bi bi-binoculars home-icon "></i>
            <div>所有鏡框「台灣設計」</div>
        </div>

        <div className="col-12 col-lg-2 col-md-4 mb-5 d-flex justify-content-center align-items-center flex-column">
            <i className="bi bi-emoji-smile home-icon "></i>
            <div>安心售後服務</div>
        </div>

        <div className="col-12 col-lg-2 col-md-4 mb-5 d-flex justify-content-center align-items-center flex-column">
            <i className="bi bi-eyeglasses home-icon "></i>
            <div>堅守台灣品質</div>
        </div>

        <div className="col-12 col-lg-2 col-md-4 mb-5 d-flex justify-content-center align-items-center flex-column">
            <i className="bi bi-hand-thumbs-up home-icon "></i>
            <div>只為您推薦，決不推銷</div>
        </div>
      </div>
    </section>
    
    <section className="home-imagery-container d-flex justify-content-center position-relative mt-5">
      <div className="w-75">
        <img src="https://images.unsplash.com/photo-1648071216843-0d304a6d49b2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="" alt="眼鏡店首頁" />
      </div>
      <div className="w-25">
        <div className="h-50">
          <img src="https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="" alt="眼鏡店首頁" />
        </div>
        <div className="h-50">
          <img src="https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="" alt="眼鏡店首頁" />
        </div>

        <div className="home-imagery-container-text d-flex justify-content-center flex-column text-white">
          <h2 className="h3 text-center">寵 物 友 善</h2>
          <div className="mt-2">歡 迎 帶 寵 物 一 同 前 來</div>
        </div>
      </div>
    </section>

  </>)
}

export default HomePage
