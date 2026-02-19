import { useState, useEffect } from 'react'
import { AppView } from './lib/types'
import { SettingsProvider } from './lib/SettingsProvider'
import { Editor } from './components/Editor'
import { Home } from './components/Home'
import { Settings } from './components/Settings'
import './App.css'

function App() {
  const [nav, setNav] = useState<AppView>({ view: 'home' })

  // Global keyboard shortcuts (not active inside the editor to avoid conflicts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (nav.view === 'editor') return
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const meta = isMac ? e.metaKey : e.ctrlKey

      // Cmd+, → Settings
      if (meta && e.key === ',') {
        e.preventDefault()
        setNav({ view: 'settings' })
      }
      // Cmd+A → Archive (only from home, to avoid conflicts)
      if (meta && e.key === 'a' && nav.view === 'home') {
        e.preventDefault()
        setNav({ view: 'archive' })
      }
      // Cmd+N → New note (only from home)
      if (meta && e.key === 'n' && nav.view === 'home') {
        e.preventDefault()
        setNav({ view: 'editor', pieceId: null, returnTo: 'home' })
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [nav.view])

  return (
    <SettingsProvider>
      <div key={nav.view} className="view-fade">
        {nav.view === 'home' && (
          <Home
            onSelectPiece={(id) => setNav({ view: 'editor', pieceId: id, returnTo: 'home' })}
            onNewPiece={() => setNav({ view: 'editor', pieceId: null, returnTo: 'home' })}
            onViewArchive={() => setNav({ view: 'archive' })}
            onViewSettings={() => setNav({ view: 'settings' })}
            showArchived={false}
          />
        )}
        {nav.view === 'archive' && (
          <Home
            onSelectPiece={(id) => setNav({ view: 'editor', pieceId: id, returnTo: 'archive' })}
            onNewPiece={() => setNav({ view: 'editor', pieceId: null, returnTo: 'archive' })}
            onViewArchive={() => setNav({ view: 'home' })}
            showArchived={true}
          />
        )}
        {nav.view === 'settings' && (
          <Settings onBack={() => setNav({ view: 'home' })} />
        )}
        {nav.view === 'editor' && (
          <Editor
            pieceId={nav.pieceId}
            onBack={() => setNav({ view: nav.returnTo || 'home' })}
          />
        )}
      </div>
    </SettingsProvider>
  )
}

export default App
