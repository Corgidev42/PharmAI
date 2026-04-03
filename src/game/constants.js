export const TOTAL_TILES = 100
export const LAST_TILE_INDEX = 99
export const MAX_TURNS = 64

/** Cases spéciales : course vers la case 100, pas de Chance ni défis. */
export const SPECIAL_TILE = {
  DEPART: 'DEPART',
  FIN: 'FIN',
  SERPENT: 'SERPENT',
  ECHELLE: 'ECHELLE',
}

const S = SPECIAL_TILE

/**
 * Parcours serpentin (comme jeu de l’oie classique) : case 1 en bas à gauche,
 * ligne du bas 1→10, ligne au-dessus 20→11, etc., case 100 en haut à gauche.
 * row 0 = haut de l’écran, row 9 = bas.
 */
export function buildSerpentinePath(size) {
  const res = []
  for (let i = 0; i < size * size; i++) {
    const rFromBottom = Math.floor(i / size)
    const row = size - 1 - rFromBottom
    const col = rFromBottom % 2 === 0 ? i % size : size - 1 - (i % size)
    res.push({ row, col })
  }
  return res
}

export const BOARD_SIZE = 10
export const BOARD_COLS = BOARD_SIZE
export const BOARD_ROWS = BOARD_SIZE

/** Réserve (cadre, padding, bordures, traits SVG) pour que la grille tienne sans déborder. */
export const BOARD_CHROME_MARGIN_PX = 72

const PATH = buildSerpentinePath(BOARD_SIZE)

export function getTilePosition(index) {
  if (index < 0 || index >= TOTAL_TILES) return { row: BOARD_ROWS - 1, col: 0 }
  return PATH[index]
}

/**
 * ~8 échelles, ~7 serpents (indices 0–99 = cases 1–100).
 * Serpents : tête plus haute que la queue ; échelles : bas → haut.
 */
function buildTileSpecials() {
  const t = Array(TOTAL_TILES).fill(null)
  t[0] = S.DEPART
  t[99] = S.FIN

  const echelles = [
    [3, 13],
    [8, 30],
    [20, 41],
    [27, 83],
    [35, 43],
    [50, 66],
    [70, 90],
    [17, 54],
  ]
  for (const [i] of echelles) t[i] = S.ECHELLE

  const serpents = [
    [97, 77],
    [94, 74],
    [86, 23],
    [61, 18],
    [48, 10],
    [46, 25],
    [15, 5],
  ]
  for (const [i] of serpents) t[i] = S.SERPENT

  return t
}

export const TILE_SPECIAL_AT_INDEX = buildTileSpecials()

function buildSlideTargets() {
  const a = Array(TOTAL_TILES).fill(null)
  const echelles = [
    [3, 13],
    [8, 30],
    [20, 41],
    [27, 83],
    [35, 43],
    [50, 66],
    [70, 90],
    [17, 54],
  ]
  for (const [from, to] of echelles) a[from] = to
  const serpents = [
    [97, 77],
    [94, 74],
    [86, 23],
    [61, 18],
    [48, 10],
    [46, 25],
    [15, 5],
  ]
  for (const [from, to] of serpents) a[from] = to
  return a
}

export const SLIDE_TO_AT_INDEX = buildSlideTargets()

/** Segments SVG : échelles = rampe plutôt droite, serpents = courbe sinueuse. */
export function getSnakeLadderLinks() {
  const out = []
  for (let i = 0; i < TOTAL_TILES; i++) {
    const sp = TILE_SPECIAL_AT_INDEX[i]
    const to = SLIDE_TO_AT_INDEX[i]
    if (sp === S.ECHELLE && to != null) out.push({ from: i, to, kind: 'ladder' })
    if (sp === S.SERPENT && to != null) out.push({ from: i, to, kind: 'snake' })
  }
  return out
}

export const SPECIAL_TILE_LABEL = {
  [SPECIAL_TILE.DEPART]: 'Départ',
  [SPECIAL_TILE.FIN]: 'Arrivée',
  [SPECIAL_TILE.SERPENT]: '↓',
  [SPECIAL_TILE.ECHELLE]: '↑',
}

export const SPECIAL_TILE_ACCENT = {
  [SPECIAL_TILE.DEPART]: 'lime',
  [SPECIAL_TILE.FIN]: 'amber',
  [SPECIAL_TILE.SERPENT]: 'emerald',
  [SPECIAL_TILE.ECHELLE]: 'sky',
}

export const DICE_MIN = 1
export const DICE_MAX = 6
export const DUEL_PENALTY = 1

export const PLAYER_COLORS = ['#ff6ec7', '#5dffe1']
export const PLAYER_NAMES = ['Lou', 'Toi']

/** Animation du pion entre deux cases (reste inférieure à BOARD_STEP_MS en secondes). */
export const PAWN_MOVE_DURATION_SEC = 0.42
/** Pause entre chaque case (déplacement « à la main »). */
export const BOARD_STEP_MS = 500

export const PHASES = {
  START: 'START',
  ROLLING: 'ROLLING',
  MOVING: 'MOVING',
  QUESTION: 'QUESTION',
  DUEL: 'DUEL',
  RESULT: 'RESULT',
  GAME_OVER: 'GAME_OVER',
}
