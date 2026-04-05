const VALID_TYPES = ['QCM', 'OPEN']

function validateCard(card, index) {
  const errors = []
  const prefix = `Carte #${index + 1}`

  if (card.id == null) errors.push(`${prefix}: champ "id" manquant`)
  if (!VALID_TYPES.includes(card.type)) errors.push(`${prefix}: "type" doit être QCM ou OPEN`)
  if (typeof card.question !== 'string' || !card.question.trim()) errors.push(`${prefix}: "question" manquante`)
  if (card.answer == null) errors.push(`${prefix}: "answer" manquante`)
  if (typeof card.difficulty !== 'number' || card.difficulty < 1 || card.difficulty > 3)
    errors.push(`${prefix}: "difficulty" doit être 1, 2 ou 3`)
  if (card.explanation != null && typeof card.explanation !== 'string')
    errors.push(`${prefix}: "explanation" doit être une chaîne si présente`)

  if (card.type === 'QCM') {
    if (!Array.isArray(card.options) || card.options.length < 2)
      errors.push(`${prefix}: QCM doit avoir au moins 2 options`)
    else if (!card.options.includes(card.answer))
      errors.push(`${prefix}: la réponse QCM doit être dans les options`)
  }

  return errors
}

export function parseDeck(jsonString) {
  let data
  try {
    data = JSON.parse(jsonString)
  } catch {
    return { success: false, errors: ['JSON invalide'] }
  }
  return validateDeckData(data)
}

export function validateDeckData(data) {
  const errors = []

  if (typeof data.theme !== 'string' || !data.theme.trim())
    errors.push('"theme" manquant ou vide')

  if (!Array.isArray(data.cards) || data.cards.length === 0)
    errors.push('"cards" doit être un tableau non vide')

  if (errors.length > 0) return { success: false, errors }

  for (let i = 0; i < data.cards.length; i++) {
    errors.push(...validateCard(data.cards[i], i))
  }

  if (errors.length > 0) return { success: false, errors }

  return { success: true, data }
}

export async function loadDeckFromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(parseDeck(e.target.result))
    reader.onerror = () => resolve({ success: false, errors: ['Impossible de lire le fichier'] })
    reader.readAsText(file)
  })
}

export async function loadDeckFromUrl(url) {
  try {
    const res = await fetch(url)
    const text = await res.text()
    return parseDeck(text)
  } catch {
    return { success: false, errors: [`Impossible de charger ${url}`] }
  }
}
