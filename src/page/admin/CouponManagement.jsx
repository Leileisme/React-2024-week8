
import { useNavigate } from "react-router"
import { useDispatch } from "react-redux"
import { useCallback, useEffect, useRef, useState } from "react"
import { showDangerToast,showErrorToast,showSuccessToast } from "../../utils/toastUtils"
import { checkLogin, getTokenFromCookies } from "../../utils/authUtils"
import { setIsLoading } from "../../slice/cartReducer"

import Pagination from "../../component/Pagination"
import axios from "axios"
import * as bootstrap from "bootstrap"

const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH

const CouponManagement = () => {
  const [pagination, setPagination] = useState({}) // 分頁資訊
  const dispatch = useDispatch() // 使用 set 的方法
  const navigate = useNavigate()
  const isConfirmModalRef = useRef(null) // 詳情 Modal
  const isConfirmModal = useRef(null) // 詳情 Modal
  const [modalDeleteCoupon, setModalDeleteCoupon] = useState({}) // 待確認要刪除的id
  const addModalRef = useRef(null)
  const addModal = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coupons,setCoupons] = useState([])   // 優惠券列表
  const [isEdit, setIsEdit] = useState(false)   // 是否編輯
  const [coupon,setCoupon] = useState({ // 單一優惠券
    title: "",
    is_enabled: 0,
    percent: "",
    due_date: "",
    code: "" 
  })  





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


  const openAddModal = (item) =>{
    if(item) {
      setCoupon(item)
      setIsEdit(true)
    } 
    addModal.current = new bootstrap.Modal(addModalRef.current)
    addModal.current.show()
    }



  // 新增/編輯 優惠券
  async function handleSubmit(e) {
    dispatch(setIsLoading(true))
    e.preventDefault()
    if(isSubmitting) return
    setIsSubmitting(true) 
    
    const formattedCoupon = {
      ...coupon,
      due_date: coupon.due_date ? Math.floor(new Date(coupon.due_date).getTime() / 1000) : "",
    }
    
    try {
      const url = isEdit
      ? `${api}/v2/api/${path}/admin/coupon/${coupon.id}` // 編輯訂單 API
      : `${api}/v2/api/${path}/admin/coupon` // 新增訂單 API
      const method = isEdit ? 'put' : 'post'
      await axios[method](url,{data:formattedCoupon})

      showSuccessToast(isEdit ? '編輯成功':'新增成功')
      setCoupon({
        title: "",
        is_enabled: 0,
        percent: "",
        due_date: "",
        code: "" 
      })
      addModal.current.hide()
      setIsEdit(false)
      getCoupon()
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
      // console.log(error)
      
    } finally {
      setIsSubmitting(false)
      dispatch(setIsLoading(false))
    }
  }

  // 處理 優惠券數輸入格式
  function handleCouponChange(e) {
    const { name, value, checked, type } = e.target
    let updatedValue = value
    updatedValue = type === "checkbox" ? (checked ? 1 : 0) : value

    setCoupon({
      ...coupon,
      [name]: name === "percent"
        ? Number(updatedValue) 
        : updatedValue
    })
  }

  // 取得產品列表
  const getCoupon = useCallback(async() => {
    dispatch(setIsLoading(true))
    try {
      const res = await axios.get(`${api}/v2/api/${path}/admin/coupons`)
      const upDated = res.data.coupons.map((item) => ({
        ...item,
        due_date: new Date(item.due_date * 1000).toISOString().split('T')[0]
      }))
      setCoupons(upDated)
      setPagination(res.data.pagination)
    } catch (error) {
      // console.log(error)
      showErrorToast(error?.response?.data?.message)
    } finally {
      dispatch(setIsLoading(false))
    }
  },[dispatch])

    // 關閉確認 modal
    const closeModal = () => {
      isConfirmModal.current.hide()
      setModalDeleteCoupon({})
    }

  // 刪除訂單API
  async function deleteCoupon(id){
    // console.log(id)
    
    dispatch(setIsLoading(true))
    try {   
    const res = await axios.delete(`${api}/v2/api/${path}/admin/coupon/${id}`)
    showSuccessToast(res.data.message)
    setModalDeleteCoupon({})
    getCoupon()
    isConfirmModal.current.hide()
    } catch (error) {
      console.error(error)
      showErrorToast(error?.response?.data?.message)
    } finally {
      dispatch(setIsLoading(false))
    }
  }

    // 開啟確認 modal（刪除訂單）
    function handleDeleteCoupon(item){
      setModalDeleteCoupon({
        id: item.id,
        title: item.title
      })  // 設定要開啟 Modal 的產品 id
      isConfirmModal.current = new bootstrap.Modal(isConfirmModalRef.current)
      isConfirmModal.current.show()
    }

    function handleCancel (){
      addModal.current.hide()
      setCoupon({
        title: "",
        is_enabled: 0,
        percent: "",
        due_date: "",
        code: "" 
      })
      setIsEdit(false)
    }

  useEffect(()=>{
    getCoupon()
  },[getCoupon])
    

    
  return(
    <>
      <div className="mb-3 outline-margin">
        <div className='d-flex justify-content-between mb-3'>
          <h1 className='h4'>優惠券管理</h1>
          <button type='button' className='btn btn-primary' onClick={()=> openAddModal()}>新增優惠券</button>
          <div className="modal  fade" ref={addModalRef} tabIndex="-1" data-bs-backdrop="static" >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="exampleModalLabel">{coupon.id ? '編輯優惠券' : '新增優惠券'}</h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={()=>{handleCancel()}}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-12">
                        <div className="row">

                          <div className="col-12 mb-3">
                              <label htmlFor="title" className='form-label'>優惠券名稱</label>
                              <input type="text" id="title" className='form-control form-control-sm' name='title' onChange={handleCouponChange} value={coupon.title || ''} />
                          </div>

                          <div className="col-12 mb-3">
                              <label htmlFor="code" className='form-label'>優惠代碼</label>
                              <input type="number" min="0" id="code" className='form-control form-control-sm' name='code'onChange={handleCouponChange} value={coupon.code || ''} />
                          </div>

                          <div className="col-6 mb-3">
                              <label htmlFor="due_date" className='form-label'>截止日期</label>
                              <input type="date" id="due_date" className='form-control form-control-sm' name='due_date'onChange={handleCouponChange} value={coupon.due_date || ''} />
                          </div>

                          <div className="col-6 mb-3">
                              <label htmlFor="percent" className='form-label'>折價%</label>
                              <input type="number" id="percent" className='form-control form-control-sm' name='percent'onChange={handleCouponChange} value={coupon.percent || ""} min="0" />
                          </div>

                          <div className="col-12 mb-3"> 
                            <div className="form-check">
                              <input 
                                className="form-check-input" 
                                type="checkbox" 
                                checked={coupon.is_enabled} 
                                id="is_enabled" 
                                name='is_enabled'
                                onChange={handleCouponChange}
                              />
                              <label 
                              className="form-check-label" 
                              htmlFor="is_enabled" >是否啟用
                              </label>
                            </div>
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
        </div>

        <table className='table' style={{ whiteSpace: 'nowrap' }}> 
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff' }}>
            <tr>
              <th>優惠券名稱</th>
              <th>優惠代碼</th>
              <th>優惠％</th>
              <th>到期日</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {
              coupons?.map((item,index)=>(
                <tr key={index} >
                  <td>{item.title}</td>
                  <td>{item.code}</td>
                  <td>{item.percent}</td>
                  <td>{item.due_date}</td>
                  <td>
                    {item.is_enabled
                    ? 
                    <span className='text-success'>啟用</span> 
                    :
                    <span>非啟用</span> 
                    }
                  </td>
                  <td>
                    <div className="btn-group" role="group" aria-label="Basic example">
                      <button type='button'
                      className='btn btn-outline-secondary'
                      onClick={()=> openAddModal(item)}
                      >編輯</button>
                      <button type='button'
                      className='btn btn-outline-danger'
                      onClick={()=>handleDeleteCoupon(item)}
                      >刪除</button>
                    </div>
                  </td>

                  <td>
                    <div className="modal fade" ref={isConfirmModalRef} tabIndex="-1">
                      <div className="modal-dialog">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">確定刪除「 優惠券 <span className='text-danger'> {modalDeleteCoupon.title}</span> 」?</h5>
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
                                deleteCoupon(modalDeleteCoupon.id)
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

      <Pagination pagination={pagination} getCoupon={getCoupon} type={'getCoupon'} />

  </>
  )
}

export default CouponManagement
