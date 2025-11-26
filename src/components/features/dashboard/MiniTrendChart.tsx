import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { TrendDataPoint } from '../../../types'
import { Loader2 } from 'lucide-react'

interface MiniTrendChartProps {
  data: TrendDataPoint[]
  loading?: boolean
}

const MiniTrendChart = ({ data, loading }: MiniTrendChartProps) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[200px] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[200px] flex items-center justify-center">
        <p className="text-gray-500 text-sm">No trend data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Spending Trend</h3>
        <p className="text-xs text-gray-500">Last 30 days</p>
      </div>
      
      <div className="h-[120px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAmountMini" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
                padding: '8px 12px'
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
              labelFormatter={(label) => {
                try {
                  const date = new Date(label)
                  if (isNaN(date.getTime())) return label
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                } catch {
                  return label
                }
              }}
            />
            <Area 
              type="monotone" 
              dataKey="amount"
              stroke="#6366f1" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorAmountMini)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default MiniTrendChart
