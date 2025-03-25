import { configureStore } from "@reduxjs/toolkit"
import stateReducer from "../slice/stateReducer"
import cartReducer from "../slice/cartReducer"

export const store = configureStore({
  reducer:{
    state: stateReducer,
    cart: cartReducer, // 註冊購物車的 reducer
  },
})