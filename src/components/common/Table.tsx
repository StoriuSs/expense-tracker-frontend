import React from 'react'

export interface Column<T> {
  header: string
  accessor: keyof T | ((item: T) => React.ReactNode)
  className?: string
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string | number
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
}

const Table = <T,>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick
}: TableProps<T>) => {
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
            >
              {columns.map((col, index) => (
                <td
                  key={index}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${col.className || ''}`}
                >
                  {typeof col.accessor === 'function'
                    ? col.accessor(item)
                    : (item[col.accessor] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
