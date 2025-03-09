// const OrderManagement = () => {
//   return(<>
//     訂單管理
//   </>)
// }

// export default OrderManagement

import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { showSuccessToast , showDangerToast, showErrorToast } from '../../utils/toastUtils' 
import Pagination from '../../component/AdminPagination' 


const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH

const OrderManagement = () => {
  const [orders, setOrders] = useState([]) // 訂單列表
  const [pagination, setPagination] = useState({}) // 分頁資訊


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

      useEffect(()=>{
        getOrders()
      },[])


  return(
    <>

      <div className='mb-3'>
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
                  <td>{item.is_paid ? '已付款' : '未付款'}</td>

                  <td>{item.total}</td>
                  <td>{item.user.name}</td>
                  <td>{item.user.tel}</td>
                  <td>{item.user.email}</td>
                  <td>{item.user.address}</td>
                  <td>{item.message}</td>


                  <td>
                    <button type='button' className='btn btn-outline-primary me-2' onClick={()=>{openEditModal(item)}}>編輯</button>
                    <button type='button'
                    className='btn btn-outline-danger' 
                    onClick={() => openModal(item)}>刪除</button>
                  </td>
                </tr>

              ))
            }
          </tbody>
        </table>
      </div>

      <Pagination pagination={pagination} getOrders={getOrders} />

    </>
  )
}

export default OrderManagement