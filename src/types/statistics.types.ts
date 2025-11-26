// Statistics Types

export interface TrendDataPoint {
  date: string // Format: 'yyyy-MM' or 'yyyy-MM-dd'
  amount: number
}

export interface CategoryBreakdown {
  categoryId: string
  categoryName: string
  color: string | null
  amount: number
  percentage: number
}

export interface BudgetHealth {
  categoryId: string
  categoryName: string
  limit: number
  spent: number
  percentage: number
  status: 'ok' | 'warning' | 'over_budget'
}

export interface StatisticsSummary {
  currentPeriod: {
    total: number
    avgPerDay: number
    transactionCount: number
    categoriesUsed: number
    startDate: string
    endDate: string
  }
  previousPeriod: {
    total: number
    avgPerDay: number
    startDate: string
    endDate: string
  }
  comparison: {
    totalChange: number
    avgChange: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }
  insights: string[]
}

export interface TopExpense {
  id: string
  amount: number
  categoryId: string
  categoryName: string
  categoryColor: string | null
  note: string | null
  timestamp: string
}

// Query params
export interface StatisticsQuery {
  startDate?: string
  endDate?: string
  granularity?: 'month' | 'day'
  limit?: number
}

// Date range presets
export type DateRangePreset = 
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year'
  | 'custom'
