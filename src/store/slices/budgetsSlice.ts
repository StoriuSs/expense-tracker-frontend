import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { 
  BudgetTemplate, 
  BudgetPeriod, 
  CurrentMonthSummary, 
  CreateBudgetTemplateData, 
  UpdateBudgetTemplateData,
  BudgetPeriodFilter
} from '../../types'
import { budgetsService } from '../../services/budgetsService'
import { getApiErrorMessage } from '../../utils/errorUtils'

interface BudgetsState {
  templates: BudgetTemplate[]
  periods: BudgetPeriod[]
  currentMonthSummary: CurrentMonthSummary | null
  loading: boolean
  error: string | null
  // Specific loading states
  templatesLoading: boolean
  periodsLoading: boolean
  summaryLoading: boolean
  operationLoading: boolean // For create/update/delete
}

const initialState: BudgetsState = {
  templates: [],
  periods: [],
  currentMonthSummary: null,
  loading: false,
  error: null,
  templatesLoading: false,
  periodsLoading: false,
  summaryLoading: false,
  operationLoading: false
}
// Async Thunks

export const fetchTemplates = createAsyncThunk(
  'budgets/fetchTemplates',
  async (params: { sortBy?: string; sortOrder?: 'asc' | 'desc' } | undefined, { rejectWithValue }) => {
    try {
      return await budgetsService.getTemplates(params)
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch budget templates'))
    }
  }
)

export const fetchPeriods = createAsyncThunk(
  'budgets/fetchPeriods',
  async (filter: BudgetPeriodFilter, { rejectWithValue }) => {
    try {
      return await budgetsService.getPeriods(filter)
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch budget periods'))
    }
  }
)

export const createTemplate = createAsyncThunk(
  'budgets/createTemplate',
  async (data: CreateBudgetTemplateData, { rejectWithValue }) => {
    try {
      return await budgetsService.createTemplate(data)
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create budget template'))
    }
  }
)

export const updateTemplate = createAsyncThunk(
  'budgets/updateTemplate',
  async ({ id, data }: { id: string; data: UpdateBudgetTemplateData }, { rejectWithValue }) => {
    try {
      return await budgetsService.updateTemplate(id, data)
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update budget template'))
    }
  }
)

export const deleteTemplate = createAsyncThunk(
  'budgets/deleteTemplate',
  async (id: string, { rejectWithValue }) => {
    try {
      await budgetsService.deleteTemplate(id)
      return id
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete budget template'))
    }
  }
)

export const fetchCurrentMonthSummary = createAsyncThunk(
  'budgets/fetchCurrentMonthSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await budgetsService.getCurrentSummary()
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch budget summary'))
    }
  }
)

export const generatePeriods = createAsyncThunk(
  'budgets/generatePeriods',
  async (month: string, { rejectWithValue }) => {
    try {
      return await budgetsService.generatePeriods(month)
    } catch (error: any) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to generate budget periods'))
    }
  }
)

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetState: () => initialState
  },
  extraReducers: (builder) => {
    // Fetch Templates
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.templatesLoading = true
        state.error = null
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.templatesLoading = false
        state.templates = action.payload
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.templatesLoading = false
        state.error = action.payload as string
      })

    // Create Template
    builder
      .addCase(createTemplate.pending, (state) => {
        state.operationLoading = true
        state.error = null
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.operationLoading = false
        state.templates.unshift(action.payload)
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.operationLoading = false
        state.error = action.payload as string
      })

    // Update Template
    builder
      .addCase(updateTemplate.pending, (state) => {
        state.operationLoading = true
        state.error = null
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.operationLoading = false
        const index = state.templates.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.templates[index] = action.payload
        }
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.operationLoading = false
        state.error = action.payload as string
      })

    // Delete Template
    builder
      .addCase(deleteTemplate.pending, (state) => {
        state.operationLoading = true
        state.error = null
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.operationLoading = false
        state.templates = state.templates.filter(t => t.id !== action.payload)
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.operationLoading = false
        state.error = action.payload as string
      })

    // Fetch Periods
    builder
      .addCase(fetchPeriods.pending, (state) => {
        state.periodsLoading = true
        state.error = null
      })
      .addCase(fetchPeriods.fulfilled, (state, action) => {
        state.periodsLoading = false
        state.periods = action.payload
      })
      .addCase(fetchPeriods.rejected, (state, action) => {
        state.periodsLoading = false
        state.error = action.payload as string
      })

    // Fetch Summary
    builder
      .addCase(fetchCurrentMonthSummary.pending, (state) => {
        state.summaryLoading = true
        state.error = null
      })
      .addCase(fetchCurrentMonthSummary.fulfilled, (state, action) => {
        state.summaryLoading = false
        state.currentMonthSummary = action.payload
      })
      .addCase(fetchCurrentMonthSummary.rejected, (state, action) => {
        state.summaryLoading = false
        state.error = action.payload as string
      })

    // Generate Periods
    builder
      .addCase(generatePeriods.pending, (state) => {
        state.periodsLoading = true
        state.error = null
      })
      .addCase(generatePeriods.fulfilled, (state) => {
        state.periodsLoading = false
      })
      .addCase(generatePeriods.rejected, (state, action) => {
        state.periodsLoading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, resetState } = budgetsSlice.actions
export default budgetsSlice.reducer
