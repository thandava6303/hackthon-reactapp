// ============================================
// Products Slice
// Products module state management
// ============================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Product, PaginatedResponse, TableState } from '@/types';
import { mockApi } from '@/services/mockApi';

interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  tableState: TableState;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  categories: string[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  selectedProduct: null,
  tableState: {
    page: 1,
    pageSize: 25,
    sort: null,
    filters: [],
    search: '',
  },
  pagination: {
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0,
  },
  categories: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Automotive', 'Health'],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// Async thunks
export const fetchProducts = createAsyncThunk<
  PaginatedResponse<Product>,
  { page?: number; pageSize?: number; search?: string; category?: string }
>('products/fetchProducts', async ({ page = 1, pageSize = 25, search = '', category = '' }) => {
  return await mockApi.getProducts(page, pageSize, search, category);
});

export const fetchProductById = createAsyncThunk<Product, string>(
  'products/fetchProductById',
  async (id) => {
    return await mockApi.getProductById(id);
  }
);

export const createProduct = createAsyncThunk<Product, Partial<Product>>(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      return await mockApi.createProduct(productData);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateProduct = createAsyncThunk<Product, { id: string; data: Partial<Product> }>(
  'products/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await mockApi.updateProduct(id, data);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteProduct = createAsyncThunk<string, string>(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await mockApi.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setTableState: (state, action: PayloadAction<Partial<TableState>>) => {
      state.tableState = { ...state.tableState, ...action.payload };
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic update for product status
    optimisticUpdateProductStatus: (state, action: PayloadAction<{ id: string; status: Product['status'] }>) => {
      const product = state.products.find((p) => p.id === action.payload.id);
      if (product) {
        product.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      // Fetch Product By Id
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch product';
      })
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isCreating = false;
        state.products.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.products = state.products.filter((p) => p.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedProduct?.id === action.payload) {
          state.selectedProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTableState, setSelectedProduct, clearError, optimisticUpdateProductStatus } = productsSlice.actions;

// Selectors
export const selectProducts = (state: { products: ProductsState }) => state.products.products;
export const selectSelectedProduct = (state: { products: ProductsState }) => state.products.selectedProduct;
export const selectProductsPagination = (state: { products: ProductsState }) => state.products.pagination;
export const selectProductsTableState = (state: { products: ProductsState }) => state.products.tableState;
export const selectProductsLoading = (state: { products: ProductsState }) => state.products.isLoading;
export const selectProductsCategories = (state: { products: ProductsState }) => state.products.categories;
export const selectProductsError = (state: { products: ProductsState }) => state.products.error;

export default productsSlice.reducer;
