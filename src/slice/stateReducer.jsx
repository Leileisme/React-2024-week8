import { createSlice } from "@reduxjs/toolkit";


export const stateSlice = createSlice({
  name:'state',
  initialState: {
    isLogin: false,
    isTest: false
  },
  reducers: {
    setIsLogin: (state, action) => {
      state.isLogin = action.payload
    }
  }
})

export const { setIsLogin } = stateSlice.actions
export default stateSlice.reducer