export interface Theme {
  id: string
  name: string
  vars: Record<string, string>
}

export interface Font {
  id: string
  name: string
  family: string
  googleName: string
  category: 'sans' | 'serif' | 'mono'
}

export interface AppSettings {
  themeId: string
  fontId: string
  editorFontSize: 'sm' | 'md' | 'lg'
  editorLineWidth: 'narrow' | 'normal' | 'wide'
}

export const THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    vars: {
      '--color-bg': '#fafaf8',
      '--color-bg-hover': '#f0f0ee',
      '--color-bg-elevated': '#ffffff',
      '--color-text': '#1a1a1a',
      '--color-text-muted': '#737373',
      '--color-text-subtle': '#999999',
      '--color-border': '#e8e8e6',
      '--color-shadow': 'rgba(0,0,0,0.1)',
      '--color-active': '#e8e8e6',
      '--color-active-text': '#737373',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    vars: {
      '--color-bg': '#1a1a1a',
      '--color-bg-hover': '#313131',
      '--color-bg-elevated': '#222222',
      '--color-text': '#e0e0e0',
      '--color-text-muted': '#b0b0b0',
      '--color-text-subtle': '#888888',
      '--color-border': '#2e2e2e',
      '--color-shadow': 'rgba(0,0,0,0.3)',
      '--color-active': '#3a3a3a',
      '--color-active-text': '#d0d0d0',
    },
  },
  {
    id: 'sepia',
    name: 'Sepia',
    vars: {
      '--color-bg': '#f4f0e8',
      '--color-bg-hover': '#ece7dc',
      '--color-bg-elevated': '#faf7f2',
      '--color-text': '#2c1810',
      '--color-text-muted': '#7a5c48',
      '--color-text-subtle': '#9a7c68',
      '--color-border': '#ddd5c8',
      '--color-shadow': 'rgba(44,24,16,0.1)',
      '--color-active': '#ddd5c8',
      '--color-active-text': '#5c3c28',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    vars: {
      '--color-bg': '#0f1a12',
      '--color-bg-hover': '#263c2a',
      '--color-bg-elevated': '#162219',
      '--color-text': '#c8d8c4',
      '--color-text-muted': '#88a884',
      '--color-text-subtle': '#687a64',
      '--color-border': '#1e2e22',
      '--color-shadow': 'rgba(0,0,0,0.3)',
      '--color-active': '#223028',
      '--color-active-text': '#a8c8a4',
    },
  },
  {
    id: 'dusk',
    name: 'Dusk',
    vars: {
      '--color-bg': '#1a1525',
      '--color-bg-hover': '#2d2447',
      '--color-bg-elevated': '#1f1a2d',
      '--color-text': '#d4cce8',
      '--color-text-muted': '#9088b8',
      '--color-text-subtle': '#726898',
      '--color-border': '#2a2240',
      '--color-shadow': 'rgba(0,0,0,0.3)',
      '--color-active': '#302848',
      '--color-active-text': '#b8aed8',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    vars: {
      '--color-bg': '#2e3440',
      '--color-bg-hover': '#454e62',
      '--color-bg-elevated': '#353c4a',
      '--color-text': '#d8dee9',
      '--color-text-muted': '#8892a4',
      '--color-text-subtle': '#6a7484',
      '--color-border': '#404858',
      '--color-shadow': 'rgba(0,0,0,0.3)',
      '--color-active': '#434c5e',
      '--color-active-text': '#c8d4e4',
    },
  },
  {
    id: 'graphite',
    name: 'Graphite',
    vars: {
      '--color-bg': '#1c1c1e',
      '--color-bg-hover': '#363638',
      '--color-bg-elevated': '#242426',
      '--color-text': '#ebebf5',
      '--color-text-muted': '#aeaeb2',
      '--color-text-subtle': '#8e8e93',
      '--color-border': '#38383a',
      '--color-shadow': 'rgba(0,0,0,0.4)',
      '--color-active': '#3a3a3c',
      '--color-active-text': '#d0d0d8',
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    vars: {
      '--color-bg': '#fdf6f4',
      '--color-bg-hover': '#f5ebe8',
      '--color-bg-elevated': '#ffffff',
      '--color-text': '#3c1c1c',
      '--color-text-muted': '#8c5c5c',
      '--color-text-subtle': '#b08080',
      '--color-border': '#e8d4d0',
      '--color-shadow': 'rgba(60,28,28,0.1)',
      '--color-active': '#e8d4d0',
      '--color-active-text': '#6c3c3c',
    },
  },
]

export const FONTS: Font[] = [
  // Sans-serif
  { id: 'space-grotesk', name: 'Space Grotesk', family: "'Space Grotesk', sans-serif", googleName: 'Space+Grotesk:wght@300;400;500;600;700', category: 'sans' },
  { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", googleName: 'Inter:wght@300;400;500;600', category: 'sans' },
  { id: 'dm-sans', name: 'DM Sans', family: "'DM Sans', sans-serif", googleName: 'DM+Sans:wght@300;400;500;600', category: 'sans' },
  { id: 'outfit', name: 'Outfit', family: "'Outfit', sans-serif", googleName: 'Outfit:wght@300;400;500;600', category: 'sans' },
  { id: 'plus-jakarta', name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif", googleName: 'Plus+Jakarta+Sans:wght@300;400;500;600', category: 'sans' },
  { id: 'nunito', name: 'Nunito', family: "'Nunito', sans-serif", googleName: 'Nunito:wght@300;400;500;600', category: 'sans' },
  { id: 'sora', name: 'Sora', family: "'Sora', sans-serif", googleName: 'Sora:wght@300;400;500;600', category: 'sans' },
  // Serif
  { id: 'lora', name: 'Lora', family: "'Lora', serif", googleName: 'Lora:ital,wght@0,400;0,600;1,400', category: 'serif' },
  { id: 'merriweather', name: 'Merriweather', family: "'Merriweather', serif", googleName: 'Merriweather:ital,wght@0,300;0,400;1,300', category: 'serif' },
  { id: 'playfair', name: 'Playfair Display', family: "'Playfair Display', serif", googleName: 'Playfair+Display:ital,wght@0,400;0,600;1,400', category: 'serif' },
  { id: 'eb-garamond', name: 'EB Garamond', family: "'EB Garamond', serif", googleName: 'EB+Garamond:ital,wght@0,400;0,500;1,400', category: 'serif' },
  { id: 'crimson-pro', name: 'Crimson Pro', family: "'Crimson Pro', serif", googleName: 'Crimson+Pro:ital,wght@0,400;0,600;1,400', category: 'serif' },
  { id: 'cormorant', name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", googleName: 'Cormorant+Garamond:ital,wght@0,400;0,500;1,400', category: 'serif' },
  { id: 'fraunces', name: 'Fraunces', family: "'Fraunces', serif", googleName: 'Fraunces:ital,wght@0,300;0,400;1,300', category: 'serif' },
  { id: 'spectral', name: 'Spectral', family: "'Spectral', serif", googleName: 'Spectral:ital,wght@0,300;0,400;1,300', category: 'serif' },
  // Monospace
  { id: 'jetbrains-mono', name: 'JetBrains Mono', family: "'JetBrains Mono', monospace", googleName: 'JetBrains+Mono:wght@300;400;500', category: 'mono' },
  { id: 'fira-code', name: 'Fira Code', family: "'Fira Code', monospace", googleName: 'Fira+Code:wght@300;400;500', category: 'mono' },
  { id: 'ibm-plex-mono', name: 'IBM Plex Mono', family: "'IBM Plex Mono', monospace", googleName: 'IBM+Plex+Mono:ital,wght@0,300;0,400;1,300', category: 'mono' },
  { id: 'inconsolata', name: 'Inconsolata', family: "'Inconsolata', monospace", googleName: 'Inconsolata:wght@300;400;500', category: 'mono' },
]

export const FONT_SIZES: Record<'sm' | 'md' | 'lg', string> = {
  sm: '13px',
  md: '15px',
  lg: '17px',
}

export const LINE_WIDTHS: Record<'narrow' | 'normal' | 'wide', string> = {
  narrow: '560px',
  normal: '680px',
  wide: '820px',
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeId: 'light',
  fontId: 'space-grotesk',
  editorFontSize: 'md',
  editorLineWidth: 'normal',
}

export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem('app-settings')
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    }
  } catch { /* ignore */ }

  // Migrate from old single-theme key
  const oldTheme = localStorage.getItem('theme')
  if (oldTheme === 'dark') {
    return { ...DEFAULT_SETTINGS, themeId: 'dark' }
  }

  // System preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return { ...DEFAULT_SETTINGS, themeId: 'dark' }
  }

  return DEFAULT_SETTINGS
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem('app-settings', JSON.stringify(settings))
}
