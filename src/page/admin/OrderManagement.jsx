import { useNavigate } from "react-router"
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from "react-redux"
import { showSuccessToast , showDangerToast, showErrorToast } from '../../utils/toastUtils' 
import Pagination from '../../component/AdminPagination' 
import { checkLogin, getTokenFromCookies } from "../../utils/authUtils"

import axios from "axios"
import * as bootstrap from "bootstrap"

const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH

const OrderManagement = () => {
  const [orders, setOrders] = useState([]) // 訂單列表
  const [pagination, setPagination] = useState({}) // 分頁資訊
  const [currentOrder, setCurrentOrder] = useState({}) // 編輯的
  const editModalRef = useRef(null) // 詳情 Modal
  const editModal = useRef(null) // 詳情 Modal
  const isConfirmModalRef = useRef(null) // 詳情 Modal
  const isConfirmModal = useRef(null) // 詳情 Modal
  const [modalDeleteOrder, setModalDeleteOrder] = useState({}) // 待確認要刪除的id
  const [modalPaymentState, setModalPaymentState] = useState({}) // 待確認要刪除的id

  
  

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
    if(e){
      e.preventDefault()
    }
    try {
      const res =  await axios.get(`${api}/v2/api/${path}/admin/orders?page=${page}`)
      setOrders(res.data.orders)
      setPagination(res.data.pagination)
      console.log(res);
      
    } catch (error) {
      console.log(error)
      showErrorToast('取得訂單錯誤')
    }
  }

  // 訂單詳情
  function openOrderDetailModal(order) {
    setCurrentOrder({
      create_at: order.create_at || "", // 訂單編號
      is_paid: order.is_paid || "", // 付款狀態
      message: order.message || "", // 留言
      products: order.products || {}, // 產品列表
      total: order.total || "", // 總額
      user: {
        address: order.user?.address || "",
        email: order.user?.email || "",
        name: order.user?.name || "",
        tel: order.user?.tel || ""
      },
    })    
    editModal.current = new bootstrap.Modal(editModalRef.current)
    editModal.current.show()
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
    try {
    const res = await axios.post(`${api}/v2/api/${path}/pay/${modalPaymentState.id}`)
    showSuccessToast(res.data.message)
    getOrders()
    setModalPaymentState({})
    isConfirmModal.current.hide()
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
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
    try {   
    const res = await axios.delete(`${api}/v2/api/${path}/admin/order/${id}`)
    showSuccessToast(res.data.message)
    setModalDeleteOrder({})
    getOrders()
    isConfirmModal.current.hide()
    } catch (error) {
      console.error(error)
      showErrorToast(error?.response?.data?.message)
    }
  }

  // 關閉確認 modal
  const closeModal = () => {
    isConfirmModal.current.hide()
    setModalPaymentState({})
    setModalDeleteOrder({})
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

      <div className="modal fade" ref={editModalRef} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">訂單詳情</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {currentOrder ? (
                <div>
                  <p><strong>訂單編號：</strong>{currentOrder.create_at}</p>
                  <p><strong>訂購人：</strong>{currentOrder.user?.name}</p>
                  <p><strong>手機：</strong>{currentOrder.user?.tel}</p>
                  <p><strong>地址：</strong>{currentOrder.user?.address}</p>
                  <p>
                    <strong>付款狀態：</strong>
                    <span className={currentOrder.is_paid ? "text-success" : "text-danger"}>
                      {currentOrder.is_paid ? "已付款" : "未付款"}
                    </span>
                  </p>
                </div>
              ) : (
                <p>載入中...</p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                關閉
              </button>
            </div>
          </div>
        </div>
      </div>

    


      <Pagination pagination={pagination} getOrders={getOrders} />

    </>
  )
}

export default OrderManagement