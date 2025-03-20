import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import { showSuccessToast,showDangerToast,showErrorToast } from '../../utils/toastUtils'

import { useDispatch, useSelector } from 'react-redux'
import { setCartQty, setIsLoading, setCart, setCartItemsQty } from '../../slice/cartReducer'
import ProductCard from '../../component/ProductCard'
import ProductList from '../../component/ProductList'

const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH

const ProductDetail = () => {
  const dispatch = useDispatch()
  const { cartQty, cartItemsQty } = useSelector((state) => state.cart)
  const [productDetail,setProductDetail] = useState({})
  const [productsList,setProductsList]=useState([]) // 產品列表




  // 減少商品數量 btn 
  function handleReduceCartQty(cart,formCart){
    if(formCart){
      const _itemQty =  cartItemsQty.filter((item)=> item.id === cart.product_id)
      if((_itemQty[0].qty - 1) <= 0){
        showDangerToast('最低數量是1喔！')
      }else{
        editCartItem(cart.id, cart.product_id ,_itemQty[0].qty-1)
      }
    }else{
      dispatch(setCartQty(Number(cartQty > 2 ? cartQty - 1 : 1)))
      if((cartQty-1) <= 0 ){
        showDangerToast('最低數量是1喔！')
      }
    }
  }

  // 編輯購物車 單獨產品數量
  const editCartItem = (async (cart_id,product_id,qty) => {
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
  },[dispatch,getCart])

  // 增加商品數量 btn 
  function handleAddCartQty(cart,formCart,productDetail){
    if(formCart){
      const _itemQty =  cartItemsQty.filter((item)=> item.id === cart.product_id)
      if((_itemQty[0].qty + 1) > cart.product.stockQty ){
        showDangerToast(`庫存只剩${cart.product.stockQty}喔！`)
      }else{
        editCartItem(cart.id, cart.product_id ,_itemQty[0].qty+1)
      }
    }else{
      dispatch(setCartQty(Number(cartQty < productDetail.stockQty ? cartQty + 1 : productDetail.stockQty)))
      if((cartQty+1) > productDetail.stockQty ){
        showDangerToast(`庫存只剩${productDetail.stockQty}喔！`)
      }
    }
  }

  // 取得購物車列表
  const getCart = useCallback(async ()  => {
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
  },[dispatch,editCartItem])

  // 監聽輸入數量
  function handleCartQtyInputOnChange(e,cart,formCart){
    const val = e.target.value

    if(formCart){
      dispatch(
        setCartItemsQty ((pre)=>
          pre.map((item) => item.id === cart.product_id ? {...item, qty: val} : item)
        )
      )
    }else{
      dispatch(setCartQty(val))
    }
  }

  // 監聽 產品詳情中數量 去焦點時驗證數量
  function handleCartQtyInputOnBlur(e,cart,formCart,productDetail) {
    const val = Number(e.target.value)
    if(isNaN(val) || val <1 ){
      showDangerToast('只能輸入大於0的數字喔！')
      formCart ? getCart() : dispatch(setCartQty(1))
      return
    }

    const maxQty = formCart ? cart.product.stockQty : productDetail.stockQty

    if(val > maxQty){
      showDangerToast(`庫存只剩${maxQty}`)
      formCart ? getCart() : dispatch(setCartQty(productDetail.stockQty))
      return
    }

    if (formCart){
      editCartItem(cart.id,cart.product_id,val)
    } else {
      dispatch(setCartQty(val))
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

  const {id} = useParams()

  useEffect(()=>{
    if(id){
      getProductDetail(id)
    }
  },[id])

  useEffect(()=>{
    if (productDetail.category) {
      getProductsList(productDetail.category)
    }
  },[productDetail,getProductsList])


  // 取得購物車
  useEffect(() => {
    getCart()
  }, [getCart])

  // 取得單一產品
  async function getProductDetail(id) {
    try {
      const res = await axios.get(`${api}/v2/api/${path}/product/${id}`) 
      const product = res.data.product
      const imgsIsFalsy = product?.imagesUrl.every(img=> img === "")
      const imgsUrl =  [product.imageUrl,...(!imgsIsFalsy ? product.imagesUrl : [])]
      setProductDetail({
        ...product,
        imagesUrl:imgsUrl
      })

    } catch (error) {
      console.log(error)
    }
  }

  // 取的產品列表
  const getProductsList =(async (category) => {
    dispatch(setIsLoading(true))
    try {
      const res = await axios.get(`${api}/v2/api/${path}/products?&category=${category}`)
      const upDated = res.data.products.filter((item)=> item.id !== productDetail.id)
      setProductsList(upDated)
      
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    } finally {
      dispatch(setIsLoading(false))
      
    }
  },[dispatch])
  
  return(
    <>
      <div className="container outline-margin">
        <div className="row">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/">首頁</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/product">商城</Link>

                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {productDetail.title}
                </li>
              </ul>
            </nav>
          </div>

          <div className="col-12 product-modal-container ">
            <div className="mb-5">
              <h1 className="mb-3 h3">{productDetail.title}</h1>
              <div className="row ">
                <div className="col-12 d-flex justify-content-between " >
                  <div className="product-modal-secondary-img-container">
                    {Array.isArray(productDetail.imagesUrl) && productDetail?.imagesUrl.map((img)=>(
                      <div key={img} className="mb-2">
                        <img 
                          src={img}
                          alt="副圖"
                          className="product-modal-secondary-img"
                          onClick={()=>{
                            setProductDetail({
                              ...productDetail,
                              imageUrl:img
                            })
                          }}
                        />
                      </div>
                    ))}
                  </div>
                    <img src={productDetail.imageUrl} alt="主圖" className="product-modal-primary-img" />
                </div>
                </div>
                <div className="col-12 mt-2 d-flex align-items-center">
                  <span className="text-secondary">價格：</span>
                  <span className="text-danger me-2 fs-3">${productDetail.price}</span>
                  <del className="text-secondary fs-6">${productDetail.origin_price}</del>
                </div>
                <div className="col-12 mt-2 d-flex align-items-center">
                  <span className="text-secondary">數量：</span>
                  <span className="text-danger me-2 d-flex align-items-center ">
                    <button 
                      type="button"
                      className={`btn btn-sm btn-outline-primary`}
                      onClick={()=> handleReduceCartQty(null,null)}
                    >-</button>
                    <input
                      type="text"
                      className="form-control cart-number-input text-center "
                      value={cartQty}
                      onChange={handleCartQtyInputOnChange} 
                      onBlur={(e)=>{handleCartQtyInputOnBlur(e,null,null,productDetail)}}
                    />
                    <button
                      type="button"
                      className={`btn btn-sm btn-outline-primary`}
                      onClick={()=>handleAddCartQty(null,null,productDetail)}
                    >+</button>
                  </span>
                  <span className="text-secondary fs-6">剩下{productDetail.stockQty }個</span>
                </div>
                <div className="col-12 mt-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary w-100"
                    onClick={()=>handleAddCartItem(productDetail.id,true) }>
                    加入購物車
                  </button>
                </div>
                <div className="col-12 mt-3">
                  <h5 className="h6 text-p">產品描述：</h5>
                  <p className="text-secondary">{productDetail.description}</p>
                  <h5 className="h6">商品說明：</h5>
                  <p className="text-secondary pre-line">{productDetail.content}</p>
                </div>
            </div>
          </div>

          <div className="col-12">
            <div className="mt-3 mb-3">
              <h5>更多推薦</h5>
              {
                productsList.length >0
                ?
                <ProductCard
                  productsList={productsList}
                  handleAddCartItem={handleAddCartItem}
                  getProductsList={getProductsList}
                />
                :
                <p className="mt-3 text-secondary">沒有相似的商品QQ</p>
              }
            </div>
          </div>
        </div>
        





      </div>
    </>
)}

export default ProductDetail
