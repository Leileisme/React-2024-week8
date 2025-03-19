import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const NotFoundPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/')
    }, 3000)

    return () => clearTimeout(timer) // 清除計時器，避免記憶體洩漏
  }, [navigate])

  return (
    <div className="d-flex justify-content-center align-item-center">
      <div>
        <h2>404 頁面錯誤</h2>
        <p>3 秒後將自動跳轉到首頁...</p>
      </div>
    </div>
  )
}

export default NotFoundPage
