import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { extractTextFromMultiplePDFs } from '../game/pdfExtractor'
import {
  generateDeck,
  downloadDeckAsJson,
  GEMINI_MODEL_PRESETS,
  DEFAULT_GEMINI_MODEL,
} from '../game/deckGenerator'
import { useGameStore } from '../store/useGameStore'

const STEPS = ['upload', 'config', 'generating', 'preview']

const API_KEY_STORAGE = 'pharmai_gemini_key'
const MODEL_PRESET_STORAGE = 'pharmai_gemini_model_preset'
const CUSTOM_MODEL_STORAGE = 'pharmai_gemini_model_custom'

const CUSTOM_MODEL_VALUE = '__custom__'

/** Clé fournie au build par Vite (.env), sans persistance localStorage. */
const ENV_API_KEY = (import.meta.env.VITE_GOOGLE_AI_API_KEY || '').trim()

function getStoredKey() {
  try { return localStorage.getItem(API_KEY_STORAGE) || '' } catch { return '' }
}

function storeKey(key) {
  try { localStorage.setItem(API_KEY_STORAGE, key) } catch { /* noop */ }
}

function getStoredModelPreset() {
  try {
    const v = localStorage.getItem(MODEL_PRESET_STORAGE)
    if (v && (GEMINI_MODEL_PRESETS.some((p) => p.id === v) || v === CUSTOM_MODEL_VALUE)) return v
  } catch { /* noop */ }
  return DEFAULT_GEMINI_MODEL
}

function getStoredCustomModel() {
  try { return localStorage.getItem(CUSTOM_MODEL_STORAGE) || '' } catch { return '' }
}

function storeModelPrefs(preset, customId) {
  try {
    localStorage.setItem(MODEL_PRESET_STORAGE, preset)
    if (preset === CUSTOM_MODEL_VALUE) localStorage.setItem(CUSTOM_MODEL_STORAGE, customId)
  } catch { /* noop */ }
}

function resolveModelId(preset, customId) {
  if (preset === CUSTOM_MODEL_VALUE) return customId.trim()
  return preset
}

