'use client'

interface LoadingSpinnerProps {
  size?:  'sm' | 'md' | 'lg'
  color?: string
  label?: string
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
}

/**
 * Accessible animated loading spinner.
 * Announces loading state to screen readers via aria-label.
 */
export function LoadingSpinner({
  size  = 'md',
  color = 'text-[#0176D3]',
  label = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block ${sizeMap[size]} ${color} animate-spin`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-25"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-75"
        />
      </svg>
    </span>
  )
}
