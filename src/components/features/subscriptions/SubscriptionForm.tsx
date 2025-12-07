import { useState, useEffect } from 'react'
import {
  Category,
  CreateSubscriptionData,
  UpdateSubscriptionData,
  Subscription,
  SubscriptionFrequency,
  SubscriptionStatus,
} from '../../../types'
import { format } from 'date-fns'
import CategorySelect from '../../common/CategorySelect'

interface SubscriptionFormProps {
  categories: Category[]
  initialData?: Subscription
  onSubmit: (data: CreateSubscriptionData | UpdateSubscriptionData) => void
  onCancel: () => void
  loading?: boolean
}

const SubscriptionForm = ({
  categories,
  initialData,
  onSubmit,
  onCancel,
  loading,
}: SubscriptionFormProps) => {
  const [formData, setFormData] = useState({
    categoryId: initialData?.categoryId || '',
    name: initialData?.name || '',
    amount: initialData?.amount || 0,
    frequency: initialData?.frequency || SubscriptionFrequency.MONTHLY,
    customInterval: initialData?.customInterval || 1,
    nextPaymentDate: initialData?.nextPaymentDate
      ? format(new Date(initialData.nextPaymentDate), 'yyyy-MM-dd')
      : '',
    autoCreateExpense: initialData?.autoCreateExpense ?? true,
    status: initialData?.status || SubscriptionStatus.ACTIVE,
    notes: initialData?.notes || '',
  })

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        categoryId: initialData.categoryId,
        name: initialData.name,
        amount: initialData.amount,
        frequency: initialData.frequency,
        customInterval: initialData.customInterval || 1,
        nextPaymentDate: format(new Date(initialData.nextPaymentDate), 'yyyy-MM-dd'),
        autoCreateExpense: initialData.autoCreateExpense,
        status: initialData.status,
        notes: initialData.notes || '',
      })
    } else {
      // Reset form
      setFormData({
        categoryId: '',
        name: '',
        amount: 0,
        frequency: SubscriptionFrequency.MONTHLY,
        customInterval: 1,
        nextPaymentDate: '',
        autoCreateExpense: true,
        status: SubscriptionStatus.ACTIVE,
        notes: '',
      })
    }
  }, [initialData])

  // Calculate default next payment date based on frequency
  useEffect(() => {
    if (!initialData && !formData.nextPaymentDate) {
      const today = new Date()
      let nextDate = new Date(today)

      switch (formData.frequency) {
        case SubscriptionFrequency.WEEKLY:
          nextDate.setDate(today.getDate() + 7)
          break
        case SubscriptionFrequency.MONTHLY:
          nextDate.setMonth(today.getMonth() + 1)
          break
        case SubscriptionFrequency.YEARLY:
          nextDate.setFullYear(today.getFullYear() + 1)
          break
        case SubscriptionFrequency.CUSTOM:
          nextDate.setMonth(today.getMonth() + (formData.customInterval || 1))
          break
      }

      setFormData((prev) => ({
        ...prev,
        nextPaymentDate: format(nextDate, 'yyyy-MM-dd'),
      }))
    }
  }, [formData.frequency, formData.customInterval, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData: any = {
      categoryId: formData.categoryId,
      name: formData.name,
      amount: parseFloat(formData.amount.toString()),
      frequency: formData.frequency,
      nextPaymentDate: formData.nextPaymentDate,
      autoCreateExpense: formData.autoCreateExpense,
      status: formData.status,
    }

    if (formData.frequency === SubscriptionFrequency.CUSTOM) {
      submitData.customInterval = parseInt(formData.customInterval.toString())
    }

    if (formData.notes.trim()) {
      submitData.notes = formData.notes.trim()
    }

    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Netflix, Spotify, Gym Membership"
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <CategorySelect
          categories={categories}
          value={formData.categoryId}
          onChange={(id) => setFormData({ ...formData, categoryId: id })}
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Amount <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Frequency <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: SubscriptionFrequency.WEEKLY, label: 'Weekly' },
            { value: SubscriptionFrequency.MONTHLY, label: 'Monthly' },
            { value: SubscriptionFrequency.YEARLY, label: 'Yearly' },
            { value: SubscriptionFrequency.CUSTOM, label: 'Custom' },
          ].map((freq) => (
            <button
              key={freq.value}
              type="button"
              onClick={() => setFormData({ ...formData, frequency: freq.value })}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                formData.frequency === freq.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {freq.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Interval */}
      {formData.frequency === SubscriptionFrequency.CUSTOM && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Custom Interval (days) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.customInterval}
            onChange={(e) => setFormData({ ...formData, customInterval: parseInt(e.target.value) })}
            placeholder="e.g., 3 for every 3 months"
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Next Payment Date */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Next Payment Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          required
          value={formData.nextPaymentDate}
          onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Auto-create Expense */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="text-sm font-bold text-gray-900">Auto-create Expense</p>
          <p className="text-xs text-gray-500">Automatically create expense on payment date</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.autoCreateExpense}
            onChange={(e) => setFormData({ ...formData, autoCreateExpense: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value as SubscriptionStatus })
          }
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value={SubscriptionStatus.ACTIVE}>Active</option>
          <option value={SubscriptionStatus.INACTIVE}>Inactive</option>
          <option value={SubscriptionStatus.CANCELLED}>Cancelled</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add notes about this subscription..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Subscription'}
        </button>
      </div>
    </form>
  )
}

export default SubscriptionForm
