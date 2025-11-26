import { useState } from 'react'
import { Save, AlertTriangle } from 'lucide-react'
import CategorySelect from '../../common/CategorySelect'
import { Category } from '../../../types'
import { CreateBudgetTemplateData, UpdateBudgetTemplateData, BudgetTemplate } from '../../../types'

interface BudgetTemplateFormProps {
  categories: Category[]
  initialData?: BudgetTemplate
  onSubmit: (data: CreateBudgetTemplateData | UpdateBudgetTemplateData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const BudgetTemplateForm = ({ 
  categories, 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false 
}: BudgetTemplateFormProps) => {
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')
  const [amount, setAmount] = useState(initialData?.monthlyAmount?.toString() || '')
  const [alertThreshold, setAlertThreshold] = useState(initialData?.alertThreshold || 80)
  const [active, setActive] = useState(initialData?.active ?? true)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Filter out categories that already have a budget template (unless it's the current one being edited)
  // This logic might need to be passed from parent or handled here if we had the list of all templates.
  // For now, we assume the parent handles validation or we just show all.
  // Ideally, we should disable categories that are already taken.
  
  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!categoryId) {
      newErrors.categoryId = 'Category is required'
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Valid amount is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    const data: CreateBudgetTemplateData | UpdateBudgetTemplateData = {
      monthlyAmount: parseFloat(amount),
      alertThreshold,
      active
    }

    // Only include categoryId for new templates (it's usually not editable for existing ones to avoid confusion, or maybe it is?)
    // The backend update DTO doesn't seem to support changing categoryId easily without checking conflicts.
    // Let's assume for update we don't send categoryId if it's not allowed, but our type allows it.
    // Actually, for create we need it.
    if (!initialData) {
      (data as CreateBudgetTemplateData).categoryId = categoryId
    }

    await onSubmit(data)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div className="p-1">

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          {initialData ? (
            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium">
              {categories.find(c => c.id === categoryId)?.name || 'Unknown Category'}
            </div>
          ) : (
            <CategorySelect
              categories={categories}
              value={categoryId}
              onChange={(id) => {
                setCategoryId(id)
                setErrors({ ...errors, categoryId: '' })
              }}
              error={errors.categoryId}
            />
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Budget
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setErrors({ ...errors, amount: '' })
              }}
              placeholder="0.00"
              className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-colors font-medium ${
                errors.amount
                  ? 'border-red-300 bg-red-50 focus:border-red-500'
                  : 'border-gray-200 focus:border-indigo-500'
              }`}
            />
          </div>
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Alert Threshold Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Alert Threshold
            </label>
            <span className={`text-sm font-bold ${
              alertThreshold >= 100 ? 'text-red-500' : 
              alertThreshold >= 80 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {alertThreshold}%
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <AlertTriangle size={12} />
            You'll be notified when spending reaches {alertThreshold}% of budget
          </p>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
          <span className="text-sm font-medium text-gray-700">
            Active (Auto-generate monthly)
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={20} />
                Save Budget
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    </div>
  )
}

export default BudgetTemplateForm
