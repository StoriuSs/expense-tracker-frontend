import { useEffect, useState } from 'react'
import { Expense } from '../../../types'
import expensesService from '../../../services/expensesService'
import { getCategoryIcon, getCategoryColorStyles } from '../../../utils/categoryUtils'
import { Loader2, ArrowRight, Receipt } from 'lucide-react'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

const RecentTransactions = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const { items: categories } = useSelector((state: RootState) => state.categories)

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await expensesService.getAll({ limit: 10, page: 1 })
        setExpenses(response.items)
      } catch (error) {
        console.error('Failed to fetch recent expenses', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecent()
  }, [])

  const getCategoryName = (id: string) => {
    const category = categories.find(c => c.id === id)
    return category ? category.name : 'Unknown'
  }

  const getCategoryColor = (id: string) => {
    const category = categories.find(c => c.id === id)
    return category ? category.color : 'gray'
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
        <Link 
          to="/expenses" 
          className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          View All <ArrowRight size={16} />
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-10 flex-1 flex flex-col justify-center">
          <Receipt size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 min-h-0">
          {expenses.map((expense) => {
            const categoryName = getCategoryName(expense.categoryId)
            const categoryColor = getCategoryColor(expense.categoryId)
            const Icon = getCategoryIcon(categoryName)
            const colorStyles = getCategoryColorStyles(categoryColor as any)

            return (
              <div key={expense.id} className="flex items-center gap-3 group">
                <div className={`w-10 h-10 rounded-xl ${colorStyles.bg} ${colorStyles.text} flex items-center justify-center transition-transform group-hover:scale-105`}>
                  <Icon size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {expense.note || categoryName}
                    </h4>
                    <span className="text-sm font-bold text-gray-900 shrink-0">
                      ${expense.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{categoryName}</span>
                    <span>{format(new Date(expense.timestamp), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default RecentTransactions
