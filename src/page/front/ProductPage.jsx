import { useCallback, useEffect, useState } from 'react'
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils'
import Pagination from '../../component/Pagination'
import ProductList from '../../component/ProductList'
import ProductCard from '../../component/ProductCard'
import axios from 'axios'
import { getCart, setIsLoading } from '../../slice/cartReducer'
import { useDispatch, } from 'react-redux' 


const api = import.meta.env.VITE_BASE_URL
const path = import.meta.env.VITE_API_PATH

const ProductPage = () => {
  const [productsList,setProductsList]=useState([]) // 產品列表
  const [pagination,setPagination] = useState({}) // 產品列表分頁資訊
  const [isList, setIsList] = useState(true) // 判斷產品List/Card
  const [selectedCategory, setSelectedCategory] = useState('所有商品') // 儲存選擇的分類
  const productCategory = ['所有商品','經典眼鏡','太陽眼鏡','細框眼鏡','兒童眼鏡','配件']
  const dispatch = useDispatch()

  // 新增商品到購物車
  const handleAddCartItem = (productId, qty) => {
    dispatch(addCartItem({ productId, qty }))
  }

  // 取的產品列表
  const getProductsList = useCallback(async (page = 1,category=null) => {
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
  },[dispatch])

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

   // 監聽商品分類
  function handleCategoryClick(e, category) {
    e.preventDefault()
    setSelectedCategory(category) // 更新選擇的分類
    if (category === '所有商品') {
      getProductsList(1)
    } else {
      getProductsList(1, category)
    }
  }
  


  useEffect(()=>{
    getProductsList()
    getCart()
  },[getProductsList])

  // 監聽商品換頁
  function handlePageClick(e,page){
    e.preventDefault()
    getProductsList(page)
  }



  return(<>
    <div className="container mt-5">
      <div className="row">
        <div className="col-12 col-lg-2"></div>
        <div className="col-12 col-lg-10 mt-5">
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
        </div>
    
        <aside className="col-12 col-lg-2">
        {/* 大於 lg 時顯示列表 */}
        <ul className="list-group d-none d-lg-block mt-3">
          {productCategory.map((category) => (
            <li className="list-group-item aside-list" key={category}>
              <a
                onClick={(e) => handleCategoryClick(e, category)}
                href="#"
                className="text-decoration-none text-dark"
              >
                {category}
              </a>
            </li>
          ))}
        </ul>

        {/* 小於 lg 時顯示下拉選單 */}
        <div className="d-block d-lg-none ">
          <div className="form-floating">
            <select
              id="categorySelect"
              className="form-select"
              onChange={(e) => handleCategoryClick(e, e.target.value)}
              >
              {productCategory.map((category) => (
                <option key={category} value={selectedCategory} // 綁定選擇的分類
                onChange={(e) => handleCategoryClick(e, e.target.value)} >
                  {category}
                </option>
              ))}
            </select>
            <label htmlFor="categorySelect" className="form-label">分類篩選</label>
          </div>
        </div>
      </aside>


        <div className="col-lg-10 col-12 mt-4">

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
