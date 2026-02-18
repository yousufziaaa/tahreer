import { useRef, useState, useEffect } from 'react'
import { useEditor, EditorContent, JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Typography from '@tiptap/extension-typography'
import { loadPiece, savePiece } from '../../lib/storage'
import { Piece } from '../../lib/types'
import './Editor.css'

interface EditorProps {
  pieceId: string | null
  onBack: () => void
}

export function Editor({ pieceId, onBack }: EditorProps) {
  const idRef = useRef<string>(pieceId ?? crypto.randomUUID())
  const createdAtRef = useRef<string>(new Date().toISOString())
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLoadingRef = useRef<boolean>(false)
  const [title, setTitle] = useState<string>('Untitled...')
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [currentTime, setCurrentTime] = useState<string>('')
  const titleInputRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<string>('Untitled...')

  // Keep titleRef in sync with title state
  useEffect(() => {
    titleRef.current = title
  }, [title])

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      setCurrentTime(`${hours}:${minutes}:${seconds}`)
    }

    updateTime() // Set initial time
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  // Keyboard shortcut: Cmd/Ctrl + Left Arrow to go back to homepage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux) + Left Arrow
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifierPressed = isMac ? e.metaKey : e.ctrlKey
      
      if (modifierPressed && e.key === 'ArrowLeft') {
        e.preventDefault()
        e.stopPropagation()
        onBack()
      }
    }

    // Use capture phase to catch events before they're handled by other components
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [onBack])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Typography,
    ],
    autofocus: 'end',
    editorProps: {
      attributes: { 
        class: 'tiptap-editor',
        spellcheck: 'true',
        lang: 'en',
      },
    },
    onCreate({ editor }) {
      if (pieceId) {
        isLoadingRef.current = true
        loadPiece(pieceId).then((piece) => {
          createdAtRef.current = piece.createdAt
          const loadedTitle = piece.title || 'Untitled...'
          setTitle(loadedTitle)
          titleRef.current = loadedTitle
          editor.commands.setContent(piece.content)
          const text = editor.getText()
          setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
          setCharCount(text.length)
          // Allow saves after content is loaded
          setTimeout(() => {
            isLoadingRef.current = false
          }, 100)
        })
      } else {
        isLoadingRef.current = false
      }
    },
    onUpdate({ editor }) {
      // Don't save during initial load
      if (isLoadingRef.current) {
        return
      }

      const text = editor.getText()
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      setWordCount(words)
      setCharCount(text.length)

      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        const content = editor.getJSON()
        const piece: Piece = {
          id: idRef.current,
          title: titleRef.current || 'Untitled',
          content,
          createdAt: createdAtRef.current,
          updatedAt: new Date().toISOString(),
          wordCount: words,
        }
        savePiece(piece)
      }, 800)
    },
    onDestroy() {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current)
    },
  })

  const handleTitleChange = (newTitle: string) => {
    const trimmedTitle = newTitle.trim()
    const finalTitle = trimmedTitle || 'Untitled...'
    setTitle(finalTitle)
    titleRef.current = finalTitle
    
    if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current)
    titleSaveTimer.current = setTimeout(() => {
      if (editor) {
        const text = editor.getText()
        const words = text.trim() ? text.trim().split(/\s+/).length : 0
        const content = editor.getJSON()
        const piece: Piece = {
          id: idRef.current,
          title: trimmedTitle || 'Untitled',
          content,
          createdAt: createdAtRef.current,
          updatedAt: new Date().toISOString(),
          wordCount: words,
        }
        savePiece(piece)
      }
    }, 800)
  }

  // Sync title with contentEditable element when title changes externally (e.g., loading a piece)
  useEffect(() => {
    if (titleInputRef.current && !titleInputRef.current.matches(':focus')) {
      if (title === 'Untitled...') {
        titleInputRef.current.textContent = ''
      } else {
        titleInputRef.current.textContent = title
      }
    }
  }, [title])

  // Ensure spellcheck is enabled on the editor element
  useEffect(() => {
    if (editor) {
      const editorElement = editor.view.dom
      if (editorElement instanceof HTMLElement) {
        // Set attributes for spellcheck
        editorElement.setAttribute('spellcheck', 'true')
        editorElement.setAttribute('lang', 'en')
        editorElement.setAttribute('contenteditable', 'true')
        editorElement.setAttribute('data-spellcheck', 'true')
        
        // Set spellcheck property
        editorElement.spellcheck = true
        
        // Force spellcheck to be enabled (for WebKit/webview)
        editorElement.setAttribute('autocorrect', 'on')
        editorElement.setAttribute('autocapitalize', 'on')
        
        // Ensure the element can receive focus for spellcheck to work
        if (!editorElement.hasAttribute('tabindex')) {
          editorElement.setAttribute('tabindex', '0')
        }
      }
    }
  }, [editor])

  const handleTitleFocus = () => {
    if (titleInputRef.current && title === 'Untitled...') {
      titleInputRef.current.textContent = ''
    }
  }

  const handleTitleBlur = () => {
    if (titleInputRef.current) {
      const text = titleInputRef.current.textContent?.trim() || ''
      const newTitle = text || 'Untitled...'
      setTitle(newTitle)
      titleRef.current = newTitle
      
      // Save immediately on blur
      if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current)
      if (editor) {
        const editorText = editor.getText()
        const words = editorText.trim() ? editorText.trim().split(/\s+/).length : 0
        const content = editor.getJSON()
        const piece: Piece = {
          id: idRef.current,
          title: text || 'Untitled',
          content,
          createdAt: createdAtRef.current,
          updatedAt: new Date().toISOString(),
          wordCount: words,
        }
        savePiece(piece)
      }
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      titleInputRef.current?.blur()
      editor?.commands.focus()
    }
  }

  const promptLink = () => {
    const url = window.prompt('Enter URL')
    if (url) editor?.chain().focus().setLink({ href: url }).run()
  }

  const promptImage = () => {
    const url = window.prompt('Enter image URL')
    if (url) editor?.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className="editor-page">
      {/* Back Button */}
      <button onClick={onBack} className="editor-back-button" title="Back">
        ←
      </button>

      {/* Toolbar */}
      <div className="editor-toolbar">

        <div className="toolbar-center">
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`toolbar-btn${editor?.isActive('heading', { level: 1 }) ? ' is-active' : ''}`}
            title="Heading 1"
          >
            h1
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`toolbar-btn${editor?.isActive('heading', { level: 2 }) ? ' is-active' : ''}`}
            title="Heading 2"
          >
            h2
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`toolbar-btn${editor?.isActive('heading', { level: 3 }) ? ' is-active' : ''}`}
            title="Heading 3"
          >
            h3
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
            className={`toolbar-btn${editor?.isActive('heading', { level: 4 }) ? ' is-active' : ''}`}
            title="Heading 4"
          >
            h4
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`toolbar-btn${editor?.isActive('bold') ? ' is-active' : ''}`}
            title="Bold"
          >
            B
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`toolbar-btn${editor?.isActive('italic') ? ' is-active' : ''}`}
            title="Italic"
          >
            I
          </button>

          <button
            onClick={promptLink}
            className={`toolbar-btn${editor?.isActive('link') ? ' is-active' : ''}`}
            title="Link"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.87988 9.12012C7.44171 9.68195 8.20544 10.0001 9.00388 10.0001C9.80232 10.0001 10.5661 9.68195 11.1279 9.12012L13.1279 7.12012C14.2504 5.99765 14.2504 4.23058 13.1279 3.10812C12.0054 1.98565 10.2384 1.98565 9.11588 3.10812L8.00388 4.22012M9.12012 6.87988C8.55829 6.31805 7.79456 6 6.99612 6C6.19768 6 5.43395 6.31805 4.87212 6.87988L2.87212 8.87988C1.74965 10.0023 1.74965 11.7694 2.87212 12.8919C3.99458 14.0144 5.76165 14.0144 6.88412 12.8919L7.99612 11.7799" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`toolbar-btn${editor?.isActive('bulletList') ? ' is-active' : ''}`}
            title="Bullet List"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="3" cy="4" r="1.5" fill="currentColor"/>
              <circle cx="3" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="3" cy="12" r="1.5" fill="currentColor"/>
              <path d="M6 4H14M6 8H14M6 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Writing canvas */}
      <div className="editor-scroll">
        <div
          ref={titleInputRef}
          contentEditable
          suppressContentEditableWarning
          className="editor-title"
          data-placeholder="Untitled..."
          spellCheck={true}
          onInput={(e) => handleTitleChange(e.currentTarget.textContent || '')}
          onFocus={handleTitleFocus}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
        />
        <EditorContent editor={editor} />
      </div>

      {/* Word / char counter */}
      <div className="editor-counter">
        {wordCount} words • {charCount} characters
      </div>

      {/* Clock */}
      <div className="editor-clock">
        {currentTime}
      </div>
    </div>
  )
}
