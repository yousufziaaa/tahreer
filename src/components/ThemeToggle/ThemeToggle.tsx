import { useTheme } from '../../lib/theme'
import './ThemeToggle.css'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        // Moon icon for dark mode
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.293 13.293C16.378 13.737 15.35 14 14.25 14C10.798 14 8 11.202 8 7.75C8 6.65 8.263 5.622 8.707 4.707C5.88 5.432 4 7.98 4 11C4 14.866 7.134 18 11 18C14.02 18 16.568 16.12 17.293 13.293Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      ) : (
        // Sun icon for light mode
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="10"
            cy="10"
            r="3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M10 2V4M10 16V18M18 10H16M4 10H2M16.364 3.636L14.95 5.05M5.05 14.95L3.636 16.364M16.364 16.364L14.95 14.95M5.05 5.05L3.636 3.636"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  )
}
