import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { PHASES } from '../game/constants'

const DOT_POSITIONS = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
}

function DiceFace({ value }) {
  const dots = DOT_POSITIONS[value] || []
  return (
    <div className="grid grid-cols-3 grid-rows-3 w-16 h-16 p-2 gap-1">
      {Array.from({ length: 9 }, (_, i) => {
        const row = Math.floor(i / 3)
        const col = i % 3
        const hasDot = dots.some(([r, c]) => r === row && c === col)
        return (
          <div key={i} className="flex items-center justify-center">
            {hasDot && <div className="w-2.5 h-2.5 rounded-full bg-gray-100" />}
          </div>
        )
      })}
    </div>
  )
}

export default function Dice() {
  const phase = useGameStore((s) => s.phase)
  const diceValue = useGameStore((s) => s.diceValue)
  const currentPlayer = useGameStore((s) => s.currentPlayer)
  const players = useGameStore((s) => s.players)
  const roll = useGameStore((s) => s.roll)
  const finishMovement = useGameStore((s) => s.finishMovement)
  const [rolling, setRolling] = useState(false)
  const [displayValue, setDisplayValue] = useState(1)

  const handleRoll = useCallback(() => {
    if (phase !== PHASES.ROLLING || rolling) return
    setRolling(true)

    let ticks = 0
    const interval = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 6) + 1)
      ticks++
      if (ticks >= 10) {
        clearInterval(interval)
        const finalValue = roll()
        setDisplayValue(finalValue)
        setRolling(false)
        setTimeout(() => finishMovement(), 600)
      }
    }, 80)
  }, [phase, rolling, roll, finishMovement])

  const isActive = phase === PHASES.ROLLING
  const shown = diceValue ?? displayValue

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-gray-400">
        {isActive ? (
          <>
            Tour de{' '}
            <span style={{ color: players[currentPlayer].color }} className="font-semibold">
              {players[currentPlayer].name}
            </span>
            {' '}&mdash; Lancez le dé !
          </>
        ) : (
          phase === PHASES.MOVING && `Déplacement de ${diceValue} case${diceValue > 1 ? 's' : ''}...`
        )}
      </p>

      <motion.button
        onClick={handleRoll}
        disabled={!isActive || rolling}
        className={`relative w-20 h-20 rounded-xl border-2 flex items-center justify-center
          transition-colors ${
            isActive
              ? 'border-gray-500 bg-gray-800 hover:bg-gray-700 cursor-pointer'
              : 'border-gray-700 bg-gray-800/50 cursor-default opacity-60'
          }`}
        animate={rolling ? { rotate: [0, 15, -15, 10, -10, 0] } : { rotate: 0 }}
        transition={{ duration: 0.4, repeat: rolling ? Infinity : 0 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={shown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <DiceFace value={shown} />
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
