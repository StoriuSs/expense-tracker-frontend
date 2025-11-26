import { TopExpense } from '../../../types'
import { getCategoryIcon, getCategoryColorStyles } from '../../../utils/categoryUtils'
import { Loader2, Receipt } from 'lucide-react'
import { format } from 'date-fns'

interface TopExpensesListProps {
  data: TopExpense[]
  loading?: boolean
  limit?: number
}

const TopExpensesList = ({ data, loading, limit = 10 }: TopExpensesListProps) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-[300px]">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Loading top expenses...</p>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-[300px]">
        <div className="text-center">
          <Receipt size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No expenses found</p>
        </div>
      </div>
    )
  }

  const displayData = data.slice(0, limit)

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Biggest Expenses</h3>
      <p className="text-xs text-gray-500 -mt-3 mb-4">Top transactions in selected period</p>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {displayData.map((expense, index) => {
          const Icon = getCategoryIcon(expense.categoryName)
          const colorStyles = getCategoryColorStyles(expense.categoryColor as any)
          const expenseDate = new Date(expense.timestamp)
          
          return (
            <div 
              key={expense.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {/* Rank */}
              <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center shrink-0">
                {index + 1}
              </div>

              {/* Category Icon */}
              <div className={`w-10 h-10 rounded-xl ${colorStyles.bg} ${colorStyles.text} flex items-center justify-center shrink-0`}>
                <Icon size={20} />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {expense.note || 'No description'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {expense.categoryName} • {format(expenseDate, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-gray-900 shrink-0">
                    ${expense.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {data.length > limit && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            {data.length - limit} more {data.length - limit === 1 ? 'expense' : 'expenses'} not shown
          </p>
        </div>
      )}
    </div>
  )
}

export default TopExpensesList
