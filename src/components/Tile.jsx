import { SPECIAL_TILE_LABEL, SPECIAL_TILE_ACCENT } from '../game/constants'

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

export default function Tile({ tile, index, size = 64 }) {
  const accent = tile.special ? SPECIAL_TILE_ACCENT[tile.special] : null
  const ownerStyle = tile.special
    ? ACCENT_CLASS[accent] || 'border-violet-400/60 bg-violet-950/35 shadow-neon-violet'
    : OWNER_STYLES[tile.owner] ?? OWNER_STYLES[null]

  const specialLabel = tile.special ? SPECIAL_TILE_LABEL[tile.special] : null
  const fontSize = Math.max(7, size * 0.13)

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-2xl border-2 flex flex-col items-center justify-center
        transition-all duration-300 hover:scale-[1.04] hover:brightness-110 ${ownerStyle}`}
    >
      <span
        className="text-white/40 absolute top-0.5 left-1 font-mono"
        style={{ fontSize: Math.max(7, size * 0.14) }}
      >
        {index}
      </span>

      {specialLabel && (
        <span
          className="font-extrabold text-white/90 leading-tight text-center px-0.5 drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
          style={{ fontSize, maxWidth: size * 0.85 }}
        >
          {specialLabel}
        </span>
      )}

      {tile.owner !== null && !tile.special && (
        <div
          className="absolute bottom-0.5 right-1 rounded-full ring ring-white/30"
          style={{
            width: size * 0.16,
            height: size * 0.16,
            backgroundColor: tile.owner === 0 ? '#ff6ec7' : '#5dffe1',
          }}
        />
      )}
    </div>
  )
}
