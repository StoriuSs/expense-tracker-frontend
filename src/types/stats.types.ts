export enum Granularity {
  DAY = 'day',
  MONTH = 'month',
  YEAR = 'year'
}

export interface StatsQuery {
  startDate?: string
  endDate?: string
  granularity?: Granularity
}

export interface TrendPoint {
  date: string
  amount: number
  count: number
}

export interface CategoryBreakdownItem {
  categoryId: string
  categoryName: string
  categoryColor: string
  amount: number
  percentage: number
  count: number
}

export interface BudgetHealthItem {
  categoryId: string
  categoryName: string
  budgetAmount: number
  spentAmount: number
  percentage: number
  status: 'ok' | 'warning' | 'over_budget'
}