export default function DeckCreator({ onClose, playerId = 0 }) {
  const loadDeckForPlayer = useGameStore((s) => s.loadDeckForPlayer)
  const playerName = useGameStore((s) => s.players[playerId]?.name ?? `Joueur ${playerId + 1}`)

  const [step, setStep] = useState('upload')
  const [files, setFiles] = useState([])
  const [extractedText, setExtractedText] = useState('')
  const [extractInfo, setExtractInfo] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState(null)

  // Config (localStorage prioritaire sur .env pour permettre de surcharger sans redémarrer)
  const [apiKey, setApiKey] = useState(() => getStoredKey() || ENV_API_KEY)
  const [theme, setTheme] = useState('')
  const [cardCount, setCardCount] = useState(20)
  const [modelPreset, setModelPreset] = useState(getStoredModelPreset)
  const [customModelId, setCustomModelId] = useState(getStoredCustomModel)
  /** Consignes libres pour guider Gemini sur ce lot de PDF (non persistées). */
  const [guideInstructions, setGuideInstructions] = useState('')

  // Generation
  const [progress, setProgress] = useState(null)
  const [genError, setGenError] = useState(null)

  // Preview
  const [generatedDeck, setGeneratedDeck] = useState(null)
  const [warnings, setWarnings] = useState(null)

  const fileInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  // --- Upload step ---
  const handleFiles = useCallback(async (newFiles) => {
    const pdfs = Array.from(newFiles).filter(
      (f) => f.type === 'application/pdf' || f.name.endsWith('.pdf')
    )
    if (pdfs.length === 0) return
    setFiles(pdfs)
    setExtracting(true)
    setExtractError(null)

    try {
      const result = await extractTextFromMultiplePDFs(pdfs)
      setExtractedText(result.text)
      setExtractInfo(result)
      setGuideInstructions('')
      if (!theme) setTheme(pdfs[0].name.replace(/\.pdf$/i, ''))
      setStep('config')
    } catch (err) {
      setExtractError(err.message || 'Erreur lors de l\'extraction du PDF')
    } finally {
      setExtracting(false)
    }
  }, [theme])

  // --- Generation step ---
  const handleGenerate = useCallback(async () => {
    if (!apiKey.trim()) return
    const model = resolveModelId(modelPreset, customModelId)
    if (!model) return
    storeKey(apiKey)
    storeModelPrefs(modelPreset, customModelId)
    setStep('generating')
    setGenError(null)
    setProgress(null)

    try {
      const result = await generateDeck({
        apiKey,
        text: extractedText,
        theme,
        totalCards: cardCount,
        model,
        guideInstructions,
        onProgress: setProgress,
      })

      if (result.success) {
        setGeneratedDeck(result.data)
        setWarnings(result.warnings || null)
        setStep('preview')
      } else {
        setGenError(result.errors.join('\n'))
        setStep('config')
      }
    } catch (err) {
      setGenError(err.message)
      setStep('config')
    }
  }, [apiKey, extractedText, theme, cardCount, modelPreset, customModelId, guideInstructions])

  // --- Preview actions ---
  const handleLoadInGame = useCallback(() => {
    if (generatedDeck) {
      loadDeckForPlayer(playerId, generatedDeck)
      onClose()
    }
  }, [generatedDeck, loadDeckForPlayer, playerId, onClose])

  const handleDownload = useCallback(() => {
    if (generatedDeck) downloadDeckAsJson(generatedDeck)
  }, [generatedDeck])

  const handleDeleteCard = useCallback((cardId) => {
    setGeneratedDeck((prev) => {
      if (!prev) return prev
      const cards = prev.cards.filter((c) => c.id !== cardId)
      cards.forEach((c, i) => { c.id = i + 1 })
      return { ...prev, cards }
    })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-purple-950/80 backdrop-blur-md p-2 sm:p-3"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="flex h-[100dvh] max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border-2 border-pink-400/35 bg-gradient-to-b from-purple-950/98 to-fuchsia-950/40 shadow-neon-pink"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-pink-400/20 px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h2 className="text-lg font-extrabold title-candy">Deck Gemini</h2>
            <p className="text-xs text-pink-200/70 mt-0.5">
              Pour <span className="font-semibold text-cyan-200">{playerName}</span> — PDF → questions
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex shrink-0 gap-2 px-4 pt-3 sm:px-6 sm:pt-4">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                STEPS.indexOf(step) >= i ? 'bg-indigo-500' : 'bg-gray-800'
              }`}
            />
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {/* UPLOAD */}
            {step === 'upload' && (
              <motion.div
                key="upload"
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <UploadStep
                  fileInputRef={fileInputRef}
                  dragging={dragging}
                  setDragging={setDragging}
                  handleFiles={handleFiles}
                  extracting={extracting}
                  extractError={extractError}
                  files={files}
                />
              </motion.div>
            )}

            {/* CONFIG */}
            {step === 'config' && (
              <motion.div
                key="config"
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ConfigStep
                  extractInfo={extractInfo}
                  apiKey={apiKey}
                  setApiKey={setApiKey}
                  theme={theme}
                  setTheme={setTheme}
                  guideInstructions={guideInstructions}
                  setGuideInstructions={setGuideInstructions}
                  cardCount={cardCount}
                  setCardCount={setCardCount}
                  modelPreset={modelPreset}
                  setModelPreset={setModelPreset}
                  customModelId={customModelId}
                  setCustomModelId={setCustomModelId}
                  onGenerate={handleGenerate}
                  onBack={() => setStep('upload')}
                  genError={genError}
                />
              </motion.div>
            )}

            {/* GENERATING */}
            {step === 'generating' && (
              <motion.div
                key="generating"
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GeneratingStep progress={progress} />
              </motion.div>
            )}

            {/* PREVIEW */}
            {step === 'preview' && generatedDeck && (
              <motion.div
                key="preview"
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <PreviewStep
                  deck={generatedDeck}
                  warnings={warnings}
                  onLoadInGame={handleLoadInGame}
                  onDownload={handleDownload}
                  onDeleteCard={handleDeleteCard}
                  onRegenerate={() => setStep('config')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============================================================
// Sub-components for each step
// ============================================================

function UploadStep({ fileInputRef, dragging, setDragging, handleFiles, extracting, extractError, files }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <p className="shrink-0 text-xs text-gray-400 sm:text-sm">
        Importez un ou plusieurs fichiers PDF de cours. Le texte sera extrait puis envoyé à Google Gemini pour générer des questions.
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 sm:gap-3 sm:p-8
          cursor-pointer transition-all ${
            dragging
              ? 'border-indigo-400 bg-indigo-500/10'
              : 'border-gray-600 bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-500'
          }`}
      >
        {extracting ? (
          <>
            <Spinner />
            <p className="text-sm text-gray-300">Extraction du texte en cours...</p>
          </>
        ) : (
          <>
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m3 0l-3-3m3 3l-3 3M.75 3.375c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125V1.5A1.125 1.125 0 0019.125.375H1.875A1.125 1.125 0 00.75 1.5v1.875z"
              />
            </svg>
            <div className="text-center">
              <p className="text-sm text-gray-300">Glissez vos fichiers PDF ici</p>
              <p className="text-xs text-gray-500 mt-1">ou cliquez pour sélectionner</p>
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {files.length > 0 && !extracting && (
        <div className="text-xs text-gray-500">
          {files.map((f) => f.name).join(', ')}
        </div>
      )}

      {extractError && (
        <div className="px-3 py-2 rounded-lg bg-rose-900/20 border border-rose-700/30">
          <p className="text-sm text-rose-300">{extractError}</p>
        </div>
      )}
    </div>
  )
}

function ConfigStep({
  extractInfo,
  apiKey,
  setApiKey,
  theme,
  setTheme,
  guideInstructions,
  setGuideInstructions,
  cardCount,
  setCardCount,
  modelPreset,
  setModelPreset,
  customModelId,
  setCustomModelId,
  onGenerate,
  onBack,
  genError,
}) {
  const effectiveModel = resolveModelId(modelPreset, customModelId)
  const canGenerate =
    apiKey.trim().length > 10 &&
    theme.trim().length > 0 &&
    effectiveModel.length > 0

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden sm:gap-3">
      {extractInfo && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-900/20 border border-emerald-700/30">
          <span className="text-emerald-400 text-sm">&#10003;</span>
          <p className="text-sm text-emerald-300">
            {extractInfo.totalPages} pages extraites depuis {extractInfo.fileNames.length} fichier{extractInfo.fileNames.length > 1 ? 's' : ''}
            {' '}({(extractInfo.text.length / 1000).toFixed(1)}k caractères)
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-400">Clé API Google AI (Gemini)</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Obtenez une clé sur aistudio.google.com"
          className="w-full px-4 py-2.5 rounded-lg bg-gray-800/60 border border-gray-700
            text-gray-100 placeholder-gray-600 text-sm focus:outline-none focus:border-gray-500 transition-colors"
        />
        <p className="text-xs text-gray-600">
          {ENV_API_KEY
            ? 'Préremplie depuis .env (VITE_GOOGLE_AI_API_KEY). Vous pouvez la remplacer ici ; sinon elle est aussi sauvegardée dans le navigateur après génération.'
            : 'Vous pouvez définir VITE_GOOGLE_AI_API_KEY dans un fichier .env (voir .env.example). Sinon, collez la clé ici ; elle est stockée localement dans le navigateur.'}
          {' '}Envoyée uniquement aux serveurs Google pour la génération.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-400">Thème du deck</label>
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Ex: Pharmacologie Générale"
          className="w-full px-4 py-2.5 rounded-lg bg-gray-800/60 border border-gray-700
            text-gray-100 placeholder-gray-600 text-sm focus:outline-none focus:border-gray-500 transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-medium text-gray-400">
            Consignes pour ce cours (optionnel)
          </label>
          <span className="text-[10px] text-gray-600 tabular-nums">
            {guideInstructions.length}/6000
          </span>
        </div>
        <textarea
          value={guideInstructions}
          onChange={(e) => setGuideInstructions(e.target.value.slice(0, 6000))}
          rows={2}
          placeholder={`Exemples :\n• Insister sur le chapitre 3…\n• Niveau L2, pas de calculs.`}
          className="max-h-20 min-h-[3.25rem] w-full resize-none overflow-y-auto rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-xs leading-relaxed text-gray-100 placeholder-gray-600 focus:border-violet-500/50 focus:outline-none"
        />
        <p className="text-xs text-gray-600">
          Ces règles s’appliquent uniquement à la génération liée aux PDF importés ci-dessus ; elles sont envoyées à Gemini en plus du texte extrait.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-400">Modèle Gemini</label>
        <select
          value={modelPreset}
          onChange={(e) => setModelPreset(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-gray-800/60 border border-gray-700
            text-gray-100 text-sm focus:outline-none focus:border-gray-500 transition-colors"
        >
          {GEMINI_MODEL_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
          <option value={CUSTOM_MODEL_VALUE}>Autre (ID personnalisé)</option>
        </select>
        {modelPreset === CUSTOM_MODEL_VALUE && (
          <input
            type="text"
            value={customModelId}
            onChange={(e) => setCustomModelId(e.target.value)}
            placeholder="ex: gemini-2.5-flash-preview-05-20"
            className="w-full px-4 py-2.5 rounded-lg bg-gray-800/60 border border-gray-700
              text-gray-100 placeholder-gray-600 text-sm focus:outline-none focus:border-gray-500 transition-colors"
          />
        )}
        <p className="text-xs text-gray-600">
          Modèle utilisé : <span className="text-gray-400 font-mono">{effectiveModel || '—'}</span>
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-400">Nombre de cartes</label>
        <input
          type="number"
          min={5}
          max={50}
          value={cardCount}
          onChange={(e) => setCardCount(Math.max(5, Math.min(50, parseInt(e.target.value) || 20)))}
          className="w-full px-4 py-2.5 rounded-lg bg-gray-800/60 border border-gray-700
            text-gray-100 text-sm focus:outline-none focus:border-gray-500 transition-colors"
        />
      </div>

      {genError && (
        <div className="px-3 py-2 rounded-lg bg-rose-900/20 border border-rose-700/30">
          <p className="text-sm text-rose-300">{genError}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-lg border border-gray-700 text-gray-400
            text-sm hover:bg-gray-800 transition-colors"
        >
          Retour
        </button>
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all
            ${canGenerate
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
        >
          Générer les questions
        </button>
      </div>
    </div>
  )
}

function GeneratingStep({ progress }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <Spinner size="lg" />
      <div className="text-center space-y-2">
        <p className="text-gray-200 font-medium">Génération en cours...</p>
        {progress && (
          <p className="text-sm text-gray-400">{progress.message}</p>
        )}
        {progress?.total > 1 && (
          <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden mx-auto mt-3">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${((progress.current || 0) / progress.total) * 100}%` }}
            />
          </div>
        )}
      </div>
      <p className="text-xs text-gray-600 max-w-xs text-center">
        Gemini analyse votre cours et génère des questions variées. Cela peut prendre 15 à 90 secondes selon le modèle.
      </p>
    </div>
  )
}

function PreviewStep({ deck, warnings, onLoadInGame, onDownload, onDeleteCard, onRegenerate }) {
  const [expandedCard, setExpandedCard] = useState(null)

  const qcmCount = deck.cards.filter((c) => c.type === 'QCM').length
  const openCount = deck.cards.filter((c) => c.type === 'OPEN').length
  const diffCounts = [1, 2, 3].map((d) => deck.cards.filter((c) => c.difficulty === d).length)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      {/* Stats */}
      <div className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-lg bg-gray-800/50 px-2 py-1.5 text-center sm:px-3 sm:py-2">
          <p className="text-base font-bold text-gray-100 sm:text-lg">{deck.cards.length}</p>
          <p className="text-[10px] text-gray-500 sm:text-xs">cartes</p>
        </div>
        <div className="rounded-lg bg-gray-800/50 px-2 py-1.5 text-center sm:px-3 sm:py-2">
          <p className="text-base font-bold text-indigo-400 sm:text-lg">{qcmCount}</p>
          <p className="text-[10px] text-gray-500 sm:text-xs">QCM</p>
        </div>
        <div className="rounded-lg bg-gray-800/50 px-2 py-1.5 text-center sm:px-3 sm:py-2">
          <p className="text-base font-bold text-amber-400 sm:text-lg">{openCount}</p>
          <p className="text-[10px] text-gray-500 sm:text-xs">Ouvertes</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap justify-center gap-x-2 gap-y-0.5 text-[10px] text-gray-500 sm:text-xs">
        <span>Facile: {diffCounts[0]}</span>
        <span>·</span>
        <span>Moyen: {diffCounts[1]}</span>
        <span>·</span>
        <span>Difficile: {diffCounts[2]}</span>
      </div>

      {warnings && (
        <div className="shrink-0 rounded-lg border border-amber-700/30 bg-amber-900/20 px-2 py-1.5 sm:px-3 sm:py-2">
          <p className="text-[10px] text-amber-300 sm:text-xs">Certaines cartes ont été auto-corrigées.</p>
        </div>
      )}

      {/* Card list — sans défilement : aperçu tronqué */}
      <div className="min-h-0 flex-1 space-y-1.5 overflow-hidden pr-0.5">
        {deck.cards.map((card) => (
          <div
            key={card.id}
            className="rounded-lg border border-gray-700/30 bg-gray-800/40 px-2 py-1.5 transition-colors hover:bg-gray-800/60 sm:px-3 sm:py-2"
          >
            <div className="flex items-start gap-1.5 sm:gap-2">
              <span className={`mt-0.5 shrink-0 rounded px-1 py-0.5 text-[9px] font-bold sm:text-[10px] ${
                card.type === 'QCM' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {card.type}
              </span>
              <p
                className="line-clamp-2 flex-1 cursor-pointer text-[11px] text-gray-200 sm:text-sm"
                onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
              >
                {card.question}
              </p>
              <span className="text-[10px] text-gray-500 shrink-0">
                {'★'.repeat(card.difficulty)}{'☆'.repeat(3 - card.difficulty)}
              </span>
              <button
                onClick={() => onDeleteCard(card.id)}
                className="text-gray-600 hover:text-rose-400 transition-colors shrink-0 ml-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <AnimatePresence>
              {expandedCard === card.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 pt-2 border-t border-gray-700/30 text-xs text-gray-400 space-y-1">
                    {card.type === 'QCM' && card.options && (
                      <div className="space-y-0.5">
                        {card.options.map((opt, i) => (
                          <p key={i} className={opt === card.answer ? 'text-emerald-400 font-medium' : ''}>
                            {opt === card.answer ? '✓ ' : '  '}{opt}
                          </p>
                        ))}
                      </div>
                    )}
                    {card.type === 'OPEN' && (
                      <p><span className="text-gray-500">Réponse :</span> {card.answer}</p>
                    )}
                    {card.explanation && (
                      <p className="text-gray-500">
                        <span className="font-semibold text-gray-400">Explication :</span> {card.explanation}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-wrap gap-2 pt-1 sm:gap-3 sm:pt-2">
        <button
          onClick={onRegenerate}
          className="px-4 py-2.5 rounded-lg border border-gray-700 text-gray-400
            text-sm hover:bg-gray-800 transition-colors"
        >
          Regénérer
        </button>
        <button
          onClick={onDownload}
          className="px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300
            text-sm hover:bg-gray-800 transition-colors"
        >
          Télécharger JSON
        </button>
        <button
          onClick={onLoadInGame}
          className="flex-1 py-2.5 rounded-lg font-semibold text-sm
            bg-gradient-to-r from-emerald-600 to-emerald-500 text-white
            hover:from-emerald-500 hover:to-emerald-400 transition-all
            shadow-lg shadow-emerald-500/20"
        >
          Charger dans le jeu
        </button>
      </div>
    </div>
  )
}

function Spinner({ size = 'md' }) {
  const dim = size === 'lg' ? 'w-10 h-10' : 'w-5 h-5'
  return (
    <div className={`${dim} border-2 border-gray-600 border-t-indigo-400 rounded-full animate-spin`} />
  )
}
