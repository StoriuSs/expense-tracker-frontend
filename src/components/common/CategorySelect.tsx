import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { getCategoryIcon, getCategoryColorStyles } from '../../utils/categoryUtils'
import { CategoryColor } from '../../types'

interface Category {
  id: string
  name: string
  color: string
}

interface CategorySelectProps {
  categories: Category[]
  value: string
  onChange: (categoryId: string) => void
  error?: string
  disabled?: boolean
  className?: string
}

const CategorySelect = ({ categories, value, onChange, error, disabled, className = '' }: CategorySelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedCategory = categories.find(c => c.id === value)
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (categoryId: string) => {
    onChange(categoryId)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected value / Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-full px-4 border-2 rounded-xl transition-all flex items-center justify-between ${
          error 
            ? 'border-red-300 bg-red-50' 
            : isOpen
            ? 'border-indigo-500 bg-white'
            : 'border-gray-200 bg-white hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {selectedCategory ? (
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {(() => {
              const Icon = getCategoryIcon(selectedCategory.name)
              const styles = getCategoryColorStyles(selectedCategory.color as CategoryColor)
              return (
                <>
                  <div className={`w-8 h-8 rounded-lg ${styles.bg} ${styles.text} flex items-center justify-center`}>
                    <Icon size={18} />
                  </div>
                  <span className="font-medium text-gray-900 truncate">{selectedCategory.name}</span>
                </>
              )
            })()}
          </div>
        ) : (
          <span className="text-gray-400">Select a category...</span>
        )}
        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-hidden">
          {/* Search bar */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto max-h-60">
            {filteredCategories.length > 0 ? (
              filteredCategories.map(category => {
                const Icon = getCategoryIcon(category.name)
                const styles = getCategoryColorStyles(category.color as CategoryColor)
                const isSelected = category.id === value

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleSelect(category.id)}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-900'
                        : 'hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${styles.bg} ${styles.text} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <span className="font-medium truncate">{category.name}</span>
                    {isSelected && (
                      <svg className="ml-auto w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No categories found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default CategorySelect
