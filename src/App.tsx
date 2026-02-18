import { useState } from 'react'
import { AppView } from './lib/types'
import { Editor } from './components/Editor'
import { Home } from './components/Home'
import { ThemeProvider } from './lib/theme'
import { ThemeToggle } from './components/ThemeToggle'
import { BackButton } from './components/BackButton'
import './App.css'

function App() {
  const [nav, setNav] = useState<AppView>({ view: 'home' })

  return (
    <ThemeProvider>
      <ThemeToggle />
      {nav.view === 'archive' && (
        <BackButton onClick={() => setNav({ view: 'home' })} />
      )}
      <div key={nav.view} className="view-fade">
        {nav.view === 'home' && (
          <Home
            onSelectPiece={(id) => setNav({ view: 'editor', pieceId: id, returnTo: 'home' })}
            onNewPiece={() => setNav({ view: 'editor', pieceId: null, returnTo: 'home' })}
            onViewArchive={() => setNav({ view: 'archive' })}
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
        {nav.view === 'editor' && (
          <Editor
            pieceId={nav.pieceId}
            onBack={() => setNav({ view: nav.returnTo || 'home' })}
          />
        )}
      </div>
    </ThemeProvider>
  )
}

export default App
