'use client'

import { useState, useEffect } from 'react'
import { ChatBubbleLeftIcon, UserCircleIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
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
  replies?: Comment[]
}

interface CommentsSectionProps {
  newsId: string
}

export default function CommentsSection({ newsId }: CommentsSectionProps) {
  const { language } = useLanguage()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    author: '',
    email: '',
    content: ''
  })

  // Reply form state
  const [replyFormData, setReplyFormData] = useState({
    author: '',
    email: '',
    content: ''
  })

  useEffect(() => {
    fetchComments()
  }, [newsId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?newsId=${newsId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.author.trim() || !formData.content.trim()) {
      toast.error(language === 'ta' ? 'பெயர் மற்றும் கருத்து அவசியம்' : 'Name and comment are required')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsId,
          author: formData.author.trim(),
          email: formData.email.trim() || undefined,
          content: formData.content.trim(),
        }),
      })

      if (response.ok) {
        toast.success(
          language === 'ta' 
            ? 'உங்கள் கருத்து வெற்றிகரமாக சேர்க்கப்பட்டது!'
            : 'Your comment has been posted successfully!'
        )
        setFormData({ author: '', email: '', content: '' })
        // Refresh comments immediately
        fetchComments()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || (language === 'ta' ? 'கருத்து சமர்ப்பிக்க முடியவில்லை' : 'Failed to submit comment'))
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault()
    
    if (!replyFormData.author.trim() || !replyFormData.content.trim()) {
      toast.error(language === 'ta' ? 'பெயர் மற்றும் பதில் அவசியம்' : 'Name and reply are required')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsId,
          author: replyFormData.author.trim(),
          email: replyFormData.email.trim() || undefined,
          content: replyFormData.content.trim(),
          parentId: parentId, // This makes it a reply
        }),
      })

      if (response.ok) {
        toast.success(
          language === 'ta' 
            ? 'உங்கள் பதில் வெற்றிகரமாக சேர்க்கப்பட்டது!'
            : 'Your reply has been posted successfully!'
        )
        setReplyFormData({ author: '', email: '', content: '' })
        setReplyingTo(null) // Close reply form
        // Refresh comments immediately
        fetchComments()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || (language === 'ta' ? 'பதில் சமர்ப்பிக்க முடியவில்லை' : 'Failed to submit reply'))
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)
    
    if (diffInMinutes < 1) {
      return language === 'ta' ? 'இப்போது' : 'Just now'
    } else if (diffInMinutes < 60) {
      return language === 'ta' 
        ? `${diffInMinutes} நிமிடங்களுக்கு முன்பு`
        : `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return language === 'ta'
        ? `${hours} மணி நேரத்திற்கு முன்பு`
        : `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <ChatBubbleLeftIcon className="h-6 w-6 mr-2" />
          {language === 'ta' ? 'கருத்துகள்' : 'Comments'}
          {comments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({comments.length})
            </span>
          )}
        </h2>
      </div>

      {/* Comment Form */}
      <div className="mb-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'ta' ? 'உங்கள் கருத்தைப் பகிருங்கள்' : 'Leave a Comment'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ta' ? 'பெயர்' : 'Name'} *
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder={language === 'ta' ? 'உங்கள் பெயரை உள்ளிடவும்' : 'Enter your name'}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ta' ? 'மின்னஞ்சல்' : 'Email'} ({language === 'ta' ? 'விருப்பம்' : 'Optional'})
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={language === 'ta' ? 'உங்கள் மின்னஞ்சல்' : 'Your email (optional)'}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ta' ? 'கருத்து' : 'Comment'} *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={language === 'ta' ? 'உங்கள் கருத்தை எழுதுங்கள்...' : 'Write your comment...'}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting 
              ? (language === 'ta' ? 'சமர்ப்பிக்கிறது...' : 'Submitting...')
              : (language === 'ta' ? 'கருத்தை சமர்ப்பிக்கவும்' : 'Submit Comment')
            }
          </Button>
        </form>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading comments...'}
          </p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {language === 'ta' 
            ? 'இதுவரை கருத்துகள் எதுவும் இல்லை. முதல் கருத்தை நீங்கள் இடுங்கள்!'
            : 'No comments yet. Be the first to comment!'
          }
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg p-6 shadow-sm">
              {/* Comment Header */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {comment.author}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  
                  {/* Reply Button */}
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ArrowUturnLeftIcon className="h-4 w-4 mr-1" />
                    {language === 'ta' ? 'பதிலளிக்க' : 'Reply'}
                  </button>
                </div>
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="mt-4 ml-10 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    {language === 'ta' ? `${comment.author} க்கு பதிலளிக்கவும்` : `Reply to ${comment.author}`}
                  </h4>
                  <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={replyFormData.author}
                        onChange={(e) => setReplyFormData({ ...replyFormData, author: e.target.value })}
                        placeholder={language === 'ta' ? 'உங்கள் பெயர்' : 'Your name'}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="email"
                        value={replyFormData.email}
                        onChange={(e) => setReplyFormData({ ...replyFormData, email: e.target.value })}
                        placeholder={language === 'ta' ? 'மின்னஞ்சல் (விருப்பம்)' : 'Email (optional)'}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <textarea
                      value={replyFormData.content}
                      onChange={(e) => setReplyFormData({ ...replyFormData, content: e.target.value })}
                      placeholder={language === 'ta' ? 'உங்கள் பதிலை எழுதுங்கள்...' : 'Write your reply...'}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (language === 'ta' ? 'சமர்ப்பிக்கிறது...' : 'Submitting...') : (language === 'ta' ? 'பதிலை சமர்ப்பிக்கவும்' : 'Submit Reply')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyFormData({ author: '', email: '', content: '' })
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-10 space-y-4 border-l-2 border-blue-200 pl-4">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-4 rounded-lg ${
                        reply.isAdminReply
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <UserCircleIcon className={`h-8 w-8 ${
                            reply.isAdminReply ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">
                              {reply.author}
                            </span>
                            {reply.isAdminReply && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                                {language === 'ta' ? 'நிர்வாகி' : 'Admin'}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
