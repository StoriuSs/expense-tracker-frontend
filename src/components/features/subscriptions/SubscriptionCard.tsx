import { formatDistanceToNow, differenceInDays, isPast } from 'date-fns'
import { MoreVertical, Calendar, DollarSign } from 'lucide-react'
import { Subscription, Category, SubscriptionStatus } from '../../../types'
import { getCategoryIcon, getCategoryColorStyles } from '../../../utils/categoryUtils'
import { useState, useRef, useEffect } from 'react'

interface SubscriptionCardProps {
  subscription: Subscription
  category: Category | undefined
  onPayNow: (id: string) => void
  onEdit: (subscription: Subscription) => void
  onStatusChange: (id: string, status: SubscriptionStatus) => void
  onDelete: (id: string) => void
}

const SubscriptionCard = ({ 
  subscription, 
  category, 
  onPayNow, 
  onEdit, 
  onStatusChange, 
  onDelete 
}: SubscriptionCardProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const Icon = getCategoryIcon(category?.name || '')
  const categoryStyles = getCategoryColorStyles(category?.color as any)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Calculate progress to next payment
  const nextDate = new Date(subscription.nextPaymentDate)
  const today = new Date()
  const daysUntilPayment = differenceInDays(nextDate, today)
  const isOverdue = isPast(nextDate) && daysUntilPayment < 0

  // Determine progress bar color
  let progressColor = 'bg-green-500'
  if (daysUntilPayment <= 3 || isOverdue) {
    progressColor = 'bg-red-500'
  } else if (daysUntilPayment <= 7) {
    progressColor = 'bg-yellow-500'
  }

  // Calculate progress percentage (max 30 days range)
  const maxDays = 30
  const progressPercentage = Math.max(0, Math.min(100, ((maxDays - daysUntilPayment) / maxDays) * 100))

  // Status badge styles
  const getStatusBadge = () => {
    switch (subscription.status) {
      case SubscriptionStatus.ACTIVE:
        return 'bg-green-100 text-green-700'
      case SubscriptionStatus.INACTIVE:
        return 'bg-gray-100 text-gray-500'
      case SubscriptionStatus.CANCELLED:
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-500'
    }
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${category ? `${categoryStyles.bg} ${categoryStyles.text}` : 'bg-gray-100 text-gray-500'} flex items-center justify-center shrink-0`}>
            <Icon size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{subscription.name}</h3>
            <p className="text-sm text-gray-500">
              {category?.name || 'Unknown'} • {subscription.frequency}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusBadge()}`}>
            {subscription.status}
          </span>
          <span className="text-lg font-bold text-gray-900">
            ${subscription.amount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${progressColor} transition-all duration-300`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">
          {daysUntilPayment > 0 ? `${daysUntilPayment} days to next` : isOverdue ? 'Overdue' : 'Today'}
        </p>
      </div>

      {/* Payment Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-gray-400" />
          <span className="text-gray-600">
            Next payment: <span className="font-medium text-gray-900">
              {nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <DollarSign size={16} className="text-gray-400" />
          <span className="text-gray-600">
            Last charged: <span className="font-medium text-gray-900">
              {subscription.lastChargedDate 
                ? new Date(subscription.lastChargedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Never'}
            </span>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {subscription.status === SubscriptionStatus.ACTIVE && (
          <button
            onClick={() => onPayNow(subscription.id)}
            className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Pay Now
          </button>
        )}
        <button
          onClick={() => onEdit(subscription)}
          className={`${subscription.status === SubscriptionStatus.ACTIVE ? 'flex-1' : 'flex-1'} px-3 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors`}
        >
          Edit
        </button>
        
        {/* More Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical size={20} className="text-gray-600" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
              {subscription.status === SubscriptionStatus.ACTIVE ? (
                <>
                  <button
                    onClick={() => {
                      onStatusChange(subscription.id, SubscriptionStatus.INACTIVE)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => {
                      onStatusChange(subscription.id, SubscriptionStatus.CANCELLED)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </>
              ) : subscription.status === SubscriptionStatus.INACTIVE ? (
                <button
                  onClick={() => {
                    onStatusChange(subscription.id, SubscriptionStatus.ACTIVE)
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Activate
                </button>
              ) : null}
              
              <hr className="my-2 border-gray-100" />
              
              <button
                onClick={() => {
                  onDelete(subscription.id)
                  setShowMenu(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notes (if any) */}
      {subscription.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 italic">{subscription.notes}</p>
        </div>
      )}
    </div>
  )
}

export default SubscriptionCard
