import './BackButton.css'

interface BackButtonProps {
  onClick: () => void
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="back-button"
      title="Back to home"
      aria-label="Back to home"
    >
      ←
    </button>
  )
}
