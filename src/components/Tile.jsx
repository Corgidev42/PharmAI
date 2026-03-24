import { PLAYER_COLORS, SPECIAL_TILE_LABEL } from '../game/constants'

const OWNER_STYLES = {
  null: 'border-gray-700/50 bg-gray-800/60',
  0: 'border-indigo-500/70 bg-indigo-950/40',
  1: 'border-amber-500/70 bg-amber-950/40',
}

export default function Tile({ tile, index, hasPlayer0, hasPlayer1 }) {
  const ownerStyle = tile.special
    ? 'border-violet-500/50 bg-violet-950/30'
    : OWNER_STYLES[tile.owner] ?? OWNER_STYLES[null]

  const specialLabel = tile.special ? SPECIAL_TILE_LABEL[tile.special] : null

  return (
    <div
      className={`relative w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center
        transition-colors duration-300 ${ownerStyle}`}
    >
      <span className="text-[10px] text-gray-500 absolute top-0.5 left-1.5 font-mono">
        {index}
      </span>
      {specialLabel && (
        <span className="text-[9px] font-bold text-violet-300/90 leading-tight text-center px-0.5 max-w-[3.5rem]">
          {specialLabel}
        </span>
      )}

      <div className={`flex gap-1 ${specialLabel ? 'mt-0.5' : ''}`}>
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
