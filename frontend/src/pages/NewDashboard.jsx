import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Mail,
  RefreshCw,
  Settings,
  LogOut,
  Download,
  ChevronDown,
  Search
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SummaryCards from '../components/modern/SummaryCards'
import SpendingGraph from '../components/modern/SpendingGraph'
import CategoryBreakdown from '../components/modern/CategoryBreakdown'
import TransactionsTable from '../components/modern/TransactionsTable'
import CategoryModal from '../components/modern/CategoryModal'

const DATE_RANGES = [
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3Months', label: 'Last 3 Months' },
  { value: 'last6Months', label: 'Last 6 Months' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'allTime', label: 'All Time' }
]

export default function NewDashboard({ user, setUser }) {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [fetching, setFetching] = useState(false)
  const [fetchStatus, setFetchStatus] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedDateRange, setSelectedDateRange] = useState('thisMonth')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const jobIdRef = useRef(null)

  useEffect(() => {
    // Load existing data on mount
    fetchDashboardData()
  }, [])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (showDateDropdown && !event.target.closest('.fetch-dropdown')) {
        setShowDateDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDateDropdown])

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, invoicesRes] = await Promise.all([
        axios.get('/api/dashboard/summary'),
        axios.get('/api/invoices', { params: { limit: 100 } })
      ])
      
      console.log('📊 Dashboard Data:', summaryRes.data, invoicesRes.data)
      setSummary(summaryRes.data)
      setInvoices(invoicesRes.data.invoices)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  const checkJobStatus = async (jobId) => {
    try {
      const response = await axios.get(`/api/invoices/job/${jobId}`)
      return response.data
    } catch (error) {
      console.error('Job status check failed:', error)
      return null
    }
  }

  const waitForJobCompletion = async (jobId) => {
    let attempts = 0
    const maxAttempts = 60 // 60 seconds max wait
    
    while (attempts < maxAttempts) {
      const status = await checkJobStatus(jobId)
      
      if (!status) break
      
      if (status.isCompleted) {
        return status.result // Return the job result data
      }
      
      if (status.isFailed) {
        return null
      }
      
      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
    }
    
    return null
  }

  const handleFetch = async (dateRange) => {
    try {
      setFetching(true)
      setFetchStatus('Connecting to Gmail...')
      setSelectedDateRange(dateRange)
      setShowDateDropdown(false)
      
      // Start fetch job
      const response = await axios.post('/api/invoices/fetch', { dateRange })
      jobIdRef.current = response.data.jobId
      
      setFetchStatus('Fetching & parsing emails...')
      
      // Wait for job completion and get result data
      const result = await waitForJobCompletion(jobIdRef.current)
      
      if (result && result.invoices) {
        setFetchStatus('Updating dashboard...')
        
        // Display the fetched data immediately
        setInvoices(result.invoices)
        
        // Also fetch summary data
        const summaryRes = await axios.get('/api/dashboard/summary')
        setSummary(summaryRes.data)
        
        setFetchStatus('Complete!')
      } else {
        setFetchStatus('Failed!')
      }
      
      setTimeout(() => {
        setFetching(false)
        setFetchStatus('')
      }, 1000)
    } catch (error) {
      console.error('Fetch failed:', error)
      setFetchStatus('Failed!')
      setTimeout(() => {
        setFetching(false)
        setFetchStatus('')
      }, 2000)
    }
  }

  const handleSync = async () => {
    // Sync = re-fetch with current selected date range
    await handleFetch(selectedDateRange)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 relative">
      {/* Inline Loader Overlay */}
      <AnimatePresence>
        {fetching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {fetchStatus || 'Processing...'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Please wait while we fetch and parse your invoices
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 30, ease: 'linear' }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  InvoiceIQ
                </h1>
                <p className="text-xs text-gray-500">Smart Invoice Management</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl w-96">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search merchants, amounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Fetch Dropdown */}
              <div className="relative fetch-dropdown">
                <button
                  onClick={() => setShowDateDropdown(!showDateDropdown)}
                  disabled={fetching}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 font-medium"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {fetching ? fetchStatus : 'Fetch'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showDateDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                  >
                    {DATE_RANGES.map((range) => (
                      <button
                        key={range.value}
                        onClick={() => handleFetch(range.value)}
                        disabled={fetching}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 ${
                          selectedDateRange === range.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
              
              {/* Sync Button */}
              <button
                onClick={handleSync}
                disabled={fetching}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 font-medium"
              >
                <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync</span>
              </button>
              
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <LogOut className="h-5 w-5 text-gray-600" />
              </button>
              
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-10 w-10 rounded-full ring-2 ring-blue-500"
                />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        <SummaryCards summary={summary?.summary} />

        {/* Spending Graph */}
        <div className="mb-8">
          <SpendingGraph data={summary?.monthlyTrends} />
        </div>

        {/* Category Breakdown + Transactions */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <CategoryBreakdown 
              data={summary?.categoryBreakdown} 
              onCategoryClick={setSelectedCategory}
            />
          </div>
          <div className="lg:col-span-2">
            <TransactionsTable 
              invoices={invoices}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </main>

      {/* Category Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <CategoryModal
            category={selectedCategory}
            invoices={invoices.filter(inv => inv.category === selectedCategory)}
            onClose={() => setSelectedCategory(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
