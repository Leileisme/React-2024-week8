import axios from "axios"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router"
import { setIsLogin } from "../slice/stateReducer"
import { showSuccessToast, showErrorToast } from "../utils/toastUtils"
import { ToastContainer } from 'react-toastify'

const api = import.meta.env.VITE_BASE_URL

// 登入
const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [user, setUser] = useState({
    username:'',
    password:''
  })

  
  // 登入 API
  async function handleLogin(e){
    e.preventDefault()      
    try {
      const res = await axios.post(
        `${api}/v2/admin/signin`, user)
      const {token,expired} = res.data
      // document.cookie = `token=${token};expires=${new Date(expired)} `
      document.cookie = `token=${token}; expires=${new Date(expired).toUTCString()}; path=/`

      // axios.defaults.headers.common.Authorization = token
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
      dispatch(setIsLogin(true))
      showSuccessToast('登入成功')
      navigate('/admin')
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    }
  }

  // 監聽 input
  function handleInputChange(e){
    const {name,value} = e.target
    setUser({
      ...user,
      [name]:value
    })
  }

  // 返回首頁
  function handleBack(){
    navigate('/')
  }

  return(
    <>
      <div className='container'>
        <div className='d-flex justify-content-center align-items-center flex-column vh-100'>
          <div className="card p-5 mb-3" style={{width: '450px'}}>
            <h1 className='h3 text-center mb-3'>管理員登入</h1>
            <form onSubmit={handleLogin}>
              <div className='form-floating mb-3'>
                <input type="email" id="email" className='form-control' name='username' onChange={handleInputChange} />
                <label htmlFor="email">email</label>
              </div>
              <div className='form-floating mb-3'>
                <input type="password" id="password" className='form-control' name='password' onChange={handleInputChange} />
                <label htmlFor="password">password</label>
              </div>
              <div className='d-flex'>
                <button type='submit' className='btn btn-primary w-75 me-3' >登入</button>
                <button type='button' className='btn btn-outline-secondary w-25' onClick={handleBack}>返回</button>
              </div>
            </form>
          </div>
          <div className="text-secondary">@leilei 2025</div>
        </div>
      </div>

      <ToastContainer></ToastContainer>
    </>
  )
}

export default Login