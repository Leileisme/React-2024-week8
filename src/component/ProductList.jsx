import { useNavigate } from "react-router"
import { useDispatch, useSelector } from 'react-redux'
import { showDangerToast,showErrorToast,showSuccessToast } from "../utils/toastUtils"
import { setCartQty,setCart,setCartItemsQty,setIsLoading } from "../slice/cartReducer"
import axios from "axios"

const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH

const ProductList = (props) =>{
  const productDetail = useSelector(state=> state.cart.productDetail)
  const cartQty = useSelector(state=> state.cart.cartQty)
  const cartItemsQty = useSelector(state=> state.cart.cartItemsQty)

  const dispatch = useDispatch()
  const {
    productsList
  } = props
  const navigate = useNavigate()

  // 進入產品詳情
  const handleClickProduct = (productId) => {
    // 使用 navigate 進行路由跳轉
    navigate(`/product/${productId}`)
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
return(
<>
  <div>
    {/* 桌面版 Table */}
    <div className="d-none d-lg-block">
      <table className="table m">
        <thead>
          <tr>
            <th scope="col">圖片</th>
            <th scope="col">商品名稱</th>
            <th scope="col">分類</th>
            <th scope="col">價格</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {productsList.map((product) => (
            <tr key={product.id}>
              <td className="align-content-center">
                <img src={product.imageUrl} alt="" className="product-list-img" />
              </td>
              <td className="align-content-center">
                <h3 className="h6">{product.title}</h3>
              </td>
              <td className="align-content-center">{product.category}</td>
              <td className="align-content-center">
                <span className="h5 text-danger">$ {product.price}</span>
                <br />
                <del className="text-secondary">$ {product.origin_price}</del>
              </td>
              <td className="align-content-center">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleClickProduct(product.id)}
                  >查看詳情</button>

                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => handleAddCartItem(product.id, false)}
                  >加入購物車</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* 手機版 Card List */}
    <div className="d-block d-lg-none">
      {productsList.map((product) => (
        <div key={product.id} className="card mb-3">
          <div className="row g-0">
            <div className="col-3 align-items-center">
              <img src={product.imageUrl} alt="" className=" rounded-start product-list-md-img" />
            </div>
            <div className="col-6">
              <div className="card-body">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text">
                  <small className="text-muted">{product.category}</small>
                </p>
                <p className="card-text">
                  <span className="h5 text-danger me-3">$ {product.price}</span>
                  <del className="text-secondary">$ {product.origin_price}</del>
                </p>

              </div>
            </div>
            <div className="col-3">
              <div className="d-flex gap-2 flex-column  card-body">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary flex-grow-1"
                onClick={() => handleClickProduct(product.id)}
              >查看詳情</button>

              <button
                type="button"
                className="btn btn-sm btn-primary flex-grow-1"
                onClick={() => handleAddCartItem(product.id, false)}
              >加入購物車</button>
            </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

</>
)}

export default ProductList