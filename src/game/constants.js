export const TOTAL_TILES = 24
export const MAX_TURNS = 30
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
