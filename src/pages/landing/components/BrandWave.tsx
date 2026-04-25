interface BrandWaveProps {
  className?: string
  animated?: boolean
}

export function BrandWave({ className = '', animated = true }: BrandWaveProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id="wp-brand-wave"
          x1="0"
          x2="240"
          y1="0"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#5B1F9E" />
          <stop offset="0.5" stopColor="#9B4FDE" />
          <stop offset="1" stopColor="#7B2FBE" />
        </linearGradient>
      </defs>
      <path
        d="M0 8 Q 12 0 24 8 T 48 8 T 72 8 T 96 8 T 120 8 T 144 8 T 168 8 T 192 8 T 216 8 T 240 8"
        stroke="url(#wp-brand-wave)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="8 6"
        className={animated ? 'wp-wave-flow' : ''}
      />
    </svg>
  )
}
