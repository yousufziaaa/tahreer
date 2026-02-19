import { useEffect, useState, useRef } from 'react'
import {
  listPieces,
  deletePiece,
  archivePiece,
  unarchivePiece,
  loadGroups,
  createGroup,
  updatePieceGroup,
} from '../../lib/storage'
import { PieceMeta, Group } from '../../lib/types'
import './Home.css'

const PRESET_COLORS = [
  '#6B8F6A',
  '#7A6B8F',
  '#8F6B6B',
  '#6B7A8F',
  '#8F7E6B',
  '#6B8F87',
]

interface HomeProps {
  onSelectPiece: (id: string) => void
  onNewPiece: () => void
  onViewArchive?: () => void
  onViewSettings?: () => void
  showArchived?: boolean
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function Home({
  onSelectPiece,
  onNewPiece,
  onViewArchive,
  onViewSettings,
  showArchived = false,
}: HomeProps) {
  const [pieces, setPieces] = useState<PieceMeta[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    pieceId: string
  } | null>(null)

  // Group dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [newGroupMode, setNewGroupMode] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const contextMenuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const newGroupInputRef = useRef<HTMLInputElement>(null)

  const refreshPieces = () => {
    listPieces(showArchived)
      .then(setPieces)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refreshPieces()
    if (!showArchived) loadGroups().then(setGroups)
  }, [showArchived])

  // Close context menu on outside click / Escape
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
      if (event.key === 'Escape') setContextMenu(null)
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

