/** Serpents décoratifs néon (SVG) — ne touchent pas au gameplay */
export default function SnakeDecor({ className = '' }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-visible text-pink-400/35 ${className}`}
      aria-hidden
    >
      <svg
        className="absolute -left-8 top-1/4 w-32 h-48 animate-wiggle"
        viewBox="0 0 100 160"
        fill="none"
      >
        <path
          d="M50 8 Q75 40 50 72 Q25 104 50 136 Q65 152 82 148"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_rgba(255,110,199,0.8)]"
        />
        <circle cx="38" cy="18" r="4" fill="#5dffe1" className="opacity-90" />
        <circle cx="48" cy="16" r="4" fill="#5dffe1" className="opacity-90" />
      </svg>
      <svg
        className="absolute -right-6 bottom-1/4 w-36 h-40 animate-wiggle [animation-delay:0.5s]"
        viewBox="0 0 120 140"
        fill="none"
      >
        <path
          d="M20 120 Q50 90 80 60 Q100 35 75 12"
          stroke="#5dffe1"
          strokeWidth="4"
          strokeLinecap="round"
          className="opacity-40 drop-shadow-[0_0_10px_rgba(93,255,225,0.7)]"
        />
      </svg>
      <svg
        className="absolute left-[15%] -bottom-4 w-28 h-24 opacity-30"
        viewBox="0 0 90 80"
        fill="none"
      >
        <path
          d="M8 40 Q30 10 55 35 Q80 60 70 72"
          stroke="#c4b5fd"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
