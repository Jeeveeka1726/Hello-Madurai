'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface Singer {
  id: string
  name: string
  name_ta: string | null
  imageUrl: string | null
}

interface Reply {
  id: string
  content: string
  author: string
  isAdminReply: boolean
  createdAt: string
}

interface Comment {
  id: string
  content: string
  author: string
  createdAt: string
  singer: Singer
  replies: Reply[]
  _count: {
    replies: number
  }
}

export default function RadioCommentsPage() {
  const { language } = useLanguage()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/admin/radio-comments')
      const data = await response.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error(language === 'ta' ? 'கருத்துகளை பெற முடியவில்லை' : 'Failed to fetch comments')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'ta' ? 'இந்த கருத்தை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this comment?')) return

    try {
      const response = await fetch(`/api/admin/radio-comments/${id}`, {
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
    const content = replyContent[commentId]?.trim()
    if (!content) {
      toast.error(language === 'ta' ? 'பதிலை உள்ளிடவும்' : 'Please enter a reply')
      return
    }

    try {
      const response = await fetch(`/api/admin/radio-comments/${commentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: 'Hello Madurai Admin',
          content: content.trim(),
        }),
      })

      if (response.ok) {
        await fetchComments()
        setReplyContent({ ...replyContent, [commentId]: '' })
        setReplyingTo(null)
        toast.success(language === 'ta' ? 'பதில் வெற்றிகரமாக அனுப்பப்பட்டது!' : 'Reply sent successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || (language === 'ta' ? 'பதில் அனுப்ப முடியவில்லை' : 'Failed to send reply'))
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'An error occurred')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString(language === 'ta' ? 'ta-IN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {language === 'ta' ? 'டிஜிட்டல் எஃப்.எம் கருத்துகள்' : 'Digital FM Comments'}
      </h1>

      {comments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          {language === 'ta' ? 'கருத்துகள் இல்லை' : 'No comments yet'}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg shadow">
              <div className="p-6">
                {/* Artist Info */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    {comment.singer.imageUrl && (
                      <img
                        src={comment.singer.imageUrl}
                        alt={comment.singer.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <a
                        href={`/radio`}
                        target="_blank"
                        className="text-sm font-semibold text-blue-600 hover:underline"
                      >
                        {language === 'ta' && comment.singer.name_ta ? comment.singer.name_ta : comment.singer.name}
                      </a>
                      <p className="text-xs text-gray-500">
                        {language === 'ta' ? 'கலைஞர்' : 'Artist'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {comment.author}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">
                      {comment.content}
                    </p>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-6 space-y-3 border-l-2 border-blue-200 pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className={`p-3 rounded-lg ${
                            reply.isAdminReply
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-sm text-gray-900">
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
                            <p className="text-sm text-gray-700">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <textarea
                          value={replyContent[comment.id] || ''}
                          onChange={(e) => setReplyContent({ ...replyContent, [comment.id]: e.target.value })}
                          placeholder={language === 'ta' ? 'உங்கள் பதிலை எழுதுங்கள்...' : 'Write your reply...'}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleReply(comment.id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                          >
                            {language === 'ta' ? 'அனுப்பு' : 'Send'}
                          </button>
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-md text-sm font-medium"
                          >
                            {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-gray-300"
                      title={language === 'ta' ? 'பதிலளி' : 'Reply'}
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded border border-gray-300"
                      title={language === 'ta' ? 'நீக்கு' : 'Delete'}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