  // Close group dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
        setNewGroupMode(false)
        setNewGroupName('')
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  // Focus new-group input when it appears
  useEffect(() => {
    if (newGroupMode && newGroupInputRef.current) {
      newGroupInputRef.current.focus()
    }
  }, [newGroupMode])

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      setCurrentTime(`${hours}:${minutes}:${seconds}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Cmd+← back from archive
  useEffect(() => {
    if (!showArchived || !onViewArchive) return
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifierPressed = isMac ? e.metaKey : e.ctrlKey
      if (modifierPressed && e.key === 'ArrowLeft') {
        e.preventDefault()
        e.stopPropagation()
        onViewArchive()
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [showArchived, onViewArchive])

  const handleContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    pieceId: string
  ) => {
    event.preventDefault()
    setContextMenu({ x: event.clientX, y: event.clientY, pieceId })
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

  const handleCreateGroup = async () => {
    const trimmed = newGroupName.trim()
    if (!trimmed) return
    const color = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]
    const group = await createGroup(trimmed, color)
    setGroups((prev) => [...prev, group])
    setNewGroupName('')
    setNewGroupMode(false)
    setDropdownOpen(false)
  }

  const handleContextMenuGroupChange = async (groupId: string | null) => {
    if (!contextMenu) return
    try {
      await updatePieceGroup(contextMenu.pieceId, groupId)
      setContextMenu(null)
      refreshPieces()
    } catch (error) {
      console.error('Failed to update piece group:', error)
    }
  }

  const filteredPieces =
    !showArchived && selectedGroupId
      ? pieces.filter((p) => p.groupId === selectedGroupId)
      : pieces

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null

  return (
    <div className="home-page">
      {/* Group filter dropdown (home only) */}
      {!showArchived && (
        <div className="group-dropdown-wrapper" ref={dropdownRef}>
          <button
            className="group-trigger"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            {selectedGroup ? (
              <span
                className="group-dot-sm"
                style={{ backgroundColor: selectedGroup.color }}
              />
            ) : (
              <span className="group-dot-sm group-dot-all" />
            )}
            <span className="group-trigger-name">
              {selectedGroup?.name ?? 'All'}
            </span>
            <svg
              className={`group-chevron${dropdownOpen ? ' open' : ''}`}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="group-dropdown">
              {/* All */}
              <button
                className={`group-dropdown-item${selectedGroupId === null ? ' is-active' : ''}`}
                onClick={() => {
                  setSelectedGroupId(null)
                  setDropdownOpen(false)
                  setNewGroupMode(false)
                }}
              >
                <span className="group-dot-sm group-dot-all" />
                <span className="group-dropdown-item-name">All</span>
                {selectedGroupId === null && (
                  <span className="group-check">✓</span>
                )}
              </button>

              {groups.map((group) => (
                <button
                  key={group.id}
                  className={`group-dropdown-item${selectedGroupId === group.id ? ' is-active' : ''}`}
                  onClick={() => {
                    setSelectedGroupId(group.id)
                    setDropdownOpen(false)
                    setNewGroupMode(false)
                  }}
                >
                  <span
                    className="group-dot-sm"
                    style={{ backgroundColor: group.color }}
                  />
                  <span className="group-dropdown-item-name">{group.name}</span>
                  {selectedGroupId === group.id && (
                    <span className="group-check">✓</span>
                  )}
                </button>
              ))}

              <div className="group-dropdown-divider" />

              {!newGroupMode ? (
                <button
                  className="group-dropdown-item group-new-trigger"
                  onClick={() => setNewGroupMode(true)}
                >
                  <span className="group-new-label">+ New Group</span>
                </button>
              ) : (
                <div className="group-new-form">
                  <input
                    ref={newGroupInputRef}
                    className="group-new-input"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateGroup()
                      if (e.key === 'Escape') {
                        setNewGroupMode(false)
                        setNewGroupName('')
                      }
                    }}
                    placeholder="Group name…"
                  />
                  <div className="group-new-actions">
                    <button
                      className="group-new-cancel"
                      onClick={() => {
                        setNewGroupMode(false)
                        setNewGroupName('')
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="group-new-confirm"
                      onClick={handleCreateGroup}
                      disabled={!newGroupName.trim()}
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="home-container">
        {/* Header */}
        <div className="home-header">
          {showArchived ? (
            <div className="home-header-left">
              <button
                onClick={onViewArchive}
                className="home-back-button"
                title="Back"
              >
                ←
              </button>
              <h1 className="home-title">Archive</h1>
            </div>
          ) : (
            <h1 className="home-title home-title-arabic">تحرير</h1>
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
        ) : filteredPieces.length === 0 ? (
          <p className="home-empty">
            {selectedGroupId
              ? 'No pieces in this group.'
              : 'No pieces yet. Start writing.'}
          </p>
        ) : (
          <ul className="home-pieces-list">
            {filteredPieces.map((piece) => {
              const group = groups.find((g) => g.id === piece.groupId)
              return (
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
                      {group && (
                        <span
                          className="piece-group-dot"
                          style={{ backgroundColor: group.color }}
                        />
                      )}
                      {formatDate(piece.updatedAt)} • {piece.wordCount} words
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer links */}
      {showArchived ? (
        <div className="home-counter">
          {pieces.length}{' '}
          {pieces.length === 1 ? 'archived piece' : 'archived pieces'}
        </div>
      ) : (
        <div className="home-footer-links">
          <button
            className="home-counter home-counter-link"
            onClick={onViewArchive}
          >
            Archive
          </button>
          <button
            className="home-counter home-counter-link"
            onClick={onViewSettings}
          >
            Settings
          </button>
        </div>
      )}

      {/* Clock */}
      <div className="home-clock">{currentTime}</div>

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
          {!showArchived && groups.length > 0 && (() => {
            const pieceGroupId = pieces.find((p) => p.id === contextMenu!.pieceId)?.groupId ?? null
            return (
              <>
                <div className="home-context-menu-group-label">Group</div>
                <button
                  className="home-context-menu-item"
                  onClick={() => handleContextMenuGroupChange(null)}
                >
                  <span className="group-dot-sm group-dot-none" />
                  <span className="group-dropdown-item-name">No group</span>
                  {pieceGroupId === null && <span className="group-check">✓</span>}
                </button>
                {groups.map((g) => (
                  <button
                    key={g.id}
                    className="home-context-menu-item"
                    onClick={() => handleContextMenuGroupChange(g.id)}
                  >
                    <span className="group-dot-sm" style={{ backgroundColor: g.color }} />
                    <span className="group-dropdown-item-name">{g.name}</span>
                    {pieceGroupId === g.id && <span className="group-check">✓</span>}
                  </button>
                ))}
                <div className="home-context-menu-divider" />
              </>
            )
          })()}

          {showArchived ? (
            <button className="home-context-menu-item" onClick={handleUnarchive}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.667 3.333h10.666L13.333 5.333v8a1.333 1.333 0 0 1-1.333 1.334H4a1.333 1.333 0 0 1-1.333-1.334V5.333L2.667 3.333ZM2.667 3.333 4 1.333h8l1.333 2M6.667 8h2.666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Unarchive</span>
            </button>
          ) : (
            <button className="home-context-menu-item" onClick={handleArchive}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.667 3.333h10.666L13.333 5.333v8a1.333 1.333 0 0 1-1.333 1.334H4a1.333 1.333 0 0 1-1.333-1.334V5.333L2.667 3.333ZM2.667 3.333 4 1.333h8l1.333 2M6.667 8h2.666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
