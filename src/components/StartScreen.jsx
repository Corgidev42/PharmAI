import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { loadDeckFromUrl } from '../game/deckLoader'
import DeckImporter from './DeckImporter'
import DeckCreator from './DeckCreator'
import SnakeDecor from './SnakeDecor'

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
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="relative w-full max-w-md glass-candy p-8 border-2 border-pink-400/30 shadow-neon-pink">
        <SnakeDecor className="opacity-60" />
        <div className="relative z-[1] space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl title-candy">PharmAI</h1>
            <p className="text-pink-200/80 text-sm font-semibold">
              Réviser en s’amusant · plateau néon · fées & serpents
            </p>
          </div>

          <div className="space-y-3">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full shrink-0 shadow-neon-pink ring-2 ring-white/30"
                  style={{ backgroundColor: player.color }}
                />
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => setPlayerName(player.id, e.target.value)}
                  placeholder={`Joueur ${player.id + 1}`}
                  className="flex-1 px-4 py-3 rounded-2xl bg-purple-950/60 border-2 border-cyan-400/25
                    text-white placeholder-pink-300/40 text-sm focus:outline-none focus:border-pink-400/50
                    focus:shadow-neon-cyan transition-all"
                />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-cyan-200/90">Deck de questions</h2>
            <DeckImporter />

            <div className="flex gap-2">
              <button
                onClick={loadSample}
                className="flex-1 text-xs font-bold text-cyan-200 py-2.5 rounded-2xl border-2 border-cyan-400/35
                  hover:bg-cyan-500/10 hover:shadow-neon-cyan transition-all"
              >
                Deck d’exemple
              </button>
              <button
                onClick={() => setShowCreator(true)}
                className="flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all
                  bg-gradient-to-r from-fuchsia-600/40 to-violet-600/40
                  border-2 border-fuchsia-400/40 text-fuchsia-100
                  hover:from-fuchsia-500/50 hover:to-violet-500/50 shadow-neon-fuchsia"
              >
                Gemini + PDF
              </button>
            </div>
          </div>

          <button
            onClick={startGame}
            disabled={!canStart}
            className={`w-full py-4 rounded-2xl font-extrabold text-sm tracking-wide transition-all
              ${
                canStart
                  ? 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-cyan-400 text-white shadow-neon-pink hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-purple-950/80 text-pink-300/40 cursor-not-allowed border border-pink-500/20'
              }`}
          >
            {canStart ? 'C’est parti !' : 'Importe un deck pour jouer'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCreator && <DeckCreator onClose={() => setShowCreator(false)} />}
      </AnimatePresence>
    </div>
  )
}
