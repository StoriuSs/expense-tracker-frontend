import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { getDateRangePresets, formatDateRange, DateRange } from '../../../utils/dateRangeUtils'

interface DateRangeSelectorProps {
  onRangeChange: (startDate: string, endDate: string) => void
  defaultPreset?: string
}

const DateRangeSelector = ({ onRangeChange, defaultPreset = 'this_month' }: DateRangeSelectorProps) => {
  const presets = getDateRangePresets()
  const [activePreset, setActivePreset] = useState(defaultPreset)
  const [customRange, setCustomRange] = useState({ start: '', end: '' })
  const [showCustom, setShowCustom] = useState(false)

  const handlePresetClick = (presetKey: string) => {
    if (presetKey === 'custom') {
      setShowCustom(true)
      setActivePreset('custom')
      return
    }

    const preset = presets[presetKey]
    if (preset) {
      const range = preset()
      setActivePreset(presetKey)
      setShowCustom(false)
      onRangeChange(range.startDate, range.endDate)
    }
  }

  const handleCustomApply = () => {
    if (customRange.start && customRange.end) {
      onRangeChange(customRange.start, customRange.end)
    }
  }

  const getCurrentRange = (): string => {
    if (activePreset === 'custom' && customRange.start && customRange.end) {
      return formatDateRange(customRange.start, customRange.end)
    }
    const preset = presets[activePreset]
    if (preset) {
      const range = preset()
      return formatDateRange(range.startDate, range.endDate)
    }
    return ''
  }

  const presetButtons = [
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'last_3_months', label: 'Last 3M' },
    { key: 'last_6_months', label: 'Last 6M' },
    { key: 'this_year', label: 'This Year' },
    { key: 'custom', label: 'Custom' }
  ]

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
      {/* Preset Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {presetButtons.map((preset) => (
          <button
            key={preset.key}
            onClick={() => handlePresetClick(preset.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
              activePreset === preset.key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      {showCustom && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleCustomApply}
              disabled={!customRange.start || !customRange.end}
              className="w-full px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Current Range Display */}
      <div className="flex items-center gap-2 text-gray-600 pt-2 border-t border-gray-100">
        <Calendar size={16} />
        <span className="text-sm font-medium">{getCurrentRange()}</span>
      </div>
    </div>
  )
}

export default DateRangeSelector
