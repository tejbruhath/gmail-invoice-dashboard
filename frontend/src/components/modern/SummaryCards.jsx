import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, FileText, Tag, Clock } from 'lucide-react'

export default function SummaryCards({ summary }) {
  if (!summary) return null

  const cards = [
    {
      title: 'Total Spent',
      value: `₹${summary.totalSpending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
      trend: '+12.5%',
      trendUp: true
    },
    {
      title: 'Total Invoices',
      value: summary.totalInvoices,
      icon: FileText,
      color: 'from-green-500 to-green-600',
      subtitle: 'transactions'
    },
    {
      title: 'Avg Per Invoice',
      value: `₹${summary.averageSpending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Tag,
      color: 'from-purple-500 to-purple-600',
      trend: '-5.2%',
      trendUp: false
    },
    {
      title: 'Last Synced',
      value: 'Just now',
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      subtitle: 'Click sync to refresh'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              {card.trend && (
                <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {card.trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{card.trend}</span>
                </div>
              )}
              {card.subtitle && (
                <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
