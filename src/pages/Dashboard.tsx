import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { fetchSummary, fetchTrend, fetchBudgetHealth } from '../store/slices/statisticsSlice'
import { fetchSubscriptions } from '../store/slices/subscriptionsSlice'
import { fetchCategories } from '../store/slices/categoriesSlice'
import { subDays, format } from 'date-fns'
import { Wallet, Calendar, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getDateRangePresets } from '../utils/dateRangeUtils'

import SummaryCard from '../components/features/reports/SummaryCard'
import MiniTrendChart from '../components/features/dashboard/MiniTrendChart'
import RecentTransactions from '../components/features/dashboard/RecentTransactions'
import BudgetHealthList from '../components/features/reports/BudgetHealthList'

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { summary, trend, budgetHealth, loading: statsLoading } = useSelector((state: RootState) => state.statistics)
  const { items: subscriptions } = useSelector((state: RootState) => state.subscriptions)

  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    // Fetch initial data using date range presets
    const presets = getDateRangePresets()
    const thisMonth = presets.this_month()
    const last30DaysStart = subDays(new Date(), 30).toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]

    dispatch(fetchCategories())
    dispatch(fetchSummary({ startDate: thisMonth.startDate, endDate: thisMonth.endDate }))
    dispatch(fetchTrend({ startDate: last30DaysStart, endDate: today, granularity: 'day' }))
    dispatch(fetchBudgetHealth())
    dispatch(fetchSubscriptions())
  }, [dispatch])

  // Calculate next subscription
  const getNextSubscription = () => {
    if (!subscriptions.length) return null
    
    // Simple logic: find next payment date
    // In a real app, we'd calculate next payment date based on frequency
    // For now, let's just take the first one that is active
    const activeSubs = subscriptions.filter(s => s.status === 'active')
    if (!activeSubs.length) return null
    
    // Sort by next payment date if available, or just pick first
    return activeSubs[0]
  }

  const nextSub = getNextSubscription()

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {user?.fullName?.split(' ')[0] || 'User'}! 👋</h1>
          <p className="text-gray-500">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
        </div>
        <Link 
          to="/expenses" 
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Add Expense
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Spent This Month"
          value={summary ? `$${summary.currentPeriod.total.toFixed(2)}` : '$0.00'}
          icon={Wallet}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
          change={summary?.comparison.totalChange}
        />
        
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <span className="text-gray-500 font-medium text-sm">Next Subscription</span>
          </div>
          {nextSub ? (
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                ${nextSub.amount.toFixed(2)}
              </div>
              <div className="text-sm font-medium text-gray-600 truncate">
                {nextSub.name}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm py-2">No active subscriptions</div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <span className="text-gray-500 font-medium text-sm">Active Budgets</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {budgetHealth.length}
          </div>
          <div className="text-sm text-gray-500">
            Tracking {budgetHealth.length} categories
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          <div className="shrink-0">
            <MiniTrendChart data={trend} loading={statsLoading} />
          </div>
          <div className="flex-1 min-h-0">
            <RecentTransactions />
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="h-full overflow-y-auto">
          <BudgetHealthList data={budgetHealth} loading={statsLoading} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
