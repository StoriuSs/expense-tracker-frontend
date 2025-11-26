import { FC } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNextPage: boolean
  hasPreviousPage: boolean
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage
}) => {
  if (totalPages <= 1) return null

  const renderPageNumbers = () => {
    const pages = []
    const showPages = 5
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
    let endPage = Math.min(totalPages, startPage + showPages - 1)

    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        className={`p-2 rounded-lg border transition-all ${
          hasPreviousPage
            ? 'border-gray-200 hover:bg-gray-50 text-gray-700'
            : 'border-gray-100 text-gray-300 cursor-not-allowed'
        }`}
        title="Previous page"
      >
        <ChevronLeft size={20} />
      </button>

      {renderPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`min-w-[40px] h-10 px-3 rounded-lg border transition-all font-medium ${
            page === currentPage
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className={`p-2 rounded-lg border transition-all ${
          hasNextPage
            ? 'border-gray-200 hover:bg-gray-50 text-gray-700'
            : 'border-gray-100 text-gray-300 cursor-not-allowed'
        }`}
        title="Next page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

export default Pagination
