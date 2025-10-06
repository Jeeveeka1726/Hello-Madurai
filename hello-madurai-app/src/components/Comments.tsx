'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ChatBubbleLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline'

interface Comment {
  id: string
  content: string
  author: string
  email?: string
  createdAt: string
  updatedAt: string
}

interface CommentsProps {
  itemId: string
  itemType: 'news' | 'video' | 'radio' | 'business'
  isOpen: boolean
  onClose: () => void
}

export default function Comments({ itemId, itemType, isOpen, onClose }: CommentsProps) {
  const { t } = useLanguage()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState({
    content: '',
    author: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchComments()
    }
  }, [isOpen, itemId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/${itemType}/${itemId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.content.trim() || !newComment.author.trim()) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/${itemType}/${itemId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComment)
      })

      if (response.ok) {
        const comment = await response.json()
        setComments(prev => [comment, ...prev])
        setNewComment({ content: '', author: '' })
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <ChatBubbleLeftIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {t('comments.title', 'Comments', 'கருத்துகள்')} ({comments.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                {t('comments.loading', 'Loading comments...', 'கருத்துகள் ஏற்றப்படுகிறது...')}
              </div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {t('comments.empty', 'No comments yet. Be the first to comment!', 'இன்னும் கருத்துகள் இல்லை. முதலில் கருத்து தெரிவிக்கவும்!')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <UserCircleIcon className="h-8 w-8 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="border-t p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('comments.form.name', 'Name', 'பெயர்')} *
              </label>
              <input
                type="text"
                required
                value={newComment.author}
                onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white dark:bg-gray-700 dark:text-white"
                placeholder={t('comments.form.namePlaceholder', 'Your name', 'உங்கள் பெயர்')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('comments.form.comment', 'Comment', 'கருத்து')} *
              </label>
              <textarea
                required
                rows={3}
                value={newComment.content}
                onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white dark:bg-gray-700 dark:text-white"
                placeholder={t('comments.form.commentPlaceholder', 'Write your comment...', 'உங்கள் கருத்தை எழுதுங்கள்...')}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('comments.form.cancel', 'Cancel', 'ரத்து')}
              </button>
              <button
                type="submit"
                disabled={submitting || !newComment.content.trim() || !newComment.author.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting 
                  ? t('comments.form.posting', 'Posting...', 'பதிவிடப்படுகிறது...')
                  : t('comments.form.post', 'Post Comment', 'கருத்தை பதிவிடவும்')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

