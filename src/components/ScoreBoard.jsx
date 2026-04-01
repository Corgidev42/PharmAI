import { useGameStore } from '../store/useGameStore'
import { countOwnedTiles } from '../game/engine'

export default function ScoreBoard() {
  const players = useGameStore((s) => s.players)
  const tiles = useGameStore((s) => s.tiles)
  const decks = useGameStore((s) => s.decks)
  const currentPlayer = useGameStore((s) => s.currentPlayer)
  const turnCount = useGameStore((s) => s.turnCount)
  const maxTurns = useGameStore((s) => s.maxTurns)

  return (
    <div className="glass-candy rounded-3xl p-5 w-full max-w-xs sm:w-72 space-y-4 border-2 border-cyan-400/25 shadow-neon-cyan">
      <div className="space-y-2 text-[10px] text-fuchsia-200/85">
        {players.map((p, i) => {
          const d = decks[i]
          const left = d.cards.length - d.currentIndex
          return (
            <div key={p.id} className="border border-white/10 rounded-xl px-2 py-1.5 bg-purple-950/40">
              <p className="font-bold text-white/95 truncate">{p.name}</p>
              <p className="text-fuchsia-200/70 truncate" title={d.theme}>
                {d.theme || '—'}
              </p>
              <p className="text-cyan-200/80">{left} carte{left !== 1 ? 's' : ''} restante{left !== 1 ? 's' : ''}</p>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between text-[11px] font-semibold text-cyan-200/70">
        <span>
          Tour {turnCount}/{maxTurns}
        </span>
        <span className="text-pink-200/80">
          Pioche : {players[currentPlayer]?.name ?? '…'}
        </span>
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
              <span
                className="text-xl font-extrabold tabular-nums drop-shadow-[0_0_8px_currentColor]"
                style={{ color: player.color }}
              >
                {player.score + bonus}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
