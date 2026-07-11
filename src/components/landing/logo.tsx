export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" fill="#14141c" />
      <circle cx="14" cy="14" r="3" fill="#c96b6e" />
      <path
        d="M14 14 Q 32 20 32 34"
        stroke="#f5f3ef"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M50 14 Q 32 20 32 34"
        stroke="#f5f3ef"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      <circle cx="50" cy="14" r="3" fill="#c96b6e" />
      <text
        x="32"
        y="52"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif"
        fontSize="26"
        fontWeight="900"
        fill="#f5f3ef"
      >
        T
      </text>
    </svg>
  )
}
