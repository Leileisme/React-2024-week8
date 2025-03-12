import axios from "axios"
import { showDangerToast } from "./toastUtils"
import { setIsLogin } from "../slice/stateReducer"

const api = import.meta.env.VITE_BASE_URL;

export async function checkLogin(dispatch) {
  try {
    await axios.post(`${api}/v2/api/user/check`)
    dispatch(setIsLogin(true)) 
  } catch (error) {
    showDangerToast("登入驗證失敗，請重新登入")
    throw error // 將錯誤拋出，讓外部處理
  }
}

export function getTokenFromCookies() {
  return document.cookie.replace(
    /(?:(?:^|.*\s*)token\s*=\s*([^;]*).*$)|^.*$/,
    "$1"
  )
}
