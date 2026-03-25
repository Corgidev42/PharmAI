import { useGameStore } from '../store/useGameStore'
import { countOwnedTiles } from '../game/engine'

export default function ScoreBoard() {
  const players = useGameStore((s) => s.players)
  const tiles = useGameStore((s) => s.tiles)
  const currentPlayer = useGameStore((s) => s.currentPlayer)
  const turnCount = useGameStore((s) => s.turnCount)
  const maxTurns = useGameStore((s) => s.maxTurns)
  const deckTheme = useGameStore((s) => s.deck.theme)
  const cardsLeft = useGameStore((s) => s.deck.cards.length - s.deck.currentIndex)

  return (
    <div className="glass-candy rounded-3xl p-5 w-64 space-y-4 border-2 border-cyan-400/25 shadow-neon-cyan">
      {deckTheme && (
        <p className="text-xs text-fuchsia-200/90 text-center font-extrabold tracking-wide uppercase">
          {deckTheme}
        </p>
      )}

      <div className="flex justify-between text-[11px] font-semibold text-cyan-200/70">
        <span>Tour {turnCount}/{maxTurns}</span>
        <span>{cardsLeft} carte{cardsLeft !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-3">
        {players.map((player) => {
          const owned = countOwnedTiles(tiles, player.id)
          const bonus = player.bonus ?? 0
          const isActive = player.id === currentPlayer

          return (
            <div
              key={player.id}
              className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all border-2 ${
                isActive
                  ? 'bg-pink-500/15 border-pink-400/50 shadow-neon-pink'
                  : 'bg-purple-950/40 border-white/10'
              }`}
            >
              <div
                className="w-6 h-6 rounded-full shrink-0 ring-2 ring-white/40 shadow-lg"
                style={{ backgroundColor: player.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{player.name}</p>
                <p className="text-[11px] text-pink-200/70">
                  {owned} case{owned !== 1 ? 's' : ''}
                  {bonus !== 0 ? ` · bonus ${bonus > 0 ? '+' : ''}${bonus}` : ''}
                </p>
              </div>
              <span className="text-xl font-extrabold tabular-nums drop-shadow-[0_0_8px_currentColor]" style={{ color: player.color }}>
                {player.score + bonus}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
