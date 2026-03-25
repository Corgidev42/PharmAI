export const TOTAL_TILES = 24
export const MAX_TURNS = 30

/** Cases spéciales : classiques + inventions « mignonnes » (serpents, fée, potion…). */
export const SPECIAL_TILE = {
  DEPART: 'DEPART',
  CHANCE: 'CHANCE',
  TAX: 'TAX',
  PARC: 'PARC',
  PRISON: 'PRISON',
  /** +1 bonus — fée des bonbons */
  FEE_BONBONS: 'FEE_BONBONS',
  /** Glissade −2 cases (rebondit jusqu’à une case stable) */
  SERPENT: 'SERPENT',
  /** Glissade +2 cases */
  ECHELLE: 'ECHELLE',
  /** +2 bonus — potion rose */
  POTION_DOUX: 'POTION_DOUX',
  /** Repos — nuage tout doux */
  NUAGE: 'NUAGE',
  /** +1 bonus — tu flex */
  MEGAPHONE: 'MEGAPHONE',
  /** Repos — bulles magiques */
  BULLES_PAIX: 'BULLES_PAIX',
  /** Repos — toile d’araignée (coin mignon, rien de méchant) */
  TOILE_ARAIGNEE: 'TOILE_ARAIGNEE',
}

/** Par index 0–23. null = case propriété classique. */
export const TILE_SPECIAL_AT_INDEX = [
  SPECIAL_TILE.DEPART,
  SPECIAL_TILE.FEE_BONBONS,
  null,
  SPECIAL_TILE.ECHELLE,
  SPECIAL_TILE.TAX,
  null,
  SPECIAL_TILE.SERPENT,
  null,
  SPECIAL_TILE.CHANCE,
  SPECIAL_TILE.POTION_DOUX,
  null,
  SPECIAL_TILE.MEGAPHONE,
  SPECIAL_TILE.NUAGE,
  null,
  SPECIAL_TILE.BULLES_PAIX,
  null,
  SPECIAL_TILE.CHANCE,
  null,
  SPECIAL_TILE.SERPENT,
  SPECIAL_TILE.FEE_BONBONS,
  SPECIAL_TILE.TAX,
  null,
  SPECIAL_TILE.TOILE_ARAIGNEE,
  SPECIAL_TILE.ECHELLE,
]

export const SPECIAL_TILE_LABEL = {
  [SPECIAL_TILE.DEPART]: 'Départ',
  [SPECIAL_TILE.CHANCE]: 'Chance',
  [SPECIAL_TILE.TAX]: 'Taxe',
  [SPECIAL_TILE.PARC]: 'Parc',
  [SPECIAL_TILE.PRISON]: 'Prison',
  [SPECIAL_TILE.FEE_BONBONS]: 'Fée',
  [SPECIAL_TILE.SERPENT]: 'Serpent',
  [SPECIAL_TILE.ECHELLE]: 'Échelle',
  [SPECIAL_TILE.POTION_DOUX]: 'Potion',
  [SPECIAL_TILE.NUAGE]: 'Nuage',
  [SPECIAL_TILE.MEGAPHONE]: 'Mégaphone',
  [SPECIAL_TILE.BULLES_PAIX]: 'Bulles',
  [SPECIAL_TILE.TOILE_ARAIGNEE]: 'Toile',
}

/** Couleur néon pour le plateau (Tailwind arbitrary / thème). */
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

/** Couleurs joueurs : néon bien flashy */
export const PLAYER_COLORS = ['#ff6ec7', '#5dffe1']
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

export const BOARD_COLS = 8
export const BOARD_ROWS = 7

export function getTilePosition(index) {
  if (index <= 6) return { row: 0, col: index }
  if (index <= 11) return { row: index - 6, col: 7 }
  if (index <= 18) return { row: 6, col: 18 - index }
  return { row: 23 - index + 1, col: 0 }
}
