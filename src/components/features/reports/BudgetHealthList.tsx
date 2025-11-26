import { BudgetHealth } from '../../../types'
import { getCategoryIcon } from '../../../utils/categoryUtils'
import { Loader2, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'

interface BudgetHealthListProps {
  data: BudgetHealth[]
  loading?: boolean
} 

const BudgetHealthList = ({ data, loading }: BudgetHealthListProps) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-[400px]">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Loading budget data...</p>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-[400px]">
        <div className="text-center">
          <p className="text-gray-500">No active budgets for this month</p>
          <p className="text-sm text-gray-400 mt-1">Create budget templates to track spending</p>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: BudgetHealth['status']) => {
    switch (status) {
      case 'ok':
        return <CheckCircle size={16} className="text-green-600" />
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-600" />
      case 'over_budget':
        return <AlertCircle size={16} className="text-red-600" />
    }
  }

  const getProgressColor = (status: BudgetHealth['status']) => {
    switch (status) {
      case 'over_budget': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Budget Health (Current Month)</h3>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {data.map((budget) => {
          const Icon = getCategoryIcon(budget.categoryName)
          const percentage = Math.min(budget.percentage, 100)
          
          return (
            <div key={budget.categoryId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{budget.categoryName}</span>
                  {getStatusIcon(budget.status)}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  ${budget.spent.toFixed(0)} / ${budget.limit.toFixed(0)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${getProgressColor(budget.status)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className={`text-xs font-bold shrink-0 ${
                  budget.status === 'over_budget' 
                    ? 'text-red-600' 
                    : budget.status === 'warning' 
                    ? 'text-yellow-600' 
                    : 'text-green-600'
                }`}>
                  {budget.percentage.toFixed(0)}%
                </span>
              </div>

              {budget.percentage >= 100 && (
                <p className="text-xs text-red-600 font-medium">
                  Over budget by ${(budget.spent - budget.limit).toFixed(2)}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BudgetHealthList
