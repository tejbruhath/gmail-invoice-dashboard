import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react'

export default function SettingsPage({ user, setUser }) {
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteData = async () => {
    try {
      setDeleting(true)
      await axios.delete('/api/user/data')
      setUser(null)
      navigate('/')
    } catch (error) {
      console.error('Delete failed:', error)
      setDeleting(false)
    }
  }

  const handleRevokeAccess = async () => {
    try {
      await axios.post('/api/user/revoke')
      setUser(null)
      navigate('/')
    } catch (error) {
      console.error('Revoke failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="flex items-center gap-4">
            {user?.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="h-16 w-16 rounded-full"
              />
            )}
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Privacy & Security</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">Read-only Access</p>
                <p className="text-sm text-blue-700">
                  We only read your emails. We never send, delete, or modify anything.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={handleRevokeAccess}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Revoke Gmail Access
              </button>
              <p className="text-sm text-gray-500 mt-2">
                This will disconnect your Gmail but keep your invoice data
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-red-200">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
          
          {!showDeleteConfirm ? (
            <div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Trash2 className="h-4 w-4" />
                Delete All Data
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Permanently delete your account and all invoice data
              </p>
            </div>
          ) : (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="font-semibold text-red-900 mb-3">
                Are you absolutely sure?
              </p>
              <p className="text-sm text-red-700 mb-4">
                This action cannot be undone. All your invoices and account data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteData}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
