import { requireAdmin } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import NotificationSender from '@/components/admin/NotificationSender'

export default async function AdminNotificationsPage() {
  // Ensure user is admin
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Notification Management</h1>
          <p className="mt-2 text-lg text-gray-600">
            Send push notifications to users
          </p>
        </div>

        {/* Notification Sender */}
        <NotificationSender />

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">How to Send Notifications</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Topic Notifications:</strong> Send to all users subscribed to a specific topic (news, events, jobs, etc.)</p>
            <p><strong>Token Notifications:</strong> Send to a specific device using its FCM token</p>
            <p><strong>Content Notifications:</strong> Automatically categorized notifications for specific content types</p>
            <p><strong>Bilingual Support:</strong> Add both English and Tamil versions for better user experience</p>
          </div>
        </div>

        {/* Notification Topics */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900">all</h4>
              <p className="text-sm text-gray-600">All users (both English and Tamil)</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900">news</h4>
              <p className="text-sm text-gray-600">Users subscribed to news updates</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900">events</h4>
              <p className="text-sm text-gray-600">Users subscribed to event notifications</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900">jobs</h4>
              <p className="text-sm text-gray-600">Users subscribed to job alerts</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900">emergency</h4>
              <p className="text-sm text-gray-600">Critical alerts and warnings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
