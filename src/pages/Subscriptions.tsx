import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Search, Loader2, Wallet } from 'lucide-react'
import { AppDispatch, RootState } from '../store'
import { 
  fetchSubscriptions, 
  createSubscription, 
  updateSubscription, 
  deleteSubscription,
  processPayment 
} from '../store/slices/subscriptionsSlice'
import { fetchCategories } from '../store/slices/categoriesSlice'
import SubscriptionForm from '../components/features/subscriptions/SubscriptionForm'
import SubscriptionCard from '../components/features/subscriptions/SubscriptionCard'
import SubscriptionStats from '../components/features/subscriptions/SubscriptionStats'
import Modal from '../components/common/Modal'
import Pagination from '../components/common/Pagination'
import CategorySelect from '../components/common/CategorySelect'
import { 
  Subscription, 
  CreateSubscriptionData, 
  UpdateSubscriptionData, 
  SubscriptionStatus 
} from '../types'
import toast from 'react-hot-toast'

import { useDebounce } from '../hooks/useDebounce'

const Subscriptions = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { items: subscriptions, loading, operationLoading, pagination } = useSelector((state: RootState) => state.subscriptions)
  const { items: categories } = useSelector((state: RootState) => state.categories)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  
  // Filters
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | SubscriptionStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500) // Debounce search query
  
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState('nextPaymentDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 6

  // Fetch data with server-side params
  const loadSubscriptions = () => {
    dispatch(fetchSubscriptions({ 
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      status: activeStatusFilter === 'all' ? undefined : activeStatusFilter,
      search: debouncedSearchQuery || undefined, // Use debounced query
      categoryId: categoryFilter || undefined,
      sortBy,
      sortOrder
    }))
  }

  // Initial data fetch and when filters/page change
  useEffect(() => {
    loadSubscriptions()
  }, [dispatch, currentPage, activeStatusFilter, categoryFilter, sortBy, sortOrder, debouncedSearchQuery]) // Add debouncedSearchQuery to dependencies

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateSubscription = async (data: CreateSubscriptionData | UpdateSubscriptionData) => {
    try {
      await dispatch(createSubscription(data as CreateSubscriptionData)).unwrap()
      toast.success('Subscription created successfully')
      setShowCreateForm(false)
      loadSubscriptions()
    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : (error.message || 'Failed to create subscription'))
    }
  }

  const handleUpdateSubscription = async (data: CreateSubscriptionData | UpdateSubscriptionData) => {
    if (!editingSubscription) return
    try {
      await dispatch(updateSubscription({ id: editingSubscription.id, data })).unwrap()
      toast.success('Subscription updated successfully')
      setEditingSubscription(null)
      loadSubscriptions()
    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : (error.message || 'Failed to update subscription'))
    }
  }

  const handleDeleteSubscription = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await dispatch(deleteSubscription(id)).unwrap()
        toast.success('Subscription deleted')
        loadSubscriptions()
      } catch (error: any) {
        toast.error(typeof error === 'string' ? error : (error.message || 'Failed to delete subscription'))
      }
    }
  }

  const handlePayNow = async (id: string) => {
    const subscription = subscriptions.find(s => s.id === id)
    if (!subscription) return
    
    if (window.confirm(`Process payment of $${subscription.amount} for ${subscription.name}?`)) {
      try {
        const result = await dispatch(processPayment(id)).unwrap()
        
        if (result.budgetStatus === 'OVER_BUDGET') {
          toast.error('Payment processed, but you have exceeded your budget!', { icon: '🚨' })
        } else if (result.budgetStatus === 'WARNING') {
          toast('Payment processed. You are approaching your budget limit.', { icon: '⚠️' })
        } else {
          toast.success('Payment processed successfully')
        }
        
        loadSubscriptions()
      } catch (error: any) {
        toast.error(typeof error === 'string' ? error : (error.message || 'Failed to process payment'))
      }
    }
  }

  const handleStatusChange = async (id: string, status: SubscriptionStatus) => {
    try {
      await dispatch(updateSubscription({ id, data: { status } })).unwrap()
      toast.success(`Subscription ${status.toLowerCase()}`)
      loadSubscriptions()
    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : (error.message || 'Failed to update subscription status'))
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header with Action Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          New Subscription
        </button>
      </div>

      {/* Stats - Note: Stats might need a separate endpoint if they should reflect ALL data, not just paginated */}
      <SubscriptionStats subscriptions={subscriptions} />

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { value: 'all', label: 'All' },
            { value: SubscriptionStatus.ACTIVE, label: 'Active' },
            { value: SubscriptionStatus.INACTIVE, label: 'Inactive' },
            { value: SubscriptionStatus.CANCELLED, label: 'Cancelled' }
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => {
                setActiveStatusFilter(status.value as any)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                activeStatusFilter === status.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1) // Reset page on search input
              }}
              placeholder="Search by name..."
              className="w-full h-10 pl-10 pr-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          {/* Category Filter */}
          <CategorySelect
            categories={[
              { id: '', name: 'All Categories', color: 'gray' },
              ...categories
            ]}
            value={categoryFilter}
            onChange={(categoryId) => {
              setCategoryFilter(categoryId)
              setCurrentPage(1)
            }}
            className="h-10"
          />

          {/* Sort */}
          <select
            value={`${sortBy}__${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('__')
              setSortBy(newSortBy)
              setSortOrder(newSortOrder as 'asc' | 'desc')
              setCurrentPage(1)
            }}
            className="px-4 h-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-full"
          >
            <option value="nextPaymentDate__asc">Next Payment (Soonest)</option>
            <option value="nextPaymentDate__desc">Next Payment (Latest)</option>
            <option value="amount__desc">Amount (High to Low)</option>
            <option value="amount__asc">Amount (Low to High)</option>
            <option value="name__asc">Name (A-Z)</option>
            <option value="name__desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Grid */}
      {loading && subscriptions.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading subscriptions...</p>
          </div>
        </div>
      ) : subscriptions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((subscription) => {
              const category = categories.find(c => c.id === subscription.categoryId)
              return (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  category={category}
                  onPayNow={handlePayNow}
                  onEdit={setEditingSubscription}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteSubscription}
                />
              )
            })}
          </div>
          
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
            />
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Wallet size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Subscriptions Found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {searchQuery || categoryFilter || activeStatusFilter !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Track your recurring payments and never miss a bill.'}
          </p>
          {!searchQuery && !categoryFilter && activeStatusFilter === 'all' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Add First Subscription
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateForm || !!editingSubscription}
        onClose={() => {
          setShowCreateForm(false)
          setEditingSubscription(null)
        }}
        title={editingSubscription ? 'Edit Subscription' : 'Create New Subscription'}
      >
        <SubscriptionForm
          categories={categories}
          initialData={editingSubscription || undefined}
          onSubmit={editingSubscription ? handleUpdateSubscription : handleCreateSubscription}
          onCancel={() => {
            setShowCreateForm(false)
            setEditingSubscription(null)
          }}
          loading={operationLoading}
        />
      </Modal>
    </div>
  )
}

export default Subscriptions
