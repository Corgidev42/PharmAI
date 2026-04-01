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
  const decks = useGameStore((s) => s.decks)
  const loadDeckForPlayer = useGameStore((s) => s.loadDeckForPlayer)
  const setDeckErrors = useGameStore((s) => s.setDeckErrors)
  const deckErrors = useGameStore((s) => s.deckErrors)

  const [showCreator, setShowCreator] = useState(false)
  const [geminiPlayerId, setGeminiPlayerId] = useState(0)

  const canStart = decks[0].cards.length > 0 && decks[1].cards.length > 0

  const loadSample = useCallback(async () => {
    const result = await loadDeckFromUrl('/deck.sample.json')
    if (result.success) {
      const data = result.data
      loadDeckForPlayer(0, { theme: data.theme, cards: [...data.cards] })
      loadDeckForPlayer(1, { theme: data.theme, cards: [...data.cards] })
    } else {
      setDeckErrors(result.errors)
    }
  }, [loadDeckForPlayer, setDeckErrors])

  const openGemini = (playerId) => {
    setGeminiPlayerId(playerId)
    setShowCreator(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="relative w-full max-w-lg glass-candy p-8 border-2 border-pink-400/30 shadow-neon-pink">
        <SnakeDecor className="opacity-60" />
        <div className="relative z-[1] space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl title-candy">PharmAI</h1>
            <p className="text-pink-200/80 text-sm font-semibold">
              Chaque joueur importe son deck : aux questions de ton tour, c’est ton paquet qui est pioché.
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

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-cyan-200/90">Decks de révision</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DeckImporter playerId={0} />
              <DeckImporter playerId={1} />
            </div>

            {deckErrors && (
              <div className="px-3 py-2 rounded-lg bg-rose-900/20 border border-rose-700/30 space-y-1">
                {deckErrors.map((err, i) => (
                  <p key={i} className="text-sm text-rose-300">
                    • {err}
                  </p>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={loadSample}
                className="flex-1 min-w-[140px] text-xs font-bold text-cyan-200 py-2.5 rounded-2xl border-2 border-cyan-400/35
                  hover:bg-cyan-500/10 hover:shadow-neon-cyan transition-all"
              >
                Exemple (les deux decks)
              </button>
              <button
                onClick={() => openGemini(0)}
                className="flex-1 min-w-[140px] py-2.5 rounded-2xl text-xs font-bold transition-all
                  bg-gradient-to-r from-fuchsia-600/40 to-violet-600/40
                  border-2 border-fuchsia-400/40 text-fuchsia-100
                  hover:from-fuchsia-500/50 hover:to-violet-500/50 shadow-neon-fuchsia"
              >
                Gemini — {players[0].name}
              </button>
              <button
                onClick={() => openGemini(1)}
                className="flex-1 min-w-[140px] py-2.5 rounded-2xl text-xs font-bold transition-all
                  bg-gradient-to-r from-cyan-600/35 to-teal-600/35
                  border-2 border-cyan-400/40 text-cyan-100
                  hover:from-cyan-500/45 hover:to-teal-500/45"
              >
                Gemini — {players[1].name}
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
            {canStart ? 'C’est parti !' : 'Importe un deck pour chaque joueur'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCreator && (
          <DeckCreator
            playerId={geminiPlayerId}
            onClose={() => setShowCreator(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
