/**
 * Ajoute une clé "explanation" à chaque carte des decks listés si elle est absente.
 * Usage : node scripts/fill-deck-explanations.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const FILES = [
  'public/deck.sample.json',
  'public/lou/physiologie.json',
  'public/lou/botanique generale.json',
  'public/moi/bsq.json',
  'public/moi/qt_qml.json',
  'public/moi/life.json',
]

function defaultExplanation(card) {
  const ans = String(card.answer ?? '').trim()
  if (card.type === 'QCM') {
    return `La bonne réponse est « ${ans} ». Les autres options sont des distracteurs plausibles : compare-les au cours pour mémoriser les distinctions (mécanisme, définition, ordre de grandeur).`
  }
  return `Réponse-type attendue : ${ans}. Complète avec les exemples ou nuances vus dans ta fiche si l’énoncé le demande.`
}

for (const rel of FILES) {
  const path = join(root, rel)
  let raw
  try {
    raw = readFileSync(path, 'utf8')
  } catch (e) {
    console.warn('Skip (missing):', rel)
    continue
  }
  const data = JSON.parse(raw)
  if (!Array.isArray(data.cards)) {
    console.warn('Skip (no cards):', rel)
    continue
  }
  let n = 0
  for (const c of data.cards) {
    if (c.explanation != null && String(c.explanation).trim()) continue
    c.explanation = defaultExplanation(c)
    n++
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(rel, '→', n, 'carte(s) complétée(s)')
}
