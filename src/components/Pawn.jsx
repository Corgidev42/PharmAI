import { motion } from 'framer-motion'

function SnakeSVG({ color, size }) {
  const eyeR = size * 0.07
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      className="drop-shadow-[0_0_10px_currentColor] animate-wiggle"
      style={{ color }}
    >
      {/* Corps ondulé */}
      <path
        d="M30 8 Q42 14 38 24 Q34 34 42 40 Q48 44 44 52 Q42 56 36 54"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      {/* Tête */}
      <circle cx="30" cy="10" r="8" fill={color} opacity="0.85" />
      {/* Oeil gauche */}
      <circle cx="26" cy="8" r={eyeR + 1} fill="white" />
      <circle cx="26.5" cy="8" r={eyeR * 0.6} fill="#1a0a2e" />
      {/* Oeil droit */}
      <circle cx="34" cy="8" r={eyeR + 1} fill="white" />
      <circle cx="33.5" cy="8" r={eyeR * 0.6} fill="#1a0a2e" />
      {/* Langue */}
      <path
        d="M30 16 L30 20 M30 20 L28 23 M30 20 L32 23"
        stroke="#ff4d6d"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Reflet sur la tête */}
      <circle cx="28" cy="6" r="2" fill="white" opacity="0.4" />
    </svg>
  )
}

export default function Pawn({ playerId, row, col, color, cellSize = 64, gap = 6, overlap = false }) {
  const step = cellSize + gap
  const pawnSize = Math.round(cellSize * 0.55)
  const center = (cellSize - pawnSize) / 2
  const overlapOffset = overlap ? (playerId === 0 ? -pawnSize * 0.14 : pawnSize * 0.14) : 0

  return (
    <motion.div
      className="absolute z-[30] pointer-events-none"
      style={{ width: pawnSize, height: pawnSize }}
      animate={{
        top: row * step + center,
        left: col * step + center + overlapOffset,
      }}
      transition={{ type: 'spring', stiffness: 230, damping: 18, mass: 0.7 }}
    >
      <SnakeSVG color={color} size={pawnSize} />
    </motion.div>
  )
}
