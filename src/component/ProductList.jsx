import { useNavigate } from "react-router"

const ProductList = (props) =>{
const {
  productsList,
  handleClickProductModal,
  handleAddCartItem
} = props
const navigate = useNavigate()

// 前往產品細節
function handleClickProduct (id){
  navigate(`/product/${id}`)
}

return(
<>
  <table className="table">
    <thead>
      <tr>
        <th scope="col">圖片</th>
        <th scope="col" >商品名稱</th>
        <th scope="col">分類</th>
        <th scope="col">價格</th>
        <th></th>
      </tr>
    </thead>
    <tbody >
      {productsList.map((product)=>(
        <tr key={product.id} >
          <td className="align-content-center"><img src={product.imageUrl} alt="" className="product-list-img" /></td>
          <td className="align-content-center"> <h3 className="h6">{product.title}</h3></td>
          <td className="align-content-center">{product.category}</td>
          <td className="align-content-center">
            <span className="h5 text-danger">$ {product.price}</span>
            <br />
            <del className="text-secondary">$ {product.origin_price}</del>
          </td>
          <td className="align-content-center">
            <div className="btn-group" role="group">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={()=>handleClickProduct(product.id)}
                >
                查看詳情
              </button>

              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => handleAddCartItem(product.id,false) }>
                加入購物車
              </button>
            </div>
          </td>
        </tr>
      ))
      }
    </tbody>
  </table>
</>
)}

export default ProductList