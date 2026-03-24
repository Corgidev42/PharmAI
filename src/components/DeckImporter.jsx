import { useRef, useState, useCallback } from 'react'
import { useGameStore } from '../store/useGameStore'
import { loadDeckFromFile } from '../game/deckLoader'

export default function DeckImporter() {
  const loadDeck = useGameStore((s) => s.loadDeck)
  const setDeckErrors = useGameStore((s) => s.setDeckErrors)
  const deckErrors = useGameStore((s) => s.deckErrors)
  const deckTheme = useGameStore((s) => s.deck.theme)
  const deckCount = useGameStore((s) => s.deck.cards.length)

  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  const processFile = useCallback(async (file) => {
    if (!file) return
    setLoading(true)
    setDeckErrors(null)

    const result = await loadDeckFromFile(file)
    if (result.success) {
      loadDeck(result.data)
    } else {
      setDeckErrors(result.errors)
    }
    setLoading(false)
  }, [loadDeck, setDeckErrors])

  const handleFileChange = (e) => processFile(e.target.files?.[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files?.[0])
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed
          cursor-pointer transition-colors ${
            dragging
              ? 'border-indigo-400 bg-indigo-500/10'
              : 'border-gray-600 bg-gray-800/40 hover:bg-gray-800/60 hover:border-gray-500'
          }`}
      >
        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-sm text-gray-400">
          {loading ? 'Chargement...' : 'Glissez un fichier deck.json ou cliquez pour importer'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {deckTheme && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-900/20 border border-emerald-700/30">
          <span className="text-emerald-400 text-sm">✓</span>
          <p className="text-sm text-emerald-300">
            <span className="font-semibold">{deckTheme}</span> &mdash; {deckCount} cartes chargées
          </p>
        </div>
      )}

      {deckErrors && (
        <div className="px-3 py-2 rounded-lg bg-rose-900/20 border border-rose-700/30 space-y-1">
          {deckErrors.map((err, i) => (
            <p key={i} className="text-sm text-rose-300">• {err}</p>
          ))}
        </div>
      )}
    </div>
  )
}
