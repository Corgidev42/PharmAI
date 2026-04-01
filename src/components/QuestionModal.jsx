import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { PHASES } from '../game/constants'
import OpenQuestionTwoPlayer from './OpenQuestionTwoPlayer'

function QCMQuestion({ card, onAnswer }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="space-y-4">
      <p className="text-lg font-bold text-white leading-relaxed">{card.question}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {card.options.map((opt) => (
          <button
            key={opt}
            onClick={() => {
              setSelected(opt)
              setTimeout(() => onAnswer(opt), 200)
            }}
            disabled={selected !== null}
            className={`px-4 py-3.5 rounded-2xl border-2 text-left transition-all text-sm font-bold
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

function ResultDisplay({ correct, onProceed, isChance }) {
  const captureLine = isChance
    ? correct
      ? '+2 bonus (case Chance, pas de capture).'
      : 'Pas de bonus. Carte suivante.'
    : correct
      ? 'Case capturée.'
      : 'Case non capturée.'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="text-center space-y-4"
    >
      <p className={`text-xl font-bold ${correct ? 'text-emerald-300' : 'text-rose-300'}`}>
        {correct ? 'Bonne réponse' : 'Mauvaise réponse'}
      </p>
      <p className="text-sm text-slate-300">{captureLine}</p>
      <button
        onClick={onProceed}
        className="px-8 py-3 rounded-2xl font-bold bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-neon-pink hover:brightness-110 transition-all"
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

  const visible =
    phase === PHASES.QUESTION ||
    (phase === PHASES.RESULT && (landingType === 'FREE' || landingType === 'CHANCE'))
  const player = players[currentPlayer]
  const arbiter = players[currentPlayer === 0 ? 1 : 0]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="w-full max-w-lg rounded-2xl border border-white/15 bg-gradient-to-br from-purple-950/98 to-slate-950/90 p-6 shadow-2xl"
            style={{ boxShadow: `0 0 32px ${player.color}22` }}
          >
            {slideNote && phase === PHASES.QUESTION && (
              <p className="text-xs font-medium text-slate-300 mb-4 px-3 py-2 rounded-xl bg-white/5 border border-white/10 whitespace-pre-line">
                {slideNote}
              </p>
            )}

            {phase === PHASES.QUESTION && currentCard && (
              <>
                {landingType === 'CHANCE' && (
                  <p className="text-xs font-medium text-violet-200/95 mb-3 px-3 py-2 rounded-xl bg-violet-500/15 border border-violet-400/30">
                    Case Chance : carte la plus facile restante dans le paquet. Bonne réponse = +2 bonus
                    (pas de capture de case).
                  </p>
                )}
                <div className="flex items-center justify-between mb-4">
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
                    accent={landingType === 'CHANCE' ? 'violet' : 'pink'}
                  />
                )}
              </>
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
                  isChance={landingType === 'CHANCE'}
                />
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
