import { useRef, useState, useCallback } from 'react'
import { useGameStore } from '../store/useGameStore'
import { loadDeckFromFile } from '../game/deckLoader'

export default function DeckImporter({ playerId }) {
  const loadDeckForPlayer = useGameStore((s) => s.loadDeckForPlayer)
  const setDeckErrors = useGameStore((s) => s.setDeckErrors)
  const playerName = useGameStore((s) => s.players[playerId]?.name ?? `Joueur ${playerId + 1}`)
  const deckTheme = useGameStore((s) => s.decks[playerId]?.theme ?? '')
  const deckCount = useGameStore((s) => s.decks[playerId]?.cards?.length ?? 0)

  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  const processFile = useCallback(
    async (file) => {
      if (!file) return
      setLoading(true)
      setDeckErrors(null)

      const result = await loadDeckFromFile(file)
      if (result.success) {
        loadDeckForPlayer(playerId, result.data)
      } else {
        setDeckErrors(result.errors)
      }
      setLoading(false)
    },
    [loadDeckForPlayer, playerId, setDeckErrors]
  )

  const handleFileChange = (e) => processFile(e.target.files?.[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files?.[0])
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-cyan-200/80">Deck de {playerName}</p>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed
          cursor-pointer transition-all ${
            dragging
              ? 'border-pink-400 bg-pink-500/15 shadow-neon-pink'
              : 'border-cyan-400/40 bg-purple-950/40 hover:bg-fuchsia-950/30 hover:border-pink-400/50'
          }`}
      >
        <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-xs text-gray-400 text-center px-2">
          {loading ? 'Chargement...' : 'JSON ou clic pour importer'}
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
          <p className="text-xs text-emerald-300">
            <span className="font-semibold">{deckTheme}</span> — {deckCount} carte{deckCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
