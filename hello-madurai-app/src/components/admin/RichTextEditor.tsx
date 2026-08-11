'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import { Node } from '@tiptap/core'
import {
  BoldIcon,
  ItalicIcon,
  PhotoIcon,
  LinkIcon,
  ListBulletIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'

// Custom Instagram Reel Extension with Auto-Paste Detection
// Uses Instagram's /embed iframe endpoint (works without external scripts)
const InstagramReel = Node.create({
  name: 'instagramReel',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'iframe[data-instagram-reel]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    // Instagram's /embed endpoint with captioned=1 parameter for better compatibility
    return [
      'iframe',
      {
        'data-instagram-reel': '',
        'src': HTMLAttributes.src,
        'frameborder': '0',
        'scrolling': 'no',
        'allowtransparency': 'true',
        'allowfullscreen': 'true',
        'style': 'border: none; overflow: hidden; width: 100%; max-width: 540px; height: 960px; margin: 0 auto; display: block; background: white;',
      },
    ]
  },

  addCommands() {
    return {
      setInstagramReel: (options: { url: string }) => ({ commands }) => {
        // Extract reel ID from URL and remove query parameters
        const match = options.url.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/)
        if (!match) return false

        const reelId = match[1]
        // Use Instagram's /embed endpoint
        // Add utm_source=ig_embed to tell Instagram this is an embedded player
        const embedSrc = `https://www.instagram.com/p/${reelId}/embed/?utm_source=ig_embed&amp;utm_campaign=loading`

        return commands.insertContent({
          type: this.name,
          attrs: { src: embedSrc },
        })
      },
    }
  },

  // Auto-paste detection for Instagram Reels
  addPasteRules() {
    return [
      {
        // Match Instagram URL and capture everything including query params
        find: /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)(?:\/)?(?:\?[^\s]*)?\s*/g,
        handler: ({ match, chain, state, range }) => {
          console.log('📸 Instagram Reel detected:', match[0])
          const reelId = match[1]
          const cleanUrl = `https://www.instagram.com/reel/${reelId}/`
          console.log('📸 Embedding Instagram Reel (clean URL):', cleanUrl)

          // Delete the pasted text (including query params) and insert the embed
          chain()
            .deleteRange(range)
            .setInstagramReel({ url: cleanUrl })
            .run()

          return true // Prevent default paste behavior
        },
      },
    ]
  },
})

