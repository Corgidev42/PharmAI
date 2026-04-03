import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { PHASES } from '../game/constants'

const DOT_POSITIONS = {
  1: [[1, 1]],
  2: [
    [0, 2],
    [2, 0],
  ],
  3: [
    [0, 2],
    [1, 1],
    [2, 0],
  ],
  4: [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
  ],
  5: [
    [0, 0],
    [0, 2],
    [1, 1],
    [2, 0],
    [2, 2],
  ],
  6: [
    [0, 0],
    [0, 2],
    [1, 0],
    [1, 2],
    [2, 0],
    [2, 2],
  ],
}

function DiceFace({ value }) {
  const dots = DOT_POSITIONS[value] || []
  return (
    <div className="grid grid-cols-3 grid-rows-3 w-full h-full min-h-0 p-[10%] gap-[8%] place-items-center">
      {Array.from({ length: 9 }, (_, i) => {
        const row = Math.floor(i / 3)
        const col = i % 3
        const hasDot = dots.some(([r, c]) => r === row && c === col)
        return (
          <div key={i} className="flex items-center justify-center w-full h-full">
            {hasDot && (
              <div
                className="rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)] w-[min(40%,1.25rem)] aspect-square max-w-[18px]"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Dice({ compact = false }) {
  const phase = useGameStore((s) => s.phase)
  const diceValue = useGameStore((s) => s.diceValue)
  const isAnimatingMovement = useGameStore((s) => s.isAnimatingMovement)
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
        setTimeout(async () => {
          await finishMovement()
        }, 180)
      }
    }, 80)
  }, [phase, rolling, roll, finishMovement])

  const isActive = phase === PHASES.ROLLING
  const shown = diceValue ?? displayValue

  return (
    <div
        className={`flex flex-col w-full ${compact ? 'items-stretch gap-1.5 sm:gap-2' : 'items-center gap-3'}`}
    >
      <p
        className={`font-semibold text-pink-200/85 w-full ${
          compact
            ? 'text-center text-[10px] sm:text-[11px] leading-snug px-0.5 sm:px-1'
            : 'text-sm text-center max-w-[14rem]'
        }`}
      >
        {isActive ? (
          <>
            Tour de{' '}
            <span
              style={{ color: players[currentPlayer].color }}
              className="font-extrabold drop-shadow-[0_0_6px_currentColor]"
            >
              {players[currentPlayer].name}
            </span>
            {' '}
            — lance le dé.
          </>
        ) : (
          phase === PHASES.MOVING &&
          (isAnimatingMovement
            ? `Déplacement — ${diceValue ?? ''} ${diceValue > 1 ? 'cases' : 'case'}`
            : `${diceValue ?? ''} ${diceValue > 1 ? 'cases' : 'case'}`)
        )}
      </p>

      <div
        className={
          compact
            ? 'w-full flex justify-center px-0.5'
            : 'flex justify-center'
        }
      >
        <div
          className={
            compact
              ? 'relative w-full max-w-[min(100%,5.5rem)] max-lg:landscape:max-w-[min(100%,6.75rem)] sm:max-w-[min(100%,7.5rem)] md:max-w-[min(100%,9rem)] mx-auto [aspect-ratio:1/1] shrink-0'
              : 'relative h-20 w-20 shrink-0'
          }
        >
          <motion.button
            type="button"
            onClick={handleRoll}
            disabled={!isActive || rolling}
            className={`absolute inset-0 rounded-2xl sm:rounded-3xl border-2 flex items-center justify-center overflow-hidden transition-all touch-manipulation ${
              isActive
                ? 'border-pink-400/70 bg-purple-950/80 hover:border-cyan-400/60 cursor-pointer shadow-neon-pink hover:shadow-neon-cyan'
                : 'border-white/15 bg-purple-950/50 cursor-default opacity-55'
            }`}
            animate={rolling ? { rotate: [0, 15, -15, 10, -10, 0] } : { rotate: 0 }}
            transition={{ duration: 0.4, repeat: rolling ? Infinity : 0 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={shown}
                className="absolute inset-0 flex items-center justify-center p-1"
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
      </div>
    </div>
  )
}
