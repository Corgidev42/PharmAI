/**
 * Mélange déterministe (reproductible) pour éviter que la bonne réponse
 * reste toujours au même endroit dans la grille, tout en restant stable
 * entre les re-rendus React (Strict Mode).
 */
export function shuffleWithSeed(items, seed) {
  if (!Array.isArray(items) || items.length < 2) return [...(items || [])]
  const arr = [...items]
  let x = Number(seed) >>> 0
  if (x === 0) x = 2463534242
  const next = () => {
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    return (x >>> 0) / 4294967296
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Entier dérivé de la carte pour grainer le mélange des options. */
export function seedForCardOptions(card) {
  const id = Number(card?.id) || 0
  const q = typeof card?.question === 'string' ? card.question : ''
  let h = id * 1315423911
  for (let i = 0; i < q.length; i++) {
    h = Math.imul(h ^ q.charCodeAt(i), 2654435761)
  }
  return h >>> 0
}

/** Mélange aléatoire (Fisher–Yates) — ordre des cartes du deck au début de chaque partie. */
export function shuffleArrayRandom(items) {
  if (!Array.isArray(items) || items.length < 2) return [...(items || [])]
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
