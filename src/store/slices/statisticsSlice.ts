import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import statisticsService from '../../services/statisticsService'
import {
  TrendDataPoint,
  CategoryBreakdown,
  BudgetHealth,
  StatisticsSummary,
  TopExpense,
  StatisticsQuery
} from '../../types'

interface StatisticsState {
  trend: TrendDataPoint[]
  categoryBreakdown: CategoryBreakdown[]
  budgetHealth: BudgetHealth[]
  summary: StatisticsSummary | null
  topExpenses: TopExpense[]
  loading: boolean
  error: string | null
}

const initialState: StatisticsState = {
  trend: [],
  categoryBreakdown: [],
  budgetHealth: [],
  summary: null,
  topExpenses: [],
  loading: false,
  error: null
}

// Async Thunks
export const fetchTrend = createAsyncThunk(
  'statistics/fetchTrend',
  async (params?: StatisticsQuery) => {
    return await statisticsService.getTrend(params)
  }
)

export const fetchCategoryBreakdown = createAsyncThunk(
  'statistics/fetchCategoryBreakdown',
  async (params?: StatisticsQuery) => {
    return await statisticsService.getCategoryBreakdown(params)
  }
)

export const fetchBudgetHealth = createAsyncThunk(
  'statistics/fetchBudgetHealth',
  async () => {
    return await statisticsService.getBudgetHealth()
  }
)

export const fetchSummary = createAsyncThunk(
  'statistics/fetchSummary',
  async (params?: StatisticsQuery) => {
    return await statisticsService.getSummary(params)
  }
)

export const fetchTopExpenses = createAsyncThunk(
  'statistics/fetchTopExpenses',
  async (params?: StatisticsQuery) => {
    return await statisticsService.getTopExpenses(params)
  }
)

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Fetch Trend
    builder
      .addCase(fetchTrend.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTrend.fulfilled, (state, action) => {
        state.loading = false
        state.trend = action.payload
      })
      .addCase(fetchTrend.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch trend data'
      })

    // Fetch Category Breakdown
    builder
      .addCase(fetchCategoryBreakdown.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategoryBreakdown.fulfilled, (state, action) => {
        state.loading = false
        state.categoryBreakdown = action.payload
      })
      .addCase(fetchCategoryBreakdown.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch category breakdown'
      })

    // Fetch Budget Health
    builder
      .addCase(fetchBudgetHealth.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBudgetHealth.fulfilled, (state, action) => {
        state.loading = false
        state.budgetHealth = action.payload
      })
      .addCase(fetchBudgetHealth.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch budget health'
      })

    // Fetch Summary
    builder
      .addCase(fetchSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.loading = false
        state.summary = action.payload
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch summary'
      })

    // Fetch Top Expenses
    builder
      .addCase(fetchTopExpenses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTopExpenses.fulfilled, (state, action) => {
        state.loading = false
        state.topExpenses = action.payload
      })
      .addCase(fetchTopExpenses.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch top expenses'
      })
  }
})

export const { clearError } = statisticsSlice.actions
export default statisticsSlice.reducer
