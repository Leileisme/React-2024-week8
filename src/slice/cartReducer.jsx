import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { showSuccessToast,showDangerToast,showErrorToast } from '../utils/toastUtils'

const BASE_URL = import.meta.env.VITE_BASE_URL
const PATH = import.meta.env.VITE_API_PATH

// 取得購物車列表
export const getCart = createAsyncThunk('cart/getCart', async (_, { dispatch }) => {
  try {
    const res = await axios.get(`${BASE_URL}/v2/api/${PATH}/cart`);
    const cartData = res.data.data;

    // 檢查庫存數量
    const updatedCart = cartData.carts.map((item) => {
      if (item.qty > item.product.stockQty) {
        showDangerToast(`商品 ${item.product.title} 庫存不足，最多只能購買 ${item.product.stockQty} 個`);
        dispatch(editCartItem({ cartId: item.id, productId: item.product_id, qty: item.product.stockQty }));
        return { ...item, qty: item.product.stockQty };
      }
      return item;
    });

    return {
      cart: cartData,
      cartItemsQty: updatedCart.map((cart) => ({
        id: cart.product_id,
        qty: cart.qty,
      })),
    };
  } catch (error) {
    showErrorToast(error?.response?.data?.message);
    throw error;
  }
});

// 修改購物車數量
export const editCartItem = createAsyncThunk(
  'cart/editCartItem',
  async ({ cartId, productId, qty }, { rejectWithValue }) => {
    try {
      await axios.put(`${BASE_URL}/v2/api/${PATH}/cart/${cartId}`, { product_id: productId, qty });
      return { cartId, productId, qty };
    } catch (error) {
      showErrorToast(error?.response?.data?.message);
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

// 新增商品到購物車
export const addCartItem = createAsyncThunk(
  'cart/addCartItem',
  async ({ productId, qty }, { rejectWithValue }) => {
    try {
      await axios.post(`${BASE_URL}/v2/api/${PATH}/cart`, { product_id: productId, qty });
      return { productId, qty };
    } catch (error) {
      showErrorToast(error?.response?.data?.message);
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);



// 設定產品詳情
export const setProductDetail = createAsyncThunk(
  'cart/setProductDetail',
  async (productDetail) => productDetail
);

// 購物車 Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: {}, // 購物車
    productDetail: {}, // 產品詳情
    cartQty: 1, // 單獨商品數量
    cartItemsQty: [], // 多個商品數量
    isLoading: false,
  },
  reducers: {
    // 設定單一商品數量
    setCartQty: (state, action) => {
      state.cartQty = action.payload;
    },
    setIsLoading:(state, action) => {
      state.isLoading = action.payload;
    },

    // 處理輸入數量變化（即時更新）
    handleCartQtyInputOnChange: (state, action) => {
      const { cartId, qty, formCart } = action.payload;
      if (formCart) {
        state.cartItemsQty = state.cartItemsQty.map((item) =>
          item.id === cartId ? { ...item, qty } : item
        );
      } else {
        state.cartQty = qty;
      }
    },

    // 處理數量輸入框離開焦點時的行為
    handleCartQtyInputOnBlur: (state, action) => {
      const { cart, formCart, productDetail, dispatch } = action.payload;
      let val = Number(action.payload.qty);

      if (isNaN(val) || val < 1) {
        showDangerToast('只能輸入大於 0 的數字！');
        if (formCart) {
          dispatch(getCart()); // 重新取得購物車數據
        } else {
          state.cartQty = 1;
        }
        return;
      }

      const maxQty = formCart ? cart.product.stockQty : productDetail.stockQty;

      if (val > maxQty) {
        showDangerToast(`庫存只剩 ${maxQty}`);
        val = maxQty;
      }

      if (formCart) {
        dispatch(editCartItem({ cartId: cart.id, productId: cart.product_id, qty: val }));
      } else {
        state.cartQty = val;
      }
    },

    // 加入購物車
    handleAddCartItem: (state, action) => {
      const { productId, isDetail, productDetail, dispatch } = action.payload;

      const existingItem = state.cartItemsQty.find((item) => item.id === productId);
      const currentQty = existingItem ? existingItem.qty : 0;
      const maxQty = productDetail.stockQty;

      let purchaseQty = isDetail ? Number(state.cartQty) : 1;
      const totalQty = currentQty + purchaseQty;

      if (totalQty > maxQty) {
        purchaseQty = maxQty - currentQty;
        showDangerToast(`商品 ${productDetail.title} 庫存不足，最多只能購買 ${maxQty} 個`);
      }

      if (purchaseQty > 0) {
        dispatch(addCartItem({ productId, qty: purchaseQty }));
      }

      if (isDetail) {
        state.cartQty = 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload.cart;
        state.cartItemsQty = action.payload.cartItemsQty;
      })
      .addCase(getCart.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(editCartItem.fulfilled, (state, action) => {
        const { productId, qty } = action.payload;
        state.cartItemsQty = state.cartItemsQty.map((item) =>
          item.id === productId ? { ...item, qty } : item
        );
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        const { productId, qty } = action.payload;
        const existingItem = state.cartItemsQty.find((item) => item.id === productId);
        if (existingItem) {
          existingItem.qty += qty;
        } else {
          state.cartItemsQty.push({ id: productId, qty });
        }
      })
      .addCase(setProductDetail.fulfilled, (state, action) => {
        state.productDetail = action.payload;
      });
  },
});

export const {
  setCartQty,
  setIsLoading,
  handleCartQtyInputOnChange,
  handleCartQtyInputOnBlur,
  handleAddCartItem,
} = cartSlice.actions;

export default cartSlice.reducer;
