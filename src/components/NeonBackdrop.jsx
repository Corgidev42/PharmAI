import { useMemo } from 'react'

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function NeonBackdrop() {
  const stars = useMemo(() => {
    const rng = seededRandom(42)
    return Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: `${rng() * 100}%`,
      top: `${rng() * 100}%`,
      size: 1.5 + rng() * 2,
      delay: `${(rng() * -6).toFixed(1)}s`,
      duration: `${(2 + rng() * 3).toFixed(1)}s`,
      color: ['#ff6ec7', '#5dffe1', '#c4b5fd', '#fff'][Math.floor(rng() * 4)],
    }))
  }, [])

  const particles = useMemo(() => {
    const rng = seededRandom(99)
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${rng() * 100}%`,
      size: 3 + rng() * 6,
      delay: `${(rng() * -20).toFixed(1)}s`,
      duration: `${(14 + rng() * 10).toFixed(1)}s`,
      color: ['rgba(255,110,199,0.25)', 'rgba(93,255,225,0.2)', 'rgba(196,181,253,0.2)'][
        Math.floor(rng() * 3)
      ],
    }))
  }, [])

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden
    >
      {/* Blobs */}
      <div className="absolute w-[72vmax] h-[72vmax] -top-[18%] -left-[18%] rounded-full bg-pink-500/25 blur-[100px] animate-float-blob" />
      <div
        className="absolute w-[58vmax] h-[58vmax] -bottom-[12%] -right-[12%] rounded-full bg-cyan-400/20 blur-[90px] animate-float-blob"
        style={{ animationDelay: '-9s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42vmax] h-[42vmax] rounded-full bg-violet-600/15 blur-[80px] animate-float-blob"
        style={{ animationDelay: '-14s' }}
      />
      <div
        className="absolute top-[20%] right-[5%] w-[30vmax] h-[30vmax] rounded-full bg-fuchsia-500/10 blur-[70px] animate-float-blob"
        style={{ animationDelay: '-5s' }}
      />

      {/* Stars */}
      {stars.map((s) => (
        <div
          key={`s${s.id}`}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={`p${p.id}`}
          className="absolute rounded-full animate-float-up"
          style={{
            left: p.left,
            bottom: '-5%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  )
}
