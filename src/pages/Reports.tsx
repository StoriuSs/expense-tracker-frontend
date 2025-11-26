import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { 
  fetchTrend, 
  fetchCategoryBreakdown, 
  fetchSummary, 
  fetchTopExpenses 
} from '../store/slices/statisticsSlice'
import DateRangeSelector from '../components/features/reports/DateRangeSelector'
import SummaryCard from '../components/features/reports/SummaryCard'
import SpendingTrendChart from '../components/features/reports/SpendingTrendChart'
import CategoryBreakdownChart from '../components/features/reports/CategoryBreakdownChart'
import TopExpensesList from '../components/features/reports/TopExpensesList'
import { Wallet, TrendingUp, Activity } from 'lucide-react'
import { getDateRangePresets } from '../utils/dateRangeUtils'

const Reports = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { trend, categoryBreakdown, summary, topExpenses, loading } = useSelector(
    (state: RootState) => state.statistics
  )

  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })
  const [granularity, setGranularity] = useState<'month' | 'day'>('month')

  // Initialize with This Month
  useEffect(() => {
    const presets = getDateRangePresets()
    const thisMonth = presets.this_month()
    setDateRange({ startDate: thisMonth.startDate, endDate: thisMonth.endDate })
    
    // Fetch all data with this month
    fetchAllData(thisMonth.startDate, thisMonth.endDate)
  }, [])

  const fetchAllData = (startDate: string, endDate: string) => {
    dispatch(fetchTrend({ startDate, endDate, granularity }))
    dispatch(fetchCategoryBreakdown({ startDate, endDate }))
    dispatch(fetchSummary({ startDate, endDate }))
    dispatch(fetchTopExpenses({ startDate, endDate, limit: 10 }))
  }

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate })
    fetchAllData(startDate, endDate)
  }

  const handleGranularityChange = (newGranularity: 'month' | 'day') => {
    setGranularity(newGranularity)
    if (dateRange.startDate && dateRange.endDate) {
      dispatch(fetchTrend({ 
        startDate: dateRange.startDate, 
        endDate: dateRange.endDate, 
        granularity: newGranularity 
      }))
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500">Analyze your spending patterns</p>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector onRangeChange={handleDateRangeChange} />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Spent"
          value={summary ? `$${summary.currentPeriod.total.toFixed(2)}` : '$0.00'}
          icon={Wallet}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
          change={summary?.comparison.totalChange}
        />
        
        <SummaryCard
          title="Avg per Day"
          value={summary ? `$${summary.currentPeriod.avgPerDay.toFixed(2)}` : '$0.00'}
          icon={TrendingUp}
          iconBgColor="bg-green-50"
          iconTextColor="text-green-600"
          change={summary?.comparison.avgChange}
        />
        
        <SummaryCard
          title="Transactions"
          value={summary ? summary.currentPeriod.transactionCount.toString() : '0'}
          icon={Activity}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
          subtitle={summary ? `${summary.currentPeriod.categoriesUsed} categories` : undefined}
        />
      </div>

      {/* Insights */}
      {summary && summary.insights.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
          <h3 className="text-sm font-bold text-indigo-900 mb-2">💡 Insights</h3>
          <ul className="space-y-1">
            {summary.insights.map((insight, index) => (
              <li key={index} className="text-sm text-indigo-700">
                • {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Spending Trend Chart */}
      <div>
        <div className="flex items-center justify-end gap-2 mb-3">
          <button
            onClick={() => handleGranularityChange('month')}
            className={`px-3 py-1 text-sm font-bold rounded-lg transition-colors ${
              granularity === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => handleGranularityChange('day')}
            className={`px-3 py-1 text-sm font-bold rounded-lg transition-colors ${
              granularity === 'day'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Daily
          </button>
        </div>
        <SpendingTrendChart data={trend} loading={loading} granularity={granularity} />
      </div>

      {/* Category Breakdown & Top Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdownChart data={categoryBreakdown} loading={loading} />
        <TopExpensesList data={topExpenses} loading={loading} limit={10} />
      </div>
    </div>
  )
}

export default Reports
