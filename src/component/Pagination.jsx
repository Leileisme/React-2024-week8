const Pagination=({pagination,getProducts,getOrders,getCoupon,handlePageClick,type})=>{

  return(<nav aria-label="Page navigation example">
    <ul className="pagination justify-content-center">
      <li className="page-item">
        <a
          className={`page-link ${pagination.has_pre ? '' : 'disabled'}`}
          href='#'
          onClick={(e)=>{
            if( type === 'getOrders' ){
              getOrders(e,pagination.current_page - 1)
            } else if( type === 'getProducts' ){
              getProducts(e,pagination.current_page - 1)
            } else if( type == 'getCoupon' ){
              getCoupon(e,pagination.current_page - 1)
            } else if ( type === 'handlePageClick' ){
              handlePageClick(e,pagination.current_page - 1)
            }
          }}
          >上一頁</a>
      </li>
      {
        [...new Array(pagination.total_pages)].map((_,index)=>(
          <li className="page-item" key={index+1}>
            <a 
              className={`page-link ${index+1 === pagination.current_page && 'active'}`}
              href='#'
              onClick={(e)=> {
                if( type === 'getOrders' ){
                  getOrders(e,index+1)
                } else if( type === 'getProducts' ){
                  getProducts(e,index+1)
                } else if( type == 'getCoupon' ){
                  getCoupon(e,index+1)
                }else if ( type === 'handlePageClick' ){
                  handlePageClick(e,index+1)
                }
              }}>{index+1}</a>
          </li>
        ))
      }
      <li className="page-item">
        <a
          className={`page-link ${pagination.has_next ? '' : 'disabled'}`} 
          href='#'
          onClick={(e)=>{
            if( type === 'getOrders' ){
              getOrders(e,pagination.current_page + 1)
            } else if( type === 'getProducts' ){
              getProducts(e,pagination.current_page + 1)
            } else if( type == 'getCoupon' ){
              getCoupon(e,pagination.current_page + 1)
            }else if ( type === 'handlePageClick' ){
              handlePageClick(e,pagination.current_page + 1)
            }
          }}
        >下一頁</a>
      </li>
    </ul>
  </nav>
  )
}

export default Pagination