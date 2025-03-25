import { createSlice } from "@reduxjs/toolkit";


export const stateSlice = createSlice({
  name:'state',
  initialState: {
    isLogin: getCookie("isLogin") === "true" || false,
    isTest: false
  },
  reducers: {
    setIsLogin: (state, action) => {
      state.isLogin = action.payload
      setCookie("isLogin", action.payload)
    }
  }
})

function getCookie(name) {
  const cookies = document.cookie.split("; ")
  for (let cookie of cookies) {
    const [key, value] = cookie.split("=")
    if (key === name) return value
  }
  return null
}

// 設定 Cookie（新增）
function setCookie(name, value, days = 1) {
  const expires = new Date()
  expires.setDate(expires.getDate() + days)
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`
}


export const { setIsLogin } = stateSlice.actions
export default stateSlice.reducer