import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SECTIONS = [
  {
    title: 'But du jeu',
    body: 'Posséder le plus de cases possible. Le joueur avec le plus de propriétés à la fin gagne. Le plateau est une course du bas vers le haut (case 1 → case 100).',
  },
  {
    title: 'Parcours serpentin',
    body: 'Comme un jeu de l’oie classique : la ligne du bas va de gauche à droite (1→10), la ligne au-dessus de droite à gauche (20→11), et ainsi de suite jusqu’à la case 100 en haut à gauche. On ne repart pas au début après 100 : le dé s’arrête à l’arrivée.',
  },
  {
    title: 'Déplacement',
    body: 'Lance le dé : tu avances le long du parcours. Si le dé te ferait dépasser la case 100, tu t’arrêtes sur 100. Les échelles (↑) te font monter tout de suite ; les serpents (↓) te font descendre. Pas de question pour monter une échelle simple.',
  },
  {
    title: 'Questions',
    body: 'Sur une case libre → question pour capturer. Sur une case adverse → duel. Départ : +1 bonus. Case Arrivée (100) : +2 bonus.',
  },
  {
    title: 'Fin de partie',
    body: 'Quand les deux decks sont épuisés ou après 64 tours, le joueur avec le plus de cases gagne.',
  },
]

export default function RulesModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-candy border-2 border-pink-400/40
          top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))]
          flex items-center justify-center text-pink-200 hover:text-white hover:border-pink-400/70
          transition-all hover:shadow-neon-pink text-lg font-bold"
        aria-label="Règles du jeu"
      >
        ?
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-3 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="relative flex h-[min(100dvh,100%)] max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-2 border-pink-400/30 glass-candy p-4 sm:p-5"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <h2 className="shrink-0 text-xl title-candy sm:text-2xl">Règles du jeu</h2>

              <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-x-4 gap-y-2 overflow-hidden sm:grid-cols-2 sm:gap-y-3">
                {SECTIONS.map((s) => (
                  <div key={s.title} className="min-h-0 overflow-hidden">
                    <h3 className="text-[11px] font-extrabold text-pink-300 sm:text-xs">{s.title}</h3>
                    <p className="mt-0.5 text-[10px] leading-snug text-gray-200/90 sm:text-[11px]">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-3 w-full shrink-0 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-500 py-2.5 text-sm font-bold text-white shadow-neon-pink transition-all hover:brightness-110"
              >
                Compris !
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
