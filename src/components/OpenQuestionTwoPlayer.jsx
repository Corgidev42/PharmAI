import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PREP_SECONDS = 5

function borderClassForAccent(accent) {
  if (accent === 'rose') return 'border-rose-400/45'
  if (accent === 'violet') return 'border-violet-400/45'
  return 'border-pink-400/45'
}

/** Mode solo : révélation volontaire de la référence puis auto-évaluation honnête. */
function OpenQuestionSolo({ activeName, card, onAnswer, accent = 'pink' }) {
  const [revealed, setRevealed] = useState(false)
  const borderAccent = borderClassForAccent(accent)

  useEffect(() => {
    setRevealed(false)
  }, [card?.id])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-200/90">
        Question ouverte — solo
      </p>
      <div className={`min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl border-2 ${borderAccent} bg-purple-950/60 p-3 sm:p-4`}>
        <p className="text-sm font-bold leading-snug text-white sm:text-base">{card.question}</p>
        <p className="text-[11px] text-slate-400 sm:text-xs">
          {activeName} : réfléchis, puis dévoile la référence si besoin et indique si tu avais bon.
        </p>
        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/15 sm:py-3"
          >
            Voir la réponse attendue
          </button>
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/40 p-3 sm:p-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">
              Réponse attendue (référence)
            </p>
            <p className="text-xs leading-snug text-slate-100 sm:text-sm">{card.answer}</p>
          </div>
        )}
        <div className="space-y-1.5 rounded-xl border border-white/15 bg-black/35 p-3 sm:p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Ton avis</p>
          <p className="text-xs text-slate-300 mb-2">Ta réponse était-elle correcte ?</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onAnswer(true)}
              className="flex-1 rounded-xl border-2 border-emerald-400/55 bg-emerald-500/20 py-3 font-bold text-emerald-100 transition-colors hover:bg-emerald-500/30"
            >
              J’avais bon
            </button>
            <button
              type="button"
              onClick={() => onAnswer(false)}
              className="flex-1 rounded-xl border-2 border-rose-400/55 bg-rose-500/20 py-3 font-bold text-rose-100 transition-colors hover:bg-rose-500/30"
            >
              J’avais tort
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Question OPEN : le joueur actif ne doit pas voir la réponse attendue.
 * 1) Compte à rebours — l'actif se retourne / ne regarde pas.
 * 2) L'arbitre lit question + réponse attendue.
 * 3) L'actif ne voit que la question ; l'arbitre valide à l'oral.
 */
function OpenQuestionTwoPlayerVersus({
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

  const borderAccent = borderClassForAccent(accent)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
        {step === 'prep' && (
          <motion.div
            key="prep"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`space-y-2 rounded-2xl border-2 ${borderAccent} bg-black/55 p-3 text-center sm:space-y-3 sm:p-5`}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">
              Question ouverte — confidentialité
            </p>
            <p className="text-sm font-bold leading-snug text-white sm:text-base">
              <span className="text-pink-200">{activeName}</span>
              {' '}ne doit pas voir l&apos;écran : tourne-toi, ferme les yeux ou passe l&apos;appareil à{' '}
              <span className="text-cyan-200">{arbiterName}</span>.
            </p>
            <div className="text-4xl font-black tabular-nums tracking-tight text-white sm:text-5xl">
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
            className={`space-y-2 rounded-2xl border-2 ${borderAccent} bg-purple-950/80 p-3 sm:space-y-3 sm:p-4`}
          >
            <p className="text-[11px] font-semibold text-amber-200/90 sm:text-xs">
              Réservé à {arbiterName} — ne montre pas cet écran à {activeName}.
            </p>
            <p className="line-clamp-4 text-sm font-bold leading-snug text-white sm:text-base">{card.question}</p>
            <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 sm:p-4">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">
                Réponse attendue (référence)
              </p>
              <p className="line-clamp-6 text-xs leading-snug text-slate-100 sm:text-sm">{card.answer}</p>
            </div>
            <button
              type="button"
              onClick={() => setStep('active')}
              className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/15 sm:py-3"
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
            className="space-y-3"
          >
            <div className={`rounded-2xl border-2 ${borderAccent} bg-purple-950/60 p-3 sm:p-4`}>
              <p className="line-clamp-4 text-sm font-bold leading-snug text-white sm:text-base">{card.question}</p>
              <p className="mt-2 text-[11px] text-slate-400 sm:mt-3 sm:text-xs">
                {activeName} : réponds à voix haute. {arbiterName} compare avec la référence.
              </p>
            </div>
            <div className="space-y-1.5 rounded-xl border border-white/15 bg-black/35 p-3 sm:p-4">
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
    </div>
  )
}

export default function OpenQuestionTwoPlayer({
  activeName,
  arbiterName,
  card,
  onAnswer,
  accent = 'pink',
  soloMode = false,
}) {
  if (soloMode) {
    return <OpenQuestionSolo activeName={activeName} card={card} onAnswer={onAnswer} accent={accent} />
  }
  return (
    <OpenQuestionTwoPlayerVersus
      activeName={activeName}
      arbiterName={arbiterName}
      card={card}
      onAnswer={onAnswer}
      accent={accent}
    />
  )
}
