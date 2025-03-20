import { useForm } from 'react-hook-form'
import axios from "axios"
import { useCallback, useEffect, useRef, useState } from "react"
import { showSuccessToast,showDangerToast,showErrorToast } from '../../utils/toastUtils'
import { useDispatch, useSelector } from 'react-redux'
import { setCartQty, setCart, setCartItemsQty,setIsLoading } from '../../slice/cartReducer'

const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH


const CartPage = () =>{
  const dispatch = useDispatch()
  const cart = useSelector(state=> state.cart.cart)

  const cartQty = useSelector(state=> state.cart.cartQty)
  const cartItemsQty = useSelector(state=> state.cart.cartItemsQty)
  const [toPay,setToPay] = useState(false) // 是否「去買單」
  const formCart = true // 是否購物車表單
  const [couponCode, setCouponCode] = useState("") // 優惠碼
  const getCartRef = useRef(null) // ⭐️ 用 ref 存 getCart，避免依賴循環

  // 編輯購物車 單獨產品數量
  const editCartItem = useCallback( async(cart_id,product_id,qty) => {
    dispatch(setIsLoading(true))
    try {
      await axios.put(`${api}/v2/api/${path}/cart/${cart_id}`,{data:{
        product_id,
        qty
      }})
      
      // getCart()
      getCartRef.current() 
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    }finally{
      dispatch(setIsLoading(false))
    }
  },[dispatch])


  // 取得購物車列表
  const getCart = useCallback(async() =>  {
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




  useEffect(()=>{
    getCartRef.current = getCart
    getCart()
  },[getCart])

  

  // 購物車 的 商品們數量
  function getCartItemsQty(product){
    const currentItem = Array.isArray(cartItemsQty) ? cartItemsQty.find(it => it.id === product.product_id) : null
    return currentItem ? currentItem.qty : 1
  }

  

  // 監聽輸入數量
  function handleCartQtyInputOnChange(e,cart,formCart){
    const val = e.target.value

    if(formCart){
      const updatedCartItems = cartItemsQty.map((item) =>
        item.id === cart.product_id ? { ...item, qty: val } : item
      )
    
      dispatch(setCartItemsQty(updatedCartItems))
    }else{
      dispatch(setCartQty(val))
    }
  }

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
        dispatch(
          setCartQty(Number(cartQty < productDetail.stockQty ? cartQty + 1 : productDetail.stockQty))
        )
        if((cartQty+1) > productDetail.stockQty ){
          showDangerToast(`庫存只剩${productDetail.stockQty}喔！`)
        }
      }
    }

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
      dispatch(
        setCartQty(Number(cartQty > 2 ? cartQty - 1 : 1))
      )
      if((cartQty-1) <= 0 ){
        showDangerToast('最低數量是1喔！')
      }
    }
  }

  // 監聽 產品詳情中數量
  
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

  // 表單驗證
  const {
    register,
    handleSubmit,
    formState:{ errors },
    reset
  } = useForm({
    defaultValues:{
      email:'@gmail.com'
    },
    mode: "onChange"
  })

  const onSubmit = (data) => {
    const {message,...user} = data
    postOrder(user, message)
  }


  // 刪除購物車（全部）
  async function deleteCartAll() {
    dispatch(setIsLoading(true))
    try {
      await axios.delete(`${api}/v2/api/${path}/carts`)
      getCart()
      showSuccessToast('成功清除購物車！')
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    } finally {
      dispatch(setIsLoading(false))
    }
  }

  // 監聽清空購物車
  function handleDeleteCartAll(){
    deleteCartAll()
  }

  // 編輯購物車 單獨產品數量
  async function deleteCartItem(cart_id) {
    dispatch(setIsLoading(true))

    try {
      await axios.delete(`${api}/v2/api/${path}/cart/${cart_id}`)
      showSuccessToast('刪除產品成功')
      getCart()
      
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    } finally {
    dispatch(setIsLoading(false))
    }
  }

  // 送出訂單
  async function postOrder(user,message) {
    try {
      await axios.post(`${api}/v2/api/${path}/order`,{data:{
        user,
        message
      }})
      reset()
      getCart()
      setToPay(false)
      showSuccessToast('訂單成功送出')
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    }
  } 

  function handleCoupOnChange(e) {
    setCouponCode(e.target.value)
  }

  // 套用優惠券
  async function useCoupon() {
    dispatch(setIsLoading(true))
    try {
      const res = await axios.post(`${api}/v2/api/${path}/coupon`,{data:{
        code:couponCode
      }})

      showSuccessToast(res.data.message)
      setCouponCode("")
      getCart()  
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    } finally{
      dispatch(setIsLoading(false))
    }
  }


  return(<>
    <div className="container cart ">
      <div className='mb-3'>
        <h1 className="h3">購物車</h1>
      </div>

      <div className="row ">
        <div className="col-12">
          {toPay ? (
            <div>
              <div className="card">
                <div className="card-body">
                  <table className="table mb-5 table  cart-table-container" >
                    <thead>
                      <tr>
                        <th scope="col">商品名稱</th>
                        <th scope="col" >單價</th>
                        <th scope="col">數量</th>
                        <th scope="col" className="text-end">價格</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.carts?.map((item) => (
                        <tr key={item.product.id}>
                          <td className="align-content-center">
                            {item.product.title}
                          </td>
                          <td className="align-content-center" >
                            <div className="d-flex">
                              <span className="text-secondary">$ {item.product.price}</span>
                            </div>
                          </td>
                          <td className="align-content-center">
                            <span className="me-2 d-flex align-items-center ">
                              {getCartItemsQty(item)}
                              <span className="ms-1">{item.product.unit}</span>
                            </span>
                          </td>
                          <td className="align-content-center">
                            <div className="d-flex justify-content-end">
                              <span className="text-danger">$ {item.total}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td></td>
                        <td></td>
                        <td className="align-content-center">總價</td>
                        <td className="align-content-center">
                          <div className="d-flex justify-content-end text-danger fw-bold">
                            $ {cart?.total}
                          </div>
                        </td>
                      </tr>
                      {
                        cart.final_total !== cart.total &&
                        <tr>
                        <td></td>
                        <td></td>
                        <td className="align-content-center text-bg-danger">折扣後</td>
                        <td className="align-content-center text-bg-danger">
                          <div className="d-flex justify-content-end fw-bold">
                            $ {cart.final_total}
                          </div>
                        </td>
                      </tr>
                      }
                    </tbody>
                  </table>

                  <div className="mb-5 d-flex justify-content-end align-items-center">
                    <div className="text-secondary me-3">輸入「666」<br />限時8折</div>
                    <div className="form-floating me-3">
                      <input
                        type="text"
                        className="form-control me-3"
                        id="coupon"
                        placeholder="coupon"
                        value={couponCode}
                        onChange={handleCoupOnChange}
                      />
                      <label htmlFor="coupon">使用折扣碼</label>

                    </div>
                      <button type="button" className="btn btn-primary" onClick={useCoupon}> 確定</button>
                  </div>

                  <h5 className="card-title mb-2">訂購資訊</h5>
                  <div className="card-text">
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="row">
                        <div className="col-lg-6 col-12 mb-3">
                          <div className="form-floating">
                            <input
                              type="text"
                              className={`form-control ${errors['name'] && 'is-invalid'}`}
                              id="name"
                              placeholder="name"
                              {...register('name', {
                                required: '欄位必填',
                              })}
                            />
                            <span className="invalid-feedback">
                              {errors.name ? errors.name.message : ''}
                            </span>
                            <label htmlFor="name">訂購人姓名</label>
                          </div>
                        </div>

                        <div className="col-lg-6 col-12 mb-3">
                          <div className="form-floating">
                            <input
                              type="tel"
                              className={`form-control ${errors['tel'] && 'is-invalid'}`}
                              id="tel"
                              placeholder="tel"
                              {...register('tel', {
                                required: '欄位必填',
                                pattern: {
                                  value: /^[0-9]{10}$/,
                                  message: '請輸入有效的手機',
                                },
                              })}
                            />
                            <span className="invalid-feedback">
                              {errors.tel ? errors.tel.message : ''}
                            </span>
                            <label htmlFor="tel">訂購人手機</label>
                          </div>
                        </div>

                        <div className="col-12 mb-3">
                          <div className="form-floating">
                            <input
                              type="email"
                              className={`form-control ${errors['email'] && 'is-invalid'}`}
                              id="email"
                              placeholder="email"
                              {...register('email', {
                                required: '欄位必填',
                                pattern: {
                                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                  message: '請輸入有效的 email 格式',
                                },
                              })}
                            />
                            <span className="invalid-feedback">
                              {errors.email ? errors.email.message : ''}
                            </span>
                            <label htmlFor="email">訂購人email</label>
                          </div>
                        </div>

                        <div className="col-12 mb-3">
                          <div className="form-floating">
                            <input
                              type="text"
                              className={`form-control ${errors['address'] && 'is-invalid'}`}
                              id="address"
                              placeholder="address"
                              {...register('address', {
                                required: '欄位必填',
                              })}
                            />
                            <span className="invalid-feedback">
                              {errors.address ? errors.address.message : ''}
                            </span>
                            <label htmlFor="address">訂購人地址</label>
                          </div>
                        </div>

                        <div className="col-12 mb-3">
                          <div className="form-floating">
                            <textarea
                              type="text"
                              className={`form-control ${errors['message'] && 'is-invalid'}`}
                              style={{ height: '120px' }}
                              id="message"
                              placeholder="message"
                              {...register('message', {
                                maxLength: {
                                  value: 100,
                                  message: '字數不能超過100字',
                                },
                              })}
                            />
                            <span className="invalid-feedback">
                              {errors.message ? errors.message.message : ''}
                            </span>
                            <label htmlFor="message">
                              如有特殊需求，請這邊填寫（字數限制100字）
                            </label>
                          </div>
                        </div>

                        <div className="col-12">
                          <button
                            type="submit"
                            className={`btn btn-sm btn-primary w-100 mb-2 mt-2 ${
                              cart?.carts?.length === 0 ? 'disabled' : ''
                            }`}
                          >
                            送出訂單
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary w-100"
                            onClick={() => setToPay(false)}
                          >
                            返回商品編緝
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
            <div className="">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col"></th>
                    <th scope="col">商品名稱</th>
                    <th scope="col">數量</th>
                    <th scope="col">單價</th>
                    <th scope="col">庫存</th>
                    <th scope="col" className="text-end">
                      價格
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cart.carts?.map((item) => (
                    <tr key={item.product.id}>
                      
                      <td className="align-content-center ">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteCartItem(item.id)}
                        >
                          X
                        </button>
                      </td>
                      <td className="align-content-center">
                        {item.product.title}
                      </td>
                      <td className="align-content-center">
                        <span className="me-2 d-flex align-items-center ">
                          <button
                            type="button"
                            className={`btn btn-sm btn-outline-primary`}
                            onClick={() => handleReduceCartQty(item, formCart)}
                          >
                            -
                          </button>
                          <input
                            type="text"
                            className="form-control cart-number-input text-center "
                            value={getCartItemsQty(item)}
                            onChange={(e) => handleCartQtyInputOnChange(e, item, formCart)}
                            onBlur={(e) => {
                              handleCartQtyInputOnBlur(e, item, true, null);
                            }}
                          />
                          <button
                            type="button"
                            className={`btn btn-sm btn-outline-primary`}
                            onClick={() => handleAddCartQty(item, formCart)}
                          >
                            +
                          </button>
                          <span className="ms-1">{item.product.unit}</span>
                        </span>
                      </td>
                      <td className="align-content-center">
                        <div className="d-flex ">
                          <span className="text-secondary" >
                            $ {item.product.price}
                          </span>
                        </div>
                      </td>
                      <td className="align-content-center">
                        <span className="d-flex text-secondary" >
                          {item.product.stockQty}
                        </span>
                      </td>
                      <td className="align-content-center">
                        <div className="d-flex justify-content-end">
                          <span className="text-danger text-end">
                            $ {item.total}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="align-content-center">總價</td>
                    <td className="align-content-center">
                      <div className="d-flex justify-content-end text-danger fw-bold">
                        $ {cart?.total}
                      </div>
                    </td>
                  </tr>
                  
                </tbody>

                
              </table>

              <button
                type="button"
                className={`btn btn-sm btn-primary w-100 mb-2 mt-5 ${cart?.carts?.length === 0 ? 'disabled' : ''}`}
                onClick={() => setToPay(true)}
              >
                去買單
              </button>
              <button
                type="button"
                className={`btn btn-sm btn-danger w-100 ${cart?.carts?.length === 0 ? 'disabled' : ''}`}
                onClick={handleDeleteCartAll}
              >
                清空購物車
              </button>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
    

  </>)
}

export default CartPage
