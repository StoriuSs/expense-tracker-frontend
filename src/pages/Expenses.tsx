import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { 
  fetchExpenses, 
  createExpense, 
  updateExpense, 
  deleteExpense,
  batchDeleteExpenses,
  uploadReceipt
} from '../store/slices/expensesSlice'
import { fetchCategories } from '../store/slices/categoriesSlice'
import { Expense, CreateExpenseData } from '../types'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import ImageModal from '../components/common/ImageModal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Pagination from '../components/common/Pagination'
import { toast } from 'react-hot-toast'
import { Plus, Filter, X, Search, Trash2, Edit2, AlertCircle, Receipt, FileText } from 'lucide-react'
import { getCategoryIcon, getCategoryColorStyles } from '../utils/categoryUtils'
import ExpenseForm from '../components/features/expenses/ExpenseForm'
import { getAssetUrl } from '../utils/urlUtils'

const Expenses = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { items, loading, pagination } = useSelector((state: RootState) => state.expenses)
  const { items: categories } = useSelector((state: RootState) => state.categories)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null)
  
  // Batch delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12
  
  // Applied filters (only update on Apply click)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  })

  // Fetch categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories({}))
    }
  }, [dispatch, categories.length])

  // Fetch expenses
  useEffect(() => {
    dispatch(fetchExpenses({ 
      search: appliedFilters.search || undefined,
      categoryId: appliedFilters.category || undefined,
      startDate: appliedFilters.startDate || undefined,
      endDate: appliedFilters.endDate || undefined,
      minAmount: appliedFilters.minAmount ? Number(appliedFilters.minAmount) : undefined,
      maxAmount: appliedFilters.maxAmount ? Number(appliedFilters.maxAmount) : undefined,
      page: currentPage,
      limit: ITEMS_PER_PAGE
    }))
  }, [dispatch, appliedFilters, currentPage])

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: searchTerm,
      category: filterCategory,
      startDate,
      endDate,
      minAmount,
      maxAmount
    })
    setCurrentPage(1) // Reset to page 1
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterCategory('')
    setStartDate('')
    setEndDate('')
    setMinAmount('')
    setMaxAmount('')
    setAppliedFilters({
      search: '',
      category: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedIds(new Set()) // Clear selection on page change
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreate = () => {
    setSelectedExpense(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setExpenseToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (expenseToDelete) {
      try {
        await dispatch(deleteExpense(expenseToDelete)).unwrap()
        toast.success('Expense deleted successfully')
        setIsDeleteModalOpen(false)
        setExpenseToDelete(null)
        // Refetch
        dispatch(fetchExpenses({ 
          search: appliedFilters.search || undefined,
          categoryId: appliedFilters.category || undefined,
          startDate: appliedFilters.startDate || undefined,
          endDate: appliedFilters.endDate || undefined,
          minAmount: appliedFilters.minAmount ? Number(appliedFilters.minAmount) : undefined,
          maxAmount: appliedFilters.maxAmount ? Number(appliedFilters.maxAmount) : undefined,
          page: currentPage,
          limit: ITEMS_PER_PAGE
        }))
      } catch (error) {
        toast.error('Failed to delete expense')
      }
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return
    
    try {
      await dispatch(batchDeleteExpenses(Array.from(selectedIds))).unwrap()
      toast.success(`${selectedIds.size} expenses deleted successfully`)
      setSelectedIds(new Set())
      // Refetch
      dispatch(fetchExpenses({ 
        search: appliedFilters.search || undefined,
        categoryId: appliedFilters.category || undefined,
        startDate: appliedFilters.startDate || undefined,
        endDate: appliedFilters.endDate || undefined,
        minAmount: appliedFilters.minAmount ? Number(appliedFilters.minAmount) : undefined,
        maxAmount: appliedFilters.maxAmount ? Number(appliedFilters.maxAmount) : undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      }))
    } catch (error) {
      toast.error('Failed to delete expenses')
    }
  }

  const handleSubmit = async (data: CreateExpenseData, receiptFile?: File) => {
    try {
      if (selectedExpense) {
        // Update expense data first
        await dispatch(updateExpense({ id: selectedExpense.id, data })).unwrap()
        
        // If there's a new receipt file, upload it separately
        if (receiptFile) {
          await dispatch(uploadReceipt({ id: selectedExpense.id, file: receiptFile })).unwrap()
        }
        
        toast.success('Expense updated successfully')
      } else {
        await dispatch(createExpense({ data, receiptFile })).unwrap()
        toast.success('Expense created successfully')
        setCurrentPage(1) // Reset to page 1 to see new expense
      }
      setIsModalOpen(false)
      // Refetch
      dispatch(fetchExpenses({ 
        search: appliedFilters.search || undefined,
        categoryId: appliedFilters.category || undefined,
        startDate: appliedFilters.startDate || undefined,
        endDate: appliedFilters.endDate || undefined,
        minAmount: appliedFilters.minAmount ? Number(appliedFilters.minAmount) : undefined,
        maxAmount: appliedFilters.maxAmount ? Number(appliedFilters.maxAmount) : undefined,
        page: selectedExpense ? currentPage : 1,
        limit: ITEMS_PER_PAGE
      }))
    } catch (error) {
      toast.error(selectedExpense ? 'Failed to update expense' : 'Failed to create expense')
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(item => item.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const hasActiveFilters = appliedFilters.search || appliedFilters.category || appliedFilters.startDate || appliedFilters.endDate || appliedFilters.minAmount || appliedFilters.maxAmount
  const hasUnappliedChanges = 
    searchTerm !== appliedFilters.search ||
    filterCategory !== appliedFilters.category ||
    startDate !== appliedFilters.startDate ||
    endDate !== appliedFilters.endDate ||
    minAmount !== appliedFilters.minAmount ||
    maxAmount !== appliedFilters.maxAmount

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">

      {/* Search and Actions */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={18} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full font-medium">
                  {[appliedFilters.search, appliedFilters.category, appliedFilters.startDate, appliedFilters.endDate, appliedFilters.minAmount, appliedFilters.maxAmount].filter(Boolean).length}
                </span>
              )}
            </Button>
            
            {selectedIds.size > 0 && (
              <Button 
                variant="danger"
                onClick={handleBatchDelete}
                className="flex items-center gap-2"
              >
                <Trash2 size={18} />
                <span>Delete ({selectedIds.size})</span>
              </Button>
            )}
            
            <Button onClick={handleCreate} size="lg" className="shadow-lg shadow-indigo-200 flex items-center gap-2 whitespace-nowrap">
              <Plus size={20} />
              <span>New Expense</span>
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                <input 
                  type="number" 
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                <input 
                  type="number" 
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="Any"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                onClick={handleApplyFilters}
                className="flex items-center gap-2"
                disabled={!hasUnappliedChanges}
              >
                Apply Filters
              </Button>
              {hasActiveFilters && (
                <Button 
                  variant="secondary"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X size={16} /> Clear All
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {loading && items.length === 0 ? (
        <LoadingSpinner size="lg" className="h-64" />
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No expenses found</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your filters to see more results." 
              : "Track your first expense to get started with managing your finances."}
          </p>
          {hasActiveFilters ? (
            <Button onClick={clearFilters} variant="secondary">Clear Filters</Button>
          ) : (
            <Button onClick={handleCreate} size="lg">Create Expense</Button>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === items.length && items.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Note</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Receipt</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((expense) => {
                    const category = categories.find(c => c.id === expense.categoryId)
                    const Icon = category ? getCategoryIcon(category.name) : FileText
                    const styles = category ? getCategoryColorStyles(category.color) : { bg: 'bg-gray-100', text: 'text-gray-600' }
                    
                    return (
                      <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(expense.id)}
                            onChange={() => toggleSelect(expense.id)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${styles.bg} ${styles.text} flex items-center justify-center`}>
                              <Icon size={20} />
                            </div>
                            <span className="font-medium text-gray-900">{category?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900">{formatCurrency(expense.amount)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 text-sm">{formatDate(expense.timestamp)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 text-sm truncate max-w-xs block">
                            {expense.note || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {expense.receiptUrl ? (
                            <button
                              onClick={() => {
                                setSelectedReceiptUrl(expense.receiptUrl)
                                setReceiptModalOpen(true)
                              }}
                              className="inline-flex items-center justify-center text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                              title="View Receipt"
                            >
                              <Receipt size={20} />
                            </button>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(expense)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(expense.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              hasNextPage={pagination.currentPage < pagination.totalPages}
              hasPreviousPage={pagination.currentPage > 1}
            />
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedExpense ? 'Edit Expense' : 'New Expense'}
      >
        <ExpenseForm
          initialData={selectedExpense}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={loading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Expense"
        footer={
          <>
            <Button variant="danger" onClick={handleConfirmDelete} isLoading={loading}>
              Delete Expense
            </Button>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} className="mr-3">
              Cancel
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Confirm Deletion</h4>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

      {/* Receipt Image Modal */}
      <ImageModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        imageUrl={getAssetUrl(selectedReceiptUrl)}
        title="Receipt"
      />
    </div>
  )
}

export default Expenses
