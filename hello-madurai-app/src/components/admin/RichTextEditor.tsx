'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon,
  PhotoIcon,
  LinkIcon,
  ListBulletIcon,
  NumberedListIcon,
  LanguageIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import { useTranslate } from '@/hooks/useTranslate'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  label?: string
  showTranslate?: boolean
  targetLanguage?: 'en' | 'ta'
  onTranslate?: (translatedText: string, targetLang: 'en' | 'ta') => void
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  className = '',
  label,
  showTranslate = false,
  targetLanguage = 'ta',
  onTranslate
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [uploading, setUploading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { translate, loading: translating } = useTranslate()
  const [isTranslating, setIsTranslating] = useState(false)

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || ''
      setIsInitialized(true)
    }
  }, [value, isInitialized])

  const executeCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      document.execCommand(command, false, value)
      updateContent()
    }
  }

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'image')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        insertImage(data.url)
        toast.success('Image uploaded successfully!')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to upload image.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image.')
    } finally {
      setUploading(false)
    }
  }

  const insertImage = (url: string) => {
    const img = `<img src="${url}" alt="Uploaded image" style="max-width: 800px; width: 100%; height: auto; margin: 16px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />`
    executeCommand('insertHTML', img)
  }

  const handleImageButtonClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleImageUpload(file)
      }
    }
    input.click()
  }

  const handleLinkClick = () => {
    const url = prompt('Enter URL:')
    if (url) {
      executeCommand('createLink', url)
    }
  }

  const handleTranslate = async () => {
    if (!editorRef.current || !value.trim()) {
      toast.error('No content to translate')
      return
    }

    setIsTranslating(true)
    try {
      // Extract text from HTML content
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = value
      const textContent = tempDiv.textContent || tempDiv.innerText || ''
      
      if (!textContent.trim()) {
        toast.error('No text content found to translate')
        return
      }

      const sourceLanguage = targetLanguage === 'ta' ? 'en' : 'ta'
      
      console.log('Translation Debug:', {
        textContent: textContent.substring(0, 100) + '...',
        targetLanguage,
        sourceLanguage
      })

      const translated = await translate({
        text: textContent,
        targetLanguage: targetLanguage,
        sourceLanguage: sourceLanguage
      })

      console.log('Translation Result:', {
        original: textContent.substring(0, 100) + '...',
        translated: translated.substring(0, 100) + '...',
        targetLanguage
      })

      // Use callback to populate target field, or fallback to current field
      if (onTranslate) {
        onTranslate(translated, targetLanguage)
        toast.success(`Translated to ${targetLanguage === 'ta' ? 'Tamil' : 'English'}! Check the ${targetLanguage === 'ta' ? 'Tamil' : 'English'} field.`)
      } else {
        // Fallback: replace current field content
        if (editorRef.current) {
          editorRef.current.innerHTML = `<p>${translated}</p>`
          onChange(editorRef.current.innerHTML)
          toast.success(`Translated to ${targetLanguage === 'ta' ? 'Tamil' : 'English'}!`)
        }
      }
    } catch (error) {
      console.error('Translation error:', error)
      toast.error('Translation failed. Please try again.')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          executeCommand('bold')
          break
        case 'i':
          e.preventDefault()
          executeCommand('italic')
          break
        case 'u':
          e.preventDefault()
          executeCommand('underline')
          break
      }
    }
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    onChange(target.innerHTML)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    executeCommand('insertText', text)
  }

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('bold')}
          className="p-2"
          title="Bold (Ctrl+B)"
        >
          <BoldIcon className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('italic')}
          className="p-2"
          title="Italic (Ctrl+I)"
        >
          <ItalicIcon className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('underline')}
          className="p-2"
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (editorRef.current) {
              editorRef.current.focus()
              document.execCommand('insertUnorderedList', false)
              updateContent()
            }
          }}
          className="p-2"
          title="Bullet List"
        >
          <ListBulletIcon className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (editorRef.current) {
              editorRef.current.focus()
              document.execCommand('insertOrderedList', false)
              updateContent()
            }
          }}
          className="p-2"
          title="Numbered List"
        >
          <NumberedListIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLinkClick}
          className="p-2"
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImageButtonClick}
          disabled={uploading}
          className="p-2"
          title="Insert Image (Recommended: 800×450px, under 150KB, WebP/JPEG)"
        >
          <PhotoIcon className="h-4 w-4" />
          {uploading && <span className="ml-1 text-xs">...</span>}
        </Button>

        {showTranslate && (
          <>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleTranslate}
              disabled={isTranslating || !value || !value.trim()}
              className="p-2 text-xs"
              title={`Translate to ${targetLanguage === 'ta' ? 'Tamil' : 'English'}`}
            >
              <LanguageIcon className="h-4 w-4" />
              {isTranslating ? '...' : `→${targetLanguage === 'ta' ? 'த' : 'EN'}`}
            </Button>
          </>
        )}

        <select
          onChange={(e) => executeCommand('formatBlock', e.target.value)}
          className="ml-2 text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          defaultValue=""
        >
          <option value="">Format</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Paragraph</option>
        </select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className="min-h-[200px] p-4 focus:outline-none text-gray-900 dark:text-white bg-white dark:bg-purple-900"
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          lineHeight: '1.6'
        }}
        placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(placeholder);
          color: #9ca3af;
          pointer-events: none;
          font-style: italic;
        }
        [contenteditable] img {
          max-width: 800px;
          width: 100%;
          height: auto;
          margin: 16px 0;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: block;
        }
        [contenteditable] h1 {
          font-size: 1.875rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.875rem 0;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        [contenteditable] li {
          margin: 0.5rem 0;
        }
        [contenteditable] p {
          margin: 0.5rem 0;
        }
        [contenteditable] a {
          color: #8b5cf6;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}