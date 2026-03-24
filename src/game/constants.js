export const TOTAL_TILES = 24
export const MAX_TURNS = 30

/** Cases « Monopoly » : pas de propriété, effets immédiats ou carte bonus. */
export const SPECIAL_TILE = {
  DEPART: 'DEPART',
  CHANCE: 'CHANCE',
  TAX: 'TAX',
  PARC: 'PARC',
  PRISON: 'PRISON',
}

/** Par index de case (0–23). null = case propriété classique. */
export const TILE_SPECIAL_AT_INDEX = [
  SPECIAL_TILE.DEPART, // 0 — Départ
  null,
  null,
  null,
  SPECIAL_TILE.TAX, // 4 — Impôt
  null,
  null,
  null,
  SPECIAL_TILE.CHANCE, // 8 — Chance (question bonus, pas de propriété)
  null,
  null,
  null,
  SPECIAL_TILE.PARC, // 12 — Parc gratuit (repos)
  null,
  null,
  null,
  SPECIAL_TILE.CHANCE, // 16 — Chance
  null,
  null,
  null,
  SPECIAL_TILE.TAX, // 20 — Taxe
  null,
  SPECIAL_TILE.PRISON, // 22 — Visite simple (repos)
  null,
]

export const SPECIAL_TILE_LABEL = {
  [SPECIAL_TILE.DEPART]: 'Départ',
  [SPECIAL_TILE.CHANCE]: 'Chance',
  [SPECIAL_TILE.TAX]: 'Taxe',
  [SPECIAL_TILE.PARC]: 'Parc',
  [SPECIAL_TILE.PRISON]: 'Prison',
}
export const DICE_MIN = 1
export const DICE_MAX = 6
export const DUEL_PENALTY = 1

export const PLAYER_COLORS = ['#6366f1', '#f59e0b']
export const PLAYER_NAMES = ['Joueur 1', 'Joueur 2']

export const PHASES = {
  START: 'START',
  ROLLING: 'ROLLING',
  MOVING: 'MOVING',
  QUESTION: 'QUESTION',
  DUEL: 'DUEL',
  RESULT: 'RESULT',
  GAME_OVER: 'GAME_OVER',
}

// Board layout: rectangular loop of 24 tiles
// Top row:    0..6   (left to right, 7 tiles)
// Right col:  7..11  (top to bottom, 5 tiles)
// Bottom row: 12..18 (right to left, 7 tiles)
// Left col:   19..23 (bottom to top, 5 tiles)
export const BOARD_COLS = 8
export const BOARD_ROWS = 7

export function getTilePosition(index) {
  if (index <= 6) return { row: 0, col: index }
  if (index <= 11) return { row: index - 6, col: 7 }
  if (index <= 18) return { row: 6, col: 18 - index }
  return { row: 23 - index + 1, col: 0 }
}
