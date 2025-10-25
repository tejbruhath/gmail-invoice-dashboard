import { Mail, TrendingUp, PieChart, Shield, Zap, Lock } from 'lucide-react'
import axios from 'axios'

export default function LandingPage() {
  const handleLogin = async () => {
    try {
      const response = await axios.get('/auth/google')
      window.location.href = response.data.authUrl
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const features = [
    {
      icon: Mail,
      title: 'Automatic Scanning',
      description: 'Scans your Gmail for invoices and receipts automatically'
    },
    {
      icon: PieChart,
      title: 'Smart Categorization',
      description: 'AI-powered categorization of your expenses'
    },
    {
      icon: TrendingUp,
      title: 'Visual Analytics',
      description: 'Beautiful charts and insights into your spending'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Read-only access, encrypted storage, and full data control'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process hundreds of invoices in seconds'
    },
    {
      icon: Lock,
      title: 'Secure OAuth',
      description: 'Industry-standard Google OAuth2 authentication'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Invoice Dashboard</span>
          </div>
          <button
            onClick={handleLogin}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Track Your Expenses
          <br />
          Automatically
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect your Gmail and let AI extract, categorize, and visualize all your invoices and receipts in one beautiful dashboard
        </p>
        <button
          onClick={handleLogin}
          className="px-8 py-4 bg-primary text-white text-lg rounded-lg hover:bg-primary/90 transition shadow-lg hover:shadow-xl"
        >
          Get Started with Gmail
        </button>
        <p className="mt-4 text-sm text-gray-500">
          Free • Secure • Privacy-focused
        </p>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition"
            >
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Organize Your Finances?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of users who trust us with their expense tracking
          </p>
          <button
            onClick={handleLogin}
            className="px-8 py-4 bg-white text-primary text-lg rounded-lg hover:bg-gray-100 transition shadow-lg"
          >
            Sign Up Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>&copy; 2024 Invoice Dashboard. Built with ❤️ for better expense tracking.</p>
      </footer>
    </div>
  )
}
