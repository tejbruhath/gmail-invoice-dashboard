import { DollarSign, FileText, TrendingUp } from 'lucide-react'

export default function SummaryCards({ summary }) {
  if (!summary) return null

  const cards = [
    {
      title: 'Total Spending',
      value: `$${summary.totalSpending.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Invoices',
      value: summary.totalInvoices,
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      title: 'Average Amount',
      value: `$${summary.averageSpending.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">{card.title}</h3>
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
