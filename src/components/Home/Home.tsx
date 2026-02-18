import { useEffect, useState, useRef } from 'react'
import { listPieces, deletePiece, archivePiece, unarchivePiece } from '../../lib/storage'
import { PieceMeta } from '../../lib/types'
import './Home.css'

interface HomeProps {
  onSelectPiece: (id: string) => void
  onNewPiece: () => void
  onViewArchive?: () => void
  showArchived?: boolean
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function Home({ onSelectPiece, onNewPiece, onViewArchive, showArchived = false }: HomeProps) {
  const [pieces, setPieces] = useState<PieceMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    pieceId: string
  } | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const refreshPieces = () => {
    listPieces(showArchived)
      .then(setPieces)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refreshPieces()
  }, [showArchived])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu(null)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu(null)
      }
    }

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [contextMenu])

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

  // Keyboard shortcut: Cmd/Ctrl + Left Arrow to go back from archive to homepage
  useEffect(() => {
    if (!showArchived || !onViewArchive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux) + Left Arrow
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifierPressed = isMac ? e.metaKey : e.ctrlKey
      
      if (modifierPressed && e.key === 'ArrowLeft') {
        e.preventDefault()
        e.stopPropagation()
        onViewArchive()
      }
    }

    // Use capture phase to catch events before they're handled by other components
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [showArchived, onViewArchive])

  const handleContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    pieceId: string
  ) => {
    event.preventDefault()
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      pieceId,
    })
  }

  const handleDelete = async () => {
    if (!contextMenu) return

    try {
      await deletePiece(contextMenu.pieceId)
      setContextMenu(null)
      refreshPieces()
    } catch (error) {
      console.error('Failed to delete piece:', error)
    }
  }

  const handleArchive = async () => {
    if (!contextMenu) return

    try {
      await archivePiece(contextMenu.pieceId)
      setContextMenu(null)
      refreshPieces()
    } catch (error) {
      console.error('Failed to archive piece:', error)
    }
  }

  const handleUnarchive = async () => {
    if (!contextMenu) return

    try {
      await unarchivePiece(contextMenu.pieceId)
      setContextMenu(null)
      refreshPieces()
    } catch (error) {
      console.error('Failed to unarchive piece:', error)
    }
  }

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Header */}
        <div className="home-header">
          {showArchived ? (
            <button
              onClick={onViewArchive}
              className="home-title home-title-link"
            >
              Archive
            </button>
          ) : (
            <h1 className="home-title">Tahreer</h1>
          )}
          {!showArchived && (
            <button onClick={onNewPiece} className="home-new-button">
              + New
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <p className="home-loading">Loading…</p>
        ) : pieces.length === 0 ? (
          <p className="home-empty">No pieces yet. Start writing.</p>
        ) : (
          <ul className="home-pieces-list">
            {pieces.map((piece) => (
              <li
                key={piece.id}
                className="home-piece-item"
                onContextMenu={(e) => handleContextMenu(e, piece.id)}
              >
                <button
                  onClick={() => onSelectPiece(piece.id)}
                  className="home-piece-button"
                >
                  <span className="home-piece-title">
                    {piece.title || 'Untitled'}
                  </span>
                  <span className="home-piece-meta">
                    {formatDate(piece.updatedAt)} • {piece.wordCount} words
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Piece count counter / Archive link */}
      {showArchived ? (
        <div className="home-counter">
          {pieces.length} {pieces.length === 1 ? 'archived piece' : 'archived pieces'}
        </div>
      ) : (
        <button
          className="home-counter home-counter-link"
          onClick={onViewArchive}
        >
          Archive
        </button>
      )}

      {/* Clock */}
      <div className="home-clock">
        {currentTime}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="home-context-menu"
          style={{
            position: 'fixed',
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          {showArchived ? (
            <button
              className="home-context-menu-item"
              onClick={handleUnarchive}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.667 3.333h10.666L13.333 5.333v8a1.333 1.333 0 0 1-1.333 1.334H4a1.333 1.333 0 0 1-1.333-1.334V5.333L2.667 3.333ZM2.667 3.333 4 1.333h8l1.333 2M6.667 8h2.666"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Unarchive</span>
            </button>
          ) : (
            <button
              className="home-context-menu-item"
              onClick={handleArchive}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.667 3.333h10.666L13.333 5.333v8a1.333 1.333 0 0 1-1.333 1.334H4a1.333 1.333 0 0 1-1.333-1.334V5.333L2.667 3.333ZM2.667 3.333 4 1.333h8l1.333 2M6.667 8h2.666"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Archive</span>
            </button>
          )}
          <button
            className="home-context-menu-item delete"
            onClick={handleDelete}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334ZM6.667 7.333v4M9.333 7.333v4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  )
}
