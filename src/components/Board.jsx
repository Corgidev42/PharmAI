import { useId, useMemo, useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import {
  TOTAL_TILES,
  BOARD_COLS,
  BOARD_ROWS,
  BOARD_CHROME_MARGIN_PX,
  getTilePosition,
  getSnakeLadderLinks,
  PAWN_MOVE_DURATION_SEC,
  SPECIAL_TILE,
} from '../game/constants'
import { ladderRibbonPath, snakeRibbonPath } from '../game/boardRibbonPaths.js'
import Tile from './Tile'
import Pawn from './Pawn'

/**
 * Déduit cellSize + gap pour un carré de côté `sidePx` (mesure utile du conteneur).
 * `sidePx` doit être min(largeur,hauteur) disponible pour tout le bloc plateau (grille + cadre).
 */
function dimensionsFromSquareSide(sidePx) {
  if (!Number.isFinite(sidePx) || sidePx < 64) {
    return { cellSize: 14, gap: 2 }
  }
  const inner = Math.max(28, sidePx - BOARD_CHROME_MARGIN_PX)
  let gap = Math.max(2, Math.round(inner * 0.016))
  let cellSize = Math.floor((inner - 9 * gap) / 10)
  if (cellSize < 12) {
    gap = 2
    cellSize = Math.floor((inner - 9 * gap) / 10)
  }
  cellSize = Math.min(96, Math.max(10, cellSize))
  while (cellSize > 8 && 10 * cellSize + 9 * gap > inner) {
    cellSize -= 1
  }
  if (10 * cellSize + 9 * gap > inner) {
    gap = 1
    cellSize = Math.min(96, Math.max(8, Math.floor((inner - 9) / 10)))
    while (cellSize > 6 && 10 * cellSize + 9 * gap > inner) cellSize -= 1
  }
  return { cellSize: Math.max(8, cellSize), gap }
}

function CourseTrace({ cellSize, gap, tilePositions }) {
  const gradId = useId().replace(/:/g, '')
  const step = cellSize + gap
  const w = BOARD_COLS * cellSize + (BOARD_COLS - 1) * gap
  const h = BOARD_ROWS * cellSize + (BOARD_ROWS - 1) * gap
  const points = tilePositions.map(({ row, col }) => ({
    x: col * step + cellSize / 2,
    y: row * step + cellSize / 2,
  }))
  const d = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    return `${acc} L ${p.x} ${p.y}`
  }, '')

  return (
    <svg
      className="absolute left-0 top-0 z-0 pointer-events-none overflow-visible"
      width={w}
      height={h}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ff6ec7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5dffe1" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={Math.max(1.5, cellSize * 0.035)}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.45}
      />
    </svg>
  )
}

function SnakeLadderRibbons({ cellSize, gap, tilePositions }) {
  const filterId = useId().replace(/:/g, '')
  const step = cellSize + gap
  const w = BOARD_COLS * cellSize + (BOARD_COLS - 1) * gap
  const h = BOARD_ROWS * cellSize + (BOARD_ROWS - 1) * gap
  const links = getSnakeLadderLinks()

  const center = (idx) => {
    const { row, col } = tilePositions[idx] ?? getTilePosition(idx)
    return {
      x: col * step + cellSize / 2,
      y: row * step + cellSize / 2,
    }
  }

  return (
    <svg
      className="absolute left-0 top-0 z-[0.5] pointer-events-none overflow-visible"
      width={w}
      height={h}
      aria-hidden
    >
      <defs>
        <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {links.map((link, i) => {
        const a = center(link.from)
        const b = center(link.to)
        const isLadder = link.kind === 'ladder'
        const pathD = isLadder
          ? ladderRibbonPath(a.x, a.y, b.x, b.y, cellSize)
          : snakeRibbonPath(a.x, a.y, b.x, b.y, cellSize)
        const stroke = isLadder ? '#5dffe1' : '#e879f9'
        const width = isLadder ? Math.max(2.5, cellSize * 0.065) : Math.max(2, cellSize * 0.055)
        return (
          <path
            key={`${link.from}-${link.to}-${link.kind}-${i}`}
            d={pathD}
            fill="none"
            stroke={stroke}
            strokeWidth={width}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={isLadder ? '1 0' : '7 5'}
            opacity={isLadder ? 0.92 : 0.8}
            filter={`url(#${filterId})`}
          />
        )
      })}
    </svg>
  )
}

export default function Board() {
  const tiles = useGameStore((s) => s.tiles)
  const players = useGameStore((s) => s.players)
  const landingFx = useGameStore((s) => s.landingFx)
  const slidePath = useGameStore((s) => s.slidePath)
  const measureRef = useRef(null)
  const [squareSide, setSquareSide] = useState(() =>
    typeof window !== 'undefined'
      ? Math.max(
          120,
          Math.min(window.innerWidth, window.innerHeight) - BOARD_CHROME_MARGIN_PX - 32
        )
      : 360
  )

  useEffect(() => {
    const el = measureRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      const m = Math.min(width, height)
      if (m > 0) setSquareSide(m)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { cellSize, gap } = useMemo(
    () => dimensionsFromSquareSide(squareSide),
    [squareSide]
  )

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

  const gridW = BOARD_COLS * cellSize + (BOARD_COLS - 1) * gap
  const gridH = BOARD_ROWS * cellSize + (BOARD_ROWS - 1) * gap

  return (
    <div
      ref={measureRef}
      className="absolute inset-0 flex min-h-0 min-w-0 items-center justify-center overflow-hidden p-0.5 sm:p-1"
    >
      <div className="relative max-h-full min-h-0 min-w-0 max-w-full overflow-hidden rounded-xl border-2 border-pink-400/25 bg-purple-950/20 p-1 shadow-[0_0_40px_rgba(255,110,199,0.08)] sm:rounded-2xl sm:p-1.5 md:p-2 glass-candy">
        <div
          className="relative mx-auto max-h-full min-h-0 min-w-0 max-w-full overflow-hidden"
          style={{ width: gridW, height: gridH }}
        >
          <CourseTrace cellSize={cellSize} gap={gap} tilePositions={tilePositions} />
          <SnakeLadderRibbons cellSize={cellSize} gap={gap} tilePositions={tilePositions} />
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
            const special = tiles[player.position]?.special
            const tileSpecial =
              special === SPECIAL_TILE.ECHELLE || special === SPECIAL_TILE.SERPENT ? special : null
            const slideClimbKind =
              slidePath?.playerId === player.id ? slidePath.kind : null
            const activeSlidePath =
              slidePath?.playerId === player.id ? slidePath : null
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
                moveDurationSec={PAWN_MOVE_DURATION_SEC}
                tileSpecial={tileSpecial}
                slideClimbKind={slideClimbKind}
                activeSlidePath={activeSlidePath}
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
      </div>
    </div>
  )
}
