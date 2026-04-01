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

/** Case Chance : pioche la carte restante la plus facile (difficulté minimale). */
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

/** Serpents / échelles : enchaîne les glissades jusqu’à une case « stable ». */
export function applySerpentsEtEchelles(startIndex, tiles, maxChain = 10) {
  let pos = startIndex
  let serpents = 0
  let echelles = 0
  let guard = 0

  while (guard < maxChain) {
    guard++
    const tile = tiles[pos]
    if (!tile?.special) break
    if (tile.special === SPECIAL_TILE.SERPENT) {
      pos = (pos - 2 + TOTAL_TILES) % TOTAL_TILES
      serpents++
      continue
    }
    if (tile.special === SPECIAL_TILE.ECHELLE) {
      pos = (pos + 2) % TOTAL_TILES
      echelles++
      continue
    }
    break
  }

  let slideNote = null
  if (serpents || echelles) {
    const bits = []
    if (serpents) bits.push(`${serpents} serpent${serpents > 1 ? 's' : ''}`)
    if (echelles) bits.push(`${echelles} échelle${echelles > 1 ? 's' : ''}`)
    slideNote = `${bits.join(' · ')} — case ajustée (serpent / échelle).`
  }

  return { finalIndex: pos, slideNote }
}

export function resolveLanding(tiles, tileIndex, playerId) {
  const tile = tiles[tileIndex]
  if (tile.special) {
    if (tile.special === SPECIAL_TILE.DEPART) return 'SPECIAL_DEPART'
    if (tile.special === SPECIAL_TILE.CHANCE) return 'SPECIAL_CHANCE'
    if (tile.special === SPECIAL_TILE.TAX) return 'SPECIAL_TAX'
    if (tile.special === SPECIAL_TILE.FEE_BONBONS) return 'SPECIAL_FEE_BONBONS'
    if (tile.special === SPECIAL_TILE.POTION_DOUX) return 'SPECIAL_POTION_DOUX'
    if (tile.special === SPECIAL_TILE.MEGAPHONE) return 'SPECIAL_MEGAPHONE'
    if (tile.special === SPECIAL_TILE.NUAGE) return 'SPECIAL_NUAGE'
    if (
      tile.special === SPECIAL_TILE.PARC ||
      tile.special === SPECIAL_TILE.PRISON ||
      tile.special === SPECIAL_TILE.BULLES_PAIX ||
      tile.special === SPECIAL_TILE.TOILE_ARAIGNEE
    )
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

/**
 * @param {Array<{ cards: unknown[], currentIndex: number }>} decks — un paquet par joueur (index 0 et 1)
 */
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

/** Texte des cases repos (hors Nuage, traité à part). */
export function getRestSpecialCopy(special) {
  switch (special) {
    case SPECIAL_TILE.BULLES_PAIX:
      return {
        title: 'Repos',
        subtitle: 'Pas de question. Tour suivant.',
      }
    case SPECIAL_TILE.TOILE_ARAIGNEE:
      return {
        title: 'Repos',
        subtitle: 'Pas de question. Tour suivant.',
      }
    case SPECIAL_TILE.PARC:
      return {
        title: 'Repos',
        subtitle: 'Pas de question. Tour suivant.',
      }
    case SPECIAL_TILE.PRISON:
    default:
      return {
        title: 'Repos',
        subtitle: 'Pas de question. Tour suivant.',
      }
  }
}
