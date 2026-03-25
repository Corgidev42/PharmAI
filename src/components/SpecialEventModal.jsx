import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { PHASES } from '../game/constants'

const NEON_PANEL = {
  lime: 'border-lime-400/55 shadow-neon-lime from-purple-950/95 to-lime-950/30',
  pink: 'border-pink-400/55 shadow-neon-pink from-purple-950/95 to-pink-950/35',
  fuchsia: 'border-fuchsia-400/55 shadow-neon-fuchsia from-purple-950/95 to-fuchsia-950/35',
  amber: 'border-amber-400/55 shadow-neon-amber from-purple-950/95 to-amber-950/25',
  rose: 'border-rose-400/55 shadow-neon-rose from-purple-950/95 to-rose-950/30',
  cyan: 'border-cyan-400/55 shadow-neon-cyan from-purple-950/95 to-cyan-950/25',
  sky: 'border-sky-400/55 shadow-neon-sky from-purple-950/95 to-sky-950/25',
}

export default function SpecialEventModal() {
  const phase = useGameStore((s) => s.phase)
  const specialFeedback = useGameStore((s) => s.specialFeedback)
  const currentCard = useGameStore((s) => s.currentCard)
  const proceedAfterResult = useGameStore((s) => s.proceedAfterResult)

  const visible =
    phase === PHASES.RESULT && specialFeedback && currentCard == null && specialFeedback.title

  const neon = specialFeedback?.neon && NEON_PANEL[specialFeedback.neon]
    ? NEON_PANEL[specialFeedback.neon]
    : NEON_PANEL.cyan

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/70 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.88, y: 24, rotate: -2 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.88, y: 24 }}
            className={`w-full max-w-md rounded-[1.75rem] border-2 bg-gradient-to-br p-7 shadow-2xl ${neon}`}
          >
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-pink-300/90 mb-2">
              Case magique
            </p>
            <h3 className="text-2xl font-extrabold text-white mb-3 drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
              {specialFeedback.title}
            </h3>
            <p className="text-sm text-pink-100/85 whitespace-pre-line leading-relaxed mb-8">
              {specialFeedback.subtitle}
            </p>
            <button
              onClick={() => proceedAfterResult()}
              className="w-full py-3.5 rounded-2xl font-extrabold text-sm
                bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white
                shadow-neon-pink hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Ok, c’est trop mignon — suite !
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
