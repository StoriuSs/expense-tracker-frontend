import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { BudgetPeriod } from '../../../types'
import { getCategoryIcon, getCategoryColorStyles } from '../../../utils/categoryUtils'
import { CategoryColor } from '../../../types'

interface BudgetProgressCardProps {
  period: BudgetPeriod
  categoryName: string
  categoryColor: string
  onClick?: () => void
}

const BudgetProgressCard = ({ period, categoryName, categoryColor, onClick }: BudgetProgressCardProps) => {
  const {
    periodAmount,
    spentAmount,
    percentageUsed,
    isOverBudget,
    remaining
  } = period

  const statusColor = useMemo(() => {
    if (isOverBudget) return 'red'
    if (percentageUsed >= (period.alertThreshold || 80)) return 'yellow'
    return 'green'
  }, [isOverBudget, percentageUsed, period.alertThreshold])

  const Icon = getCategoryIcon(categoryName)
  const categoryStyles = getCategoryColorStyles(categoryColor as CategoryColor)

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
          <div className={`w-10 h-10 rounded-xl ${categoryStyles.bg} ${categoryStyles.text} flex items-center justify-center transition-transform group-hover:scale-110 shrink-0`}>
            <Icon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-gray-900 truncate" title={categoryName}>{categoryName}</h4>
            <p className="text-xs text-gray-500 font-medium truncate">
              ${spentAmount.toLocaleString()} spent • {period.expenseCount} transactions
            </p>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
          statusColor === 'red' ? 'bg-red-100 text-red-700' :
          statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {percentageUsed.toFixed(0)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div 
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
            statusColor === 'red' ? 'bg-red-500' :
            statusColor === 'yellow' ? 'bg-yellow-500' :
            'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentageUsed, 100)}%` }}
        />
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-500">
          of <span className="font-semibold text-gray-900">${periodAmount.toLocaleString()}</span>
        </div>
        
        {isOverBudget ? (
          <div className="flex items-center gap-1 text-red-600 font-bold">
            <AlertTriangle size={14} />
            +${Math.abs(remaining).toLocaleString()} over
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-600 font-medium">
            <span className="text-gray-400">Left:</span>
            ${remaining.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetProgressCard
