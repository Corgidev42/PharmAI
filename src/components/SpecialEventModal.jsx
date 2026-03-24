import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { PHASES } from '../game/constants'

export default function SpecialEventModal() {
  const phase = useGameStore((s) => s.phase)
  const specialFeedback = useGameStore((s) => s.specialFeedback)
  const currentCard = useGameStore((s) => s.currentCard)
  const proceedAfterResult = useGameStore((s) => s.proceedAfterResult)

  const visible =
    phase === PHASES.RESULT && specialFeedback && currentCard == null && specialFeedback.title

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`w-full max-w-md rounded-2xl border-2 bg-gray-900 p-6 shadow-2xl ${
              specialFeedback.positive
                ? 'border-emerald-500/40'
                : 'border-rose-500/40'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Case spéciale
            </p>
            <h3 className="text-xl font-bold text-gray-100 mb-2">{specialFeedback.title}</h3>
            <p className="text-sm text-gray-400 mb-6">{specialFeedback.subtitle}</p>
            <button
              onClick={() => proceedAfterResult()}
              className="w-full py-2.5 rounded-lg bg-gray-700 border border-gray-600
                text-gray-200 font-medium hover:bg-gray-600 transition-colors"
            >
              Continuer
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
