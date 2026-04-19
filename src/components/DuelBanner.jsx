import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { PHASES } from '../game/constants'
import OpenQuestionTwoPlayer from './OpenQuestionTwoPlayer'
import { QCMQuestion, ResultDisplay } from './QuestionModal'

export default function DuelBanner() {
  const phase = useGameStore((s) => s.phase)
  const currentCard = useGameStore((s) => s.currentCard)
  const currentPlayer = useGameStore((s) => s.currentPlayer)
  const players = useGameStore((s) => s.players)
  const submitAnswer = useGameStore((s) => s.submitAnswer)
  const lastAnswerCorrect = useGameStore((s) => s.lastAnswerCorrect)
  const proceedAfterResult = useGameStore((s) => s.proceedAfterResult)
  const landingType = useGameStore((s) => s.landingType)
  const slideNote = useGameStore((s) => s.slideNote)
  const soloMode = useGameStore((s) => s.soloMode)
  const lastSubmittedAnswer = useGameStore((s) => s.lastSubmittedAnswer)

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
          className="fixed inset-0 z-[55] flex items-center justify-center bg-fuchsia-950/75 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, rotate: -1 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.9 }}
            className="w-full max-w-lg rounded-[1.75rem] border-2 border-rose-400/50 bg-gradient-to-b from-purple-950/98 to-rose-950/40 shadow-neon-rose overflow-hidden"
          >
            <div className="bg-gradient-to-r from-pink-500/30 via-rose-500/25 to-amber-400/25 px-5 py-4 flex items-center justify-between border-b border-pink-400/20">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full shadow-neon-pink" style={{ backgroundColor: attacker.color }} />
                <span className="font-extrabold text-white text-sm">{attacker.name}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200">
                {soloMode ? 'Défi' : 'Duel'}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">
                  {soloMode ? 'Plateau' : defender.name}
                </span>
                {!soloMode && (
                  <div className="w-5 h-5 rounded-full shadow-neon-cyan" style={{ backgroundColor: defender.color }} />
                )}
              </div>
            </div>

            <div className="p-6">
              {slideNote && phase === PHASES.DUEL && (
                <p className="text-[11px] font-bold text-cyan-200 mb-4 px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-400/35 whitespace-pre-line">
                  {slideNote}
                </p>
              )}

              {phase === PHASES.DUEL && currentCard && (
                <>
                  <p className="text-xs font-semibold text-rose-200/90 mb-2">
                    Difficulté {'★'.repeat(currentCard.difficulty)}
                    {'☆'.repeat(3 - currentCard.difficulty)} — en cas de succès, tu captures la case.
                  </p>

                  {currentCard.type === 'QCM' ? (
                    <QCMQuestion
                      card={currentCard}
                      onAnswer={submitAnswer}
                      questionClassName="line-clamp-4 text-lg font-bold leading-relaxed text-white"
                    />
                  ) : (
                    <OpenQuestionTwoPlayer
                      activeName={attacker.name}
                      arbiterName={defender.name}
                      card={currentCard}
                      onAnswer={submitAnswer}
                      accent="rose"
                      soloMode={soloMode}
                    />
                  )}
                </>
              )}

              {phase === PHASES.RESULT && currentCard && (
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
                    failureSubtitle={
                      soloMode ? 'Pas capturé (−1 point).' : 'Échec du duel (−1 point).'
                    }
                  />
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
