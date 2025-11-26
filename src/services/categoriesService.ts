import axiosInstance from '../utils/axios'
import { API_ENDPOINTS } from '../config/api'
import { Category, CreateCategoryData, UpdateCategoryData } from '../types'
import { keysToCamelCase, keysToSnakeCase } from '../utils/caseConverter'

interface PaginationMeta {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface CategoriesPaginatedResponse {
  items: Category[]
  meta: PaginationMeta
}

interface CategoriesResponse {
  data: {
    items?: any[]
    meta?: any
  } | any[]
}

const categoriesService = {
  getAll: async (filters?: { 
    search?: string
    color?: string
    minUsageRate?: number
    maxUsageRate?: number
    page?: number
    limit?: number
  }): Promise<CategoriesPaginatedResponse> => {
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.color) params.append('color', filters.color)
      if (filters?.minUsageRate !== undefined) params.append('min_usage_rate', filters.minUsageRate.toString())
      if (filters?.maxUsageRate !== undefined) params.append('max_usage_rate', filters.maxUsageRate.toString())
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const response = await axiosInstance.get<CategoriesResponse>(`${API_ENDPOINTS.CATEGORIES.BASE}?${params.toString()}`)
      
      // Handle paginated response from backend
      if (response.data && response.data.data && typeof response.data.data === 'object' && 'items' in response.data.data) {
        const data = response.data.data
        return {
          items: keysToCamelCase(data.items),
          meta: keysToCamelCase(data.meta)
        }
      }
      
      // Fallback for non-paginated or array responses
      const items = Array.isArray(response.data) 
        ? keysToCamelCase(response.data)
        : Array.isArray(response.data.data)
        ? keysToCamelCase(response.data.data)
        : []
      
      return {
        items,
        meta: {
          currentPage: 1,
          itemsPerPage: items.length,
          totalItems: items.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  create: async (data: CreateCategoryData): Promise<Category> => {
    const snakeCaseData = keysToSnakeCase(data)
    const response = await axiosInstance.post(API_ENDPOINTS.CATEGORIES.BASE, snakeCaseData)
    return keysToCamelCase(response.data.data.category)
  },

  update: async (id: string, data: UpdateCategoryData): Promise<Category> => {
    const snakeCaseData = keysToSnakeCase(data)
    const response = await axiosInstance.patch(API_ENDPOINTS.CATEGORIES.BY_ID(id), snakeCaseData)
    return keysToCamelCase(response.data.data.category)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.CATEGORIES.BY_ID(id))
  }
}

export default categoriesService
