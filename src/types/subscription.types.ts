import { PaginationQuery } from './common.types'

export enum SubscriptionFrequency {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled'
}

export interface Subscription {
  id: string
  userId: string
  categoryId: string
  name: string
  amount: number
  frequency: SubscriptionFrequency
  customInterval: number | null
  nextPaymentDate: string
  lastChargedDate: string | null
  autoCreateExpense: boolean
  status: SubscriptionStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateSubscriptionData {
  categoryId: string
  name: string
  amount: number
  frequency: SubscriptionFrequency
  customInterval?: number
  nextPaymentDate: string
  autoCreateExpense?: boolean
  notes?: string
  status?: SubscriptionStatus
}

export interface UpdateSubscriptionData {
  name?: string
  amount?: number
  frequency?: SubscriptionFrequency
  customInterval?: number
  nextPaymentDate?: string
  autoCreateExpense?: boolean
  notes?: string
  status?: SubscriptionStatus
}

export interface SubscriptionFilter extends PaginationQuery {
  search?: string
  status?: SubscriptionStatus
  frequency?: SubscriptionFrequency
  categoryId?: string
  minAmount?: number
  maxAmount?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
