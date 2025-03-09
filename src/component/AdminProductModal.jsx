import { useState,useRef } from "react"
import { showSuccessToast,showDangerToast,showErrorToast } from '../utils/toastUtils'
import axios from "axios"
import PropTypes from "prop-types"

const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH

// 產品 Modal Template
const ProductModal= ({ addModalRef, addModal, product, setProduct, isEdit, setIsEdit, getProducts, pagination }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)
  const [currentTag,setCurrentTag] = useState("")

  function clearFileInput(){
    fileInputRef.current.value = ''
    setCurrentTag("")
  }

  // 增／改產品API
  async function handleSubmit(e) {
    e.preventDefault()
    if(isSubmitting) return
    setIsSubmitting(true) 

    try {
      const url = isEdit ? `${api}/v2/api/${path}/admin/product/${product.id}` : `${api}/v2/api/${path}/admin/product`
      const method = isEdit ? 'put' : 'post'
      await axios[method](url,{data:product})
      
      showSuccessToast(isEdit ? '編輯成功':'新增成功')
      getProducts(e,pagination.current_page)
      setProduct({
        id: "",
        imageUrl: "",
        title: "",
        category: "",
        unit: "",
        origin_price: 0,
        price: 0,
        description: "",
        content: "",
        is_enabled: 0,
        imagesUrl: [""],
        tags:[],
        stockQty: 0
      })
    addModal.current.hide()
    setIsEdit(false)
    fileInputRef.current.value = ''
    } catch (error) {
      showErrorToast(error?.response?.data?.message[0])
      
    } finally {
      setIsSubmitting(false)
    }
  }

  // 監聽產品
  function handleProductChange(e){
    const{name,value,checked, type}= e.target
    const upDatedCheckbox = (type === "checkbox" ? (checked ? 1 : 0) : value )
    setProduct({
      ...product,
      [name]: name === "origin_price" || name === "price" || name === "stockQty"
      ? Number(value) 
      : upDatedCheckbox
    })
  }

  // 新增空副圖
  function addImagesUrl(){
    setProduct((pre)=>({
      ...pre,
      imagesUrl: [...pre.imagesUrl,""]
    }))
  }

  // 移除指定位置副圖
  function removeImagesUrl(idx){
    setProduct((pre)=>{
    const upDated = pre.imagesUrl.filter((_,i)=> i !== idx)
    return{
      ...pre,
      imagesUrl: upDated.length > 0 ? upDated : [""]
    }
    })
  }

  // 監聽副圖
  function handleImagesUrlChange(idx, val){
    setProduct((pre) => {
      const upDated = [...pre.imagesUrl]
      upDated[idx] = val
      return {...pre,imagesUrl:upDated}
    })
  }

  // 監聽當前值
  function handleTagChange(e){
    setCurrentTag(e.target.value)
  }

  // 監聽 tags
  function handleTagsCheck(e){
    e.preventDefault()
    if(product.tags.some((tag) => tag === currentTag.trim())){
      showDangerToast('標籤重複')
      
    }else if(!currentTag.trim()){
      showDangerToast('標籤不能為空')
    }
    else{
      setProduct((pre)=>{
        const upDated = [...pre.tags]
        upDated.push(currentTag.trim())
        return {...pre,tags:upDated}
      })
      setCurrentTag("")
    }
  }
  

  // 移除 tag
  function handleRemove(i){
    setProduct((pre)=>{
      const upDatedTags = [...pre.tags]
      upDatedTags.splice(i,1)
      return {
        ...pre,
        tags: upDatedTags
      }
    })
  }


  // 上傳圖片
  async function handleFileChange(e){
    const file = e.target.files[0]
    // 模擬了 <form> 的 enctype="multipart/form-data" 提交格式
    const formData = new FormData()
    // 標籤的 name, 要上傳的檔案
    formData.append('file-to-upload', file)
    try {
      const res =  await axios.post(`${api}/v2/api/${path}/admin/upload`,formData)
      // console.log(res)
      const uploadImgUrl = res.data.imageUrl
      setProduct({
        ...product,
        imageUrl: uploadImgUrl
      })
    } catch (error) {
      // console.log(error)
      showDangerToast(error.response.data.message[0])
      
    }
  }

  return(
    <>
      <div className="modal modal-xl fade" ref={addModalRef} tabIndex="-1" >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">{isEdit? '編輯產品' : '新增產品'}</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-5">
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label htmlFor="formFile" className="form-label">圖片上傳</label>
                        <input
                          ref={fileInputRef}
                          className="form-control"
                          type="file"
                          id="formFile"
                          accept=".jpg,.jpeg,.png"
                          name='file-to-upload'
                          onChange={handleFileChange}
                        />
                      </div>

                      {
                        product.imageUrl
                        ?
                        <div className="col-12 mb-3 ">
                          <img src={product.imageUrl} alt="主圖" className='img-fluid' />
                        </div>
                        :
                        ''
                      }

                      <div className="col-12 mb-3">
                          <label htmlFor="imageUrl" className='form-label'>主圖</label>
                          <input type="text" id="imageUrl" className='form-control form-control-sm' name='imageUrl' onChange={handleProductChange} value={product.imageUrl || ''} />
                      </div>
                      

                      {Array.isArray(product.imagesUrl) &&  product.imagesUrl.map((img,index)=>(
                        <div key={index} >
                          <div className="col-12 mb-3 card p-3" >
                            <label htmlFor={`imagesUrl${index}`} className='form-label'>副圖{index + 1}</label>
                            <input type="text" id={`imagesUrl${index}`} className='form-control form-control-sm' name={`imagesUrl${index}`} value={img} onChange={(e)=>handleImagesUrlChange(index,e.target.value)}/>
                          <div className='d-flex justify-content-end mt-2'>
                            <button type='button' className='btn btn btn-outline-primary me-2' onClick={addImagesUrl}>新增</button>
                            <button type='button' className='btn btn-outline-danger' onClick={()=>removeImagesUrl(index)}>刪除</button>
                          </div>
                        </div>
                        </div>
                      ))}
                    
                    </div>
                  </div>

                  <div className="col-7">
                    <div className="row">

                      <div className="col-12 mb-3">
                          <label htmlFor="title" className='form-label'>標題</label>
                          <input type="text" id="title" className='form-control form-control-sm' name='title' onChange={handleProductChange} value={product.title || ''} />
                      </div>

                      <div className="col-12 mb-3">
                          <label htmlFor="category" className='form-label'>分類</label>
                          <input type="text" id="category" className='form-control form-control-sm' name='category'onChange={handleProductChange} value={product.category || ''} />
                      </div>

                      <div className="col-6 mb-3">
                          <label htmlFor="unit" className='form-label'>單位</label>
                          <input type="text" id="unit" className='form-control form-control-sm' name='unit'onChange={handleProductChange} value={product.unit || ''} />
                      </div>

                      <div className="col-6 mb-3">
                          <label htmlFor="stockQty" className='form-label'>數量</label>
                          <input type="number" min="0" id="stockQty" className='form-control form-control-sm' name='stockQty'onChange={handleProductChange} value={product.stockQty || ''} />
                      </div>


                      <div className="col-6 mb-3">
                          <label htmlFor="origin_price" className='form-label'>原價</label>
                          <input type="number" id="origin_price" className='form-control form-control-sm' name='origin_price'onChange={handleProductChange} value={product.origin_price || ""} min="0" />
                      </div>

                      <div className="col-6 mb-3">
                          <label htmlFor="price" className='form-label'>售價</label>
                          <input type="number" id="price" className='form-control form-control-sm' name='price'onChange={handleProductChange} value={product.price || ''} min="0"/>
                      </div>


                      <div className="col-12 mb-3">
                          <label htmlFor="description" className='form-label'>產品描述</label>
                          <textarea type="text" id="description" className='form-control form-control-sm' name='description' onChange={handleProductChange} value={product.description || ""}  />
                      </div>
                      
                      <div className="col-12 mb-3">
                          <label htmlFor="content" className='form-label'>產品說明</label>
                          <textarea type="text" id="content" className='form-control form-control-sm' name='content'onChange={handleProductChange} value={product.content || ''} />
                      </div>


                      <div className="col-12 mb-3">
                        <label htmlFor="tags" className='form-label me-2'>標籤</label>
                        {
                          product.tags.map((tag,i)=>{
                            return (<span key={i} className="badge text-bg-primary ms-1 ">{tag}
                              <button
                                type="button"
                                className="btn-close ms-2 btn-sm p-0"
                                onClick={()=>{handleRemove(i)}}
                              >X</button>
                            </span>)
                          })
                        }
                          <div className="d-flex just">
                            <input 
                              type="text" 
                              id="tags" 
                              className='form-control form-control-sm w-75 me-3' 
                              name='tags'
                              value={currentTag}
                              onChange={handleTagChange} />
                              <button type="button" className="btn btn-primary" onClick={handleTagsCheck}>新增標籤</button>
                          </div>
                      </div>

                      <div className="col-12 mb-3">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={product.is_enabled} 
                            id="is_enabled" 
                            name='is_enabled'
                            onChange={handleProductChange}
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
                <button type="button" className="btn btn-secondary " data-bs-dismiss="modal" onClick={clearFileInput}>取消</button>
                <button type="submit" className="btn btn-primary">確認</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

ProductModal.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string,
    imageUrl: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string,
    unit: PropTypes.string,
    origin_price: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    description:  PropTypes.string,
    content: PropTypes.string,
    is_enabled: PropTypes.number.isRequired,
    imagesUrl: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
  })
}

export default ProductModal