import axiosInstance from '../utils/axios'
import { API_ENDPOINTS } from '../config/api'
import { Expense, CreateExpenseData, UpdateExpenseData, ExpenseFilter, ExpenseSummary } from '../types'
import { keysToCamelCase } from '../utils/caseConverter'

interface PaginationMeta {
  currentPage: number       // current_page
  itemsPerPage: number      // items_per_page (NOT perPage!)
  totalItems: number        // total_items
  totalPages: number        // total_pages
  hasNextPage: boolean      // has_next_page
  hasPreviousPage: boolean  // has_previous_page
}

interface ExpensesPaginatedResponse {
  items: Expense[]
  meta: PaginationMeta
}

const expensesService = {
  getAll: async (filters?: ExpenseFilter): Promise<ExpensesPaginatedResponse> => {
    try {
      const params = new URLSearchParams()
      
      if (filters?.categoryId) params.append('category_id', filters.categoryId)
      if (filters?.startDate) params.append('start_date', filters.startDate)
      if (filters?.endDate) params.append('end_date', filters.endDate)
      if (filters?.minAmount !== undefined) params.append('min_amount', filters.minAmount.toString())
      if (filters?.maxAmount !== undefined) params.append('max_amount', filters.maxAmount.toString())
      if (filters?.search) params.append('search', filters.search)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const response = await axiosInstance.get(`${API_ENDPOINTS.EXPENSES.BASE}?${params}`)
      
      // Backend returns { data: { items: [...], meta: {...} } }
      // NOT pagination! Check your console log - it's "meta"
      const data = response.data.data
      return {
        items: keysToCamelCase(data.items).map((item: any) => ({
          ...item,
          amount: parseFloat(item.amount), // Convert string to number
          timestamp: new Date(item.timestamp),
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        })),
        meta: keysToCamelCase(data.meta)  // Use data.meta, not data.pagination!
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
      throw error
    }
  },

  getSummary: async (startDate?: string, endDate?: string): Promise<ExpenseSummary> => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const response = await axiosInstance.get(`${API_ENDPOINTS.EXPENSES.SUMMARY}?${params}`)
      const summary = keysToCamelCase(response.data.data)
      
      // Convert string amounts to numbers (backend returns Decimal as string)
      return {
        ...summary,
        totalAmount: parseFloat(summary.totalAmount || '0'),
        averageAmount: parseFloat(summary.averageAmount || '0'),
        count: summary.count || 0
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
      throw error
    }
  },

  create: async (data: CreateExpenseData, receiptFile?: File): Promise<Expense> => {
    try {
      const formData = new FormData()
      formData.append('categoryId', data.categoryId)
      formData.append('amount', data.amount.toString())
      formData.append('timestamp', data.timestamp)
      if (data.note) formData.append('note', data.note)
      if (receiptFile) formData.append('receipt', receiptFile)

      const response = await axiosInstance.post(API_ENDPOINTS.EXPENSES.BASE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      

      
      const responseData = keysToCamelCase(response.data.data)
      const expense = responseData.expense
      const budgetStatus = responseData.budgetStatus

      return {
        ...expense,
        amount: parseFloat(expense.amount),
        timestamp: new Date(expense.timestamp),
        createdAt: new Date(expense.createdAt),
        updatedAt: new Date(expense.updatedAt),
        budgetStatus
      }
    } catch (error) {
      console.error('Error creating expense:', error)
      throw error
    }
  },

  update: async (id: string, data: UpdateExpenseData): Promise<Expense> => {
    try {
      // Send camelCase data directly as backend DTO expects camelCase properties
      const response = await axiosInstance.patch(API_ENDPOINTS.EXPENSES.BY_ID(id), data)
      
      const responseData = keysToCamelCase(response.data.data)
      const expense = responseData.expense
      const budgetStatus = responseData.budgetStatus

      return {
        ...expense,
        amount: parseFloat(expense.amount),
        timestamp: new Date(expense.timestamp),
        createdAt: new Date(expense.createdAt),
        updatedAt: new Date(expense.updatedAt),
        budgetStatus
      }
    } catch (error) {
      console.error('Error updating expense:', error)
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.EXPENSES.BY_ID(id))
    } catch (error) {
      console.error('Error deleting expense:', error)
      throw error
    }
  },

  batchDelete: async (ids: string[]): Promise<void> => {
    try {
      await axiosInstance.post(API_ENDPOINTS.EXPENSES.BATCH_DELETE, { ids })
    } catch (error) {
      console.error('Error batch deleting expenses:', error)
      throw error
    }
  },

  uploadReceipt: async (id: string, file: File): Promise<Expense> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axiosInstance.post(API_ENDPOINTS.EXPENSES.RECEIPT(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const expense = keysToCamelCase(response.data.data.expense)
      return {
        ...expense,
        amount: parseFloat(expense.amount),
        timestamp: new Date(expense.timestamp),
        createdAt: new Date(expense.createdAt),
        updatedAt: new Date(expense.updatedAt)
      }
    } catch (error) {
      console.error('Error uploading receipt:', error)
      throw error
    }
  }
}

export default expensesService
