import { useNavigate } from "react-router"
import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { showSuccessToast,showDangerToast, showErrorToast } from '../../utils/toastUtils'
import { checkLogin, getTokenFromCookies } from "../../utils/authUtils"

import ProductList from '../../component/AdminProductList'
import ProductModal from '../../component/AdminProductModal'
import Pagination from '../../component/AdminPagination' 

import axios from "axios"
import * as bootstrap from "bootstrap"

const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH

const ProductManagement = () => {
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


  const [product,setProduct] = useState({
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
    imagesUrl: [],
    tags: [],
    stockQty: 0
  })// 單一產品
  const [products,setProducts] = useState([])   // 產品列表
  const [isEdit, setIsEdit] = useState(false)   // 是否編輯
  const [pagination, setPagination] = useState({}) // 分頁資訊
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false)


  const addModalRef = useRef(null)
  const addModal = useRef(null)


  useEffect(()=>{
    getProducts()
  },[])

  // 取得產品資訊
  async function getProducts(e,page=1) {
    if(e){
      e.preventDefault()
    }
    try {
      const res =  await axios.get(`${api}/v2/api/${path}/admin/products?page=${page}`)
      setProducts(res.data.products)
      setPagination(res.data.pagination)     
    } catch (error) {
      // console.log(error)
      showErrorToast('取得產品錯誤')
    }
  }

  // 產品編輯跳窗
  const openEditModal = (productData) =>{
    setIsEdit(true)
    setProduct({
      id: productData.id|| "",
      imageUrl: productData.imageUrl || "",
      title: productData.title || "",
      category: productData.category || "",
      unit: productData.unit || "",
      origin_price:productData.origin_price ||  0,
      price:productData.price||  0,
      description:productData.description ||  "",
      content:productData.content || "",
      is_enabled:productData.is_enabled || 0 ,
      imagesUrl: productData.imagesUrl || [],
      tags:productData.tags || [],
      stockQty: productData.stockQty || 0
    })
    addModal.current = new bootstrap.Modal(addModalRef.current)
    addModal.current.show()
  }

  // 產品新增跳窗
  const openAddModal = () =>{
    setIsEdit(false)
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
      imagesUrl: [],
      tags:[],
      stockQty: 0
    })
    addModal.current = new bootstrap.Modal(addModalRef.current)
    addModal.current.show()
  }

  // 刪除產品
  async function handleDelete (id,e){
    if(isSubmittingDelete) return
    setIsSubmittingDelete(true)
    try {
      await axios.delete(`${api}/v2/api/${path}/admin/product/${id}`)
      getProducts(e,pagination.current_page)
      
      showSuccessToast('刪除成功')
      setIsSubmittingDelete(false)
    } catch (error) {
      showDangerToast('刪除失敗')
    }
  }


  return(
    <>
      <div className="mb-3">
        <div className='d-flex justify-content-between mb-3'>
          <h1 className='h4'>產品管理</h1>
          <button type='button' className='btn btn-primary' onClick={openAddModal}>新增產品</button>
          
          <ProductModal 
            addModalRef={addModalRef}
            addModal={addModal}
            product={product}
            setProduct={setProduct}
            products={products}
            setProducts={setProducts}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            getProducts={getProducts}
            pagination={pagination} />
        </div>
        <ProductList 
        products={products} 
        setProducts={setProducts} 
        openEditModal={openEditModal} 
        handleDelete={handleDelete} 
        setProduct={setProduct} 
        pagination={pagination} 
        setPagination={setPagination} 
        isSubmittingDelete={isSubmittingDelete}
        setIsSubmittingDelete={setIsSubmittingDelete} />

        <Pagination pagination={pagination} getProducts={getProducts} />
      </div>

    </>
  )
}

export default ProductManagement
