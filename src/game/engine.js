import {
  TOTAL_TILES,
  LAST_TILE_INDEX,
  DICE_MIN,
  DICE_MAX,
  DUEL_PENALTY,
  MAX_TURNS,
  TILE_SPECIAL_AT_INDEX,
  SLIDE_TO_AT_INDEX,
  SPECIAL_TILE,
} from './constants.js'

export function rollDice() {
  return Math.floor(Math.random() * (DICE_MAX - DICE_MIN + 1)) + DICE_MIN
}

/** Un pas en avant, sans dépasser la case 100 (index 99). */
export function stepForward(position) {
  if (position >= LAST_TILE_INDEX) return position
  return Math.min(LAST_TILE_INDEX, position + 1)
}

/** Avance de `steps` pas (pour usage ponctuel) — plafonné à l’arrivée. */
export function movePlayer(position, steps) {
  return Math.min(LAST_TILE_INDEX, position + steps)
}

export function createInitialTiles() {
  return Array.from({ length: TOTAL_TILES }, (_, i) => {
    const special = TILE_SPECIAL_AT_INDEX[i] ?? null
    const slideTo = SLIDE_TO_AT_INDEX[i]
    return {
      id: i,
      owner: null,
      special,
      slideTo: slideTo != null ? slideTo : null,
    }
  })
}

export function createPlayer(id, name, color) {
  return { id, name, position: 0, score: 0, bonus: 0, color }
}

export function drawCard(cards, currentIndex, minDifficulty = 0) {
  if (currentIndex >= cards.length) return { card: null, nextIndex: currentIndex }

  if (minDifficulty > 0) {
    const harder = cards.findIndex(
      (c, i) => i >= currentIndex && c.difficulty > minDifficulty
    )
    if (harder !== -1) {
      const card = cards[harder]
      const remaining = [...cards]
      remaining.splice(harder, 1)
      return { card, nextIndex: currentIndex, remainingCards: remaining }
    }
  }

  return { card: cards[currentIndex], nextIndex: currentIndex + 1 }
}

export function drawChanceCard(cards, currentIndex) {
  if (currentIndex >= cards.length) return { card: null, nextIndex: currentIndex }

  const remaining = cards.slice(currentIndex)
  if (remaining.length === 0) return { card: null, nextIndex: currentIndex }

  const minDiff = Math.min(...remaining.map((c) => Number(c.difficulty) || 3))
  const rel = remaining.findIndex((c) => (Number(c.difficulty) || 3) === minDiff)
  const absoluteIndex = currentIndex + rel

  const card = cards[absoluteIndex]
  const nextCards = [...cards]
  nextCards.splice(absoluteIndex, 1)
  return { card, nextIndex: currentIndex, remainingCards: nextCards }
}

export function checkAnswer(card, answer) {
  if (card.type === 'QCM') {
    return answer === card.answer
  }
  return answer === true
}

/** Indices visités entre deux cases du parcours (serpentin), d’un pas de 1. */
export function indexPath(from, to) {
  const a = Math.max(0, Math.min(LAST_TILE_INDEX, from))
  const b = Math.max(0, Math.min(LAST_TILE_INDEX, to))
  if (a === b) return []
  const step = a < b ? 1 : -1
  const out = []
  for (let i = a + step; step > 0 ? i <= b : i >= b; i += step) {
    out.push(i)
  }
  return out
}

export function resolveSlides(startIndex, tiles, maxChain = 24) {
  let pos = startIndex
  let serpents = 0
  let echelles = 0
  let guard = 0

  while (guard < maxChain) {
    guard++
    const tile = tiles[pos]
    if (!tile?.special) break
    const st = tile.special
    if (st !== SPECIAL_TILE.SERPENT && st !== SPECIAL_TILE.ECHELLE) break
    const target = tile.slideTo
    if (target == null || target === pos) break
    const clamped = Math.max(0, Math.min(LAST_TILE_INDEX, target))
    if (st === SPECIAL_TILE.SERPENT) serpents++
    if (st === SPECIAL_TILE.ECHELLE) echelles++
    pos = clamped
  }

  let slideNote = null
  if (serpents || echelles) {
    const bits = []
    if (serpents) bits.push(`${serpents} serpent${serpents > 1 ? 's' : ''}`)
    if (echelles) bits.push(`${echelles} échelle${echelles > 1 ? 's' : ''}`)
    slideNote = `${bits.join(' · ')} — déplacement.`
  }

  return { finalIndex: pos, slideNote, serpents, echelles }
}

export function resolveLanding(tiles, tileIndex, playerId) {
  const tile = tiles[tileIndex]
  if (tile.special) {
    if (tile.special === SPECIAL_TILE.DEPART) return 'SPECIAL_DEPART'
    if (tile.special === SPECIAL_TILE.FIN) return 'SPECIAL_FIN'
  }
  if (tile.owner === null) return 'FREE'
  if (tile.owner === playerId) return 'OWN'
  return 'OPPONENT'
}

export function captureTile(tiles, tileIndex, playerId) {
  const target = tiles[tileIndex]
  if (target.special) return tiles
  return tiles.map((t, i) =>
    i === tileIndex ? { ...t, owner: playerId } : t
  )
}

export function applyPlayerBonus(players, playerId, delta) {
  return players.map((p) => {
    if (p.id !== playerId) return p
    const next = (p.bonus ?? 0) + delta
    return { ...p, bonus: delta < 0 ? Math.max(0, next) : next }
  })
}

export function applyDuelPenalty(player) {
  return { ...player, score: player.score - DUEL_PENALTY }
}

export function countOwnedTiles(tiles, playerId) {
  return tiles.filter((t) => t.owner === playerId).length
}

export function checkVictory(tiles, decks, turnCount) {
  const bothDecksExhausted =
    Array.isArray(decks) &&
    decks.length >= 2 &&
    decks[0].currentIndex >= decks[0].cards.length &&
    decks[1].currentIndex >= decks[1].cards.length
  const turnsOver = turnCount >= MAX_TURNS

  if (!bothDecksExhausted && !turnsOver) return null

  const counts = [countOwnedTiles(tiles, 0), countOwnedTiles(tiles, 1)]

  if (counts[0] > counts[1]) return 0
  if (counts[1] > counts[0]) return 1
  return -1
}

export function nextPlayerIndex(current) {
  return current === 0 ? 1 : 0
}
