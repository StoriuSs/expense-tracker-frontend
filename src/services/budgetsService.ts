import axiosInstance from '../utils/axios'
import { 
  BudgetTemplate, 
  CreateBudgetTemplateData, 
  UpdateBudgetTemplateData, 
  BudgetPeriod, 
  BudgetPeriodFilter,
  CurrentMonthSummary,
} from '../types'
import { API_ENDPOINTS } from '../config/api'
import { keysToCamelCase, keysToSnakeCase } from '../utils/caseConverter'

export const budgetsService = {
  // Templates
  getTemplates: async (params?: { sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<BudgetTemplate[]> => {
    const queryParams = new URLSearchParams()
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const response = await axiosInstance.get(`${API_ENDPOINTS.BUDGET_TEMPLATES.BASE}?${queryParams.toString()}`)
    return keysToCamelCase(response.data.data.items).map((item: any) => ({
      ...item,
      monthlyAmount: parseFloat(item.monthlyAmount)
    }))
  },

  createTemplate: async (data: CreateBudgetTemplateData): Promise<BudgetTemplate> => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.BUDGET_TEMPLATES.BASE, 
      keysToSnakeCase(data)
    )
    const responseData = keysToCamelCase(response.data.data)
    const template = responseData.budgetTemplate
    return {
      ...template,
      monthlyAmount: parseFloat(template.monthlyAmount)
    }
  },

  updateTemplate: async (id: string, data: UpdateBudgetTemplateData): Promise<BudgetTemplate> => {
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.BUDGET_TEMPLATES.BASE}/${id}`, 
        keysToSnakeCase(data)
      )
      const responseData = keysToCamelCase(response.data.data)
      const template = responseData.budgetTemplate
      return {
        ...template,
        monthlyAmount: parseFloat(template.monthlyAmount)
      }
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.BUDGET_TEMPLATES.BASE}/${id}`)
  },

  // Periods
  getPeriods: async (filter: BudgetPeriodFilter): Promise<BudgetPeriod[]> => {
    const params = new URLSearchParams()
    if (filter.month) params.append('month', filter.month)
    if (filter.categoryId) params.append('category_id', filter.categoryId)
    if (filter.startDate) params.append('start_date', filter.startDate)
    if (filter.endDate) params.append('end_date', filter.endDate)

    const response = await axiosInstance.get(`${API_ENDPOINTS.BUDGET_PERIODS.BASE}?${params.toString()}`)
    return keysToCamelCase(response.data.data.items).map((item: any) => ({
      ...item,
      periodAmount: parseFloat(item.periodAmount),
      spentAmount: parseFloat(item.spentAmount),
      remaining: parseFloat(item.remaining)
    }))
  },

  getCurrentSummary: async (): Promise<CurrentMonthSummary> => {
    const response = await axiosInstance.get(API_ENDPOINTS.BUDGET_PERIODS.CURRENT_SUMMARY)
    const summary = keysToCamelCase(response.data.data)
    return {
      ...summary,
      totalBudget: parseFloat(summary.totalBudget),
      totalSpent: parseFloat(summary.totalSpent),
      categories: summary.categories.map((cat: any) => ({
        ...cat,
        periodAmount: parseFloat(cat.periodAmount),
        spentAmount: parseFloat(cat.spentAmount),
        remaining: parseFloat(cat.remaining)
      }))
    }
  },

  generatePeriods: async (month: string): Promise<BudgetPeriod[]> => {
    const response = await axiosInstance.post(
      `${API_ENDPOINTS.BUDGET_PERIODS.BASE}/generate`,
      { month }
    )
    return keysToCamelCase(response.data.data).map((item: any) => ({
      ...item,
      periodAmount: parseFloat(item.periodAmount),
      spentAmount: parseFloat(item.spentAmount),
      remaining: parseFloat(item.remaining)
    }))
  }
}
