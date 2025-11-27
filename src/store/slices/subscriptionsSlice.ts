import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import subscriptionsService from '../../services/subscriptionsService'
import { Subscription, CreateSubscriptionData, UpdateSubscriptionData, SubscriptionFilter } from '../../types'
import { getApiErrorMessage } from '../../utils/errorUtils'

interface PaginationMeta {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface SubscriptionsState {
  items: Subscription[]
  loading: boolean
  error: string | null
  operationLoading: boolean
  pagination: PaginationMeta | null
}

const initialState: SubscriptionsState = {
  items: [],
  loading: false,
  error: null,
  operationLoading: false,
  pagination: null
}

// Async Thunks
export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetchAll',
  async (filters?: SubscriptionFilter) => {
    const response = await subscriptionsService.getAll(filters)
    return response
  }
)

export const fetchSubscription = createAsyncThunk(
  'subscriptions/fetchOne',
  async (id: string) => {
    const response = await subscriptionsService.getById(id)
    return response
  }
)

export const createSubscription = createAsyncThunk(
  'subscriptions/create',
  async (data: CreateSubscriptionData, { rejectWithValue }) => {
    try {
      const response = await subscriptionsService.create(data)
      return response
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create subscription'))
    }
  }
)

export const updateSubscription = createAsyncThunk(
  'subscriptions/update',
  async ({ id, data }: { id: string; data: UpdateSubscriptionData }, { rejectWithValue }) => {
    try {
      const response = await subscriptionsService.update(id, data)
      return response
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update subscription'))
    }
  }
)

export const deleteSubscription = createAsyncThunk(
  'subscriptions/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await subscriptionsService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete subscription'))
    }
  }
)

export const processPayment = createAsyncThunk(
  'subscriptions/processPayment',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await subscriptionsService.processPayment(id)
      return response.subscription
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to process payment'))
    }
  }
)

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.pagination = action.payload.meta
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch subscriptions'
      })

    // Fetch One
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        } else {
          state.items.push(action.payload)
        }
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch subscription'
      })

    // Create
    builder
      .addCase(createSubscription.pending, (state) => {
        state.operationLoading = true
        state.error = null
      })
      .addCase(createSubscription.fulfilled, (state) => {
        state.operationLoading = false
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.operationLoading = false
        state.error = action.payload as string
      })

    // Update
    builder
      .addCase(updateSubscription.pending, (state) => {
        state.operationLoading = true
        state.error = null
      })
      .addCase(updateSubscription.fulfilled, (state) => {
        state.operationLoading = false
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.operationLoading = false
        state.error = action.payload as string
      })

    // Delete
    builder
      .addCase(deleteSubscription.pending, (state) => {
        state.operationLoading = true
        state.error = null
      })
      .addCase(deleteSubscription.fulfilled, (state) => {
        state.operationLoading = false
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.operationLoading = false
        state.error = action.payload as string
      })

    // Process Payment
    builder
      .addCase(processPayment.pending, (state) => {
        state.operationLoading = true
        state.error = null
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.operationLoading = false
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.operationLoading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError } = subscriptionsSlice.actions
export default subscriptionsSlice.reducer
