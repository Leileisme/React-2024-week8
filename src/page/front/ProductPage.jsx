import { useEffect, useRef, useState } from 'react'
import { Modal,Offcanvas}  from 'bootstrap'
import { showSuccessToast,showDangerToast,showErrorToast } from '../../utils/toastUtils'
import { useParams, useNavigate } from 'react-router'
import Pagination from '../../component/Pagination'
import ProductList from '../../component/ProductList'
import ProductCard from '../../component/ProductCard'
import ProductModalDetail from '../../component/ProductModalDetail'
import axios from 'axios'
import { getCart, editCartItem, addCartItem, setCartQty, setProductDetail,setIsLoading } from '../../slice/cartReducer';
import { useDispatch, useSelector } from 'react-redux'



const BASE_URL = import.meta.env.VITE_BASE_URL
const PATH = import.meta.env.VITE_API_PATH



const ProductPage = () => {
  const [productsList,setProductsList]=useState([]) // 產品列表
  const [pagination,setPagination] = useState({}) // 產品列表分頁資訊
  const [isList, setIsList] = useState(true) // 判斷產品List/Card
  // const [cart,setCart] = useState({}) // 購物車
  // const [productDetail,setProductDetail] = useState({})
  // const [cartQty,setCartQty] = useState(1) // 加入購物車 單獨商品
  // const [cartItemsQty,setCartItemsQty] = useState([{
  //   id:'',
  //   qty:1
  // }]) // 加入購物車 多獨商品

  const [formCart,setFormCart] = useState(true) // 是否購物車表單
  const [toPay,setToPay] = useState(true) // 是否「去買單」
  // const [isLoading,setIsLoading] = useState(false)

  const offcanvasCartRef = useRef(null) // 購物車 Offcanvas DOM
  const addOffcanvasCartRef = useRef(null) // 購物車 new Offcanvas 的方法
  const productDetailRef = useRef(null) // 商品詳情 Modal DOM
  const addProductDetailRef = useRef(null) // 商品詳情 new Modal 的方法
  const productCategory = ['所有商品','經典眼鏡','太陽眼鏡','細框眼鏡','兒童眼鏡','配件']

  const dispatch = useDispatch();
  const { cart, productDetail, cartQty, cartItemsQty, isLoading } = useSelector((state) => state.cart)

    // 新增商品到購物車
    const handleAddCartItem = (productId, qty) => {
      dispatch(addCartItem({ productId, qty }));
    };

  // const {id} = useParams()
  // const navigate = useNavigate()

  // useEffect(()=>{
  //   if(id){
  //     getProductDetail(id)
  //   }
  // },[id])

  // // 取得單一產品
  // async function getProductDetail(id) {
  //   try {
  //     const res = await axios.get(`${BASE_URL}/v2/api/${PATH}/product/${id}`) 
  //     const product = res.data.product
  //     const imgsIsFalsy = product?.imagesUrl.every(img=> img === "")
  //     const imgsUrl =  [product.imageUrl,...(!imgsIsFalsy ? product.imagesUrl : [])]
  //     setProductDetail({
  //       ...product,
  //       imagesUrl:imgsUrl
  //     })

  //   } catch (error) {
  //     console.log(error)
      
  //   }
  // }

    // // 監聽打開 產品細節
    // function handleClickProductModal(product){
    //   getProductDetail(product.id)
    //   addProductDetailRef.current = new Modal(productDetailRef.current)
    //   addProductDetailRef.current.show()
    // }
  

  // 取的產品列表
  async function getProductsList(page = 1,category=null) {
    // setIsLoading(true)
    dispatch(setIsLoading(true))
    try {
      const res = await axios.get(
        category 
        ? `${BASE_URL}/v2/api/${PATH}/products?page=${page}&category=${category}` 
        : `${BASE_URL}/v2/api/${PATH}/products?page=${page}`
      )
      setProductsList(res.data.products)
      setPagination(res.data.pagination)
      
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    } finally {
      dispatch(setIsLoading(false))
      
    }
  }

  // 加入購物車
  async function addCartItem(product_id,qty) {
    // setIsLoading(true)
    dispatch(setIsLoading(true))
    try {
      await axios.post(`${BASE_URL}/v2/api/${PATH}/cart`, {
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
      // setIsLoading(false)
      dispatch(setIsLoading(false))

    }
  }

  // 編輯購物車 單獨產品數量
  // async function editCartItem(cart_id,product_id,qty) {
  //   setIsLoading(true)
  //   try {
  //     await axios.put(`${BASE_URL}/v2/api/${PATH}/cart/${cart_id}`,{data:{
  //       product_id,
  //       qty
  //     }})
      
  //     getCart()
  //   } catch (error) {
  //     showErrorToast(error?.response?.data?.message)
  //     setIsLoading(false)

  //   }
  // }

  useEffect(()=>{
    getProductsList()
    getCart()
  },[])

  // // 取得購物車列表
  // async function getCart() {
  //   setIsLoading(true)
  //   try {
  //     const res = await axios.get(`${BASE_URL}/v2/api/${PATH}/cart`)
  //     setCart(res.data.data)
  //     const _cart = res.data.data.carts.map((item)=>{
  //       if(item.qty > item.product.stockQty){
  //         showDangerToast(`商品${item.product.title}庫存不足，最多只能購買${item.product.stockQty}個`)
  //         item.qty = item.product.stockQty
  //         editCartItem(item.id,item.product_id,item.product.stockQty)
  //       }
  //       return item
  //     })

  //     setCartItemsQty(
  //       _cart.map(cart=>({
  //         id: cart.product_id,
  //         qty:cart.qty
  //       }))
  //     )
  //   } catch (error) {
  //     showErrorToast(error?.response?.data?.message)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }



  // // 減少商品數量 btn 
  // function handleReduceCartQty(cart,formCart){
  //   if(formCart){
  //     const _itemQty =  cartItemsQty.filter((item)=> item.id === cart.product_id)
  //     if((_itemQty[0].qty - 1) <= 0){
  //       showDangerToast('最低數量是1喔！')
  //     }else{
  //       editCartItem(cart.id, cart.product_id ,_itemQty[0].qty-1)
  //     }

  //   }else{
  //     setCartQty(Number(cartQty > 2 ? cartQty - 1 : 1))
  //     if((cartQty-1) <= 0 ){
  //       showDangerToast('最低數量是1喔！')
  //     }
  //   }
  // }

  // // 增加商品數量 btn 
  // function handleAddCartQty(cart,formCart,productDetail){
  //   if(formCart){
  //     const _itemQty =  cartItemsQty.filter((item)=> item.id === cart.product_id)
  //     if((_itemQty[0].qty + 1) > cart.product.stockQty ){
  //       showDangerToast(`庫存只剩${cart.product.stockQty}喔！`)
  //     }else{
  //       editCartItem(cart.id, cart.product_id ,_itemQty[0].qty+1)
  //     }
  //   }else{
  //     setCartQty(Number(cartQty < productDetail.stockQty ? cartQty + 1 : productDetail.stockQty))
  //     if((cartQty+1) > productDetail.stockQty ){
  //       showDangerToast(`庫存只剩${productDetail.stockQty}喔！`)
  //     }
  //   }
  // }

  // // 監聽 產品詳情中數量
  // function handleCartQtyInputOnBlur(e,cart,formCart,productDetail) {
  //   const val = Number(e.target.value)
  //   if(isNaN(val) || val <1 ){
  //     showDangerToast('只能輸入大於0的數字喔！')
  //     formCart ? getCart() : setCartQty(1)
  //     return
  //   }

  //   const maxQty = formCart ? cart.product.stockQty : productDetail.stockQty

  //   if(val > maxQty){
  //     showDangerToast(`庫存只剩${maxQty}`)
  //     formCart ? getCart() : setCartQty(productDetail.stockQty)
  //     return
  //   }

  //   if (formCart){
  //     editCartItem(cart.id,cart.product_id,val)
  //   } else {
  //     setCartQty(val)
  //   }
  // }


  // // 監聽輸入數量
  // function handleCartQtyInputOnChange(e,cart,formCart){
  //   const val = e.target.value

  //   if(formCart){
  //     setCartItemsQty ((pre)=>
  //       pre.map((item) => item.id === cart.product_id ? {...item, qty: val} : item)
  //     )
  //   }else{
  //     setCartQty(val)
  //   }
  // }

  // // 監聽 產品詳情中 加入購物車
  // function handleAddCartItem(product_id,isDetail) {
  //   const _currentCart = cartItemsQty.filter(item => item.id === product_id)  
  //   if(_currentCart.length === 0) {
  //     addCartItem(product_id,Number(cartQty))
  //   } else {
  //     const _currentCartQty = _currentCart ? _currentCart[0].qty : 0
  //     const _maxQty = productDetail.stockQty

  //     let _purchaseQty = isDetail ? Number(cartQty) : 1
  //     const totalQty = _currentCartQty + _purchaseQty

  //     if(totalQty > _maxQty){
  //       _purchaseQty = _maxQty - _currentCartQty
  //       showDangerToast(`商品${productDetail.title}庫存不足，最多只能購買${_maxQty}個`)
  //     }

  //     if(_purchaseQty > 0){
  //       addCartItem(product_id,_purchaseQty)
  //     }
  //   }

  //   if(isDetail){
  //     addProductDetailRef.current.hide()
  //   }
  //   setCartQty(1)
  // }

  // 監聽商品換頁
  function handlePageClick(e,page){
    e.preventDefault()
    getProductsList(page)
  }

  // 監聽商品分類
  function handleCategoryClick(e,category){
    e.preventDefault()
    if(category === '所有商品'){
    getProductsList(1)
    }else{
      getProductsList(1,category)
    }
  }


  return(<>
    <div className="row">
      <aside className="col-2">
        <ul className="list-group">
          {
            productCategory.map((category)=>(
              <li className="list-group-item  aside-list"  key={category}>
                <a 
                  onClick={(e)=>handleCategoryClick(e,category)}
                  href="#"
                  className="text-decoration-none text-dark">
                  {category}
                </a>
              </li>
            ))
          }
        </ul>
      </aside>

      <div className="col-10">
        <div className="d-flex justify-content-between">
          <h1 className="h3">
            線上商城
          </h1>
          <div className="btn-group">
            <button 
              type="button" 
              className={`btn btn-outline-primary select-list-type ps-2 pe-2 ${isList ? "active" : ""} align-items-center d-flex`}
              style={{height:"25px",fontSize:"1rem"}}
              onClick={()=> setIsList(true)}
              >
              <i className="bi bi-justify" 
              ></i>
            </button>
            <button
              type="button"
              className={`btn btn-outline-primary select-list-type ps-2 pe-2 ${!isList ? "active" : ""} align-items-center d-flex`}
              style={{height:"25px",fontSize:"1rem"}}
              onClick={()=> setIsList(false)}>
              <i className="bi bi-grid"></i>
            </button>
          </div>
        </div>
        {
          isList 
          ?
          <ProductList
            productsList={productsList}
            handleAddCartItem={handleAddCartItem}
          />
          :
          <ProductCard
            productsList={productsList}
            handleAddCartItem={handleAddCartItem}
          />
        }
        {/* <ProductModalDetail
          productDetailRef={productDetailRef}
          productDetail={productDetail}
          setProductDetail={setProductDetail}
          handleReduceCartQty={handleReduceCartQty}
          cartQty={cartQty}
          handleCartQtyInputOnChange={handleCartQtyInputOnChange}
          handleCartQtyInputOnBlur={handleCartQtyInputOnBlur}
          handleAddCartQty={handleAddCartQty}
          handleAddCartItem={handleAddCartItem}
        /> */}
        <Pagination
          pagination={pagination}
          handlePageClick={handlePageClick}
        />
      </div>
    </div>
  </>)
}

export default ProductPage
