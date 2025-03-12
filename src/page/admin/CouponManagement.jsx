
import { useNavigate } from "react-router"
import { useDispatch } from "react-redux"
import { useEffect, useRef, useState } from "react"
import { showDangerToast,showErrorToast,showSuccessToast } from "../../utils/toastUtils"
import { checkLogin, getTokenFromCookies } from "../../utils/authUtils"

import axios from "axios"
import * as bootstrap from "bootstrap"

const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH

const CouponManagement = () => {
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

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coupons,setCoupons] = useState([])   // 優惠券列表
  const [isEdit, setIsEdit] = useState(false)   // 是否編輯
  const [coupon,setCoupon] = useState({ // 單一優惠券
    title: "",
    is_enabled: "",
    percent: "",
    due_date: "" ,
    code: "" 
  })  



  const addModalRef = useRef(null)
  const addModal = useRef(null)

  
  const openAddModal = () =>{
    setIsEdit(false)
    setCoupon({
      title: "",
      is_enabled: "",
      percent: "",
      due_date: "" ,
      code: "" 
    })
    addModal.current = new bootstrap.Modal(addModalRef.current)
    addModal.current.show()
    }

  async function handleSubmit(e) {
    e.preventDefault()
    if(isSubmitting) return
    setIsSubmitting(true) 
    try {
      const url = isEdit
      ? `${api}/v2/api/${path}/admin/coupon/all/${coupon.id}` // 編輯訂單 API
      : `${api}/v2/api/${path}/admin/coupon` // 新增訂單 API
      const method = isEdit ? 'put' : 'post'
      await axios[method](url,{data:coupon})

      showSuccessToast(isEdit ? '編輯成功':'新增成功')
      setCoupon({
        title: "",
        is_enabled: "",
        percent: "",
        due_date: "" ,
        code: "" 
      })
      addModal.current.hide()
      setIsEdit(false)
    } catch (error) {
      showErrorToast(error?.response?.data?.message[0])
      console.log(error)
      
    } finally {
      setIsSubmitting(false)
    }

  }

  function handleCouponChange(e) {
    const { name, value, checked, type } = e.target
  
    // 處理日期格式
    let updatedValue = value;
    if (name === "due_date" && value) {
      // 假設 value 是 "YYYY-MM-DD" 格式的字符串
      updatedValue = Math.floor(new Date(value).getTime() / 1000); // 轉換為 Unix 時間戳（秒）
    } else {
      updatedValue = type === "checkbox" ? (checked ? 1 : 0) : value;
    }
  
    setCoupon({
      ...coupon,
      [name]: name === "percent" || name === "is_enabled" 
        ? Number(updatedValue) 
        : updatedValue
    })
  }
  

    
  return(<>

  
          <div className="mb-3">
        <div className='d-flex justify-content-between mb-3'>
          <h1 className='h4'>優惠券管理</h1>
          <button type='button' className='btn btn-primary' onClick={openAddModal}>新增優惠券</button>
          
          <div className="modal  fade" ref={addModalRef} tabIndex="-1" >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="exampleModalLabel">{isEdit? '編輯優惠券' : '新增優惠券'}</h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
                    <button type="button" className="btn btn-secondary " data-bs-dismiss="modal">取消</button>
                    <button type="submit" className="btn btn-primary">確認</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
    
      </div>
  </>)
}

export default CouponManagement
