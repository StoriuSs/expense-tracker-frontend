import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { CreateExpenseData, Expense } from '../../../types'
import Button from '../../common/Button'
import Input from '../../common/Input'
import CategorySelect from '../../common/CategorySelect'
import { Upload, X } from 'lucide-react'
import { getAssetUrl } from '../../../utils/urlUtils'
import { format } from 'date-fns'

interface ExpenseFormProps {
  initialData?: Expense
  onSubmit: (data: CreateExpenseData & { removeReceipt?: boolean }, receiptFile?: File) => void
  onCancel: () => void
  isLoading: boolean
}

const ExpenseForm = ({ initialData, onSubmit, onCancel, isLoading }: ExpenseFormProps) => {
  const { items: categories } = useSelector((state: RootState) => state.categories)

  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')
  const [amount, setAmount] = useState(initialData?.amount.toString() || '')
  const [timestamp, setTimestamp] = useState(
    initialData
      ? format(new Date(initialData.timestamp), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm")
  )
  const [note, setNote] = useState(initialData?.note || '')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(
    initialData?.receiptUrl || null
  )
  const [shouldRemoveReceipt, setShouldRemoveReceipt] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setCategoryId(initialData.categoryId)
      setAmount(initialData.amount.toString())
      setTimestamp(format(new Date(initialData.timestamp), "yyyy-MM-dd'T'HH:mm"))
      setNote(initialData.note || '')
      setReceiptPreview(initialData.receiptUrl || null)
      setShouldRemoveReceipt(false)
    } else {
      // Reset form if initialData is cleared (e.g. switching from Edit to Create)
      setCategoryId('')
      setAmount('')
      setTimestamp(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
      setNote('')
      setReceiptPreview(null)
      setReceiptFile(null)
      setShouldRemoveReceipt(false)
    }
  }, [initialData])

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
      setShouldRemoveReceipt(false) // New file uploaded, no need to remove
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearReceipt = () => {
    setReceiptFile(null)
    setReceiptPreview(null)
    // Only set removeReceipt flag if editing and there was an existing receipt
    if (initialData?.receiptUrl) {
      setShouldRemoveReceipt(true)
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!categoryId) newErrors.categoryId = 'Category is required'
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Amount must be greater than 0'
    if (!timestamp) newErrors.timestamp = 'Date is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const data: CreateExpenseData & { removeReceipt?: boolean } = {
      categoryId,
      amount: parseFloat(amount),
      timestamp: new Date(timestamp).toISOString(),
      note: note.trim() || undefined,
      ...(shouldRemoveReceipt && { removeReceipt: true }),
    }

    onSubmit(data, receiptFile || undefined)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <CategorySelect
          categories={categories}
          value={categoryId}
          onChange={setCategoryId}
          error={errors.categoryId}
          disabled={isLoading}
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount <span className="text-red-500">*</span>
        </label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          error={errors.amount}
          disabled={isLoading}
        />
      </div>

      {/* Date & Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date & Time <span className="text-red-500">*</span>
        </label>
        <Input
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          error={errors.timestamp}
          disabled={isLoading}
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this expense..."
          rows={3}
          disabled={isLoading}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Receipt Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Receipt (Optional)</label>

        {receiptPreview ? (
          <div className="relative">
            <img
              src={
                receiptPreview.startsWith('blob:') || receiptPreview.startsWith('data:')
                  ? receiptPreview
                  : getAssetUrl(receiptPreview) || ''
              }
              alt="Receipt preview"
              className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
              onError={(e) => {
                console.error('Failed to load receipt image:', receiptPreview)
                console.error('Asset URL:', getAssetUrl(receiptPreview))
              }}
            />
            <button
              type="button"
              onClick={clearReceipt}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*,application/pdf"
              onChange={handleReceiptChange}
              disabled={isLoading}
            />
          </label>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" isLoading={isLoading} disabled={isLoading} className="flex-1">
          {initialData ? 'Update Expense' : 'Create Expense'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default ExpenseForm
