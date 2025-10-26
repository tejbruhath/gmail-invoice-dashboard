import { motion } from 'framer-motion'
import { ShoppingBag, Utensils, Plane, Zap, Gamepad2, Heart, MoreHorizontal, ShoppingCart } from 'lucide-react'

const CATEGORY_CONFIG = {
  food: { icon: Utensils, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-600' },
  groceries: { icon: ShoppingCart, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  shopping: { icon: ShoppingBag, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
  travel: { icon: Plane, color: 'from-green-500 to-green-600', bg: 'bg-green-50', text: 'text-green-600' },
  bills: { icon: Zap, color: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-600' },
  entertainment: { icon: Gamepad2, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-600' },
  healthcare: { icon: Heart, color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50', text: 'text-pink-600' },
  other: { icon: MoreHorizontal, color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-600' }
}

export default function CategoryBreakdown({ data, onCategoryClick }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Spending by Category</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No category data available
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">Spending by Category</h2>
      
      <div className="space-y-3">
        {data.map((item, index) => {
          const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other
          const Icon = config.icon
          
          return (
            <motion.button
              key={item.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => onCategoryClick(item.category)}
              className="w-full p-4 rounded-xl hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${config.text}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 capitalize">{item.category}</p>
                    <p className="text-xs text-gray-500">{item.count} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{item.total.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className={`h-full bg-gradient-to-r ${config.color}`}
                />
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
