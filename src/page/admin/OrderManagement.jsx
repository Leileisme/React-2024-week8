import { useNavigate } from "react-router"
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from "react-redux"
import { showSuccessToast , showDangerToast, showErrorToast } from '../../utils/toastUtils' 
import { checkLogin, getTokenFromCookies } from "../../utils/authUtils"
import { setIsLoading } from "../../slice/cartReducer"
import Pagination from "../../component/Pagination"

import axios from "axios"
import * as bootstrap from "bootstrap"

const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH

const OrderManagement = () => {
  const [orders, setOrders] = useState([]) // 訂單列表
  const [pagination, setPagination] = useState({}) // 分頁資訊
  const [order, setOrder] = useState({
    products: {},
    user: {},
    create_at: "",
    is_paid: false,
    message: "",
    total: "",
    id: "",
    paid_date: "",
    num:"",
  }) // 編輯的
  const editModalRef = useRef(null) // 詳情 Modal
  const editModal = useRef(null) // 詳情 Modal
  const [productDetails, setProductDetails] = useState([]) //API 回傳的產品資訊
  const isConfirmModalRef = useRef(null) // 確認 Modal
  const isConfirmModal = useRef(null) // 確認 Modal
  const [modalDeleteOrder, setModalDeleteOrder] = useState({}) // 待確認要刪除的id
  const [modalPaymentState, setModalPaymentState] = useState({}) // 待確認要刪除的id
  const [isSubmitting, setIsSubmitting] = useState(false)


  const dispatch = useDispatch() // 使用 set 的方法
  const navigate = useNavigate()
  
  //  驗證登入
  useEffect(() => {
    const token = getTokenFromCookies()
  
    if (token) {
      axios.defaults.headers.common.Authorization = token
      checkLogin(dispatch).catch(() => { // 抓住 authUtils.jsx 拋出的錯誤
        navigate("/login") 
      })
    } else {
      showDangerToast("Token not found")
      navigate("/login")
    }
  }, [dispatch, navigate])

  useEffect(()=>{
    getOrders()
  },[])

  // 取得訂單資訊
  async function getOrders(e,page=1) {
    dispatch(setIsLoading(true))
    if(e){
      e.preventDefault()
    }
    try {
      const res =  await axios.get(`${api}/v2/api/${path}/admin/orders?page=${page}`)
      setOrders(res.data.orders)
      setPagination(res.data.pagination)
    } catch (error) {
      console.log(error)
      showErrorToast('取得訂單錯誤')
    } finally {
      dispatch(setIsLoading(false))
    }
  }

  useEffect(()=>{
    console.log(orders)
    
  },[orders])

  // 訂單詳情
  function openOrderDetailModal(order) {
    dispatch(setIsLoading(true))
    const productsArray = Object.values(order.products)
    setProductDetails(productsArray)
    console.log(productsArray)
    
    setOrder({
      id: order.create_at || "",
      paid_date: order.paid_date || "",
      create_at: order.create_at || "", // 訂單編號
      is_paid: order.is_paid || false, // 付款狀態
      message: order.message || "", // 留言
      products: order.products || {}, // 產品列表
      total: order.total || "", // 總額
      user: {
        address: order.user?.address || "",
        email: order.user?.email || "",
        name: order.user?.name || "",
        tel: order.user?.tel || ""
      },
      num:order.num || "",
    })    
    editModal.current = new bootstrap.Modal(editModalRef.current)
    editModal.current.show()
    dispatch(setIsLoading(false))
  }

  // 開啟確認 modal（修改狀態）
  function handlePaymentState(order){
    setModalPaymentState({
      id: order.id,
      create_at: order.create_at
    })  // 設定要開啟 Modal 的產品 id
    console.log(order)
    
    isConfirmModal.current = new bootstrap.Modal(isConfirmModalRef.current)
    isConfirmModal.current.show()    
  }

  // 修改付款狀態API
  async function editOrder(){
    dispatch(setIsLoading(true))
    try {
    const res = await axios.post(`${api}/v2/api/${path}/pay/${modalPaymentState.id}`)
    showSuccessToast(res.data.message)
    getOrders()
    setModalPaymentState({})
    isConfirmModal.current.hide()
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    } finally {
      dispatch(setIsLoading(false))
    }
  }

  // 開啟確認 modal（刪除訂單）
  function handleDeleteOrder(order){
    setModalDeleteOrder({
      id: order.id,
      create_at: order.create_at
    })  // 設定要開啟 Modal 的產品 id
    isConfirmModal.current = new bootstrap.Modal(isConfirmModalRef.current)
    isConfirmModal.current.show()
  }

  // 刪除訂單API
  async function deleteOrder(id){
    dispatch(setIsLoading(true))
    try {   
    const res = await axios.delete(`${api}/v2/api/${path}/admin/order/${id}`)
    showSuccessToast(res.data.message)
    setModalDeleteOrder({})
    getOrders()
    isConfirmModal.current.hide()
    } catch (error) {
      console.error(error)
      showErrorToast(error?.response?.data?.message)
    } finally {
      dispatch(setIsLoading(false))
    }
  }

  // 關閉確認 modal
  const closeModal = () => {
    isConfirmModal.current.hide()
    setModalPaymentState({})
    setModalDeleteOrder({})
  }

  // 取消編輯訂單
  const handleCancel = () => {
    editModal.current.hide()
    setOrder({
      products: {},
      user: {},
      create_at: "",
      is_paid: false,
      message: "",
      total: "",
      id: "",
      paid_date: "",
      num: ""
    })
  }

  // 新增/編輯 優惠券
  async function handleSubmit(e) {
    dispatch(setIsLoading(true))
    e.preventDefault()
    if(isSubmitting) return
    setIsSubmitting(true) 
    console.log('submit',order)

    const data = 
      {
        create_at: order.create_at,
        is_paid: order.is_paid,
        message: order.message,
        products: order.products,
        user: {
          address: order.user.address,
          email: order.email,
          name: order.name,
          tel: order.tel
        },
        num: order.num
      }
    
    
    try {
      await axios.put(`${api}/v2/api/${path}/admin/order/${order.id}`,{data:{
        order
      }} )
      showSuccessToast('編輯成功')
      setOrder({
        create_at: "", // 訂單編號
        is_paid: false, // 付款狀態
        message:  "", // 留言
        products: [], // 產品列表
        total: "", // 總額
        user: {
          address: "",
          email:  "",
          name: "",
          tel: ""
        },
        num:"",
      })    
      editModal.current.hide()
      getOrders()
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
      console.log(error)
    } finally {
      setIsSubmitting(false)
      dispatch(setIsLoading(false))
    }
  }

  // 取裡 優惠券數輸入格式
  function handleOrderChange(e) {
    const { name, value } = e.target
  
    setOrder((pre) => ({
      ...pre,
      user: {
        ...pre.user,
        [name]: value, // 更新對應的欄位
      },
    }))
  }

  return(
    <>
      <div className='mb-3'>
        <div className='d-flex justify-content-between mb-3'>
          <h1 className='h4'>訂單管理</h1>
        </div>
        <table className='table' style={{ whiteSpace: 'nowrap' }}> 
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff' }}>
            <tr>
              <th >訂單編號</th>
              <th >付款狀態</th>
              <th >訂單總額</th>
              <th >訂購人</th>
              <th >手機</th>
              <th >email</th>
              <th >地址</th>
              <th >留言</th>
              <th >操作</th>
            </tr>
          </thead>
          <tbody>
            {
              orders.map((item,index)=>(
                <tr key={index}>
                  <td>{item.create_at}</td>
                  <td>
                  {item.is_paid 
                  ?
                    <div className='badge bg-secondary fw-bold'>
                    已付款
                    </div>
                  :
                  (
                    <>
                    <span className='badge bg-danger fw-bold me-2'>
                    未付款
                    </span >
                  </>
                  )
                  }
                  </td>

                  <td>{item.total}</td>
                  <td>{item.user.name}</td>
                  <td>{item.user.tel}</td>
                  <td>{item.user.email}</td>
                  <td>{item.user.address}</td>
                  <td>{item.message}</td>


                  <td>
                  <div className="btn-group" role="group" aria-label="Basic example">
                    <button type='button'
                    className='btn btn-outline-secondary'
                    onClick={()=>{openOrderDetailModal(item)}}>查看</button>
                    <button 
                    type='button' 
                    className= {`btn btn-outline-primary ${item.is_paid ? 'disabled' : ''}` } 
                    onClick={() => handlePaymentState(item)}>
                    修改付款狀態
                    </button >
                    <button type='button'
                    className='btn btn-outline-danger ' 
                    onClick={()=> handleDeleteOrder(item)}
                    >刪除</button>
                  </div>

                    
                  </td>

                  <td>
                    <div className="modal fade" ref={isConfirmModalRef} tabIndex="-1">
                      <div className="modal-dialog">
                        <div className="modal-content">
                          <div className="modal-header">
                          {
                            modalDeleteOrder?.id // 如果有刪除的訂單資料，顯示刪除訊息
                            ? 
                            <h5 className="modal-title">確定刪除「 訂單 <span className='text-danger'> {modalDeleteOrder.create_at}</span> 」?</h5>
                            : 
                            <h5 className="modal-title">確定 「訂單 <span className='text-danger'> {modalPaymentState?.create_at}</span> 」 已付款?</h5>
                          }
                            
                          </div>
                          <div className="modal-body">
                            <p>這個操作將無法撤銷，確定這麼做嗎？</p>
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={closeModal}
                            >
                              取消
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => {
                                modalDeleteOrder?.id ?  deleteOrder(modalDeleteOrder.id) : editOrder(item) 
                                closeModal()  // 刪除後關閉 Modal
                              }}
                            >確定
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>

              ))
            }
          </tbody>
        </table>
      </div>
      <div className="modal  fade" ref={editModalRef} tabIndex="-1" data-bs-backdrop="static" >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="exampleModalLabel">編輯訂單「{order.create_at}」</h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={()=>{handleCancel()}}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-12">
                        <div className="row">
                          <h6 className="col-12 mb-6">訂購人資訊</h6>
                          <div className="col-6 mb-3">
                              <label htmlFor="name" className='form-label'>姓名</label>
                              <input type="text" id="name" className='form-control form-control-sm' name='name' value={order?.user?.name || ''} onChange={(e)=> handleOrderChange(e)}/>
                          </div>

                          <div className="col-6 mb-3">
                              <label htmlFor="address" className='form-label'>地址</label>
                              <input type="text" min="0" id="address" className='form-control form-control-sm' name='address' value={order?.user?.address || ''} onChange={(e)=> handleOrderChange(e)}/>
                          </div>

                          <div className="col-6 mb-3">
                              <label htmlFor="email" className='form-label'>email</label>
                              <input type="email" id="email" className='form-control form-control-sm' name='email' value={order?.user?.email || ''}  onChange={(e)=> handleOrderChange(e)}/>
                          </div>

                          <div className="col-6 mb-3">
                              <label htmlFor="tel" className='form-label'>手機</label>
                              <input type="tel" id="tel" className='form-control form-control-sm' name='tel' value={order?.user?.tel || ""} min="0" onChange={(e)=> handleOrderChange(e)}/>
                          </div>
                          <h6 className="col-12 mt-3">訂購產品</h6>
                          <div className="col-12">
                            <table className='table'>
                              <thead>
                                <tr>
                                  <th className="text-bg-secondary">商品名稱</th>
                                  <th className="text-bg-secondary">商品單價</th>
                                  <th className="text-bg-secondary">訂單數量</th>
                                  <th className="text-bg-secondary">總額</th>
                                </tr>
                              </thead>
                              <tbody>
                              {
                                productDetails.length > 0 && Object.values(productDetails).map((item)=>(
                                  <tr key={item.id}>
                                    <td>{item?.product?.title}</td>
                                    <td>{item?.product?.price}</td>
                                    <td>{item.qty}</td>
                                    <td>{item.total}</td>
                                  </tr>
                                )) 
                              }
                              <tr>
                                <td>{}</td>
                                <td>{}</td>
                                <th>訂單總額</th>
                                <td className="text-danger">{order?.total}</td>
                              </tr>
                              </tbody>
                            </table>
                          </div>

                          
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button"className="btn btn-secondary " onClick={()=>{handleCancel()}}>取消</button>
                    <button type="submit" className="btn btn-primary">確認</button>
                  </div>
                </form>
              </div>
            </div>
      </div>

      <Pagination pagination={pagination} getOrders={getOrders} type={'getOrders'}  />

    </>
  )
}

export default OrderManagement