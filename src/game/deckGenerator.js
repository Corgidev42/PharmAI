import { GoogleGenerativeAI } from '@google/generative-ai'
import { chunkText } from './pdfExtractor.js'
import { validateDeckData } from './deckLoader.js'

/** Modèles courants ; l’utilisateur peut aussi saisir un ID arbitraire (Google AI Studio). */
export const GEMINI_MODEL_PRESETS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (rapide)' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (qualité)' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite (léger)' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
]

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'

const SYSTEM_PROMPT = `Tu es un assistant pédagogique expert. À partir du contenu de cours fourni, tu génères des questions de révision au format JSON strict.

Règles :
- Génère un mélange de questions QCM (4 options, une seule bonne réponse) et OPEN (réponse courte attendue).
- Environ 65% QCM et 35% OPEN.
- Répartis les difficultés : ~30% difficulté 1 (facile), ~45% difficulté 2 (moyen), ~25% difficulté 3 (difficile).
- Les questions doivent couvrir les concepts clés du cours de manière variée.
- Pour les QCM, les distracteurs doivent être plausibles mais clairement faux.
- Pour les OPEN, la réponse doit être concise (1-2 phrases).
- Chaque carte doit inclure "explanation" : 1 à 3 phrases en français qui expliquent POURQUOI la bonne réponse est correcte (rappel du mécanisme, piège fréquent, ou lien avec le cours). Indispensable pour l’apprentissage après une erreur.
- Chaque question doit avoir un id unique (entier séquentiel).
- Si l'utilisateur fournit des consignes spécifiques pour ce document, applique-les en priorité (thèmes à privilégier, style, niveau, langue, interdits, proportion QCM/OPEN, etc.) tout en respectant le format JSON attendu.

Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de backticks, pas de texte avant ou après).`

function buildUserPrompt(text, count, theme, guideInstructions) {
  const guide = typeof guideInstructions === 'string' ? guideInstructions.trim() : ''
  const guideBlock = guide
    ? `Consignes spécifiques de l'utilisateur pour CE cours / CES documents (prioritaires lorsqu'elles précisent autre chose que les règles générales) :
"""
${guide}
"""

`
    : ''

  return `${guideBlock}Contenu du cours :
"""
${text}
"""

Génère exactement ${count} questions de révision sur le thème "${theme}".

Format JSON attendu (chaque carte a une clé "explanation" obligatoire) :
{
  "theme": "${theme}",
  "cards": [
    {
      "id": 1,
      "type": "QCM",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "B",
      "explanation": "Pourquoi B est correct et comment écarter les autres options.",
      "difficulty": 1
    },
    {
      "id": 2,
      "type": "OPEN",
      "question": "...",
      "answer": "...",
      "explanation": "Points clés à mentionner et erreurs fréquentes.",
      "difficulty": 2
    }
  ]
}`
}

function formatGeminiError(err) {
  if (!err) return 'Erreur inconnue'
  const any = err
  if (typeof any.message === 'string' && any.message) return any.message
  if (any.error?.message) return any.error.message
  if (Array.isArray(any.errorDetails)) {
    const parts = any.errorDetails.map((d) => d.message || JSON.stringify(d)).filter(Boolean)
    if (parts.length) return parts.join(' — ')
  }
  try {
    return JSON.stringify(any)
  } catch {
    return String(err)
  }
}

function normalizeParsedDeck(parsed, theme) {
  if (!parsed || typeof parsed !== 'object') return null
  if (Array.isArray(parsed.cards)) return parsed
  if (Array.isArray(parsed)) return { theme, cards: parsed }
  return null
}

/**
 * Génère un deck à partir du texte du cours via l’API Google Gemini.
 *
 * @param {object} params
 * @param {string} params.apiKey - Clé API Google AI (AI Studio)
 * @param {string} params.text - Texte extrait du cours
 * @param {string} params.theme - Nom du thème du deck
 * @param {number} [params.totalCards=20]
 * @param {string} params.model - ID du modèle Gemini (ex. gemini-2.5-flash)
 * @param {string} [params.guideInstructions] - Consignes libres pour guider l'IA sur ce PDF
 * @param {function} [params.onProgress]
 * @returns {Promise<{ success: boolean, data?: object, errors?: string[], warnings?: string[] }>}
 */
