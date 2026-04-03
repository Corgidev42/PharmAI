import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { countOwnedTiles } from '../game/engine'

export default function GameOverScreen() {
  const players = useGameStore((s) => s.players)
  const tiles = useGameStore((s) => s.tiles)
  const winner = useGameStore((s) => s.winner)
  const resetGame = useGameStore((s) => s.resetGame)

  const isDraw = winner === -1
  const winnerPlayer = isDraw ? null : players[winner]

  return (
    <div className="flex h-[100dvh] max-w-[100vw] items-center justify-center overflow-hidden p-3 sm:p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm text-center space-y-6 relative"
      >
        <div className="glass-candy p-8 border-2 border-fuchsia-400/35 shadow-neon-fuchsia space-y-4">
          <motion.div
            className="text-7xl"
            animate={{ rotate: [0, -6, 6, -6, 0], scale: [1, 1.06, 1] }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {isDraw ? '🤝' : '🎀'}
          </motion.div>
          <h1 className="text-3xl font-extrabold title-candy">
            {isDraw ? 'Égalité kawaii' : 'Gros bravo !'}
          </h1>
          {winnerPlayer && (
            <p className="text-xl font-extrabold drop-shadow-[0_0_12px_currentColor]" style={{ color: winnerPlayer.color }}>
              {winnerPlayer.name}
            </p>
          )}
          <p className="text-xs text-pink-200/75 leading-relaxed">
            Gagnant = plus de cases possédées (les bonus néon ne comptent pas pour le titre).
          </p>

          <div className="space-y-2 pt-2">
            {players.map((player) => {
              const owned = countOwnedTiles(tiles, player.id)
              const bonus = player.bonus ?? 0
              const isWinner = player.id === winner
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 ${
                    isWinner
                      ? 'bg-pink-500/20 border-pink-400/50 shadow-neon-pink'
                      : 'bg-purple-950/50 border-white/10'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-full ring-2 ring-white/30"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="flex-1 text-left font-bold text-white">{player.name}</span>
                  <span className="text-xs text-pink-200/80">
                    {owned} cases
                    {bonus !== 0 ? ` · ${bonus > 0 ? '+' : ''}${bonus}` : ''}
                  </span>
                  <span className="text-lg font-extrabold" style={{ color: player.color }}>
                    {player.score + bonus}
                  </span>
                </div>
              )
            })}
          </div>

          <button
            onClick={resetGame}
            className="w-full py-4 rounded-2xl font-extrabold text-sm
              bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 text-white
              shadow-neon-cyan hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Rejouer !
          </button>
        </div>
      </motion.div>
    </div>
  )
}
