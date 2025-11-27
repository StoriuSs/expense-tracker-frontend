import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import categoriesService from '../../services/categoriesService'
import { Category, CreateCategoryData, UpdateCategoryData } from '../../types'
import { getApiErrorMessage } from '../../utils/errorUtils'

interface PaginationMeta {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface CategoriesState {
  items: Category[]
  loading: boolean
  error: string | null
  pagination: PaginationMeta | null
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
  pagination: null
}

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (filters: { 
    search?: string
    color?: string
    minUsageRate?: number
    maxUsageRate?: number
    page?: number
    limit?: number
  } | undefined, { rejectWithValue }) => {
    try {
      return await categoriesService.getAll(filters)
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch categories'))
    }
  }
)

export const createCategory = createAsyncThunk(
  'categories/create',
  async (data: CreateCategoryData, { rejectWithValue }) => {
    try {
      return await categoriesService.create(data)
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create category'))
    }
  }
)

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }: { id: string; data: UpdateCategoryData }, { rejectWithValue }) => {
    try {
      return await categoriesService.update(id, data)
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update category'))
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await categoriesService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete category'))
    }
  }
)

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetCategories: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.pagination = action.payload.meta
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create
      .addCase(createCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.loading = false
        // Don't push to state - let refetch handle it
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update
      .addCase(updateCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.loading = false
        // Don't update state - let refetch handle it
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Delete
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCategory.fulfilled, (state) => {
        state.loading = false
        // Don't filter state - let refetch handle it
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, resetCategories } = categoriesSlice.actions
export default categoriesSlice.reducer
