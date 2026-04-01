import { useGameStore } from './store/useGameStore'
import StartScreen from './components/StartScreen'
import Board from './components/Board'
import ScoreBoard from './components/ScoreBoard'
import Dice from './components/Dice'
import QuestionModal from './components/QuestionModal'
import DuelBanner from './components/DuelBanner'
import SpecialEventModal from './components/SpecialEventModal'
import GameOverScreen from './components/GameOverScreen'
import RulesModal from './components/RulesModal'

export default function App() {
  const phase = useGameStore((s) => s.phase)

  if (phase === 'START') {
    return <StartScreen />
  }

  if (phase === 'GAME_OVER') {
    return <GameOverScreen />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 gap-4 pb-8">
      <h1 className="text-2xl md:text-3xl title-candy animate-neon-flicker">
        PharmAI
      </h1>
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
        <ScoreBoard />
        <div className="flex flex-col items-center gap-4">
          <Board />
          <Dice />
        </div>
      </div>
      <QuestionModal />
      <DuelBanner />
      <SpecialEventModal />
      <RulesModal />
    </div>
  )
}
