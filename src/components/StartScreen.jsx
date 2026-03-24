import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { loadDeckFromUrl } from '../game/deckLoader'
import DeckImporter from './DeckImporter'
import DeckCreator from './DeckCreator'

export default function StartScreen() {
  const players = useGameStore((s) => s.players)
  const setPlayerName = useGameStore((s) => s.setPlayerName)
  const startGame = useGameStore((s) => s.startGame)
  const deckCount = useGameStore((s) => s.deck.cards.length)
  const loadDeck = useGameStore((s) => s.loadDeck)
  const setDeckErrors = useGameStore((s) => s.setDeckErrors)

  const [showCreator, setShowCreator] = useState(false)

  const loadSample = useCallback(async () => {
    const result = await loadDeckFromUrl('/deck.sample.json')
    if (result.success) {
      loadDeck(result.data)
    } else {
      setDeckErrors(result.errors)
    }
  }, [loadDeck, setDeckErrors])

  const canStart = deckCount > 0

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-amber-400 bg-clip-text text-transparent">
            PharmAI
          </h1>
          <p className="text-gray-400 text-sm">Jeu de plateau de révision</p>
        </div>

        {/* Player names */}
        <div className="space-y-3">
          {players.map((player) => (
            <div key={player.id} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: player.color }}
              />
              <input
                type="text"
                value={player.name}
                onChange={(e) => setPlayerName(player.id, e.target.value)}
                placeholder={`Joueur ${player.id + 1}`}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800/60 border border-gray-700
                  text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-500
                  transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Deck section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-300">Deck de questions</h2>
          <DeckImporter />

          <div className="flex gap-2">
            <button
              onClick={loadSample}
              className="flex-1 text-xs text-gray-500 hover:text-gray-300 transition-colors py-2
                rounded-lg border border-gray-800 hover:border-gray-700"
            >
              Deck d'exemple
            </button>
            <button
              onClick={() => setShowCreator(true)}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition-all
                bg-gradient-to-r from-violet-600/20 to-indigo-600/20
                border border-violet-500/30 text-violet-300
                hover:from-violet-600/30 hover:to-indigo-600/30 hover:border-violet-500/50"
            >
              Créer via Gemini (PDF)
            </button>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startGame}
          disabled={!canStart}
          className={`w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all
            ${
              canStart
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/20'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
        >
          {canStart ? 'Commencer la partie' : 'Importez un deck pour commencer'}
        </button>
      </div>

      {/* Deck Creator Modal */}
      <AnimatePresence>
        {showCreator && <DeckCreator onClose={() => setShowCreator(false)} />}
      </AnimatePresence>
    </div>
  )
}
