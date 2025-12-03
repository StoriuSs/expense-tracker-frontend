import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar, FileText, Loader2, ExternalLink } from 'lucide-react'
import { AppDispatch, RootState } from '../../../store'
import { fetchExpenses } from '../../../store/slices/expensesSlice'
import { BudgetPeriod, Category } from '../../../types'
import Modal from '../../common/Modal'

interface BudgetExpensesModalProps {
  isOpen: boolean
  onClose: () => void
  period: BudgetPeriod | null
  category: Category | undefined
}

const BudgetExpensesModal = ({ isOpen, onClose, period, category }: BudgetExpensesModalProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { items: expenses, loading } = useSelector((state: RootState) => state.expenses)

  useEffect(() => {
    if (isOpen && period) {
      dispatch(fetchExpenses({
        categoryId: period.categoryId,
        startDate: period.periodStart,
        endDate: period.periodEnd,
        limit: 100 // Fetch up to 100 expenses for this period
      }))
    }
  }, [isOpen, period, dispatch])

  const handleViewAllExpenses = () => {
    if (!period) return
    
    // Navigate to Expenses page with pre-filled filters
    const params = new URLSearchParams({
      categoryId: period.categoryId,
      startDate: period.periodStart,
      endDate: period.periodEnd
    })
    
    navigate(`/expenses?${params.toString()}`)
    onClose()
  }

  if (!period) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center min-w-0">
          <span className="truncate" title={category?.name}>{category?.name || 'Budget'}</span>
          <span className="whitespace-nowrap ml-1">Expenses</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Header Info */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-gray-500">Period</p>
              <p className="font-medium text-gray-900">
                {format(new Date(period.periodStart), 'MMM d')} - {format(new Date(period.periodEnd), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="font-bold text-lg text-gray-900">${period.spentAmount.toLocaleString()}</p>
            </div>
          </div>
          
          {/* View All Button */}
          <button
            onClick={handleViewAllExpenses}
            className="w-full mt-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink size={16} />
            View All in Expenses Page
          </button>
        </div>

        {/* Expenses List */}
        <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 size={32} className="animate-spin mb-2" />
              <p>Loading expenses...</p>
            </div>
          ) : expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div 
                  key={expense.id} 
                  className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-100 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {expense.note || 'No description'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {format(new Date(expense.timestamp), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-gray-900">
                    -${expense.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p>No expenses found for this period</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default BudgetExpensesModal
