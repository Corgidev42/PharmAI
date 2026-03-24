import {
  TOTAL_TILES,
  DICE_MIN,
  DICE_MAX,
  DUEL_PENALTY,
  MAX_TURNS,
  TILE_SPECIAL_AT_INDEX,
  SPECIAL_TILE,
} from './constants.js'

export function rollDice() {
  return Math.floor(Math.random() * (DICE_MAX - DICE_MIN + 1)) + DICE_MIN
}

export function movePlayer(position, steps) {
  return (position + steps) % TOTAL_TILES
}

export function createInitialTiles() {
  return Array.from({ length: TOTAL_TILES }, (_, i) => ({
    id: i,
    owner: null,
    special: TILE_SPECIAL_AT_INDEX[i] ?? null,
  }))
}

export function createPlayer(id, name, color) {
  return { id, name, position: 0, score: 0, bonus: 0, color }
}

/**
 * Draw the next card from the deck. For duels, picks a card with
 * difficulty strictly greater than `minDifficulty` if available.
 */
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

export function checkAnswer(card, answer) {
  if (card.type === 'QCM') {
    return answer === card.answer
  }
  // OPEN: manual validation (player confirms)
  return answer === true
}

export function resolveLanding(tiles, tileIndex, playerId) {
  const tile = tiles[tileIndex]
  if (tile.special) {
    if (tile.special === SPECIAL_TILE.DEPART) return 'SPECIAL_DEPART'
    if (tile.special === SPECIAL_TILE.CHANCE) return 'SPECIAL_CHANCE'
    if (tile.special === SPECIAL_TILE.TAX) return 'SPECIAL_TAX'
    if (tile.special === SPECIAL_TILE.PARC || tile.special === SPECIAL_TILE.PRISON)
      return 'SPECIAL_REST'
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

/** Bonus Monopoly (points hors nombre de cases possédées). */
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

export function checkVictory(tiles, deck, turnCount) {
  const deckExhausted = deck.currentIndex >= deck.cards.length
  const turnsOver = turnCount >= MAX_TURNS

  if (!deckExhausted && !turnsOver) return null

  const counts = [countOwnedTiles(tiles, 0), countOwnedTiles(tiles, 1)]

  if (counts[0] > counts[1]) return 0
  if (counts[1] > counts[0]) return 1
  return -1 // draw
}

export function nextPlayerIndex(current) {
  return current === 0 ? 1 : 0
}
