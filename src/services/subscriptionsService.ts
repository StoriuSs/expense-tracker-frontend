import axiosInstance from '../utils/axios'
import { API_ENDPOINTS } from '../config/api'
import { Subscription, CreateSubscriptionData, UpdateSubscriptionData, SubscriptionFilter } from '../types'
import { keysToCamelCase, keysToSnakeCase } from '../utils/caseConverter'

interface PaginationMeta {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface SubscriptionsPaginatedResponse {
  items: Subscription[]
  meta: PaginationMeta
}

const subscriptionsService = {
  getAll: async (filters?: SubscriptionFilter): Promise<SubscriptionsPaginatedResponse> => {
    try {
      const params = new URLSearchParams()
      
      if (filters?.status) params.append('status', filters.status)
      if (filters?.categoryId) params.append('category_id', filters.categoryId)
      if (filters?.frequency) params.append('frequency', filters.frequency)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.minAmount !== undefined) params.append('min_amount', filters.minAmount.toString())
      if (filters?.maxAmount !== undefined) params.append('max_amount', filters.maxAmount.toString())
      if (filters?.sortBy) params.append('sort_by', filters.sortBy)
      if (filters?.sortOrder) params.append('sort_order', filters.sortOrder)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const response = await axiosInstance.get(`${API_ENDPOINTS.SUBSCRIPTIONS.BASE}?${params}`)
      
      // Backend now returns standard format: { code, type, message, data: { items, meta } }
      const data = response.data.data
      
      if (!data || !data.items) {
        console.error('Invalid response structure:', response.data)
        return { items: [], meta: { currentPage: 1, itemsPerPage: 10, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } }
      }
      
      return {
        items: keysToCamelCase(data.items).map((item: any) => ({
          ...item,
          amount: parseFloat(item.amount),
          nextPaymentDate: new Date(item.nextPaymentDate).toISOString(),
          lastChargedDate: item.lastChargedDate ? new Date(item.lastChargedDate).toISOString() : null,
          createdAt: new Date(item.createdAt).toISOString(),
          updatedAt: new Date(item.updatedAt).toISOString()
        })),
        meta: keysToCamelCase(data.meta)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      throw error
    }
  },

  getById: async (id: string): Promise<Subscription> => {
    const response = await axiosInstance.get(API_ENDPOINTS.SUBSCRIPTIONS.BY_ID(id))
    const subscription = keysToCamelCase(response.data.data.subscription)
    
    return {
      ...subscription,
      amount: parseFloat(subscription.amount),
      nextPaymentDate: new Date(subscription.nextPaymentDate).toISOString(),
      lastChargedDate: subscription.lastChargedDate ? new Date(subscription.lastChargedDate).toISOString() : null,
      createdAt: new Date(subscription.createdAt).toISOString(),
      updatedAt: new Date(subscription.updatedAt).toISOString()
    }
  },

  create: async (data: CreateSubscriptionData): Promise<Subscription> => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.SUBSCRIPTIONS.BASE,
      keysToSnakeCase(data)
    )
    const subscription = keysToCamelCase(response.data.data.subscription)
    
    return {
      ...subscription,
      amount: parseFloat(subscription.amount),
      nextPaymentDate: new Date(subscription.nextPaymentDate).toISOString(),
      lastChargedDate: subscription.lastChargedDate ? new Date(subscription.lastChargedDate).toISOString() : null,
      createdAt: new Date(subscription.createdAt).toISOString(),
      updatedAt: new Date(subscription.updatedAt).toISOString()
    }
  },

  update: async (id: string, data: UpdateSubscriptionData): Promise<Subscription> => {
    const response = await axiosInstance.patch(
      API_ENDPOINTS.SUBSCRIPTIONS.BY_ID(id),
      keysToSnakeCase(data)
    )
    const subscription = keysToCamelCase(response.data.data.subscription)
    
    return {
      ...subscription,
      amount: parseFloat(subscription.amount),
      nextPaymentDate: new Date(subscription.nextPaymentDate).toISOString(),
      lastChargedDate: subscription.lastChargedDate ? new Date(subscription.lastChargedDate).toISOString() : null,
      createdAt: new Date(subscription.createdAt).toISOString(),
      updatedAt: new Date(subscription.updatedAt).toISOString()
    }
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.SUBSCRIPTIONS.BY_ID(id))
  },

  processPayment: async (id: string): Promise<{ subscription: Subscription; expense: any }> => {
    const response = await axiosInstance.post(API_ENDPOINTS.SUBSCRIPTIONS.PAY(id))
    const data = keysToCamelCase(response.data.data)
    
    return {
      subscription: {
        ...data.subscription,
        amount: parseFloat(data.subscription.amount),
        nextPaymentDate: new Date(data.subscription.nextPaymentDate).toISOString(),
        lastChargedDate: data.subscription.lastChargedDate ? new Date(data.subscription.lastChargedDate).toISOString() : null,
        createdAt: new Date(data.subscription.createdAt).toISOString(),
        updatedAt: new Date(data.subscription.updatedAt).toISOString()
      },
      expense: data.expense
    }
  }
}

export default subscriptionsService
