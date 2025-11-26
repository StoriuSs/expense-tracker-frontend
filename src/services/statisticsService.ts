import axiosInstance from '../utils/axios'
import { API_ENDPOINTS } from '../config/api'
import {
  TrendDataPoint,
  CategoryBreakdown,
  BudgetHealth,
  StatisticsSummary,
  TopExpense,
  StatisticsQuery
} from '../types'
import { keysToCamelCase, keysToSnakeCase } from '../utils/caseConverter'

const statisticsService = {
  getTrend: async (params?: StatisticsQuery): Promise<TrendDataPoint[]> => {
    const query = new URLSearchParams()
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    if (params?.granularity) query.append('granularity', params.granularity)

    const response = await axiosInstance.get(
      `${API_ENDPOINTS.STATISTICS.TREND}?${query}`
    )
    const data = keysToCamelCase(response.data.data)
    return data.map((item: any) => ({
      date: item.date,
      amount: parseFloat(item.amount)
    }))
  },

  getCategoryBreakdown: async (params?: StatisticsQuery): Promise<CategoryBreakdown[]> => {
    const query = new URLSearchParams()
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)

    const response = await axiosInstance.get(
      `${API_ENDPOINTS.STATISTICS.CATEGORIES}?${query}`
    )
    const data = keysToCamelCase(response.data.data)
    return data.map((item: any) => ({
      ...item,
      amount: parseFloat(item.amount),
      percentage: parseFloat(item.percentage)
    }))
  },

  getBudgetHealth: async (): Promise<BudgetHealth[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.STATISTICS.BUDGETS)
    const data = keysToCamelCase(response.data.data)
    return data.map((item: any) => ({
      ...item,
      limit: parseFloat(item.limit),
      spent: parseFloat(item.spent),
      percentage: parseFloat(item.percentage)
    }))
  },

  getSummary: async (params?: StatisticsQuery): Promise<StatisticsSummary> => {
    const query = new URLSearchParams()
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)

    const response = await axiosInstance.get(
      `${API_ENDPOINTS.STATISTICS.SUMMARY}?${query}`
    )
    const data = keysToCamelCase(response.data.data)
    
    return {
      currentPeriod: {
        ...data.currentPeriod,
        total: parseFloat(data.currentPeriod.total),
        avgPerDay: parseFloat(data.currentPeriod.avgPerDay)
      },
      previousPeriod: {
        ...data.previousPeriod,
        total: parseFloat(data.previousPeriod.total),
        avgPerDay: parseFloat(data.previousPeriod.avgPerDay)
      },
      comparison: {
        ...data.comparison,
        totalChange: parseFloat(data.comparison.totalChange),
        avgChange: parseFloat(data.comparison.avgChange)
      },
      insights: data.insights
    }
  },

  getTopExpenses: async (params?: StatisticsQuery): Promise<TopExpense[]> => {
    const query = new URLSearchParams()
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    if (params?.limit) query.append('limit', params.limit.toString())

    const response = await axiosInstance.get(
      `${API_ENDPOINTS.STATISTICS.TOP_EXPENSES}?${query}`
    )
    const data = keysToCamelCase(response.data.data)
    return data.map((item: any) => ({
      ...item,
      amount: parseFloat(item.amount),
      timestamp: new Date(item.timestamp).toISOString()
    }))
  }
}

export default statisticsService
