import { useState } from 'react'
import { format } from 'date-fns'
import { Filter, X } from 'lucide-react'

const CATEGORIES = ['food', 'shopping', 'bills', 'entertainment', 'travel', 'healthcare', 'other']

export default function InvoiceTable({ invoices, onRefresh, filters, setFilters }) {
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ category: '', startDate: '', endDate: '' })
  }

  const getCategoryColor = (category) => {
    const colors = {
      food: 'bg-orange-100 text-orange-700',
      shopping: 'bg-blue-100 text-blue-700',
      bills: 'bg-red-100 text-red-700',
      entertainment: 'bg-purple-100 text-purple-700',
      travel: 'bg-green-100 text-green-700',
      healthcare: 'bg-pink-100 text-pink-700',
      other: 'bg-gray-100 text-gray-700'
    }
    return colors[category] || colors.other
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Invoices</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <button
            onClick={clearFilters}
            className="mt-3 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </button>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No invoices found. Click "Sync" to fetch from Gmail.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-gray-600">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Merchant</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    {format(new Date(invoice.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 font-medium">{invoice.merchant}</td>
                  <td className="py-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(invoice.category)}`}>
                      {invoice.category}
                    </span>
                  </td>
                  <td className="py-3 font-semibold">
                    ${invoice.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
