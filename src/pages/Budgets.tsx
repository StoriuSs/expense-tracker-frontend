import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Plus, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Wallet, 
  TrendingDown, 
  AlertCircle,
  Loader2
} from 'lucide-react'
import { AppDispatch, RootState } from '../store'
import { 
  fetchTemplates, 
  fetchPeriods, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  generatePeriods,
  fetchCurrentMonthSummary 
} from '../store/slices/budgetsSlice'
import { fetchCategories } from '../store/slices/categoriesSlice'
import BudgetProgressCard from '../components/features/budgets/BudgetProgressCard'
import BudgetTemplateForm from '../components/features/budgets/BudgetTemplateForm'
import Modal from '../components/common/Modal'
import Pagination from '../components/common/Pagination'
import BudgetExpensesModal from '../components/features/budgets/BudgetExpensesModal'
import { CreateBudgetTemplateData, UpdateBudgetTemplateData, BudgetTemplate, BudgetPeriod } from '../types'
import toast from 'react-hot-toast'
import { getCategoryIcon, getCategoryColorStyles } from '../utils/categoryUtils'

const Budgets = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    templates, 
    periods, 
    loading, 
    periodsLoading,
    operationLoading 
  } = useSelector((state: RootState) => state.budgets)
  const { items: categories } = useSelector((state: RootState) => state.categories)

  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')
  
  // Current Month always shows current month
  const currentMonth = new Date().toISOString().slice(0, 7)
  
  // History tab can navigate
  const [historyMonth, setHistoryMonth] = useState(() => {
    const now = new Date()
    now.setMonth(now.getMonth() - 1) // Default to previous month
    return now.toISOString().slice(0, 7)
  })
  
  const selectedMonth = activeTab === 'current' ? currentMonth : historyMonth

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<BudgetTemplate | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod | null>(null)

  // Pagination state for periods
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Pagination state for templates
  const [currentTemplatePage, setCurrentTemplatePage] = useState(1)
  const templatesPerPage = 6

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchTemplates())
  }, [dispatch])

  // Fetch periods when month or page changes
  useEffect(() => {
    const loadPeriods = async () => {
      const result = await dispatch(fetchPeriods({ 
        month: selectedMonth,
      })).unwrap()
      
      // Auto-generate ONLY for current month if empty and we have active templates
      if (activeTab === 'current' && result.length === 0 && templates.length > 0) {
        await dispatch(generatePeriods(selectedMonth))
        dispatch(fetchPeriods({ month: selectedMonth }))
      }
    }
    loadPeriods()
  }, [dispatch, selectedMonth, templates.length, activeTab])

  const handleMonthChange = (increment: number) => {
    const [year, month] = historyMonth.split('-').map(Number)
    const date = new Date(year, month - 1 + increment, 1)
    const newYear = date.getFullYear()
    const newMonth = String(date.getMonth() + 1).padStart(2, '0')
    setHistoryMonth(`${newYear}-${newMonth}`)
  }

  const handleCreateTemplate = async (data: CreateBudgetTemplateData | UpdateBudgetTemplateData) => {
    try {
      await dispatch(createTemplate(data as CreateBudgetTemplateData)).unwrap()
      toast.success('Budget template created successfully')
      setShowCreateForm(false)
      dispatch(fetchTemplates())
      if (activeTab === 'current') {
        dispatch(fetchPeriods({ month: currentMonth }))
      }
    } catch (error) {
      toast.error('Failed to create budget template')
    }
  }

  const handleUpdateTemplate = async (data: CreateBudgetTemplateData | UpdateBudgetTemplateData) => {
    if (!editingTemplate) return
    try {
      await dispatch(updateTemplate({ id: editingTemplate.id, data })).unwrap()
      toast.success('Budget template updated successfully')
      setEditingTemplate(null)
      dispatch(fetchTemplates())
      if (activeTab === 'current') {
        dispatch(fetchPeriods({ month: currentMonth }))
      }
    } catch (error) {
      toast.error('Failed to update budget template')
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget template? Existing periods will remain.')) {
      try {
        await dispatch(deleteTemplate(id)).unwrap()
        toast.success('Budget template deleted')
        dispatch(fetchTemplates())
      } catch (error) {
        toast.error('Failed to delete budget template')
      }
    }
  }

  useEffect(() => {
    if (activeTab === 'current') {
      dispatch(fetchCurrentMonthSummary()) // This fetches summary from backend cache
    }
  }, [dispatch, activeTab, periods]) // Refresh summary when periods change

  const { currentMonthSummary } = useSelector((state: RootState) => state.budgets)
  
  const totalBudget = periods.reduce((sum, p) => sum + p.periodAmount, 0)
  const totalSpent = periods.reduce((sum, p) => sum + p.spentAmount, 0)
  const totalRemaining = totalBudget - totalSpent
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  // Sort periods: Highest percentage used first
  const sortedPeriods = [...periods].sort((a, b) => b.percentageUsed - a.percentageUsed)

  // Sort templates: Inactive first, then by amount (descending)
  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.active === b.active) {
      return b.monthlyAmount - a.monthlyAmount
    }
    return a.active ? 1 : -1
  })

  // Client-side pagination for periods
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentPeriods = sortedPeriods.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedPeriods.length / itemsPerPage)

  // Client-side pagination for templates
  const indexOfLastTemplate = currentTemplatePage * templatesPerPage
  const indexOfFirstTemplate = indexOfLastTemplate - templatesPerPage
  const currentTemplates = sortedTemplates.slice(indexOfFirstTemplate, indexOfLastTemplate)
  const totalTemplatePages = Math.ceil(sortedTemplates.length / templatesPerPage)

  return (
    <div className="space-y-8 pb-20">
      {/* Header - Removed as requested */}
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
        {/* Tab Switcher */}
        <div className="bg-gray-100 p-1 rounded-xl flex items-center">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'current' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Current Month
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'history' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Month Selector (Only for History) */}
      {activeTab === 'history' && (
        <div className="flex justify-center">
          <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-1">
            <button 
              onClick={() => handleMonthChange(-1)}
              className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 font-bold text-gray-900 min-w-[140px] text-center">
              {new Date(historyMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => handleMonthChange(1)}
              className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <span className="text-gray-500 font-medium">Total Budget</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${totalBudget.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <TrendingDown size={20} />
            </div>
            <span className="text-gray-500 font-medium">Total Spent</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${totalSpent.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {percentUsed.toFixed(1)}% used
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <span className="text-gray-500 font-medium">Remaining</span>
          </div>
          <div className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {totalRemaining < 0 ? '-' : ''}${Math.abs(totalRemaining).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Budget Tracking Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {activeTab === 'current' ? 'Current Month Tracking' : 'Historical Tracking'}
          </h2>
          {periodsLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              Updating...
            </div>
          )}
        </div>

        {periods.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {currentPeriods.map(period => {
                const category = categories.find(c => c.id === period.categoryId)
                return (
                  <BudgetProgressCard
                    key={period.id}
                    period={period}
                    categoryName={category?.name || 'Unknown'}
                    categoryColor={category?.color || 'gray'}
                    onClick={() => setSelectedPeriod(period)}
                  />
                )
              })}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                hasNextPage={currentPage < totalPages}
                hasPreviousPage={currentPage > 1}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Wallet size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Budgets Found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {activeTab === 'current' 
                ? "You haven't set any budgets for this month yet. Create a budget template to get started."
                : "No budget data found for this month."}
            </p>
            {activeTab === 'current' && (
              <button
                onClick={() => {
                  setShowCreateForm(true)
                }}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create First Budget
              </button>
            )}
          </div>
        )}
      </section>

      {/* Budget Settings Section (Only for Current Month) */}
      {activeTab === 'current' && (
        <section className="pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                <Settings size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Budget Settings</h2>
                <p className="text-sm text-gray-500">Manage your monthly budget templates</p>
              </div>
            </div>
            
            {!showCreateForm && !editingTemplate && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus size={18} />
                New Template
              </button>
            )}
          </div>

          {/* Create/Edit Modal */}
          <Modal
            isOpen={showCreateForm || !!editingTemplate}
            onClose={() => {
              setShowCreateForm(false)
              setEditingTemplate(null)
            }}
            title={editingTemplate ? 'Edit Budget Template' : 'Create New Budget'}
          >
            <BudgetTemplateForm
              categories={categories}
              initialData={editingTemplate || undefined}
              onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
              onCancel={() => {
                setShowCreateForm(false)
                setEditingTemplate(null)
              }}
              loading={operationLoading}
            />
          </Modal>

          {/* Templates List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {templates.length > 0 ? (
              <>
                <div className="divide-y divide-gray-100">
                  {currentTemplates.map(template => {
                    const category = categories.find(c => c.id === template.categoryId)
                    const Icon = getCategoryIcon(category?.name || '')
                    const categoryStyles = getCategoryColorStyles(category?.color as any)
                    
                    return (
                      <div key={template.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${category ? `${categoryStyles.bg} ${categoryStyles.text}` : 'bg-gray-100 text-gray-500'} flex items-center justify-center`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900">{category?.name || 'Unknown Category'}</h4>
                              {!template.active && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              ${template.monthlyAmount.toLocaleString()} / month • Alert at {template.alertThreshold}%
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingTemplate(template)
                            }}
                            className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {totalTemplatePages > 1 && (
                  <div className="p-4 border-t border-gray-100">
                    <Pagination
                      currentPage={currentTemplatePage}
                      totalPages={totalTemplatePages}
                      onPageChange={setCurrentTemplatePage}
                      hasNextPage={currentTemplatePage < totalTemplatePages}
                      hasPreviousPage={currentTemplatePage > 1}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No budget templates created yet.
              </div>
            )}
          </div>
        </section>
      )}

      {/* Expenses Modal */}
      <BudgetExpensesModal
        isOpen={!!selectedPeriod}
        onClose={() => setSelectedPeriod(null)}
        period={selectedPeriod}
        category={categories.find(c => c.id === selectedPeriod?.categoryId)}
      />
    </div>
  )
}

export default Budgets
