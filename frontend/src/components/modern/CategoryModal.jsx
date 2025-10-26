import { motion } from 'framer-motion'
import { X, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

export default function CategoryModal({ category, invoices, onClose }) {
  const total = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const avgAmount = total / invoices.length
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[85vh] overflow-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 capitalize">{category} Expenses</h2>
            <p className="text-gray-500 mt-1">{invoices.length} transactions</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900">₹{total.toFixed(2)}</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
            <p className="text-sm text-gray-600 mb-1">Average Amount</p>
            <p className="text-3xl font-bold text-gray-900">₹{avgAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Transactions</h3>
          {invoices
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((inv, index) => (
              <motion.div
                key={inv._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex justify-between items-center group"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {inv.merchant}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(inv.date), 'MMMM dd, yyyy • hh:mm a')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">₹{inv.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">INR</p>
                </div>
              </motion.div>
            ))}
        </div>

        {/* Footer Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span>Showing all {invoices.length} transactions in {category}</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
