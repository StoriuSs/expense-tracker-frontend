import { useEffect, useState, forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { useDispatch, useSelector } from 'react-redux'
import { 
  Plus, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Wallet, 
  TrendingDown, 
  AlertCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  Calendar,
  ChevronDown
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
import { fetchSettings } from '../store/slices/settingsSlice'
import { fetchCategories } from '../store/slices/categoriesSlice'
import BudgetProgressCard from '../components/features/budgets/BudgetProgressCard'
import BudgetTemplateForm from '../components/features/budgets/BudgetTemplateForm'
import Modal from '../components/common/Modal'
import Pagination from '../components/common/Pagination'
import BudgetExpensesModal from '../components/features/budgets/BudgetExpensesModal'
import { CreateBudgetTemplateData, UpdateBudgetTemplateData, BudgetTemplate, BudgetPeriod } from '../types'
import toast from 'react-hot-toast'
import { getCategoryIcon, getCategoryColorStyles } from '../utils/categoryUtils'

// Custom Input for DatePicker
const CustomMonthInput = forwardRef<HTMLDivElement, any>(({ onClick, value }, ref) => (
  <div 
    ref={ref}
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group"
  >
    <Calendar size={18} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
    <span className="font-bold text-gray-900 min-w-[120px] text-center group-hover:text-indigo-700 transition-colors">
      {value}
    </span>
    <ChevronDown size={16} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
  </div>
))

const Budgets = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    templates, 
    periods, 
    periodsLoading,
    operationLoading 
  } = useSelector((state: RootState) => state.budgets)
  const { items: categories } = useSelector((state: RootState) => state.categories)
  const { settings } = useSelector((state: RootState) => state.settings)

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

  // Period Filter State
  const [periodFilter, setPeriodFilter] = useState<'all' | 'good' | 'warning' | 'over'>('all')

  // Period Sort State
  const [periodSortBy, setPeriodSortBy] = useState<string>('percentageUsed')
  const [periodSortOrder, setPeriodSortOrder] = useState<'asc' | 'desc'>('desc')

  // Reset page when period filter or sort changes
  useEffect(() => {
    setCurrentPage(1)
  }, [periodFilter, periodSortBy, periodSortOrder])

  // Sort state
  const [sortBy, setSortBy] = useState<string>('monthlyAmount')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchCategories({ limit: 1000 })) // Always load all categories for dropdowns
    if (!settings) {
      dispatch(fetchSettings())
    }
    // fetchTemplates is handled by the sort useEffect
  }, [dispatch, settings])

  // Fetch templates when sort changes
  useEffect(() => {
    dispatch(fetchTemplates({ sortBy, sortOrder }))
  }, [dispatch, sortBy, sortOrder])

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

  // Filter state for templates
  const [templateFilter, setTemplateFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Filter templates based on selection
  const filteredTemplates = templates.filter(template => {
    if (templateFilter === 'active') return template.active
    if (templateFilter === 'inactive') return !template.active
    return true
  })

  // Pagination state for templates
  const [currentTemplatePage, setCurrentTemplatePage] = useState(1)
  const templatesPerPage = 6
  // Client-side pagination for templates
  const indexOfLastTemplate = currentTemplatePage * templatesPerPage
  const indexOfFirstTemplate = indexOfLastTemplate - templatesPerPage
  const currentTemplates = filteredTemplates.slice(indexOfFirstTemplate, indexOfLastTemplate)
  const totalTemplatePages = Math.ceil(filteredTemplates.length / templatesPerPage)

  // Reset page when filter changes
  useEffect(() => {
    setCurrentTemplatePage(1)
  }, [templateFilter])

  const handleMonthChange = (increment: number) => {
    const [year, month] = historyMonth.split('-').map(Number)
    const date = new Date(year, month - 1 + increment, 1)
    const newYear = date.getFullYear()
    const newMonth = String(date.getMonth() + 1).padStart(2, '0')
    setHistoryMonth(`${newYear}-${newMonth}`)
    setCurrentPage(1) // Reset to first page when month changes
  }

  const handleCreateTemplate = async (data: CreateBudgetTemplateData | UpdateBudgetTemplateData) => {
    try {
      await dispatch(createTemplate(data as CreateBudgetTemplateData)).unwrap()
      toast.success('Budget template created successfully')
      setShowCreateForm(false)
      dispatch(fetchTemplates({ sortBy, sortOrder }))
      if (activeTab === 'current') {
        dispatch(fetchPeriods({ month: currentMonth }))
      }
    } catch (error: any) {
      console.error('Failed to create budget template:', error)
      toast.error(typeof error === 'string' ? error : 'Failed to create budget template')
    }
  }

  const handleUpdateTemplate = async (data: CreateBudgetTemplateData | UpdateBudgetTemplateData) => {
    if (!editingTemplate) return
    try {
      await dispatch(updateTemplate({ id: editingTemplate.id, data })).unwrap()
      toast.success('Budget template updated successfully')
      setEditingTemplate(null)
      dispatch(fetchTemplates({ sortBy, sortOrder }))
      if (activeTab === 'current') {
        dispatch(fetchPeriods({ month: currentMonth }))
      }
    } catch (error: any) {
      console.error('Failed to update budget template:', error)
      toast.error(typeof error === 'string' ? error : 'Failed to update budget template')
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget template? The budget for the CURRENT month will be removed, but past history will remain.')) {
      try {
        await dispatch(deleteTemplate(id)).unwrap()
        toast.success('Budget template deleted')
        dispatch(fetchTemplates({ sortBy, sortOrder }))
      } catch (error: any) {
        console.error('Failed to delete budget template:', error)
        toast.error(typeof error === 'string' ? error : 'Failed to delete budget template')
      }
    }
  }

  useEffect(() => {
    if (activeTab === 'current') {
      dispatch(fetchCurrentMonthSummary()) // This fetches summary from backend cache
    }
  }, [dispatch, activeTab, periods]) // Refresh summary when periods change
  
  const totalBudget = periods.reduce((sum, p) => sum + p.periodAmount, 0)
  const totalSpent = periods.reduce((sum, p) => sum + p.spentAmount, 0)
  const totalRemaining = totalBudget - totalSpent
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  // Sort periods
  const sortedPeriods = [...periods].sort((a, b) => {
    let comparison = 0
    switch (periodSortBy) {
      case 'percentageUsed':
        comparison = a.percentageUsed - b.percentageUsed
        break
      case 'spentAmount':
        comparison = a.spentAmount - b.spentAmount
        break
      case 'periodAmount':
        comparison = a.periodAmount - b.periodAmount
        break
      case 'categoryName':
        const catA = categories.find(c => c.id === a.categoryId)?.name || ''
        const catB = categories.find(c => c.id === b.categoryId)?.name || ''
        comparison = catA.localeCompare(catB)
        break
      default:
        comparison = 0
    }
    return periodSortOrder === 'asc' ? comparison : -comparison
  })

  // Filter periods
  const filteredPeriods = sortedPeriods.filter(period => {
    if (periodFilter === 'all') return true
    
    const isOver = period.isOverBudget
    const isWarning = !isOver && period.percentageUsed >= (period.alertThreshold || 80)
    const isGood = !isOver && !isWarning

    if (periodFilter === 'over') return isOver
    if (periodFilter === 'warning') return isWarning
    if (periodFilter === 'good') return isGood
    return true
  })

  // Client-side pagination for periods
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentPeriods = filteredPeriods.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredPeriods.length / itemsPerPage)

  return (
    <div className="space-y-8 pb-20">
      {/* Header - Removed as requested */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

        {/* Current Period Date Range Display */}
        {periods.length > 0 && (
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-900 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">
            <span className="text-indigo-400">Period:</span>
            {new Date(periods[0].periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(periods[0].periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>

      {/* Month Selector (Only for History) */}
      {activeTab === 'history' && (
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1.5">
            <button 
              onClick={() => handleMonthChange(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors hover:text-indigo-600"
              title="Previous Month"
            >
              <ChevronLeft size={20} />
            </button>

            <DatePicker
              selected={new Date(historyMonth)}
              onChange={(date) => {
                if (date) {
                  const year = date.getFullYear()
                  const month = String(date.getMonth() + 1).padStart(2, '0')
                  setHistoryMonth(`${year}-${month}`)
                  setCurrentPage(1)
                }
              }}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              customInput={<CustomMonthInput />}
              popperClassName="z-50"
            />

            <button 
              onClick={() => handleMonthChange(1)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors hover:text-indigo-600"
              title="Next Month"
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-4">
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
            
          <div className="flex items-center gap-3">
            {/* Period Sort Controls */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <select
                value={periodSortBy}
                onChange={(e) => setPeriodSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-700 border-none focus:ring-0 cursor-pointer py-1.5 pl-2 pr-6 outline-none"
              >
                <option value="percentageUsed">% Used</option>
                <option value="spentAmount">Spent</option>
                <option value="periodAmount">Total Budget</option>
                <option value="categoryName">Category</option>
              </select>
              <button
                onClick={() => setPeriodSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 hover:bg-white rounded-md transition-all text-gray-600 shadow-sm"
                title={periodSortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {periodSortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              </button>
            </div>

            <div className="h-8 w-px bg-gray-200"></div>

            {/* Period Filter Controls */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setPeriodFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  periodFilter === 'all' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPeriodFilter('good')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  periodFilter === 'good' 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Good
              </button>
              <button
                onClick={() => setPeriodFilter('warning')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  periodFilter === 'warning' 
                    ? 'bg-white text-yellow-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Warning
              </button>
              <button
                onClick={() => setPeriodFilter('over')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  periodFilter === 'over' 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Over Budget
              </button>
            </div>
          </div>
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
              <div className="flex items-center gap-3">
                {/* Sort Controls */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs font-bold text-gray-700 border-none focus:ring-0 cursor-pointer py-1.5 pl-2 pr-6 outline-none"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="monthlyAmount">Amount</option>
                    <option value="categoryName">Category</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-1.5 hover:bg-white rounded-md transition-all text-gray-600 shadow-sm"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  </button>
                </div>

                <div className="h-8 w-px bg-gray-200 mx-1"></div>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setTemplateFilter('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      templateFilter === 'all' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setTemplateFilter('active')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      templateFilter === 'active' 
                        ? 'bg-white text-green-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setTemplateFilter('inactive')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      templateFilter === 'inactive' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus size={18} />
                  New Template
                </button>
              </div>
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
              defaultAmount={settings?.defaultMonthlyBudget}
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
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-xl ${category ? `${categoryStyles.bg} ${categoryStyles.text}` : 'bg-gray-100 text-gray-500'} flex items-center justify-center shrink-0`}>
                            <Icon size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <h4 className="font-bold text-gray-900 truncate" title={category?.name || 'Unknown Category'}>{category?.name || 'Unknown Category'}</h4>
                              {!template.active && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-full shrink-0">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">
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
