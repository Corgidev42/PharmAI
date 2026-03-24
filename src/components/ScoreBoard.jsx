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
    <div className="glass rounded-2xl p-5 w-64 space-y-4">
      {deckTheme && (
        <p className="text-xs text-gray-400 text-center font-medium tracking-wide uppercase">
          {deckTheme}
        </p>
      )}

      <div className="flex justify-between text-xs text-gray-500">
        <span>Tour {turnCount}/{maxTurns}</span>
        <span>{cardsLeft} carte{cardsLeft !== 1 ? 's' : ''} restante{cardsLeft !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-3">
        {players.map((player) => {
          const owned = countOwnedTiles(tiles, player.id)
          const bonus = player.bonus ?? 0
          const isActive = player.id === currentPlayer

          return (
            <div
              key={player.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive ? 'bg-gray-700/50 ring-1' : 'bg-gray-800/30'
              }`}
              style={isActive ? { ringColor: player.color + '60' } : {}}
            >
              <div
                className="w-5 h-5 rounded-full shrink-0 ring-2 ring-white/20"
                style={{ backgroundColor: player.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{player.name}</p>
                <p className="text-xs text-gray-500">
                  {owned} case{owned !== 1 ? 's' : ''}
                  {bonus !== 0 ? ` · bonus ${bonus > 0 ? '+' : ''}${bonus}` : ''}
                </p>
              </div>
              <span className="text-lg font-bold" style={{ color: player.color }}>
                {player.score + bonus}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
