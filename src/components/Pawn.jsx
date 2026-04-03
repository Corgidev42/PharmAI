import { useLayoutEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PAWN_MOVE_DURATION_SEC, SPECIAL_TILE } from '../game/constants'
import { useGameStore } from '../store/useGameStore'
import {
  getRibbonPathD,
  slidePathDurationMs,
  getPointAndAngleOnPath,
} from '../game/boardRibbonPaths.js'

/** Icône « tête » vers le haut ; la tangente du chemin est ajustée pour aligner la marche. */
const PATH_ROTATE_OFFSET = -88

function SnakeSVG({ color, size, wiggle }) {
  const eyeR = size * 0.07
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      className={`drop-shadow-[0_0_10px_currentColor] ${wiggle ? 'animate-wiggle' : ''}`}
      style={{ color }}
    >
      <path
        d="M30 8 Q42 14 38 24 Q34 34 42 40 Q48 44 44 52 Q42 56 36 54"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <circle cx="30" cy="10" r="8" fill={color} opacity="0.85" />
      <circle cx="26" cy="8" r={eyeR + 1} fill="white" />
      <circle cx="26.5" cy="8" r={eyeR * 0.6} fill="#1a0a2e" />
      <circle cx="34" cy="8" r={eyeR + 1} fill="white" />
      <circle cx="33.5" cy="8" r={eyeR * 0.6} fill="#1a0a2e" />
      <path
        d="M30 16 L30 20 M30 20 L28 23 M30 20 L32 23"
        stroke="#ff4d6d"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="28" cy="6" r="2" fill="white" opacity="0.4" />
    </svg>
  )
}

export default function Pawn({
  playerId,
  row,
  col,
  color,
  cellSize = 64,
  gap = 6,
  overlap = false,
  moveDurationSec = PAWN_MOVE_DURATION_SEC,
  tileSpecial = null,
  slideClimbKind = null,
  /** Glissement le long du ruban SVG (même courbe que le plateau). */
  activeSlidePath = null,
}) {
  const step = cellSize + gap
  const pawnSize = Math.round(cellSize * 0.55)
  const center = (cellSize - pawnSize) / 2
  const overlapOffset = overlap ? (playerId === 0 ? -pawnSize * 0.14 : pawnSize * 0.14) : 0

  const [pathPx, setPathPx] = useState(null)

  const pathD = useMemo(() => {
    if (!activeSlidePath) return null
    return getRibbonPathD(
      activeSlidePath.fromIndex,
      activeSlidePath.toIndex,
      activeSlidePath.kind,
      cellSize,
      gap
    )
  }, [activeSlidePath, cellSize, gap])

  useLayoutEffect(() => {
    if (!activeSlidePath || !pathD) {
      setPathPx(null)
      return
    }

    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathEl.setAttribute('d', pathD)
    const totalLen = pathEl.getTotalLength()
    const duration = slidePathDurationMs(totalLen, activeSlidePath.kind)

    let done = false
    const finish = () => {
      if (done) return
      done = true
      useGameStore.getState().acknowledgeSlide()
      setPathPx(null)
    }

    const start = performance.now()
    let raf = 0

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const { x, y, rotate } = getPointAndAngleOnPath(pathEl, t)
      setPathPx({ x, y, rotate })
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        finish()
      }
    }

    const p0 = getPointAndAngleOnPath(pathEl, 0)
    setPathPx({ x: p0.x, y: p0.y, rotate: p0.rotate })
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      if (!done) finish()
    }
  }, [activeSlidePath, pathD])

  const onPath = pathPx != null

  const onLadder =
    slideClimbKind === 'ladder' ||
    (slideClimbKind == null && tileSpecial === SPECIAL_TILE.ECHELLE)
  const onSnake =
    slideClimbKind === 'snake' ||
    (slideClimbKind == null && tileSpecial === SPECIAL_TILE.SERPENT)
  const climbY = onLadder ? -cellSize * 0.12 : onSnake ? cellSize * 0.04 : 0
  const climbScale = onLadder ? 1.12 : onSnake ? 1.08 : 1
  const zLift = onPath || onLadder || onSnake ? 42 : 30

  const top = onPath ? pathPx.y - pawnSize / 2 : row * step + center
  const left = onPath ? pathPx.x - pawnSize / 2 + overlapOffset : col * step + center + overlapOffset

  const pathRotate = onPath && pathPx.rotate != null ? pathPx.rotate + PATH_ROTATE_OFFSET : 0

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: pawnSize,
        height: pawnSize,
        zIndex: zLift,
      }}
      animate={{
        top,
        left,
        y: onPath ? 0 : climbY,
        scale: climbScale,
        rotate: onPath ? pathRotate : 0,
      }}
      transition={{
        top: onPath ? { duration: 0 } : { type: 'tween', duration: moveDurationSec, ease: [0.25, 0.1, 0.25, 1] },
        left: onPath ? { duration: 0 } : { type: 'tween', duration: moveDurationSec, ease: [0.25, 0.1, 0.25, 1] },
        y: { type: 'spring', stiffness: 420, damping: 28 },
        scale: { type: 'spring', stiffness: 380, damping: 26 },
        rotate: onPath ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' },
      }}
    >
      <div
        className={`w-full h-full ${onLadder ? 'drop-shadow-[0_-6px_14px_rgba(94,234,212,0.55)]' : ''} ${onSnake ? 'drop-shadow-[0_4px_12px_rgba(232,121,249,0.45)]' : ''}`}
      >
        <SnakeSVG color={color} size={pawnSize} wiggle={!onPath} />
      </div>
    </motion.div>
  )
}
