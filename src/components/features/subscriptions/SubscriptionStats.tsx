import { Wallet, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import { Subscription, SubscriptionStatus } from '../../../types'

interface SubscriptionStatsProps {
  subscriptions: Subscription[]
}

const SubscriptionStats = ({ subscriptions }: SubscriptionStatsProps) => {
  const activeSubscriptions = subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE)
  
  // Calculate monthly total (average for non-monthly subscriptions)
  const monthlyTotal = activeSubscriptions.reduce((sum, sub) => {
    let monthlyAmount = sub.amount
    
    switch (sub.frequency) {
      case 'weekly':
        monthlyAmount = sub.amount * 4.33 // Average weeks per month
        break
      case 'yearly':
        monthlyAmount = sub.amount / 12
        break
      case 'custom':
        if (sub.customInterval) {
          monthlyAmount = sub.amount / sub.customInterval
        }
        break
    }
    
    return sum + monthlyAmount
  }, 0)

  // Find next payment
  const upcomingPayments = activeSubscriptions
    .map(sub => ({
      ...sub,
      nextDate: new Date(sub.nextPaymentDate)
    }))
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
  
  const nextPayment = upcomingPayments[0]

  // Calculate this month's actual spending (from lastChargedDate)
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  const thisMonthSpent = subscriptions
    .filter(sub => {
      if (!sub.lastChargedDate) return false
      const chargedDate = new Date(sub.lastChargedDate)
      return chargedDate >= firstDayOfMonth && chargedDate <= today
    })
    .reduce((sum, sub) => sum + sub.amount, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Monthly Total */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Wallet size={20} />
          </div>
          <span className="text-gray-500 font-medium text-sm">Expected Monthly</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          ${monthlyTotal.toFixed(2)}
        </div>
      </div>

      {/* Active Subscriptions */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <span className="text-gray-500 font-medium text-sm">Active</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {activeSubscriptions.length}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {subscriptions.length - activeSubscriptions.length} inactive
        </div>
      </div>

      {/* Next Payment */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <span className="text-gray-500 font-medium text-sm">Next Payment</span>
        </div>
        {nextPayment ? (
          <>
            <div className="text-lg font-bold text-gray-900 truncate">
              {nextPayment.name}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {nextPayment.nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${nextPayment.amount.toLocaleString()}
            </div>
          </>
        ) : (
          <div className="text-lg text-gray-400">No upcoming</div>
        )}
      </div>

      {/* This Month Spent */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <span className="text-gray-500 font-medium text-sm">Paid This Month</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          ${thisMonthSpent.toFixed(2)}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionStats
