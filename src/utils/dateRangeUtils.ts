import { 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfYear, 
  endOfYear 
} from 'date-fns'

export interface DateRange {
  startDate: string  // ISO format
  endDate: string    // ISO format
  label: string
}

export const getDateRangePresets = (): Record<string, () => DateRange> => {
  const today = new Date()

  return {
    this_month: () => {
      const start = startOfMonth(today)
      const end = endOfMonth(today)
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        label: 'This Month'
      }
    },

    last_month: () => {
      const lastMonth = subMonths(today, 1)
      const start = startOfMonth(lastMonth)
      const end = endOfMonth(lastMonth)
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        label: 'Last Month'
      }
    },

    last_3_months: () => {
      const threeMonthsAgo = subMonths(today, 3)
      const start = startOfMonth(threeMonthsAgo)
      const end = endOfMonth(today)
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        label: 'Last 3 Months'
      }
    },

    last_6_months: () => {
      const sixMonthsAgo = subMonths(today, 6)
      const start = startOfMonth(sixMonthsAgo)
      const end = endOfMonth(today)
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        label: 'Last 6 Months'
      }
    },

    this_year: () => {
      const start = startOfYear(today)
      const end = endOfYear(today)
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        label: 'This Year'
      }
    }
  }
}

export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const startFormatted = start.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
  
  const endFormatted = end.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
  
  return `${startFormatted} → ${endFormatted}`
}
