import { PLAYER_COLORS, SPECIAL_TILE_LABEL, SPECIAL_TILE_ACCENT } from '../game/constants'

const OWNER_STYLES = {
  null: 'border-white/15 bg-purple-950/50',
  0: 'border-pink-400/60 bg-pink-950/35 shadow-[0_0_12px_rgba(255,110,199,0.25)]',
  1: 'border-cyan-400/60 bg-cyan-950/30 shadow-[0_0_12px_rgba(93,255,225,0.22)]',
}

const ACCENT_CLASS = {
  lime: 'border-lime-400/75 bg-lime-950/30 shadow-neon-lime',
  violet: 'border-violet-400/75 bg-violet-950/35 shadow-neon-violet',
  rose: 'border-rose-400/70 bg-rose-950/30 shadow-neon-rose',
  cyan: 'border-cyan-400/70 bg-cyan-950/30 shadow-neon-cyan',
  slate: 'border-slate-400/50 bg-slate-900/40',
  pink: 'border-pink-400/75 bg-pink-950/35 shadow-neon-pink',
  emerald: 'border-emerald-400/70 bg-emerald-950/30 shadow-neon-emerald',
  sky: 'border-sky-400/70 bg-sky-950/30 shadow-neon-sky',
  fuchsia: 'border-fuchsia-400/70 bg-fuchsia-950/30 shadow-neon-fuchsia',
  amber: 'border-amber-400/70 bg-amber-950/25 shadow-neon-amber',
}

export default function Tile({ tile, index, hasPlayer0, hasPlayer1 }) {
  const accent = tile.special ? SPECIAL_TILE_ACCENT[tile.special] : null
  const ownerStyle = tile.special
    ? ACCENT_CLASS[accent] || 'border-violet-400/60 bg-violet-950/35 shadow-neon-violet'
    : OWNER_STYLES[tile.owner] ?? OWNER_STYLES[null]

  const specialLabel = tile.special ? SPECIAL_TILE_LABEL[tile.special] : null

  return (
    <div
      className={`relative w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center
        transition-all duration-300 hover:scale-[1.04] hover:brightness-110 ${ownerStyle}`}
    >
      <span className="text-[9px] text-white/40 absolute top-0.5 left-1 font-mono">
        {index}
      </span>
      {specialLabel && (
        <span className="text-[8px] font-extrabold text-white/90 leading-tight text-center px-0.5 max-w-[3.6rem] drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]">
          {specialLabel}
        </span>
      )}

      <div className={`flex gap-1 ${specialLabel ? 'mt-0.5' : ''}`}>
        {hasPlayer0 && (
          <div
            className="w-5 h-5 rounded-full ring-2 ring-white/50 shadow-lg"
            style={{ backgroundColor: PLAYER_COLORS[0] }}
          />
        )}
        {hasPlayer1 && (
          <div
            className="w-5 h-5 rounded-full ring-2 ring-white/50 shadow-lg"
            style={{ backgroundColor: PLAYER_COLORS[1] }}
          />
        )}
      </div>

      {tile.owner !== null && !tile.special && (
        <div
          className="absolute bottom-0.5 right-1 w-2.5 h-2.5 rounded-full ring ring-white/30"
          style={{ backgroundColor: PLAYER_COLORS[tile.owner] }}
        />
      )}
    </div>
  )
}
