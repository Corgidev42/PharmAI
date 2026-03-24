import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { PHASES } from '../game/constants'

export default function DuelBanner() {
  const phase = useGameStore((s) => s.phase)
  const currentCard = useGameStore((s) => s.currentCard)
  const currentPlayer = useGameStore((s) => s.currentPlayer)
  const players = useGameStore((s) => s.players)
  const submitAnswer = useGameStore((s) => s.submitAnswer)
  const lastAnswerCorrect = useGameStore((s) => s.lastAnswerCorrect)
  const proceedAfterResult = useGameStore((s) => s.proceedAfterResult)

  const landingType = useGameStore((s) => s.landingType)
  const [selected, setSelected] = useState(null)

  const visible = phase === PHASES.DUEL || (phase === PHASES.RESULT && landingType === 'OPPONENT')

  const attacker = players[currentPlayer]
  const defender = players[currentPlayer === 0 ? 1 : 0]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-lg rounded-2xl border-2 border-rose-500/40 bg-gray-900 shadow-2xl overflow-hidden"
          >
            {/* Duel header */}
            <div className="bg-gradient-to-r from-rose-900/40 to-amber-900/40 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: attacker.color }} />
                <span className="font-bold text-gray-100">{attacker.name}</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
                Duel
              </span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-100">{defender.name}</span>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: defender.color }} />
              </div>
            </div>

            <div className="p-6">
              {phase === PHASES.DUEL && currentCard && (
                <>
                  <p className="text-xs text-rose-300 mb-1">
                    Question de difficulté {'★'.repeat(currentCard.difficulty)}{'☆'.repeat(3 - currentCard.difficulty)}
                    {' '}&mdash; Répondez correctement pour capturer la case !
                  </p>
                  <p className="text-lg font-medium text-gray-100 leading-relaxed mt-3 mb-5">
                    {currentCard.question}
                  </p>

                  {currentCard.type === 'QCM' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentCard.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setSelected(opt)
                            setTimeout(() => { submitAnswer(opt); setSelected(null) }, 200)
                          }}
                          disabled={selected !== null}
                          className={`px-4 py-3 rounded-lg border text-left transition-all text-sm font-medium
                            ${
                              selected === opt
                                ? 'border-rose-400 bg-rose-500/20 text-rose-200'
                                : 'border-gray-600 bg-gray-700/50 text-gray-200 hover:bg-gray-700'
                            }
                            ${selected !== null && selected !== opt ? 'opacity-40' : ''}
                          `}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-gray-700/40 border border-gray-600">
                        <p className="text-xs text-gray-400 mb-1">Réponse attendue :</p>
                        <p className="text-sm text-gray-200 italic">{currentCard.answer}</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => submitAnswer(true)}
                          className="flex-1 py-2.5 rounded-lg bg-emerald-600/20 border border-emerald-500/50
                            text-emerald-300 font-medium hover:bg-emerald-600/30 transition-colors"
                        >
                          Correct
                        </button>
                        <button
                          onClick={() => submitAnswer(false)}
                          className="flex-1 py-2.5 rounded-lg bg-rose-600/20 border border-rose-500/50
                            text-rose-300 font-medium hover:bg-rose-600/30 transition-colors"
                        >
                          Incorrect
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {phase === PHASES.RESULT && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-4 py-4"
                >
                  <div className={`text-6xl ${lastAnswerCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {lastAnswerCorrect ? '⚔️' : '🛡️'}
                  </div>
                  <p className={`text-xl font-bold ${lastAnswerCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {lastAnswerCorrect ? 'Case capturée !' : 'Duel perdu ! -1 point'}
                  </p>
                  <button
                    onClick={proceedAfterResult}
                    className="px-6 py-2.5 rounded-lg bg-gray-700 border border-gray-600
                      text-gray-200 font-medium hover:bg-gray-600 transition-colors"
                  >
                    Continuer
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
