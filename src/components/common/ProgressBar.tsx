import React from 'react'

interface ProgressBarProps {
  progress: number // 0 to 100
  color?: 'indigo' | 'green' | 'yellow' | 'red'
  height?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'indigo',
  height = 'md',
  showLabel = false,
  label
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  
  const colors = {
    indigo: 'bg-indigo-600',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label || 'Progress'}</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${heights[height]}`}>
        <div
          className={`${colors[color]} ${heights[height]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  )
}

export default ProgressBar
