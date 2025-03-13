import { configureStore } from "@reduxjs/toolkit"
import messageReducer from "../slice/messageReducer"
import stateReducer from "../slice/stateReducer"
import cartReducer from "../slice/cartReducer"

export const store = configureStore({
  reducer:{
    message: messageReducer,
    state: stateReducer,
    cart: cartReducer, // 註冊購物車的 reducer
  },
  
})