// Custom YouTube extension that extends the default one to handle Shorts
const CustomYoutube = Youtube.extend({
  addPasteRules() {
    return [
      {
        // Match YouTube regular videos
        find: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)(?:[?&][^\s]*)?/g,
        handler: ({ match, chain, range }) => {
          const videoId = match[1]
          chain()
            .deleteRange(range)
            .setYoutubeVideo({ src: `https://www.youtube.com/watch?v=${videoId}` })
            .run()
          return true
        },
      },
      {
        // Match YouTube Shorts
        find: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]+)(?:[?#][^\s]*)?/g,
        handler: ({ match, chain, range }) => {
          const videoId = match[1]
          // YouTube Shorts use the same video ID format, just different URL
          chain()
            .deleteRange(range)
            .setYoutubeVideo({ src: `https://www.youtube.com/watch?v=${videoId}` })
            .run()
          return true
        },
      },
    ]
  },
})

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  label?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  className = '',
  label
}: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false)
  const isUpdatingFromProp = useRef(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
          style: 'max-width: 100% !important; height: auto !important; opacity: 1 !important; visibility: visible !important;',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      CustomYoutube.configure({
        width: 1280,
        height: 720,
        controls: true,
        nocookie: true, // Use youtube-nocookie.com to avoid embedding restrictions
        modestBranding: true,
        enableIFrameApi: false,
        inline: false,
        HTMLAttributes: {
          class: 'youtube-video',
          style: 'width: 100%; max-width: 1280px; height: auto; aspect-ratio: 16 / 9; display: block; margin: 1.5rem auto;',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
          allowfullscreen: 'true',
          frameborder: '0',
        },
      }),
      InstagramReel,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none min-h-[400px] p-4 bg-white text-gray-900'
      },
    },
    onUpdate: ({ editor }) => {
      if (!isUpdatingFromProp.current) {
        const html = editor.getHTML()
        onChange(html)
      }
    },
  })

  // Only update editor when value changes from outside (editing existing article)
  useEffect(() => {
    if (editor && !editor.isFocused) {
      const currentContent = editor.getHTML()
      if (value !== currentContent) {
        isUpdatingFromProp.current = true
        editor.commands.setContent(value || '')
        setTimeout(() => {
          isUpdatingFromProp.current = false
        }, 100)
      }
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  const handleImageUpload = async (file: File) => {
    console.log('🖼️ Image upload started:', file.name, file.type, file.size)

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size, 'bytes')
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Invalid file type:', file.type)
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
      return
    }

    setUploading(true)
    toast.loading('Uploading image...', { id: 'image-upload' })
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('📤 Sending upload request to /api/upload/news-image')
      const response = await fetch('/api/upload/news-image', {
        method: 'POST',
        body: formData,
      })

      console.log('📥 Upload response status:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Upload successful! Image URL:', data.url)

        toast.dismiss('image-upload')
        if (data.resized) {
          toast.success('✅ Image uploaded and resized to 1280x720!')
        } else {
          toast.success('✅ Image uploaded successfully!')
        }

        console.log('🖼️ Inserting image into editor:', data.url)
        editor.chain().focus().setImage({ src: data.url }).run()
        console.log('✅ Image inserted into editor')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Upload failed:', response.status, errorData)
        toast.dismiss('image-upload')
        toast.error(`Failed to upload: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error)
      toast.dismiss('image-upload')
      toast.error(`Error uploading image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const addLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        toast.error('URL must start with http:// or https://')
        return
      }
      editor.chain().focus().setLink({ href: url }).run()
      toast.success('✅ Link added!')
    }
  }


  const addImageFromURL = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        toast.error('URL must start with http:// or https://')
        return
      }
      editor.chain().focus().setImage({ src: url }).run()
      toast.success('✅ Image inserted!')
    }
  }

  const floatImageLeft = () => {
    const { state } = editor
    const { from } = state.selection
    const node = state.doc.nodeAt(from)

    if (node && node.type.name === 'image') {
      editor.commands.updateAttributes('image', {
        style: 'float: left; margin: 0.5rem 1.5rem 1rem 0; max-width: 350px; display: inline;',
        class: 'float-left'
      })
      toast.success('✅ Image floated left!')
    } else {
      toast.error('Please select an image first')
    }
  }

  const floatImageRight = () => {
    const { state } = editor
    const { from } = state.selection
    const node = state.doc.nodeAt(from)

    if (node && node.type.name === 'image') {
      editor.commands.updateAttributes('image', {
        style: 'float: right; margin: 0.5rem 0 1rem 1.5rem; max-width: 350px; display: inline;',
        class: 'float-right'
      })
      toast.success('✅ Image floated right!')
    } else {
      toast.error('Please select an image first')
    }
  }

  const clearImageFloat = () => {
    const { state } = editor
    const { from } = state.selection
    const node = state.doc.nodeAt(from)

    if (node && node.type.name === 'image') {
      editor.commands.updateAttributes('image', {
        style: 'display: block; margin: 1.5rem auto; max-width: 100%;',
        class: ''
      })
      toast.success('✅ Float cleared!')
    } else {
      toast.error('Please select an image first')
    }
  }
  }

  const addYouTubeVideo = () => {
    const url = prompt('Enter YouTube URL (supports regular videos, Shorts, and Instagram Reels):\n\nExamples:\n• https://www.youtube.com/watch?v=VIDEO_ID\n• https://youtube.com/shorts/VIDEO_ID\n• https://www.instagram.com/reel/REEL_ID/')
    if (url) {
      // Check if it's an Instagram Reel
      const instagramReelRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/
      const instagramMatch = url.match(instagramReelRegex)

      if (instagramMatch) {
        // Use the custom InstagramReel extension with full URL
        const fullUrl = url.startsWith('http') ? url : `https://www.instagram.com/reel/${instagramMatch[1]}/`
        editor.commands.setInstagramReel({
          url: fullUrl
        })
        toast.success('✅ Instagram Reel embedded!')
        return
      }

      // Check if it's a YouTube URL (including Shorts)
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
      if (!youtubeRegex.test(url)) {
        toast.error('Please enter a valid YouTube or Instagram Reel URL')
        return
      }

      // Extract video ID and create proper embed URL
      let videoId = ''

      // Handle youtube.com/watch?v=VIDEO_ID format
      const watchMatch = url.match(/[?&]v=([^&]+)/)
      if (watchMatch) {
        videoId = watchMatch[1]
      }

      // Handle youtu.be/VIDEO_ID format
      const shortMatch = url.match(/youtu\.be\/([^?]+)/)
      if (shortMatch) {
        videoId = shortMatch[1]
      }

      // Handle youtube.com/embed/VIDEO_ID format
      const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/)
      if (embedMatch) {
        videoId = embedMatch[1]
      }

      // Handle youtube.com/shorts/VIDEO_ID format (YouTube Shorts)
      const shortsMatch = url.match(/youtube\.com\/shorts\/([^?]+)/)
      if (shortsMatch) {
        videoId = shortsMatch[1]
      }

      if (!videoId) {
        toast.error('Could not extract video ID from URL')
        return
      }

      // Use the video ID with TipTap's YouTube extension
      editor.commands.setYoutubeVideo({
        src: `https://www.youtube.com/watch?v=${videoId}`,
        width: 1280,
        height: 720
      })
      toast.success('✅ YouTube video embedded at 1280×720! (Supports Shorts too)')
    }
  }



  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {label && (
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <p className="text-xs text-blue-600 mt-1">
            ✅ Images auto-resize to 1280×720 px | 📺 YouTube videos/Shorts embed at 1280×720 px | 📱 Instagram Reels supported
          </p>
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ Important: Only use public videos/reels with embedding enabled
          </p>
        </div>
      )}
      
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 bg-gray-50 sticky top-0 z-10">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 hover:bg-blue-100 rounded transition-colors ${
            editor.isActive('bold') ? 'bg-blue-200' : ''
          }`}
          title="Bold (Ctrl+B)"
        >
          <BoldIcon className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 hover:bg-blue-100 rounded transition-colors ${
            editor.isActive('italic') ? 'bg-blue-200' : ''
          }`}
          title="Italic (Ctrl+I)"
        >
          <ItalicIcon className="h-4 w-4 text-gray-700" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 text-sm font-bold hover:bg-blue-100 rounded transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-blue-200' : ''
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 text-sm font-bold hover:bg-blue-100 rounded transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-200' : ''
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 text-sm font-bold hover:bg-blue-100 rounded transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-200' : ''
          }`}
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={`px-2 py-1 text-sm font-bold hover:bg-blue-100 rounded transition-colors ${
            editor.isActive('heading', { level: 4 }) ? 'bg-blue-200' : ''
          }`}
          title="Heading 4"
        >
          H4
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={`px-2 py-1 text-sm font-bold hover:bg-blue-100 rounded transition-colors ${
            editor.isActive('heading', { level: 5 }) ? 'bg-blue-200' : ''
          }`}
          title="Heading 5"
        >
          H5
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={`px-2 py-1 text-sm font-bold hover:bg-blue-100 rounded transition-colors ${
            editor.isActive('heading', { level: 6 }) ? 'bg-blue-200' : ''
          }`}
          title="Heading 6"
        >
          H6
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 hover:bg-blue-100 rounded transition-colors ${
            editor.isActive('bulletList') ? 'bg-blue-200' : ''
          }`}
          title="Bullet List"
        >
          <ListBulletIcon className="h-4 w-4 text-gray-700" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Link */}
        <button
          type="button"
          onClick={addLink}
          className="p-2 hover:bg-blue-100 rounded transition-colors"
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4 text-gray-700" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Image Upload */}
        <label
          className="p-2 hover:bg-blue-100 rounded cursor-pointer transition-colors inline-flex items-center"
          title="Upload Image (Click to select file)"
          style={{
            backgroundColor: uploading ? '#dbeafe' : 'transparent',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          <PhotoIcon className="h-4 w-4" style={{ color: '#374151' }} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageUpload(file)
              e.target.value = ''
            }}
            disabled={uploading}
          />
        </label>

        {/* Image from URL */}
        <button
          type="button"
          onClick={addImageFromURL}
          className="px-2 py-1 text-xs font-medium hover:bg-blue-100 rounded transition-colors"
          title="Insert Image from URL (Paste image link)"
          style={{ color: '#374151' }}
        >
          🖼️ URL
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Image Float Controls */}
        <button
          type="button"
          onClick={floatImageLeft}
          className="p-2 hover:bg-blue-100 rounded transition-colors"
          title="Float Image Left (Select image first)"
        >
          <ArrowLeftIcon className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={floatImageRight}
          className="p-2 hover:bg-blue-100 rounded transition-colors"
          title="Float Image Right (Select image first)"
        >
          <ArrowRightIcon className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={clearImageFloat}
          className="px-2 py-1 text-xs font-medium hover:bg-blue-100 rounded transition-colors text-gray-700"
          title="Clear Float (Center image)"
        >
          ⊟
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* YouTube Video / Instagram Reel */}
        <button
          type="button"
          onClick={addYouTubeVideo}
          className="px-2 py-1 text-xs font-medium hover:bg-blue-100 rounded transition-colors text-gray-700"
          title="Embed YouTube Video/Shorts or Instagram Reel"
        >
          ▶️ Video
        </button>


        {uploading && (
          <div className="flex items-center px-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-600 ml-2">Uploading...</span>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="max-h-[400px] overflow-y-auto bg-white border border-gray-200 rounded-md">
        <EditorContent editor={editor} />
      </div>

      {/* Helper Text */}
      <div className="p-3 bg-blue-50 text-xs text-blue-700 border-t border-blue-200">
        <p className="font-medium mb-1">💡 TipTap Pro Editor:</p>
        <ul className="space-y-1 ml-4">
          <li>• <strong>Type freely</strong> - ALL content saves! No truncation!</li>
          <li>• <strong>Images:</strong> Click 📷 to upload or 🖼️ URL for links
            <ul className="ml-4 mt-1">
              <li>- Click an image then use ← or → to float it left/right (perfect for vertical images!)</li>
              <li>- Use ⊟ to center the image again</li>
              <li>- Text will wrap around floated images automatically</li>
            </ul>
          </li>
          <li>• <strong>Videos:</strong> Click ▶️ Video and paste:
            <ul className="ml-4 mt-1">
              <li>- YouTube videos (embeds at 1280×720 px)</li>
              <li>- YouTube Shorts (youtube.com/shorts/...)</li>
              <li>- Instagram Reels (instagram.com/reel/...)</li>
            </ul>
          </li>
          <li className="text-amber-600">⚠️ <strong>Note:</strong> Only public videos/reels with embedding enabled will play</li>
          <li>• <strong>Format:</strong> Use toolbar buttons or Ctrl+B (bold), Ctrl+I (italic)</li>
        </ul>
      </div>

      {/* TipTap Styles - Mobile Optimized */}
      <style jsx global>{`
        .ProseMirror {
          min-height: 200px;
          font-size: 16px;
          line-height: 1.6;
          color: #374151 !important;
          background-color: white !important;
          padding: 1rem;
        }
        .dark .ProseMirror {
          color: #F9FAFB !important;
          background-color: #1F2937 !important;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9CA3AF;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .dark .ProseMirror p.is-editor-empty:first-child::before {
          color: #6B7280;
        }
        @media (min-width: 640px) {
          .ProseMirror {
            min-height: 400px;
            font-size: 14px;
            line-height: 1.75;
          }
        }
        .ProseMirror:focus {
          outline: 2px solid #3B82F6;
          outline-offset: -2px;
        }
        .ProseMirror p {
          margin: 0.75rem 0;
          line-height: 1.6;
        }
        @media (min-width: 640px) {
          .ProseMirror p {
            line-height: 1.75;
          }
        }
        .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1rem 0 0.75rem;
        }
        @media (min-width: 640px) {
          .ProseMirror h1 {
            font-size: 2rem;
            margin: 1.5rem 0 1rem;
          }
        }
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem;
        }
        @media (min-width: 640px) {
          .ProseMirror h2 {
            font-size: 1.5rem;
            margin: 1.25rem 0 0.75rem;
          }
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.75rem 0;
          list-style-position: outside;
        }
        @media (min-width: 640px) {
          .ProseMirror ul, .ProseMirror ol {
            padding-left: 2rem;
          }
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror li {
          margin: 0.5rem 0;
          display: list-item;
          color: inherit;
        }
        .dark .ProseMirror li {
          color: #F9FAFB;
        }
        .ProseMirror img,
        .ProseMirror .editor-image,
        img.editor-image {
          display: block !important;
          max-width: 100% !important;
          height: auto !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
          margin: 1rem auto !important;
          opacity: 1 !important;
          visibility: visible !important;
          background-color: transparent !important;
          border: 2px solid #e5e7eb !important;
          padding: 4px !important;
        }

        /* Floated images for text wrapping */
        .ProseMirror img.float-left,
        .ProseMirror img[style*="float: left"] {
          float: left !important;
          display: inline !important;
          margin: 0.5rem 1.5rem 1rem 0 !important;
          max-width: 350px !important;
        }

        .ProseMirror img.float-right,
        .ProseMirror img[style*="float: right"] {
          float: right !important;
          display: inline !important;
          margin: 0.5rem 0 1rem 1.5rem !important;
          max-width: 350px !important;
        }

        /* Mobile: disable float for better readability */
        @media (max-width: 767px) {
          .ProseMirror img.float-left,
          .ProseMirror img.float-right,
          .ProseMirror img[style*="float"] {
            float: none !important;
            display: block !important;
            margin: 1rem auto !important;
            max-width: 100% !important;
          }
        }
        .ProseMirror a {
          color: #3B82F6;
          text-decoration: underline;
          cursor: pointer;
        }
        .ProseMirror iframe {
          width: 100% !important;
          max-width: 1280px !important;
          height: auto !important;
          aspect-ratio: 16 / 9 !important;
          border-radius: 0.75rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          margin: 1.5rem auto;
          display: block;
        }
        /* Instagram Reels - iframe embed - RESPONSIVE */
        .ProseMirror iframe[data-instagram-reel] {
          margin: 1rem auto !important;
          max-width: 540px !important;
          width: 100% !important;
          height: 960px !important;
          border: none !important;
          display: block !important;
        }

        /* Mobile - full width */
        @media (max-width: 639px) {
          .ProseMirror iframe[data-instagram-reel] {
            max-width: 100% !important;
            height: 700px !important;
          }
        }

        /* Tablet - limit width to 400px */
        @media (min-width: 640px) and (max-width: 1023px) {
          .ProseMirror iframe[data-instagram-reel] {
            max-width: 400px !important;
            height: 800px !important;
          }
        }

        /* Desktop - full Instagram Reel size (540px) */
        @media (min-width: 1024px) {
          .ProseMirror iframe[data-instagram-reel] {
            max-width: 540px !important;
            height: 960px !important;
          }
        }
        .dark .ProseMirror {
          color: #F9FAFB;
        }
      `}</style>
    </div>
  )
}
