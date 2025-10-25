import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Mail,
  RefreshCw,
  Settings,
  LogOut,
  TrendingUp,
  DollarSign,
  FileText,
  Filter
} from 'lucide-react'
import SummaryCards from '../components/SummaryCards'
import CategoryChart from '../components/CategoryChart'
import MonthlyTrend from '../components/MonthlyTrend'
import InvoiceTable from '../components/InvoiceTable'

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchDashboardData()
  }, [filters])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [summaryRes, invoicesRes] = await Promise.all([
        axios.get('/api/dashboard/summary', { params: filters }),
        axios.get('/api/invoices', { params: { ...filters, limit: 50 } })
      ])
      setSummary(summaryRes.data)
      setInvoices(invoicesRes.data.invoices)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      await axios.post('/api/invoices/fetch', { maxResults: 50 })
      // Poll for completion or show notification
      setTimeout(() => {
        fetchDashboardData()
        setSyncing(false)
      }, 3000)
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncing(false)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout')
      setUser(null)
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Invoice Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync'}
              </button>
              
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="h-5 w-5" />
              </button>
              
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-10 w-10 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <SummaryCards summary={summary?.summary} />

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <CategoryChart data={summary?.categoryBreakdown} />
          <MonthlyTrend data={summary?.monthlyTrends} />
        </div>

        {/* Invoices Table */}
        <InvoiceTable
          invoices={invoices}
          onRefresh={fetchDashboardData}
          filters={filters}
          setFilters={setFilters}
        />
      </main>
    </div>
  )
}
