import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import expensesService from '../../services/expensesService'
import { Expense, CreateExpenseData, UpdateExpenseData, ExpenseFilter, ExpenseSummary } from '../../types'
import { getApiErrorMessage } from '../../utils/errorUtils'

interface PaginationMeta {
  currentPage: number
  itemsPerPage: number      // items_per_page from backend
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface ExpensesState {
  items: Expense[]
  loading: boolean
  error: string | null
  pagination: PaginationMeta | null
  summary: ExpenseSummary | null
  summaryLoading: boolean
}

const initialState: ExpensesState = {
  items: [],
  loading: false,
  error: null,
  pagination: null,
  summary: null,
  summaryLoading: false
}

// Async Thunks
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchAll',
  async (filters: ExpenseFilter | undefined, { rejectWithValue }) => {
    try {
      const response = await expensesService.getAll(filters)
      return response
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch expenses'))
    }
  }
)

export const fetchExpenseSummary = createAsyncThunk(
  'expenses/fetchSummary',
  async (filters: { startDate?: string; endDate?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await expensesService.getSummary(filters?.startDate, filters?.endDate)
      return response
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch expense summary'))
    }
  }
)

export const createExpense = createAsyncThunk(
  'expenses/create',
  async ({ data, receiptFile }: { data: CreateExpenseData; receiptFile?: File }, { rejectWithValue }) => {
    try {
      const response = await expensesService.create(data, receiptFile)
      return response
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create expense'))
    }
  }
)

export const updateExpense = createAsyncThunk(
  'expenses/update',
  async ({ id, data }: { id: string; data: UpdateExpenseData }, { rejectWithValue }) => {
    try {
      const response = await expensesService.update(id, data)
      return response
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update expense'))
    }
  }
)

export const deleteExpense = createAsyncThunk(
  'expenses/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await expensesService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete expense'))
    }
  }
)

export const batchDeleteExpenses = createAsyncThunk(
  'expenses/batchDelete',
  async (ids: string[], { rejectWithValue }) => {
    try {
      await expensesService.batchDelete(ids)
      return ids
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete expenses'))
    }
  }
)

export const uploadReceipt = createAsyncThunk(
  'expenses/uploadReceipt',
  async ({ id, file }: { id: string; file: File }, { rejectWithValue }) => {
    try {
      const response = await expensesService.uploadReceipt(id, file)
      return response
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to upload receipt'))
    }
  }
)

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Fetch Expenses
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.pagination = action.payload.meta
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch Summary
    builder
      .addCase(fetchExpenseSummary.pending, (state) => {
        state.summaryLoading = true
      })
      .addCase(fetchExpenseSummary.fulfilled, (state, action) => {
        state.summaryLoading = false
        state.summary = action.payload
      })
      .addCase(fetchExpenseSummary.rejected, (state) => {
        state.summaryLoading = false
      })

    // Create Expense - no direct state manipulation, rely on refetch
    builder
      .addCase(createExpense.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createExpense.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Update Expense - no direct state manipulation, rely on refetch
    builder
      .addCase(updateExpense.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateExpense.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Delete Expense - no direct state manipulation, rely on refetch
    builder
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteExpense.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Batch Delete - no direct state manipulation, rely on refetch
    builder
      .addCase(batchDeleteExpenses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(batchDeleteExpenses.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(batchDeleteExpenses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Upload Receipt - update in place
    builder
      .addCase(uploadReceipt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadReceipt.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(uploadReceipt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError } = expensesSlice.actions
export default expensesSlice.reducer
