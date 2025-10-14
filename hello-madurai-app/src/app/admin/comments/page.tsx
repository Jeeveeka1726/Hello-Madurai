'use client'

import { useState, useEffect } from 'react'
import { ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

interface Comment {
  id: string
  content: string
  author: string
  email?: string
  approved: boolean
  isAdminReply: boolean
  createdAt: string
  newsId: string
  parentId?: string
  news: {
    id: string
    title: string
    title_ta?: string
  }
  replies: Comment[]
  _count?: {
    replies: number
  }
}

export default function AdminCommentsPage() {
  const { language } = useLanguage()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/admin/comments')
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error(language === 'ta' ? 'கருத்துகளை ஏற்ற முடியவில்லை' : 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'ta' ? 'இந்த கருத்தை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this comment?')) return

    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchComments()
        toast.success(language === 'ta' ? 'கருத்து நீக்கப்பட்டது!' : 'Comment deleted!')
      } else {
        toast.error(language === 'ta' ? 'நீக்க முடியவில்லை' : 'Failed to delete')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'An error occurred')
    }
  }

  const handleReply = async (commentId: string) => {
    const content = replyContent[commentId]
    if (!content || !content.trim()) {
      toast.error(language === 'ta' ? 'பதிலை உள்ளிடவும்' : 'Please enter a reply')
      return
    }

    try {
      const comment = comments.find(c => c.id === commentId)
      if (!comment) return

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsId: comment.newsId,
          parentId: commentId,
          author: 'Hello Madurai',
          content: content.trim(),
          isAdminReply: true,
        }),
      })

      if (response.ok) {
        await fetchComments()
        setReplyContent({ ...replyContent, [commentId]: '' })
        setReplyingTo(null)
        toast.success(language === 'ta' ? 'பதில் வெற்றிகரமாக அனுப்பப்பட்டது!' : 'Reply sent successfully!')
      } else {
        toast.error(language === 'ta' ? 'பதில் அனுப்ப முடியவில்லை' : 'Failed to send reply')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'An error occurred')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-blue-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-blue-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'ta' ? 'கருத்துகள் மேலாண்மை' : 'Comments Management'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {language === 'ta' ? 'கருத்துகளை பதிலளிக்கவும், நிர்வகிக்கவும்' : 'Reply to and manage comments'}
          </p>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="bg-white dark:bg-blue-900 border-gray-200 dark:border-blue-800">
              <CardContent className="p-6">
                {/* News Article Title */}
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-blue-700">
                  <a
                    href={`/news/${comment.news.id}`}
                    target="_blank"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {language === 'ta' && comment.news.title_ta ? comment.news.title_ta : comment.news.title}
                  </a>
                </div>

                {/* Comment */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {comment.author}
                      </span>
                      {comment.email && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({comment.email})
                        </span>
                      )}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {comment.content}
                    </p>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-6 space-y-3 border-l-2 border-blue-200 dark:border-blue-800 pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className={`p-3 rounded-lg ${
                            reply.isAdminReply 
                              ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                              : 'bg-gray-50 dark:bg-blue-800/50'
                          }`}>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                {reply.author}
                              </span>
                              {reply.isAdminReply && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                                  {language === 'ta' ? 'நிர்வாகி' : 'Admin'}
                                </span>
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-4 ml-6">
                        <textarea
                          value={replyContent[comment.id] || ''}
                          onChange={(e) => setReplyContent({ ...replyContent, [comment.id]: e.target.value })}
                          placeholder={language === 'ta' ? 'உங்கள் பதிலை இங்கே எழுதுங்கள்...' : 'Type your reply here...'}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-800 dark:text-white"
                          rows={3}
                        />
                        <div className="mt-2 flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleReply(comment.id)}
                          >
                            {language === 'ta' ? 'பதில் அனுப்பு' : 'Send Reply'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyContent({ ...replyContent, [comment.id]: '' })
                            }}
                          >
                            {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-blue-600 hover:text-blue-700"
                      title={language === 'ta' ? 'பதிலளி' : 'Reply'}
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-600 hover:text-red-700"
                      title={language === 'ta' ? 'நீக்கு' : 'Delete'}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'ta' ? 'கருத்துகள் எதுவும் இல்லை' : 'No comments found'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

