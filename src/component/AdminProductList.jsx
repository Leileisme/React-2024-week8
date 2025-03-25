import React, { useState } from 'react'

// 產品列表
const ProductList = ({ products, openEditModal, handleDelete, isSubmittingDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)  // 控制 Modal 顯示
  const [modalOpenProduct, setModalOpenProduct] = useState({}) // 待確認要刪除的id

  // 開啟刪除確認 modal
  const openModal = (item) => {
    setModalOpenProduct({
      id: item.id,
      title: item.title
    })  // 設定要開啟 Modal 的產品 id
    setIsModalOpen(true)
  }

  // 關閉刪除確認 modal
  const closeModal = () => {
    setModalOpenProduct({}) 
    setIsModalOpen(false) // 關閉所有的 Modal
  }

  return(
    <>
      <table className='table'>
        <thead >
          <tr>
            <th scope='col'>產品名稱</th>
            <th scope='col'>標籤</th>
            <th scope='col'>原價</th>
            <th scope='col'>售價</th>
            <th scope='col'>是否啟用</th>
            <th scope='col'>操作</th>
          </tr>
        </thead>
        <tbody>
          {
            products.map((item,index)=>(
              <tr key={index}>
                <td>{item.title}</td>
                <td>
                  {
                    item.tags ? 
                    item.tags.map((tag)=>{
                      return(
                        <span className="badge text-bg-primary me-1" key={tag}>{tag}</span>
                      )
                    })
                    :
                    ''
                  }
                </td>
                <td>{item.origin_price}</td>
                <td>{item.price}</td>
                <td>
                  {
                    item.is_enabled ? (
                      <span className='text-success' >啟用</span>
                    ) : (
                      <span>未啟用</span>
                    )
                  }
                </td>
                <td>
                  <button type='button' className='btn btn-outline-primary me-2' onClick={()=>{openEditModal(item)}}>編輯</button>
                  <button type='button'
                  className='btn btn-outline-danger' 
                  onClick={() => openModal(item)}>刪除</button>
                </td>
                <td>
                  {modalOpenProduct.id === item.id && (
                    <>
                      <div className={`modal-backdrop fade ${isModalOpen ? 'show' : ''}`}></div>
                      <div
                        className={`modal fade ${isModalOpen ? 'show' : ''} `}
                        tabIndex="-1"
                        role="dialog"
                        aria-hidden={!isModalOpen}
                        onClick={closeModal}
                        style={{ display: isModalOpen ? 'block' : 'none' }}
                      >
                        <div className="modal-dialog" role="document">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5 className="modal-title">確定刪除 <span className='text-danger'> {modalOpenProduct.title}</span> ?</h5>
                            </div>
                            <div className="modal-body">
                              <p>這個操作將無法撤銷，確定刪除這個產品嗎？</p>
                            </div>
                            <div className="modal-footer">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={closeModal}>取消</button>
                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={(e) => {
                                  handleDelete(item.id, e)
                                  closeModal()  // 刪除後關閉 Modal
                                }}
                                disabled={isSubmittingDelete}
                              >{isSubmittingDelete ? '刪除中...' : '確認刪除'}</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>

      
    </>
  )
}

export default ProductList