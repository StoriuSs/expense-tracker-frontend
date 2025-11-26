import { PaginationQuery } from './common.types'

export interface Expense {
  id: string
  categoryId: string
  subscriptionId: string | null
  amount: number
  timestamp: Date
  note: string | null
  receiptUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateExpenseData {
  categoryId: string
  amount: number
  timestamp: string // ISO string
  note?: string
}

export interface UpdateExpenseData {
  categoryId?: string
  amount?: number
  timestamp?: string
  note?: string
}

export interface ExpenseFilter extends PaginationQuery {
  categoryId?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  search?: string
}

export interface ExpenseSummary {
  totalAmount: number
  count: number
  averageAmount: number
}
