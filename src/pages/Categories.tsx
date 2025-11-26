import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/slices/categoriesSlice'
import { Category, CreateCategoryData, CategoryColor } from '../types'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import CategoryForm from '../components/features/categories/CategoryForm'
import { toast } from 'react-hot-toast'
import { getCategoryIcon, getCategoryColorStyles } from '../utils/categoryUtils'
import { Plus, Trash2, Edit2, AlertCircle, Filter, X, Search } from 'lucide-react'
import Pagination from '../components/common/Pagination'

const Categories = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { items, loading, pagination } = useSelector((state: RootState) => state.categories)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  // Filter state
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterColor, setFilterColor] = useState<CategoryColor | ''>('')
  const [minUsage, setMinUsage] = useState<string>('')
  const [maxUsage, setMaxUsage] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8
  
  // Applied filters (only update on Apply click)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    color: '' as CategoryColor | '',
    minUsage: '',
    maxUsage: ''
  })

  useEffect(() => {
    // Fetch with applied filters and pagination
    dispatch(fetchCategories({ 
      search: appliedFilters.search || undefined,
      color: appliedFilters.color || undefined, 
      minUsageRate: appliedFilters.minUsage ? Number(appliedFilters.minUsage) : undefined,
      maxUsageRate: appliedFilters.maxUsage ? Number(appliedFilters.maxUsage) : undefined,
      page: currentPage,
      limit: ITEMS_PER_PAGE
    }))
  }, [dispatch, appliedFilters, currentPage])

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: searchTerm,
      color: filterColor,
      minUsage,
      maxUsage
    })
    setCurrentPage(1) // Reset to page 1 when filters change
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreate = () => {
    setSelectedCategory(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await dispatch(deleteCategory(categoryToDelete)).unwrap()
        toast.success('Category deleted successfully')
        setIsDeleteModalOpen(false)
        setCategoryToDelete(null)
        // Refetch to update pagination
        dispatch(fetchCategories({ 
          search: appliedFilters.search || undefined,
          color: appliedFilters.color || undefined, 
          minUsageRate: appliedFilters.minUsage ? Number(appliedFilters.minUsage) : undefined,
          maxUsageRate: appliedFilters.maxUsage ? Number(appliedFilters.maxUsage) : undefined,
          page: currentPage,
          limit: ITEMS_PER_PAGE
        }))
      } catch (error) {
        toast.error('Failed to delete category')
      }
    }
  }

  const handleSubmit = async (data: CreateCategoryData) => {
    try {
      if (selectedCategory) {
        await dispatch(updateCategory({ id: selectedCategory.id, data })).unwrap()
        toast.success('Category updated successfully')
      } else {
        await dispatch(createCategory(data)).unwrap()
        toast.success('Category created successfully')
        setCurrentPage(1) // Reset to page 1 to see the new category
      }
      setIsModalOpen(false)
      // Refetch to update pagination
      dispatch(fetchCategories({ 
        search: appliedFilters.search || undefined,
        color: appliedFilters.color || undefined, 
        minUsageRate: appliedFilters.minUsage ? Number(appliedFilters.minUsage) : undefined,
        maxUsageRate: appliedFilters.maxUsage ? Number(appliedFilters.maxUsage) : undefined,
        page: selectedCategory ? currentPage : 1, // Use page 1 for new categories
        limit: ITEMS_PER_PAGE
      }))
    } catch (error) {
      toast.error(selectedCategory ? 'Failed to update category' : 'Failed to create category')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterColor('')
    setMinUsage('')
    setMaxUsage('')
    setAppliedFilters({
      search: '',
      color: '',
      minUsage: '',
      maxUsage: ''
    })
  }

  const hasActiveFilters = appliedFilters.search || appliedFilters.color || appliedFilters.minUsage || appliedFilters.maxUsage
  const hasUnappliedChanges = 
    searchTerm !== appliedFilters.search ||
    filterColor !== appliedFilters.color ||
    minUsage !== appliedFilters.minUsage ||
    maxUsage !== appliedFilters.maxUsage

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
              placeholder="Search categories..."
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
                  {[appliedFilters.search, appliedFilters.color, appliedFilters.minUsage, appliedFilters.maxUsage].filter(Boolean).length}
                </span>
              )}
            </Button>
            
            <Button onClick={handleCreate} size="lg" className="shadow-lg shadow-indigo-200 flex items-center gap-2 whitespace-nowrap">
              <Plus size={20} />
              <span>New Category</span>
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <select 
                  value={filterColor} 
                  onChange={(e) => setFilterColor(e.target.value as CategoryColor)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">All Colors</option>
                  {Object.values(CategoryColor).map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Usage</label>
                <input 
                  type="number" 
                  value={minUsage}
                  onChange={(e) => setMinUsage(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Usage</label>
                <input 
                  type="number" 
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(e.target.value)}
                  placeholder="Any"
                  min="0"
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
            <Plus size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your filters to see more results." 
              : "Create your first category to start organizing your expenses effectively."}
          </p>
          {hasActiveFilters ? (
            <Button onClick={clearFilters} variant="secondary">Clear Filters</Button>
          ) : (
            <Button onClick={handleCreate} size="lg">Create Category</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((category) => {
            const Icon = getCategoryIcon(category.name)
            const styles = getCategoryColorStyles(category.color)
            
            return (
              <div 
                key={category.id} 
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Bookmark Effect at Bottom Right */}
                <div 
                  className={`absolute bottom-0 right-0 w-24 h-24 ${styles.bgSaturated}`}
                  style={{
                    clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
                  }}
                ></div>
                
                {/* Decorative background circle */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-5 ${styles.bg}`}></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-14 h-14 rounded-2xl ${styles.bg} ${styles.text} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={28} />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                      <button 
                        onClick={() => handleEdit(category)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(category.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1 truncate" title={category.name}>
                    {category.name}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-start border-t border-gray-50">
                    <div className="flex flex-col">
                       <span className="text-xs text-gray-400 uppercase tracking-wide">Usage</span>
                       <span className="font-bold text-2xl bg-gradient-to-br from-gray-700 to-gray-900 bg-clip-text text-transparent">
                         {category.usageCount}
                       </span>
                       <span className="text-xs text-gray-500">times</span>
                    </div>

                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCategory ? 'Edit Category' : 'New Category'}
      >
        <CategoryForm
          initialData={selectedCategory}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={loading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Category"
        footer={
          <>
            <Button variant="danger" onClick={handleConfirmDelete} isLoading={loading}>
              Delete Category
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
              Are you sure you want to delete <span className="font-bold text-gray-900">{items.find(i => i.id === categoryToDelete)?.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-700">
              <strong>Warning:</strong> Deleting this category might affect existing expenses and budgets associated with it.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Categories
