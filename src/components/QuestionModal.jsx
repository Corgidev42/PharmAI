import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { PHASES } from '../game/constants'

function QCMQuestion({ card, onAnswer }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-gray-100 leading-relaxed">{card.question}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {card.options.map((opt) => (
          <button
            key={opt}
            onClick={() => {
              setSelected(opt)
              setTimeout(() => onAnswer(opt), 200)
            }}
            disabled={selected !== null}
            className={`px-4 py-3 rounded-lg border text-left transition-all text-sm font-medium
              ${
                selected === opt
                  ? 'border-indigo-400 bg-indigo-500/20 text-indigo-200'
                  : 'border-gray-600 bg-gray-700/50 text-gray-200 hover:bg-gray-700 hover:border-gray-500'
              }
              ${selected !== null && selected !== opt ? 'opacity-40' : ''}
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
      <p className="text-lg font-medium text-gray-100 leading-relaxed">{card.question}</p>
      <div className="p-3 rounded-lg bg-gray-700/40 border border-gray-600">
        <p className="text-xs text-gray-400 mb-1">Réponse attendue :</p>
        <p className="text-sm text-gray-200 italic">{card.answer}</p>
      </div>
      <p className="text-xs text-gray-500">Le joueur actif juge si sa réponse est correcte.</p>
      <div className="flex gap-3">
        <button
          onClick={() => onAnswer(true)}
          className="flex-1 py-2.5 rounded-lg bg-emerald-600/20 border border-emerald-500/50
            text-emerald-300 font-medium hover:bg-emerald-600/30 transition-colors"
        >
          Correct
        </button>
        <button
          onClick={() => onAnswer(false)}
          className="flex-1 py-2.5 rounded-lg bg-rose-600/20 border border-rose-500/50
            text-rose-300 font-medium hover:bg-rose-600/30 transition-colors"
        >
          Incorrect
        </button>
      </div>
    </div>
  )
}

function ResultDisplay({ correct, onProceed, isChance }) {
  const captureLine =
    isChance
      ? correct
        ? '+1 point bonus (case Chance, pas de propriété).'
        : 'Pas de bonus — la carte est tout de même consommée.'
      : correct
        ? 'Vous capturez cette case !'
        : 'Aucune capture cette fois.'

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center space-y-4"
    >
      <div
        className={`text-6xl ${correct ? 'text-emerald-400' : 'text-rose-400'}`}
      >
        {correct ? '✓' : '✗'}
      </div>
      <p className={`text-xl font-bold ${correct ? 'text-emerald-300' : 'text-rose-300'}`}>
        {correct ? 'Bonne réponse !' : 'Mauvaise réponse...'}
      </p>
      <p className="text-sm text-gray-400">
        {captureLine}
      </p>
      <button
        onClick={onProceed}
        className="px-6 py-2.5 rounded-lg bg-gray-700 border border-gray-600
          text-gray-200 font-medium hover:bg-gray-600 transition-colors"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-lg rounded-2xl border-2 bg-gray-900 p-6 shadow-2xl"
            style={{ borderColor: player.color + '60' }}
          >
            {phase === PHASES.QUESTION && currentCard && (
              <>
                {landingType === 'CHANCE' && (
                  <p className="text-xs font-semibold text-violet-400 mb-3 px-2 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    Case Chance — une bonne réponse donne +1 bonus ; vous ne prenez pas la case.
                  </p>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded"
                    style={{ backgroundColor: player.color + '20', color: player.color }}
                  >
                    {player.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    Difficulté {'★'.repeat(currentCard.difficulty)}{'☆'.repeat(3 - currentCard.difficulty)}
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
              <ResultDisplay
                correct={lastAnswerCorrect}
                onProceed={proceedAfterResult}
                isChance={landingType === 'CHANCE'}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
