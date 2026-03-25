/** Bulles de lumière animées en arrière-plan */
export default function NeonBackdrop() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden
    >
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
    </div>
  )
}