export async function generateDeck({
  apiKey,
  text,
  theme,
  totalCards = 20,
  model = DEFAULT_GEMINI_MODEL,
  guideInstructions = '',
  onProgress,
}) {
  const trimmedKey = (apiKey || '').trim()
  if (!trimmedKey) {
    return { success: false, errors: ['Clé API manquante. Ajoutez VITE_GOOGLE_AI_API_KEY dans .env ou saisissez la clé dans le formulaire.'] }
  }

  const trimmedText = (text || '').trim()
  if (!trimmedText) {
    return {
      success: false,
      errors: [
        'Aucun texte extrait du PDF (souvent : PDF scanné en image uniquement, ou protection du document). Essayez un PDF avec du texte sélectionnable, ou un autre fichier.',
      ],
    }
  }

  let chunks = chunkText(trimmedText, 10000)
  if (chunks.length === 0) chunks = [trimmedText.slice(0, 12000)]

  const genAI = new GoogleGenerativeAI(trimmedKey)
  const generativeModel = genAI.getGenerativeModel({
    model,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  })

  const cardsPerChunk = Math.ceil(totalCards / chunks.length)
  const allCards = []
  let nextId = 1
  const generationErrors = []

  for (let i = 0; i < chunks.length; i++) {
    onProgress?.({
      step: 'generating',
      current: i + 1,
      total: chunks.length,
      message: `Génération du lot ${i + 1}/${chunks.length}…`,
    })

    const needed = Math.min(cardsPerChunk, totalCards - allCards.length)
    if (needed <= 0) break

    try {
      const result = await generativeModel.generateContent(
        buildUserPrompt(chunks[i], needed, theme, guideInstructions)
      )
      const response = result.response
      const blockReason = response.promptFeedback?.blockReason
      if (blockReason) {
        throw new Error(`Gemini a bloqué la requête (${blockReason}). Reformulez le cours ou les consignes.`)
      }
      if (!response.candidates?.length) {
        throw new Error(
          'Réponse sans contenu (candidates vides). Vérifiez les quotas API, le modèle choisi, ou les restrictions de la clé (référents HTTP pour une clé navigateur).'
        )
      }

      let raw
      try {
        raw = response.text().trim()
      } catch (textErr) {
        throw new Error(
          `Impossible de lire le texte de la réponse : ${formatGeminiError(textErr)}. Cause fréquente : contenu filtré (SAFETY) ou fin de réponse tronquée.`
        )
      }

      if (!raw) {
        throw new Error('Réponse vide du modèle.')
      }

      let parsed
      try {
        parsed = JSON.parse(cleanJsonResponse(raw))
      } catch (parseErr) {
        const preview = raw.length > 400 ? `${raw.slice(0, 400)}…` : raw
        throw new Error(
          `JSON invalide renvoyé par le modèle : ${parseErr.message}. Début de réponse : ${preview}`
        )
      }

      const deckShape = normalizeParsedDeck(parsed, theme)
      if (!deckShape?.cards?.length) {
        throw new Error(
          'Le modèle n’a pas renvoyé de tableau "cards" exploitable. Essayez un autre modèle (ex. gemini-2.0-flash) ou réduisez le nombre de cartes par lot.'
        )
      }

      for (const card of deckShape.cards) {
        card.id = nextId++
        allCards.push(card)
      }
    } catch (err) {
      const msg = formatGeminiError(err)
      console.error(`Erreur chunk ${i + 1}:`, err)
      generationErrors.push(`Lot ${i + 1}/${chunks.length} : ${msg}`)
      onProgress?.({
        step: 'error',
        message: `Erreur sur le lot ${i + 1}: ${msg}`,
      })
    }
  }

  if (allCards.length === 0) {
    const detail = generationErrors.length
      ? generationErrors.join('\n')
      : 'Aucune erreur détaillée enregistrée (boucle non exécutée ?).'
    return {
      success: false,
      errors: [
        'Aucune carte générée. Détails ci-dessous :',
        detail,
        '',
        'Vérifications : clé valide sur https://aistudio.google.com/apikey, modèle disponible pour cette clé, quota non dépassé, et pour une clé « Applications web » : origine http://localhost:5173 autorisée.',
      ],
    }
  }

  const deck = { theme, cards: allCards.slice(0, totalCards) }
  deck.cards.forEach((c, i) => {
    c.id = i + 1
  })

  const validation = validateDeckData(deck)
  if (!validation.success) {
    const fixed = autoFixDeck(deck)
    const revalidation = validateDeckData(fixed)
    if (revalidation.success) return revalidation
    onProgress?.({ step: 'done', message: `${fixed.cards.length} cartes (avec avertissements)` })
    return { success: true, data: fixed, warnings: validation.errors }
  }

  onProgress?.({ step: 'done', message: `${deck.cards.length} cartes générées avec succès !` })
  return { success: true, data: deck }
}

function cleanJsonResponse(raw) {
  let cleaned = raw
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  }
  return cleaned
}

function autoFixDeck(deck) {
  const fixed = { ...deck, cards: [] }

  for (const card of deck.cards) {
    const c = { ...card }

    if (!c.type) c.type = Array.isArray(c.options) ? 'QCM' : 'OPEN'
    if (typeof c.difficulty !== 'number' || c.difficulty < 1 || c.difficulty > 3) c.difficulty = 2
    if (!c.question) continue

    if (c.type === 'QCM') {
      if (!Array.isArray(c.options) || c.options.length < 2) continue
      if (!c.options.includes(c.answer) && c.answer) {
        c.options[c.options.length - 1] = c.answer
      }
    }

    if (c.answer == null) continue
    if (c.explanation != null && typeof c.explanation !== 'string') delete c.explanation

    fixed.cards.push(c)
  }

  return fixed
}

export function downloadDeckAsJson(deck) {
  const json = JSON.stringify(deck, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `deck-${deck.theme.replace(/\s+/g, '-').toLowerCase()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
