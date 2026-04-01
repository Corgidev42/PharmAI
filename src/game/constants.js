export const TOTAL_TILES = 26
export const MAX_TURNS = 30

export const SPECIAL_TILE = {
  DEPART: 'DEPART',
  CHANCE: 'CHANCE',
  TAX: 'TAX',
  PARC: 'PARC',
  PRISON: 'PRISON',
  FEE_BONBONS: 'FEE_BONBONS',
  SERPENT: 'SERPENT',
  ECHELLE: 'ECHELLE',
  POTION_DOUX: 'POTION_DOUX',
  NUAGE: 'NUAGE',
  MEGAPHONE: 'MEGAPHONE',
  BULLES_PAIX: 'BULLES_PAIX',
  TOILE_ARAIGNEE: 'TOILE_ARAIGNEE',
}

/**
 * 26 cases (p\u00e9rim\u00e8tre complet 8\u00d77 avec les 4 coins).
 * 8 sp\u00e9ciales seulement, le reste = propri\u00e9t\u00e9s.
 */
export const TILE_SPECIAL_AT_INDEX = [
  SPECIAL_TILE.DEPART,        // 0  coin haut-gauche
  null,                        // 1
  null,                        // 2
  SPECIAL_TILE.ECHELLE,       // 3
  null,                        // 4
  null,                        // 5
  null,                        // 6
  null,                        // 7  coin haut-droit
  SPECIAL_TILE.CHANCE,        // 8
  null,                        // 9
  null,                        // 10
  null,                        // 11
  SPECIAL_TILE.SERPENT,       // 12
  null,                        // 13 coin bas-droit
  null,                        // 14
  SPECIAL_TILE.NUAGE,        // 15
  null,                        // 16
  null,                        // 17
  SPECIAL_TILE.CHANCE,       // 18
  null,                        // 19
  null,                        // 20 coin bas-gauche
  SPECIAL_TILE.TAX,           // 21
  null,                        // 22
  SPECIAL_TILE.FEE_BONBONS,  // 23
  null,                        // 24
  null,                        // 25
]

export const SPECIAL_TILE_LABEL = {
  [SPECIAL_TILE.DEPART]: 'D\u00e9part',
  [SPECIAL_TILE.CHANCE]: 'Chance',
  [SPECIAL_TILE.TAX]: 'Taxe',
  [SPECIAL_TILE.PARC]: 'Parc',
  [SPECIAL_TILE.PRISON]: 'Prison',
  [SPECIAL_TILE.FEE_BONBONS]: 'F\u00e9e',
  [SPECIAL_TILE.SERPENT]: 'Serpent',
  [SPECIAL_TILE.ECHELLE]: '\u00c9chelle',
  [SPECIAL_TILE.POTION_DOUX]: 'Potion',
  [SPECIAL_TILE.NUAGE]: 'Nuage',
  [SPECIAL_TILE.MEGAPHONE]: 'M\u00e9gaphone',
  [SPECIAL_TILE.BULLES_PAIX]: 'Bulles',
  [SPECIAL_TILE.TOILE_ARAIGNEE]: 'Toile',
}

export const SPECIAL_TILE_ACCENT = {
  [SPECIAL_TILE.DEPART]: 'lime',
  [SPECIAL_TILE.CHANCE]: 'violet',
  [SPECIAL_TILE.TAX]: 'rose',
  [SPECIAL_TILE.PARC]: 'cyan',
  [SPECIAL_TILE.PRISON]: 'slate',
  [SPECIAL_TILE.FEE_BONBONS]: 'pink',
  [SPECIAL_TILE.SERPENT]: 'emerald',
  [SPECIAL_TILE.ECHELLE]: 'sky',
  [SPECIAL_TILE.POTION_DOUX]: 'fuchsia',
  [SPECIAL_TILE.NUAGE]: 'sky',
  [SPECIAL_TILE.MEGAPHONE]: 'amber',
  [SPECIAL_TILE.BULLES_PAIX]: 'cyan',
  [SPECIAL_TILE.TOILE_ARAIGNEE]: 'violet',
}

export const DICE_MIN = 1
export const DICE_MAX = 6
export const DUEL_PENALTY = 1

export const PLAYER_COLORS = ['#ff6ec7', '#5dffe1']
/** Noms par défaut — modifiables à l’écran ; deck de questions lié à chaque joueur. */
export const PLAYER_NAMES = ['Lou', 'Toi']

export const PHASES = {
  START: 'START',
  ROLLING: 'ROLLING',
  MOVING: 'MOVING',
  QUESTION: 'QUESTION',
  DUEL: 'DUEL',
  RESULT: 'RESULT',
  GAME_OVER: 'GAME_OVER',
}

export const BOARD_COLS = 8
export const BOARD_ROWS = 7

/** Parcours p\u00e9rim\u00e9trique : haut \u2192 droite \u2192 bas \u2192 gauche (sens horaire, 26 cases). */
export function getTilePosition(index) {
  if (index <= 7) return { row: 0, col: index }
  if (index <= 12) return { row: index - 7, col: 7 }
  if (index <= 20) return { row: 6, col: 20 - index }
  return { row: 26 - index, col: 0 }
}
