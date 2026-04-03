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
    <div className="flex min-h-[100dvh] w-full max-w-[100vw] flex-col overflow-x-hidden overflow-y-auto pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)] [scrollbar-gutter:stable]">
      {/* sm+ : carte centrée, hauteur au contenu (pas de « trou » au milieu). max-sm : mobile étroit = carte pleine largeur, max hauteur utile. */}
      <div className="flex w-full flex-1 flex-col items-center justify-center px-2 py-3 sm:min-h-[100dvh] sm:py-6 md:px-4 md:py-8">
        <div className="glass-candy relative flex h-auto w-full max-w-lg shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-pink-400/30 p-3 shadow-neon-pink max-h-[min(100dvh,920px)] max-sm:max-h-[calc(100dvh-1.25rem)] sm:max-w-xl sm:rounded-3xl sm:p-5 md:max-w-2xl">
          <SnakeDecor className="pointer-events-none opacity-50" />
          <div className="relative z-[1] flex min-h-0 w-full flex-col gap-3 overflow-hidden sm:gap-4">
            <div className="shrink-0 space-y-1 text-center">
              <h1 className="text-2xl font-extrabold tracking-tight title-candy sm:text-3xl md:text-4xl">
                PharmAI
              </h1>
              <p className="text-[11px] font-semibold leading-snug text-pink-200/85 sm:text-xs">
                Chaque joueur importe son deck : aux questions de ton tour, c’est ton paquet qui est pioché.
              </p>
            </div>

            <div className="shrink-0 space-y-1.5 sm:space-y-2">
              {players.map((player) => (
                <div key={player.id} className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="h-4 w-4 shrink-0 rounded-full shadow-neon-pink ring-2 ring-white/30 sm:h-5 sm:w-5"
                    style={{ backgroundColor: player.color }}
                  />
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => setPlayerName(player.id, e.target.value)}
                    placeholder={`Joueur ${player.id + 1}`}
                    className="min-w-0 flex-1 rounded-xl border-2 border-cyan-400/25 bg-purple-950/60 px-3 py-2 text-sm text-white placeholder-pink-300/40 transition-all focus:border-pink-400/50 focus:outline-none focus:shadow-neon-cyan sm:rounded-2xl sm:px-4 sm:py-2.5"
                  />
                </div>
              ))}
            </div>

            <div className="flex min-h-0 w-full flex-col gap-2 overflow-hidden sm:gap-3">
              <h2 className="shrink-0 text-[11px] font-bold text-cyan-200/90 sm:text-xs">Decks de révision</h2>
              <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                <DeckImporter playerId={0} />
                <DeckImporter playerId={1} />
              </div>

              {deckErrors && (
                <div className="shrink-0 space-y-1 rounded-lg border border-rose-700/30 bg-rose-900/20 px-3 py-2">
                  {deckErrors.map((err, i) => (
                    <p key={i} className="text-xs text-rose-300 sm:text-sm">
                      • {err}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadSample}
                  className="min-w-[120px] flex-1 rounded-xl border-2 border-cyan-400/35 py-2 text-[11px] font-bold text-cyan-200 transition-all hover:bg-cyan-500/10 hover:shadow-neon-cyan sm:min-w-[140px] sm:rounded-2xl sm:py-2.5 sm:text-xs"
                >
                  Exemple (les deux decks)
                </button>
                <button
                  type="button"
                  onClick={() => openGemini(0)}
                  className="min-w-[120px] flex-1 rounded-xl border-2 border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-600/40 to-violet-600/40 py-2 text-[11px] font-bold text-fuchsia-100 transition-all hover:from-fuchsia-500/50 hover:to-violet-500/50 sm:min-w-[140px] sm:rounded-2xl sm:py-2.5 sm:text-xs"
                >
                  Gemini — {players[0].name}
                </button>
                <button
                  type="button"
                  onClick={() => openGemini(1)}
                  className="min-w-[120px] flex-1 rounded-xl border-2 border-cyan-400/40 bg-gradient-to-r from-cyan-600/35 to-teal-600/35 py-2 text-[11px] font-bold text-cyan-100 transition-all hover:from-cyan-500/45 hover:to-teal-500/45 sm:min-w-[140px] sm:rounded-2xl sm:py-2.5 sm:text-xs"
                >
                  Gemini — {players[1].name}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={startGame}
              disabled={!canStart}
              className={`mt-1 w-full shrink-0 rounded-xl py-3 text-sm font-extrabold tracking-wide transition-all sm:mt-0 sm:rounded-2xl sm:py-3.5 ${
                canStart
                  ? 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-cyan-400 text-white shadow-neon-pink hover:scale-[1.01] active:scale-[0.99]'
                  : 'cursor-not-allowed border border-pink-500/20 bg-purple-950/80 text-pink-300/40'
              }`}
            >
              {canStart ? 'C’est parti !' : 'Importe un deck pour chaque joueur'}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreator && (
          <DeckCreator playerId={geminiPlayerId} onClose={() => setShowCreator(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
