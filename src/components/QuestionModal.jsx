import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { PHASES } from '../game/constants'
import { seedForCardOptions, shuffleWithSeed } from '../game/shuffleOptions'
import OpenQuestionTwoPlayer from './OpenQuestionTwoPlayer'

function QCMQuestion({ card, onAnswer }) {
  const [selected, setSelected] = useState(null)

  const shuffledOptions = useMemo(() => {
    const opts = Array.isArray(card.options) ? [...card.options] : []
    return shuffleWithSeed(opts, seedForCardOptions(card))
  }, [card])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <p className="line-clamp-4 text-sm font-bold leading-snug text-white sm:text-base">{card.question}</p>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden sm:grid-cols-2 sm:gap-2.5">
        {shuffledOptions.map((opt, idx) => (
          <button
            key={`${card.id}-${idx}`}
            type="button"
            onClick={() => {
              setSelected(opt)
              setTimeout(() => onAnswer(opt), 200)
            }}
            disabled={selected !== null}
            className={`min-h-0 rounded-2xl border-2 px-3 py-2.5 text-left text-xs font-bold transition-all sm:px-4 sm:py-3 sm:text-sm
              ${
                selected === opt
                  ? 'border-pink-400 bg-pink-500/25 text-pink-100 shadow-neon-pink'
                  : 'border-cyan-400/35 bg-purple-950/50 text-cyan-50 hover:border-pink-400/50 hover:bg-pink-500/10'
              }
              ${selected !== null && selected !== opt ? 'opacity-35' : ''}
            `}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Après erreur QCM : même ordre que pendant la question, bonne option en vert. */
function QCMResultReveal({ card, userPick }) {
  const shuffledOptions = useMemo(() => {
    const opts = Array.isArray(card.options) ? [...card.options] : []
    return shuffleWithSeed(opts, seedForCardOptions(card))
  }, [card])

  const correctText = String(card.answer ?? '')

  return (
    <div className="w-full space-y-2 text-left">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
        {shuffledOptions.map((opt, idx) => {
          const isCorrect = opt === correctText
          const isWrongPick = !isCorrect && userPick === opt
          return (
            <div
              key={`result-${card.id}-${idx}`}
              className={`relative min-h-0 rounded-2xl border-2 px-3 py-2.5 text-xs font-bold sm:px-4 sm:py-3 sm:text-sm ${
                isCorrect
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-50 shadow-[0_0_20px_rgba(52,211,153,0.35)]'
                  : isWrongPick
                    ? 'border-rose-400/70 bg-rose-500/15 text-rose-100 opacity-90'
                    : 'border-white/10 bg-purple-950/40 text-slate-400 opacity-55'
              }`}
            >
              {isCorrect && (
                <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wide text-emerald-200/95">
                  Bonne réponse
                </span>
              )}
              {isWrongPick && (
                <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wide text-rose-200/90">
                  Mauvaise réponse
                </span>
              )}
              <span className="block leading-snug">{opt}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ResultDisplay({ correct, onProceed, card, userPick }) {
  const captureLine = correct ? 'Case capturée.' : 'Case non capturée.'
  const expl =
    typeof card?.explanation === 'string' && card.explanation.trim() ? card.explanation.trim() : null
  const showQcmReveal = !correct && card?.type === 'QCM' && Array.isArray(card?.options)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="flex max-h-[min(78dvh,32rem)] flex-col space-y-3 overflow-y-auto text-center sm:space-y-4"
    >
      <p className={`text-xl font-bold ${correct ? 'text-emerald-300' : 'text-rose-300'}`}>
        {correct ? 'Bonne réponse' : 'Mauvaise réponse'}
      </p>
      <p className="text-sm text-slate-300">{captureLine}</p>

      {showQcmReveal && (
        <QCMResultReveal card={card} userPick={typeof userPick === 'string' ? userPick : null} />
      )}

      {!correct && card?.answer != null && !showQcmReveal && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm text-slate-200">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-200/90">Réponse attendue</p>
          <p className="mt-1 whitespace-pre-line text-slate-100">{String(card.answer)}</p>
        </div>
      )}

      {!correct && expl && (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-3 py-2.5 text-left text-sm text-slate-200">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200/90">Explication</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-snug text-slate-300">{expl}</p>
        </div>
      )}

      <button
        type="button"
        onClick={onProceed}
        className="shrink-0 rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-8 py-3 font-bold text-white shadow-neon-pink transition-all hover:brightness-110"
      >
        Continuer
      </button>
    </motion.div>
  )
}

export default function QuestionModal() {
  const phase = useGameStore((s) => s.phase)
  const currentCard = useGameStore((s) => s.currentCard)
  const lastAnswerCorrect = useGameStore((s) => s.lastAnswerCorrect)
  const currentPlayer = useGameStore((s) => s.currentPlayer)
  const players = useGameStore((s) => s.players)
  const submitAnswer = useGameStore((s) => s.submitAnswer)
  const proceedAfterResult = useGameStore((s) => s.proceedAfterResult)
  const landingType = useGameStore((s) => s.landingType)
  const slideNote = useGameStore((s) => s.slideNote)
  const lastSubmittedAnswer = useGameStore((s) => s.lastSubmittedAnswer)
  const soloMode = useGameStore((s) => s.soloMode)

  const visible =
    phase === PHASES.QUESTION || (phase === PHASES.RESULT && landingType === 'FREE')
  const player = players[currentPlayer]
  const arbiter = players[currentPlayer === 0 ? 1 : 0]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/70 p-3 backdrop-blur-md sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="flex min-h-0 max-h-[min(100dvh,100%)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-purple-950/98 to-slate-950/90 p-4 shadow-2xl sm:p-5"
            style={{ boxShadow: `0 0 32px ${player.color}22` }}
          >
            {slideNote && phase === PHASES.QUESTION && (
              <p className="mb-2 line-clamp-3 shrink-0 whitespace-pre-line rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] font-medium text-slate-300 sm:mb-3 sm:px-3 sm:py-2 sm:text-xs">
                {slideNote}
              </p>
            )}

            {phase === PHASES.QUESTION && currentCard && (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="mb-3 flex shrink-0 items-center justify-between sm:mb-4">
                  <span
                    className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/15"
                    style={{
                      backgroundColor: `${player.color}22`,
                      color: player.color,
                    }}
                  >
                    {player.name}
                  </span>
                  <span className="text-xs font-semibold text-amber-200/90">
                    {'★'.repeat(currentCard.difficulty)}
                    {'☆'.repeat(3 - currentCard.difficulty)}
                  </span>
                </div>
                {currentCard.type === 'QCM' ? (
                  <QCMQuestion card={currentCard} onAnswer={submitAnswer} />
                ) : (
                  <OpenQuestionTwoPlayer
                    activeName={player.name}
                    arbiterName={arbiter.name}
                    card={currentCard}
                    onAnswer={submitAnswer}
                    accent="pink"
                    soloMode={soloMode}
                  />
                )}
              </div>
            )}

            {phase === PHASES.RESULT && (
              <>
                {slideNote && (
                  <p className="text-[11px] font-medium text-slate-400 mb-4 px-3 py-2 rounded-lg bg-white/5 border border-white/10 whitespace-pre-line">
                    {slideNote}
                  </p>
                )}
                <ResultDisplay
                  correct={lastAnswerCorrect}
                  onProceed={proceedAfterResult}
                  card={currentCard}
                  userPick={lastSubmittedAnswer}
                />
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
