import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { PHASES } from '../game/constants'

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

function OpenQuestion({ card, onAnswer }) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-bold text-white leading-relaxed">{card.question}</p>
      <div className="p-4 rounded-2xl bg-purple-950/70 border-2 border-fuchsia-400/30">
        <p className="text-xs font-bold text-fuchsia-300/80 mb-1">Réponse attendue</p>
        <p className="text-sm text-pink-100/90 italic">{card.answer}</p>
      </div>
      <p className="text-xs text-cyan-200/70">Le joueur actif tranche avec bienveillance.</p>
      <div className="flex gap-3">
        <button
          onClick={() => onAnswer(true)}
          className="flex-1 py-3 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/50
            text-emerald-200 font-extrabold hover:bg-emerald-500/30 shadow-[0_0_16px_rgba(52,211,153,0.25)]"
        >
          Yes !
        </button>
        <button
          onClick={() => onAnswer(false)}
          className="flex-1 py-3 rounded-2xl bg-rose-500/20 border-2 border-rose-400/50
            text-rose-200 font-extrabold hover:bg-rose-500/30"
        >
          Oups non
        </button>
      </div>
    </div>
  )
}

function ResultDisplay({ correct, onProceed, isChance }) {
  const captureLine = isChance
    ? correct
      ? '+1 bonus pailleté — pas de case à capturer ✨'
      : 'Pas de bonus cette fois (la carte file quand même).'
    : correct
      ? 'La case est à toi !'
      : 'Pas de capture — tant pis, on réessaiera.'

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center space-y-4"
    >
      <div className={`text-7xl ${correct ? 'drop-shadow-[0_0_20px_rgba(52,211,153,0.8)]' : 'drop-shadow-[0_0_16px_rgba(251,113,133,0.7)]'}`}>
        {correct ? '🌟' : '💫'}
      </div>
      <p className={`text-xl font-extrabold ${correct ? 'text-emerald-300' : 'text-rose-300'}`}>
        {correct ? 'Trop fort !' : 'Aïe aïe aïe…'}
      </p>
      <p className="text-sm text-pink-100/80">{captureLine}</p>
      <button
        onClick={onProceed}
        className="px-8 py-3 rounded-2xl font-extrabold bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-neon-pink hover:scale-105 transition-transform"
      >
        Suivant
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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/75 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 16 }}
            className="w-full max-w-lg rounded-[1.75rem] border-2 border-pink-400/40 bg-gradient-to-br from-purple-950/98 to-fuchsia-950/50 p-6 shadow-neon-pink"
            style={{ boxShadow: `0 0 40px ${player.color}33, 0 0 80px rgba(255,110,199,0.12)` }}
          >
            {slideNote && phase === PHASES.QUESTION && (
              <p className="text-xs font-extrabold text-emerald-200 mb-4 px-3 py-2.5 rounded-2xl bg-emerald-500/15 border-2 border-emerald-400/35 shadow-neon-emerald whitespace-pre-line">
                {slideNote}
              </p>
            )}

            {phase === PHASES.QUESTION && currentCard && (
              <>
                {landingType === 'CHANCE' && (
                  <p className="text-xs font-extrabold text-violet-200 mb-3 px-3 py-2 rounded-2xl bg-violet-500/20 border-2 border-violet-400/40 shadow-neon-violet">
                    Case Chance — bonne réponse = +1 bonus tout mignon, sans voler de case.
                  </p>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-xs font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full border-2 border-white/20"
                    style={{
                      backgroundColor: `${player.color}28`,
                      color: player.color,
                      boxShadow: `0 0 14px ${player.color}44`,
                    }}
                  >
                    {player.name}
                  </span>
                  <span className="text-xs font-bold text-amber-200/90">
                    {'★'.repeat(currentCard.difficulty)}
                    {'☆'.repeat(3 - currentCard.difficulty)}
                  </span>
                </div>
                {currentCard.type === 'QCM' ? (
                  <QCMQuestion card={currentCard} onAnswer={submitAnswer} />
                ) : (
                  <OpenQuestion card={currentCard} onAnswer={submitAnswer} />
                )}
              </>
            )}

            {phase === PHASES.RESULT && (
              <>
                {slideNote && (
                  <p className="text-[11px] font-bold text-cyan-200/90 mb-4 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 whitespace-pre-line">
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
