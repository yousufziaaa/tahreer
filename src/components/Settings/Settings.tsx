import { useEffect } from 'react'
import { useSettings } from '../../lib/SettingsProvider'
import { THEMES, FONTS, Font } from '../../lib/settings'
import './Settings.css'

interface SettingsProps {
  onBack: () => void
}

const FONT_CATEGORIES: { label: string; key: Font['category'] }[] = [
  { label: 'Sans-serif', key: 'sans' },
  { label: 'Serif', key: 'serif' },
  { label: 'Monospace', key: 'mono' },
]

export function Settings({ onBack }: SettingsProps) {
  const { settings, updateSettings } = useSettings()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifierPressed = isMac ? e.metaKey : e.ctrlKey
      if (modifierPressed && e.key === 'ArrowLeft') {
        e.preventDefault()
        e.stopPropagation()
        onBack()
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [onBack])

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <button onClick={onBack} className="settings-back-button" title="Back">
            ←
          </button>
          <h1 className="settings-title">Settings</h1>
        </div>

        {/* Theme */}
        <section className="settings-section">
          <h2 className="settings-section-title">Theme</h2>
          <div className="settings-themes">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                className={`settings-theme-swatch${settings.themeId === theme.id ? ' is-active' : ''}`}
                onClick={() => updateSettings({ themeId: theme.id })}
                title={theme.name}
                style={{
                  backgroundColor: theme.vars['--color-bg'],
                  borderColor: settings.themeId === theme.id
                    ? theme.vars['--color-text-muted']
                    : theme.vars['--color-border'],
                }}
              >
                <span
                  className="settings-theme-swatch-text"
                  style={{ color: theme.vars['--color-text-muted'] }}
                >
                  Aa
                </span>
                <span
                  className="settings-theme-swatch-name"
                  style={{ color: theme.vars['--color-text-subtle'] }}
                >
                  {theme.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Font */}
        <section className="settings-section">
          <h2 className="settings-section-title">Font</h2>
          {FONT_CATEGORIES.map(({ label, key }) => {
            const fonts = FONTS.filter((f) => f.category === key)
            return (
              <div key={key} className="settings-font-group">
                <p className="settings-font-group-label">{label}</p>
                <div className="settings-font-list">
                  {fonts.map((font) => (
                    <button
                      key={font.id}
                      className={`settings-font-item${settings.fontId === font.id ? ' is-active' : ''}`}
                      onClick={() => updateSettings({ fontId: font.id })}
                      style={{ fontFamily: font.family }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </section>

        {/* Editor */}
        <section className="settings-section">
          <h2 className="settings-section-title">Editor</h2>

          <div className="settings-row">
            <span className="settings-row-label">Font size</span>
            <div className="settings-segmented">
              {(['sm', 'md', 'lg'] as const).map((size) => (
                <button
                  key={size}
                  className={`settings-segment${settings.editorFontSize === size ? ' is-active' : ''}`}
                  onClick={() => updateSettings({ editorFontSize: size })}
                >
                  {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Line width</span>
            <div className="settings-segmented">
              {(['narrow', 'normal', 'wide'] as const).map((width) => (
                <button
                  key={width}
                  className={`settings-segment${settings.editorLineWidth === width ? ' is-active' : ''}`}
                  onClick={() => updateSettings({ editorLineWidth: width })}
                >
                  {width.charAt(0).toUpperCase() + width.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
