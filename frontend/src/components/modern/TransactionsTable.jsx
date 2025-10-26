import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ShoppingBag, Utensils, Plane, Zap, Gamepad2, Heart, MoreHorizontal, ShoppingCart } from 'lucide-react'

const CATEGORY_ICONS = {
  food: Utensils,
  groceries: ShoppingCart,
  shopping: ShoppingBag,
  travel: Plane,
  bills: Zap,
  entertainment: Gamepad2,
  healthcare: Heart,
  other: MoreHorizontal
}

const CATEGORY_COLORS = {
  food: 'bg-orange-100 text-orange-700',
  groceries: 'bg-emerald-100 text-emerald-700',
  shopping: 'bg-blue-100 text-blue-700',
  travel: 'bg-green-100 text-green-700',
  bills: 'bg-red-100 text-red-700',
  entertainment: 'bg-purple-100 text-purple-700',
  healthcare: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-700'
}

export default function TransactionsTable({ invoices, searchQuery }) {
  const filteredInvoices = invoices.filter(inv => 
    inv.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.amount.toString().includes(searchQuery)
  )

  if (filteredInvoices.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          {searchQuery ? 'No transactions match your search' : 'No transactions found. Click "Sync" to fetch invoices.'}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          <p className="text-sm text-gray-500 mt-1">{filteredInvoices.length} transactions</p>
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {filteredInvoices.map((invoice, index) => {
          const Icon = CATEGORY_ICONS[invoice.category] || MoreHorizontal
          const colorClass = CATEGORY_COLORS[invoice.category] || CATEGORY_COLORS.other
          
          return (
            <motion.div
              key={invoice._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-100 hover:border-gray-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${colorClass.replace('text-', 'bg-').replace('-700', '-100')} group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${colorClass.split(' ')[1]}`} />
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{invoice.merchant}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                        {invoice.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(invoice.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    ₹{invoice.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">INR</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
