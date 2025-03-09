import { showSuccessToast,showDangerToast,showErrorToast } from './utils/toastUtils'


// 監聽 產品詳情中 加入購物車
  export function handleAddCartItem(product_id,isDetail) {
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

    if(isDetail){
      addProductDetailRef.current.hide()
    }
    setCartQty(1)
  }


    // 監聽輸入數量
    export function handleCartQtyInputOnChange(e,cart,formCart){
      const val = e.target.value
  
      if(formCart){
        setCartItemsQty ((pre)=>
          pre.map((item) => item.id === cart.product_id ? {...item, qty: val} : item)
        )
      }else{
        setCartQty(val)
      }
    }
  
    // 監聽 產品詳情中數量
    export function handleCartQtyInputOnBlur(e,cart,formCart,productDetail) {
      const val = Number(e.target.value)
      if(isNaN(val) || val <1 ){
        showDangerToast('只能輸入大於0的數字喔！')
        formCart ? getCart() : setCartQty(1)
        return
      }
  
      const maxQty = formCart ? cart.product.stockQty : productDetail.stockQty
  
      if(val > maxQty){
        showDangerToast(`庫存只剩${maxQty}`)
        formCart ? getCart() : setCartQty(productDetail.stockQty)
        return
      }
  
      if (formCart){
        editCartItem(cart.id,cart.product_id,val)
      } else {
        setCartQty(val)
      }
    }
  
  
    // 減少商品數量 btn 
    export function handleReduceCartQty(cart,formCart){
      if(formCart){
        const _itemQty =  cartItemsQty.filter((item)=> item.id === cart.product_id)
        if((_itemQty[0].qty - 1) <= 0){
          showDangerToast('最低數量是1喔！')
        }else{
          editCartItem(cart.id, cart.product_id ,_itemQty[0].qty-1)
        }
  
      }else{
        setCartQty(Number(cartQty > 2 ? cartQty - 1 : 1))
        if((cartQty-1) <= 0 ){
          showDangerToast('最低數量是1喔！')
        }
      }
    }
  
    // 增加商品數量 btn 
    export function handleAddCartQty(cart,formCart,productDetail){
      if(formCart){
        const _itemQty =  cartItemsQty.filter((item)=> item.id === cart.product_id)
        if((_itemQty[0].qty + 1) > cart.product.stockQty ){
          showDangerToast(`庫存只剩${cart.product.stockQty}喔！`)
        }else{
          editCartItem(cart.id, cart.product_id ,_itemQty[0].qty+1)
        }
      }else{
        setCartQty(Number(cartQty < productDetail.stockQty ? cartQty + 1 : productDetail.stockQty))
        if((cartQty+1) > productDetail.stockQty ){
          showDangerToast(`庫存只剩${productDetail.stockQty}喔！`)
        }
      }
    }