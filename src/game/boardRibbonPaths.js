import { getTilePosition } from './constants.js'

/** Rampe d’échelle : peu de ondulations (montée nette). */
export function ladderRibbonPath(x1, y1, x2, y2, cellSize) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const px = -dy / len
  const py = dx / len
  const n = Math.max(2, Math.min(6, Math.round(len / (cellSize * 0.55))))
  const amp = cellSize * 0.04
  let d = `M ${x1} ${y1}`
  for (let i = 0; i < n; i++) {
    const t0 = i / n
    const t1 = (i + 1) / n
    const sign = i % 2 === 0 ? 1 : -1
    const c1x = x1 + dx * (t0 + 0.28 / n) + px * amp * sign
    const c1y = y1 + dy * (t0 + 0.28 / n) + py * amp * sign
    const c2x = x1 + dx * (t0 + 0.72 / n) + px * amp * sign
    const c2y = y1 + dy * (t0 + 0.72 / n) + py * amp * sign
    const ex = x1 + dx * t1
    const ey = y1 + dy * t1
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey}`
  }
  return d
}

/** Serpent : trajectoire plus sinueuse. */
export function snakeRibbonPath(x1, y1, x2, y2, cellSize) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const px = -dy / len
  const py = dx / len
  const n = Math.max(4, Math.min(14, Math.round(len / (cellSize * 0.38))))
  const amp = cellSize * 0.14
  let d = `M ${x1} ${y1}`
  for (let i = 0; i < n; i++) {
    const t0 = i / n
    const t1 = (i + 1) / n
    const sign = i % 2 === 0 ? 1 : -1
    const c1x = x1 + dx * (t0 + 0.28 / n) + px * amp * sign
    const c1y = y1 + dy * (t0 + 0.28 / n) + py * amp * sign
    const c2x = x1 + dx * (t0 + 0.72 / n) + px * amp * sign
    const c2y = y1 + dy * (t0 + 0.72 / n) + py * amp * sign
    const ex = x1 + dx * t1
    const ey = y1 + dy * t1
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey}`
  }
  return d
}

/**
 * Même tracé que les rubans du plateau (pour animer le pion sur la courbe).
 * @param {'ladder' | 'snake'} kind
 */
export function getRibbonPathD(fromIndex, toIndex, kind, cellSize, gap) {
  const step = cellSize + gap
  const c = (idx) => {
    const { row, col } = getTilePosition(idx)
    return {
      x: col * step + cellSize / 2,
      y: row * step + cellSize / 2,
    }
  }
  const a = c(fromIndex)
  const b = c(toIndex)
  return kind === 'ladder'
    ? ladderRibbonPath(a.x, a.y, b.x, b.y, cellSize)
    : snakeRibbonPath(a.x, a.y, b.x, b.y, cellSize)
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Durée d’animation le long du ruban (ms), bornée. */
export function slidePathDurationMs(pathLengthPx, kind) {
  const base = kind === 'snake' ? 950 : 750
  const per = kind === 'snake' ? 2.1 : 1.6
  return Math.min(3400, Math.max(720, base + pathLengthPx * per))
}

/**
 * Position sur le ruban (t = 0…1 temps d’anim) + angle tangent (degrés) pour orienter le pion.
 */
export function getPointAndAngleOnPath(pathEl, t) {
  const len = pathEl.getTotalLength()
  const u = easeInOutCubic(Math.min(1, Math.max(0, t)))
  const p = u * len
  const pt = pathEl.getPointAtLength(p)
  const delta = Math.max(2, len * 0.025)
  const p1 = pathEl.getPointAtLength(Math.max(0, p - delta))
  const p2 = pathEl.getPointAtLength(Math.min(len, p + delta))
  const rotate = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI
  return { x: pt.x, y: pt.y, rotate }
}
