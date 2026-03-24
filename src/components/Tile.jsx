import { PLAYER_COLORS } from '../game/constants'

const OWNER_STYLES = {
  null: 'border-gray-700/50 bg-gray-800/60',
  0: 'border-indigo-500/70 bg-indigo-950/40',
  1: 'border-amber-500/70 bg-amber-950/40',
}

export default function Tile({ tile, index, hasPlayer0, hasPlayer1 }) {
  const ownerStyle = OWNER_STYLES[tile.owner] ?? OWNER_STYLES[null]

  return (
    <div
      className={`relative w-16 h-16 rounded-lg border-2 flex items-center justify-center
        transition-colors duration-300 ${ownerStyle}`}
    >
      <span className="text-[10px] text-gray-500 absolute top-0.5 left-1.5 font-mono">
        {index}
      </span>

      <div className="flex gap-1">
        {hasPlayer0 && (
          <div
            className="w-5 h-5 rounded-full ring-2 ring-white/30 shadow-lg"
            style={{ backgroundColor: PLAYER_COLORS[0] }}
          />
        )}
        {hasPlayer1 && (
          <div
            className="w-5 h-5 rounded-full ring-2 ring-white/30 shadow-lg"
            style={{ backgroundColor: PLAYER_COLORS[1] }}
          />
        )}
      </div>

      {tile.owner !== null && (
        <div
          className="absolute bottom-0.5 right-1 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: PLAYER_COLORS[tile.owner] }}
        />
      )}
    </div>
  )
}
