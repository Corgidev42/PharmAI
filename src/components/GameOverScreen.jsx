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
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        <div className="space-y-2">
          <motion.div
            className="text-7xl"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {isDraw ? '🤝' : '🏆'}
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-100">
            {isDraw ? 'Égalité !' : 'Victoire !'}
          </h1>
          {winnerPlayer && (
            <p className="text-xl font-semibold" style={{ color: winnerPlayer.color }}>
              {winnerPlayer.name}
            </p>
          )}
          <p className="text-xs text-gray-500 px-2">
            Le gagnant est celui qui possède le plus de cases (les points bonus des cases spéciales ne changent pas ce classement).
          </p>
        </div>

        <div className="glass rounded-2xl p-4 space-y-3">
          {players.map((player) => {
            const owned = countOwnedTiles(tiles, player.id)
            const bonus = player.bonus ?? 0
            const isWinner = player.id === winner
            return (
              <div
                key={player.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                  isWinner ? 'bg-gray-700/50' : 'bg-gray-800/30'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full ring-2 ring-white/20"
                  style={{ backgroundColor: player.color }}
                />
                <span className="flex-1 text-left text-gray-200 font-medium">{player.name}</span>
                <span className="text-sm text-gray-400">
                  {owned} cases
                  {bonus !== 0 ? ` · bonus ${bonus > 0 ? '+' : ''}${bonus}` : ''}
                </span>
                <span className="text-lg font-bold" style={{ color: player.color }}>
                  {player.score + bonus}
                </span>
              </div>
            )
          })}
        </div>

        <button
          onClick={resetGame}
          className="w-full py-3 rounded-xl font-semibold text-sm
            bg-gradient-to-r from-indigo-600 to-indigo-500 text-white
            hover:from-indigo-500 hover:to-indigo-400 transition-all
            shadow-lg shadow-indigo-500/20"
        >
          Nouvelle partie
        </button>
      </motion.div>
    </div>
  )
}
