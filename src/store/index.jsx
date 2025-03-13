import { configureStore } from "@reduxjs/toolkit"
import messageReducer from "../slice/messageReducer"
import cartReducer from "../slice/cartReducer"

export const store = configureStore({
  reducer:{
    message: messageReducer,
    cart: cartReducer, // 註冊購物車的 reducer
  },
  
})