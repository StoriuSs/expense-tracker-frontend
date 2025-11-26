export interface ApiResponse<T = any> {
  status: string
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: {
    totalItems: number
    itemCount: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
}

export interface PaginationQuery {
  page?: number
  limit?: number
}
