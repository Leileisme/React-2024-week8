import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { showSuccessToast,showDangerToast,showErrorToast } from '../../utils/toastUtils'

import { useDispatch, useSelector } from 'react-redux';
import { getCart, editCartItem, addCartItem, setCartQty } from '../../slice/cartReducer';

const BASE_URL = import.meta.env.VITE_BASE_URL
const PATH = import.meta.env.VITE_API_PATH

const ProductDetail = (props) => {
  const dispatch = useDispatch();
  const { cart, cartQty, cartItemsQty, isLoading } = useSelector((state) => state.cart)

  const [productDetail,setProductDetail] = useState({})

 
  // 取得購物車
  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);
  
  // 設定產品詳情
  // const handleSetProductDetail = (product) => {
  //   dispatch(setProductDetail(product));
  // };
  
  // 設定購物數量
  const handleSetCartQty = (qty) => {
    dispatch(setCartQty(qty));
  };
  
  // 減少購物車商品數量
  const handleReduceCartQty = (cart) => {
    const itemQty = cartItemsQty.find((item) => item.id === cart.product_id)?.qty || 1;
    if (itemQty - 1 <= 0) {
      showDangerToast('最低數量是 1 喔！');
    } else {
      dispatch(editCartItem({ cartId: cart.id, productId: cart.product_id, qty: itemQty - 1 }));
    }
  };
  
  // 增加購物車商品數量
  const handleAddCartQty = (cart) => {
    const itemQty = cartItemsQty.find((item) => item.id === cart.product_id)?.qty || 1;
    if (itemQty + 1 > cart.product.stockQty) {
      showDangerToast(`庫存只剩 ${cart.product.stockQty} 喔！`);
    } else {
      dispatch(editCartItem({ cartId: cart.id, productId: cart.product_id, qty: itemQty + 1 }));
    }
  };
  
  // 新增商品到購物車
  const handleAddCartItem = (productId, qty) => {
    dispatch(addCartItem({ productId, qty }));
  };
  
  // 初始化時獲取購物車數據
  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  // 修改數量
  const handleCartQtyInputOnChange = (e, cartId, formCart) => {
    dispatch(handleCartQtyInputOnChange({ cartId, qty: e.target.value, formCart }));
  };

  // 失去焦點時驗證數量
  const handleCartQtyInputOnBlur = (e, cart, formCart, productDetail) => {
    dispatch(handleCartQtyInputOnBlur({ qty: e.target.value, cart, formCart, productDetail, dispatch }));
  };

  // 加入購物車
  const handleAddToCart = (productId, isDetail, productDetail) => {
    dispatch(handleAddCartItem({ productId, isDetail, productDetail, dispatch }));
  };

  // const {
  //   productDetailRef,
  //   productDetail,
  //   setProductDetail,
  //   handleReduceCartQty,
  //   cartQty,
  //   handleCartQtyInputOnChange,
  //   handleCartQtyInputOnBlur,
  //   handleAddCartQty,
  //   handleAddCartItem
  // } = props


  const {id} = useParams()

  useEffect(()=>{
    if(id){
      getProductDetail(id)
    }
  },[id])

  // 取得單一產品
  async function getProductDetail(id) {
    try {
      const res = await axios.get(`${BASE_URL}/v2/api/${PATH}/product/${id}`) 
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
  return(
    <>
      <div className="container">
        <div className=" product-detail">
          <div className="modal-header">
            <h1 className="mb-3 h3" id="exampleModalLabel">{productDetail.title}</h1>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-12 d-flex justify-content-between" >
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
      </div>
    </>
)}

export default ProductDetail
// const ProductDetail = () =>{
//   return(<>
//   產品細節
//   </>)
// }

// export default ProductDetail
