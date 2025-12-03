export interface BudgetTemplate {
  id: string
  userId: string
  categoryId: string
  monthlyAmount: number
  alertThreshold: number | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface BudgetPeriod {
  id: string
  userId: string
  categoryId: string
  periodStart: string
  periodEnd: string
  periodAmount: number
  spentAmount: number
  percentageUsed: number
  isOverBudget: boolean
  remaining: number
  alertThreshold: number | null
  createdAt: string
  updatedAt: string
  expenseCount: number
}

export interface CreateBudgetTemplateData {
  categoryId: string
  monthlyAmount: number
  alertThreshold?: number
  active?: boolean
}

export interface UpdateBudgetTemplateData {
  monthlyAmount?: number
  alertThreshold?: number
  active?: boolean
}

export interface BudgetPeriodFilter {
  month?: string // YYYY-MM
  categoryId?: string
  startDate?: string
  endDate?: string
}

export interface CategoryBudgetSummary {
  categoryId: string
  categoryName: string
  periodAmount: string
  spentAmount: string
  percentageUsed: number
  isOverBudget: boolean
  remaining: string
}

export interface CurrentMonthSummary {
  month: string
  totalBudget: string
  totalSpent: string
  percentageUsed: number
  categories: CategoryBudgetSummary[]
}
