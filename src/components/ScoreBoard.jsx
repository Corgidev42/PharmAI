import { useGameStore } from '../store/useGameStore'
import { countOwnedTiles } from '../game/engine'
import Dice from './Dice'

export default function ScoreBoard() {
  const players = useGameStore((s) => s.players)
  const tiles = useGameStore((s) => s.tiles)
  const decks = useGameStore((s) => s.decks)
  const currentPlayer = useGameStore((s) => s.currentPlayer)
  const turnCount = useGameStore((s) => s.turnCount)
  const maxTurns = useGameStore((s) => s.maxTurns)

  return (
    <div className="glass-candy flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-2xl border-2 border-cyan-400/25 p-2 shadow-neon-cyan sm:rounded-3xl sm:p-3 max-lg:landscape:rounded-xl max-lg:landscape:p-1.5 max-lg:landscape:h-auto lg:h-auto lg:min-h-0">
      <div className="order-1 max-lg:landscape:order-4 grid shrink-0 grid-cols-2 gap-1.5 text-[9px] text-fuchsia-200/85 md:grid-cols-1 max-lg:landscape:grid-cols-1 sm:gap-2 sm:text-[10px]">
        {players.map((p, i) => {
          const d = decks[i]
          const left = d.cards.length - d.currentIndex
          return (
            <div
              key={p.id}
              className="min-w-0 rounded-lg border border-white/10 bg-purple-950/40 px-1.5 py-0.5 sm:rounded-xl sm:px-2 sm:py-1 max-lg:landscape:py-0.5"
            >
              <p className="truncate text-[10px] font-bold text-white/95 sm:text-xs">{p.name}</p>
              <p
                className="truncate leading-tight text-fuchsia-200/70 max-lg:landscape:text-[9px]"
                title={d.theme}
              >
                {d.theme || '—'}
              </p>
              <p className="leading-tight text-cyan-200/80" title={`${left} cartes restantes`}>
                {left} cartes
              </p>
            </div>
          )
        })}
      </div>

      <div className="order-2 max-lg:landscape:order-2 flex shrink-0 flex-row justify-between gap-x-2 gap-y-0.5 text-[10px] font-semibold text-cyan-200/70 max-lg:landscape:flex-col max-lg:landscape:items-start max-lg:landscape:text-[9px] sm:text-[11px]">
        <span className="shrink-0 tabular-nums">
          Tour {turnCount}/{maxTurns}
        </span>
        <span
          className="min-w-0 text-pink-200/80 max-lg:landscape:w-full max-lg:landscape:break-words max-lg:landscape:text-left text-right"
          title={`Pioche : ${players[currentPlayer]?.name ?? '…'}`}
        >
          Pioche : {players[currentPlayer]?.name ?? '…'}
        </span>
      </div>

      <div className="order-3 max-lg:landscape:order-3 flex shrink-0 flex-col gap-1.5 overflow-hidden sm:gap-2 max-lg:landscape:gap-1 lg:gap-2">
        {players.map((player) => {
          const owned = countOwnedTiles(tiles, player.id)
          const bonus = player.bonus ?? 0
          const isActive = player.id === currentPlayer

          return (
            <div
              key={player.id}
              className={`flex min-h-0 min-w-0 shrink-0 items-center gap-1.5 rounded-lg border-2 px-1.5 py-1 sm:gap-3 sm:rounded-2xl sm:px-3 sm:py-2 max-lg:landscape:rounded-md max-lg:landscape:py-0.5 ${
                isActive
                  ? 'border-pink-400/50 bg-pink-500/15 shadow-neon-pink'
                  : 'border-white/10 bg-purple-950/40'
              }`}
            >
              <div
                className="h-4 w-4 shrink-0 rounded-full ring-2 ring-white/40 shadow-lg sm:h-6 sm:w-6 max-lg:landscape:h-3.5 max-lg:landscape:w-3.5"
                style={{ backgroundColor: player.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold text-white sm:text-sm max-lg:landscape:text-[10px]">
                  {player.name}
                </p>
                <p className="text-[9px] leading-tight text-pink-200/70 sm:text-[11px] max-lg:landscape:text-[8px]">
                  {owned} case{owned !== 1 ? 's' : ''}
                  {bonus !== 0 ? ` · bonus ${bonus > 0 ? '+' : ''}${bonus}` : ''}
                </p>
              </div>
              <span
                className="shrink-0 text-base font-extrabold tabular-nums drop-shadow-[0_0_8px_currentColor] sm:text-xl max-lg:landscape:text-sm"
                style={{ color: player.color }}
              >
                {player.score + bonus}
              </span>
            </div>
          )
        })}
      </div>

      <div className="order-4 max-lg:landscape:order-1 mt-0.5 w-full shrink-0 border-t border-white/10 px-0.5 pt-1.5 sm:pt-2 max-lg:landscape:mt-0 max-lg:landscape:border-b max-lg:landscape:border-b-pink-400/25 max-lg:landscape:border-t-0 max-lg:landscape:pb-1.5 max-lg:landscape:pt-0">
        <Dice compact />
      </div>
    </div>
  )
}
