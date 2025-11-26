import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface SummaryCardProps {
  title: string
  value: string
  icon: LucideIcon
  iconBgColor: string
  iconTextColor: string
  change?: number | null
  subtitle?: string
}

const SummaryCard = ({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconTextColor,
  change,
  subtitle
}: SummaryCardProps) => {
  const hasChange = change !== undefined && change !== null
  const isPositive = change ? change > 0 : false
  const isNegative = change ? change < 0 : false

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBgColor} ${iconTextColor} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        <span className="text-gray-500 font-medium text-sm">{title}</span>
      </div>

      <div className="text-2xl font-bold text-gray-900 mb-1">
        {value}
      </div>

      {hasChange && (
        <div className={`flex items-center gap-1 text-sm font-medium ${
          isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
        }`}>
          {isPositive && <TrendingUp size={16} />}
          {isNegative && <TrendingDown size={16} />}
          <span>
            {isPositive && '+'}{change.toFixed(1)}% vs last period
          </span>
        </div>
      )}

      {subtitle && !hasChange && (
        <div className="text-sm text-gray-500 mt-1">
          {subtitle}
        </div>
      )}
    </div>
  )
}

export default SummaryCard
