import { useMemo, useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { TOTAL_TILES, BOARD_COLS, BOARD_ROWS, getTilePosition } from '../game/constants'
import Tile from './Tile'
import Pawn from './Pawn'
import SnakeDecor from './SnakeDecor'

function computeCellSize() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const maxByW = (vw - 340) / (BOARD_COLS + 0.6)
  const maxByH = (vh - 200) / (BOARD_ROWS + 0.6)
  return Math.max(48, Math.min(88, Math.floor(Math.min(maxByW, maxByH))))
}

export default function Board() {
  const tiles = useGameStore((s) => s.tiles)
  const players = useGameStore((s) => s.players)
  const landingFx = useGameStore((s) => s.landingFx)
  const [cellSize, setCellSize] = useState(computeCellSize)

  const recalc = useCallback(() => setCellSize(computeCellSize()), [])
  useEffect(() => {
    window.addEventListener('resize', recalc)
    return () => window.removeEventListener('resize', recalc)
  }, [recalc])

  const gap = Math.round(cellSize * 0.09)

  const tilePositions = useMemo(
    () => Array.from({ length: TOTAL_TILES }, (_, i) => getTilePosition(i)),
    []
  )

  const grid = useMemo(() => {
    const map = new Map()
    for (let i = 0; i < TOTAL_TILES; i++) {
      const { row, col } = tilePositions[i]
      map.set(`${row}-${col}`, i)
    }
    return map
  }, [tilePositions])

  const overlap = players[0].position === players[1].position

  return (
    <div className="relative glass-candy p-3 md:p-4 border-2 border-pink-400/25">
      <SnakeDecor />
      <div
        className="grid relative z-[1]"
        style={{
          gridTemplateColumns: `repeat(${BOARD_COLS}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${BOARD_ROWS}, ${cellSize}px)`,
          gap: `${gap}px`,
        }}
      >
        {Array.from({ length: BOARD_ROWS * BOARD_COLS }, (_, idx) => {
          const row = Math.floor(idx / BOARD_COLS)
          const col = idx % BOARD_COLS
          const tileIndex = grid.get(`${row}-${col}`)

          if (tileIndex == null) {
            return <div key={idx} style={{ width: cellSize, height: cellSize }} />
          }

          return (
            <Tile
              key={tileIndex}
              tile={tiles[tileIndex]}
              index={tileIndex}
              size={cellSize}
            />
          )
        })}
      </div>

      {players.map((player) => {
        const pos = tilePositions[player.position]
        return (
          <Pawn
            key={player.id}
            playerId={player.id}
            row={pos.row}
            col={pos.col}
            color={player.color}
            cellSize={cellSize}
            gap={gap}
            overlap={overlap}
          />
        )
      })}

      <AnimatePresence>
        {landingFx && (
          <motion.div
            key={landingFx.id}
            initial={{ opacity: 0, scale: 0.6, y: 16 }}
            animate={{ opacity: 1, scale: 1.06, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -14 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="absolute z-[40] pointer-events-none"
            style={{
              left:
                getTilePosition(landingFx.tileIndex).col * (cellSize + gap) + cellSize / 2 - 42,
              top:
                getTilePosition(landingFx.tileIndex).row * (cellSize + gap) + cellSize / 2 - 42,
              width: 84,
              height: 84,
            }}
          >
            <div className="w-full h-full rounded-full bg-pink-400/20 border border-pink-300/40 shadow-neon-pink flex flex-col items-center justify-center backdrop-blur-sm">
              <span className="text-2xl leading-none">{landingFx.emoji}</span>
              <span className="text-[10px] font-extrabold text-white/95 mt-1">{landingFx.label}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
