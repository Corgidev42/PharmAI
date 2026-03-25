import { useGameStore } from './store/useGameStore'
import StartScreen from './components/StartScreen'
import Board from './components/Board'
import ScoreBoard from './components/ScoreBoard'
import Dice from './components/Dice'
import QuestionModal from './components/QuestionModal'
import DuelBanner from './components/DuelBanner'
import SpecialEventModal from './components/SpecialEventModal'
import GameOverScreen from './components/GameOverScreen'

export default function App() {
  const phase = useGameStore((s) => s.phase)

  if (phase === 'START') {
    return <StartScreen />
  }

  if (phase === 'GAME_OVER') {
    return <GameOverScreen />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8 pb-12">
      <h1 className="text-3xl md:text-4xl title-candy animate-neon-flicker">
        PharmAI
      </h1>
      <p className="-mt-4 text-sm text-pink-200/70 font-semibold">
        Plateau tout doux · néon · serpents amicaux
      </p>
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
        <ScoreBoard />
        <div className="flex flex-col items-center gap-6">
          <Board />
          <Dice />
        </div>
      </div>
      <QuestionModal />
      <DuelBanner />
      <SpecialEventModal />
    </div>
  )
}
