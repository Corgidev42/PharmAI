import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PREP_SECONDS = 5

/**
 * Question OPEN : le joueur actif ne doit pas voir la réponse attendue.
 * 1) Compte à rebours — l'actif se retourne / ne regarde pas.
 * 2) L'arbitre lit question + réponse attendue.
 * 3) L'actif ne voit que la question ; l'arbitre valide à l'oral.
 */
export default function OpenQuestionTwoPlayer({
  activeName,
  arbiterName,
  card,
  onAnswer,
  accent = 'pink',
}) {
  const [step, setStep] = useState('prep')
  const [countdown, setCountdown] = useState(PREP_SECONDS)

  const reset = useCallback(() => {
    setStep('prep')
    setCountdown(PREP_SECONDS)
  }, [])

  useEffect(() => {
    reset()
  }, [card?.id, reset])

  useEffect(() => {
    if (step !== 'prep') return
    if (countdown <= 0) {
      setStep('reader')
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [step, countdown])

  const borderAccent =
    accent === 'rose'
      ? 'border-rose-400/45'
      : accent === 'violet'
        ? 'border-violet-400/45'
        : 'border-pink-400/45'

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {step === 'prep' && (
          <motion.div
            key="prep"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`rounded-2xl border-2 ${borderAccent} bg-black/55 p-5 text-center space-y-3`}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">
              Question ouverte — confidentialité
            </p>
            <p className="text-base font-bold text-white leading-snug">
              <span className="text-pink-200">{activeName}</span>
              {' '}ne doit pas voir l&apos;écran : tourne-toi, ferme les yeux ou passe l&apos;appareil à{' '}
              <span className="text-cyan-200">{arbiterName}</span>.
            </p>
            <div className="text-5xl font-black tabular-nums text-white tracking-tight">
              {countdown > 0 ? countdown : '…'}
            </div>
            <p className="text-xs text-slate-400">
              Après le décompte, seul {arbiterName} verra la réponse attendue.
            </p>
            <button
              type="button"
              onClick={() => setStep('reader')}
              className="text-xs font-semibold text-cyan-300/90 underline-offset-2 hover:underline"
            >
              Déjà prêt — passer à l&apos;étape arbitre
            </button>
          </motion.div>
        )}

        {step === 'reader' && (
          <motion.div
            key="reader"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`rounded-2xl border-2 ${borderAccent} bg-purple-950/80 p-5 space-y-4`}
          >
            <p className="text-xs font-semibold text-amber-200/90">
              Réservé à {arbiterName} — ne montre pas cet écran à {activeName}.
            </p>
            <p className="text-lg font-bold text-white leading-relaxed">{card.question}</p>
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <p className="text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">
                Réponse attendue (référence)
              </p>
              <p className="text-sm text-slate-100 leading-relaxed">{card.answer}</p>
            </div>
            <button
              type="button"
              onClick={() => setStep('active')}
              className="w-full py-3 rounded-xl font-bold text-sm bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors"
            >
              C&apos;est noté — afficher la question à {activeName}
            </button>
          </motion.div>
        )}

        {step === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className={`rounded-2xl border-2 ${borderAccent} bg-purple-950/60 p-5`}>
              <p className="text-lg font-bold text-white leading-relaxed">{card.question}</p>
              <p className="text-xs text-slate-400 mt-3">
                {activeName} : réponds à voix haute. {arbiterName} compare avec la référence.
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-black/35 p-4 space-y-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Arbitre ({arbiterName})
              </p>
              <p className="text-xs text-slate-300 mb-2">La réponse est-elle correcte ?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onAnswer(true)}
                  className="flex-1 py-3 rounded-xl bg-emerald-500/20 border-2 border-emerald-400/55 text-emerald-100 font-bold hover:bg-emerald-500/30 transition-colors"
                >
                  Correct
                </button>
                <button
                  type="button"
                  onClick={() => onAnswer(false)}
                  className="flex-1 py-3 rounded-xl bg-rose-500/20 border-2 border-rose-400/55 text-rose-100 font-bold hover:bg-rose-500/30 transition-colors"
                >
                  Incorrect
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
