import { motion } from 'framer-motion'

const CELL_SIZE = 64 + 6 // w-16 (64px) + gap-1.5 (6px)

export default function Pawn({ playerId, row, col, color }) {
  const offset = playerId === 0 ? -5 : 5

  return (
    <motion.div
      className="absolute w-7 h-7 rounded-full ring-2 ring-white/40 shadow-xl z-10 pointer-events-none"
      style={{ backgroundColor: color }}
      animate={{
        top: row * CELL_SIZE + 18 + offset,
        left: col * CELL_SIZE + 18 + offset,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    />
  )
}
