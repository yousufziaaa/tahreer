import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react'
import {
  AppSettings,
  THEMES,
  FONTS,
  FONT_SIZES,
  LINE_WIDTHS,
  loadSettings,
  saveSettings,
} from './settings'

interface SettingsContextType {
  settings: AppSettings
  updateSettings: (updates: Partial<AppSettings>) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

function applySettings(settings: AppSettings) {
  const theme = THEMES.find((t) => t.id === settings.themeId) ?? THEMES[0]
  const font = FONTS.find((f) => f.id === settings.fontId) ?? FONTS[0]
  const root = document.documentElement

  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value)
  }

  root.style.setProperty('--font-ui', font.family)
  root.style.setProperty('--editor-font-size', FONT_SIZES[settings.editorFontSize])
  root.style.setProperty('--editor-max-width', LINE_WIDTHS[settings.editorLineWidth])

  // Load the selected Google Font dynamically
  const linkId = 'gf-dynamic'
  let link = document.getElementById(linkId) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  link.href = `https://fonts.googleapis.com/css2?family=${font.googleName}&display=swap`
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  // Apply CSS variables whenever settings change
  useEffect(() => {
    applySettings(settings)
  }, [settings])

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates }
      saveSettings(next)
      return next
    })
  }, [])

  // Keyboard shortcut: Cmd/Ctrl + Option/Alt + T to toggle light ↔ dark
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifierPressed = isMac ? e.metaKey : e.ctrlKey
      if (modifierPressed && e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault()
        e.stopPropagation()
        const current = settingsRef.current.themeId
        updateSettings({ themeId: current === 'dark' ? 'light' : 'dark' })
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [updateSettings])

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsProvider')
  return context
}
