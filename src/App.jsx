import { useGameStore } from './store/useGameStore'
import StartScreen from './components/StartScreen'
import Board from './components/Board'
import ScoreBoard from './components/ScoreBoard'
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
    <div className="h-[100dvh] min-h-0 w-full max-w-[100vw] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden max-lg:landscape:flex-row lg:flex-row gap-1 sm:gap-2 lg:gap-3 px-1 max-lg:landscape:px-1 sm:px-2 sm:px-3 pb-1 sm:pb-2 max-lg:landscape:pb-1">
        <div className="order-1 max-lg:landscape:order-2 lg:order-2 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="relative min-h-0 w-full min-w-0 flex-1 overflow-hidden">
            <Board />
          </div>
        </div>
        <aside
          className="order-2 max-lg:landscape:order-1 lg:order-1 flex min-h-0 w-full min-w-0 shrink-0 flex-col max-sm:max-h-[min(40svh,320px)] sm:max-lg:portrait:max-h-[min(38svh,300px)] max-lg:landscape:h-auto max-lg:landscape:max-h-none max-lg:landscape:w-[min(50vw,18rem)] max-lg:landscape:min-w-[min(50vw,18rem)] max-lg:landscape:max-w-[min(50vw,18rem)] max-lg:landscape:self-start lg:h-auto lg:max-h-none lg:w-72 lg:min-w-0 lg:max-w-[20rem] lg:self-start"
        >
          {/* Titre au-dessus du panneau, centré sur la largeur du panneau (laptop / tablette / mobile portrait / grand écran) */}
          <h1 className="shrink-0 w-full px-0.5 pb-1 pt-[max(0.25rem,env(safe-area-inset-top))] text-center text-base font-extrabold leading-tight tracking-tight title-candy animate-neon-flicker max-lg:landscape:pt-[max(0.2rem,env(safe-area-inset-top))] max-lg:landscape:pb-1 sm:text-lg md:text-xl lg:text-2xl">
            PharmAI
          </h1>
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden lg:h-auto lg:max-h-none">
            <div className="flex min-h-0 w-full flex-col overflow-hidden pb-[max(0.25rem,env(safe-area-inset-bottom))] lg:h-auto lg:min-h-0 lg:overflow-visible">
              <div className="mx-auto flex h-full min-h-0 w-full min-w-0 max-w-xs flex-col sm:w-72 max-lg:landscape:max-w-none lg:mx-0 lg:h-auto lg:max-w-none">
                <ScoreBoard />
              </div>
            </div>
          </div>
        </aside>
      </div>
      <QuestionModal />
      <DuelBanner />
      <SpecialEventModal />
      <RulesModal />
    </div>
  )
}
