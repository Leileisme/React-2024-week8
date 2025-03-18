import { useEffect, useState } from 'react'
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils'
import Pagination from '../../component/Pagination'
import ProductList from '../../component/ProductList'
import ProductCard from '../../component/ProductCard'
import ProductModalDetail from '../../component/ProductModalDetail'
import axios from 'axios'
import { getCart, setIsLoading } from '../../slice/cartReducer'
import { useDispatch, } from 'react-redux' 


const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH

const ProductPage = () => {
  const [productsList,setProductsList]=useState([]) // 產品列表
  const [pagination,setPagination] = useState({}) // 產品列表分頁資訊
  const [isList, setIsList] = useState(true) // 判斷產品List/Card
  const productCategory = ['所有商品','經典眼鏡','太陽眼鏡','細框眼鏡','兒童眼鏡','配件']
  const dispatch = useDispatch()

  // 新增商品到購物車
  const handleAddCartItem = (productId, qty) => {
    dispatch(addCartItem({ productId, qty }))
  }

  // 取的產品列表
  async function getProductsList(page = 1,category=null) {
    dispatch(setIsLoading(true))
    try {
      const res = await axios.get(
        category 
        ? `${api}/v2/api/${path}/products?page=${page}&category=${category}` 
        : `${api}/v2/api/${path}/products?page=${page}`
      )
      setProductsList(res.data.products)
      setPagination(res.data.pagination)
      
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    } finally {
      dispatch(setIsLoading(false))
      
    }
  }

  // 加入購物車
  async function addCartItem(product_id,qty) {
    dispatch(setIsLoading(true))
    try {
      await axios.post(`${api}/v2/api/${path}/cart`, {
        data:{
          product_id,
          qty
        }
      })
      getCart()
      showSuccessToast('成功加入購物車')
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    } finally {
      dispatch(setIsLoading(false))

    }
  }


  useEffect(()=>{
    getProductsList()
    getCart()
  },[])

  // 監聽商品換頁
  function handlePageClick(e,page){
    e.preventDefault()
    getProductsList(page)
  }

  // 監聽商品分類
  function handleCategoryClick(e,category){
    e.preventDefault()
    if(category === '所有商品'){
    getProductsList(1)
    }else{
      getProductsList(1,category)
    }
  }

  return(<>
    <div className="container mt-5">
      <div className="row">
        <aside className="col-2 col-sm-12">
          <ul className="list-group">
            {
              productCategory.map((category)=>(
                <li className="list-group-item  aside-list"  key={category}>
                  <a 
                    onClick={(e)=>handleCategoryClick(e,category)}
                    href="#"
                    className="text-decoration-none text-dark">
                    {category}
                  </a>
                </li>
              ))
            }
          </ul>
        </aside>

        <div className="col-10 col-sm-12">
          <div className="d-flex justify-content-between">
            <h1 className="h3">
              線上商城
            </h1>
            <div className="btn-group">
              <button 
                type="button" 
                className={`btn btn-outline-primary select-list-type ps-2 pe-2 ${isList ? "active" : ""} align-items-center d-flex`}
                style={{height:"25px",fontSize:"1rem"}}
                onClick={()=> setIsList(true)}
                >
                <i className="bi bi-justify" 
                ></i>
              </button>
              <button
                type="button"
                className={`btn btn-outline-primary select-list-type ps-2 pe-2 ${!isList ? "active" : ""} align-items-center d-flex`}
                style={{height:"25px",fontSize:"1rem"}}
                onClick={()=> setIsList(false)}>
                <i className="bi bi-grid"></i>
              </button>
            </div>
          </div>
          {
            isList 
            ?
            <ProductList
              productsList={productsList}
              handleAddCartItem={handleAddCartItem}
              getProductsList={getProductsList}
            />
            :
            <ProductCard
              productsList={productsList}
              handleAddCartItem={handleAddCartItem}
              getProductsList={getProductsList}
            />
          }
          <Pagination
            pagination={pagination}
            handlePageClick={handlePageClick}
            type={'handlePageClick'}
          />
        </div>
      </div>
    </div>
  </>)
}

export default ProductPage
