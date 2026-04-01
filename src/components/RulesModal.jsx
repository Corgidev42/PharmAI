import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SECTIONS = [
  {
    title: 'But du jeu',
    body: 'Poss\u00e9der le plus de cases possible sur le plateau. Le joueur avec le plus de propri\u00e9t\u00e9s \u00e0 la fin de la partie gagne\u2009!',
  },
  {
    title: 'D\u00e9roulement d\u2019un tour',
    body: '1. Lance le d\u00e9.\n2. Ton serpent avance du nombre de cases indiqu\u00e9.\n3. Selon la case\u2009:\n   \u2022 Case libre \u2192 r\u00e9ponds \u00e0 une question pour la capturer.\n   \u2022 Case adverse \u2192 duel\u2009! Bonne r\u00e9ponse = tu la prends.\n   \u2022 Ta propre case \u2192 repos, au joueur suivant.',
  },
  {
    title: 'Cases sp\u00e9ciales',
    body: '\u2022 D\u00e9part \u2014 +1 bonus\n\u2022 Chance \u2014 pioche la question la plus facile restante ; +2 bonus si bonne r\u00e9ponse (pas de capture)\n\u2022 \u00c9chelle \u2014 avance de 2 cases\n\u2022 Serpent \u2014 recule de 2 cases\n\u2022 Nuage \u2014 +1 bonus et tu rejoues (relance le d\u00e9)\n\u2022 F\u00e9e \u2014 +1 bonus\n\u2022 Taxe \u2014 \u22121 bonus\n\u2022 Questions ouvertes \u2014 le joueur actif ne doit pas voir la r\u00e9ponse attendue : compte \u00e0 rebours puis lecture par l\u2019autre joueur.',
  },
  {
    title: 'Fin de partie',
    body: 'La partie se termine quand le deck de questions est \u00e9puis\u00e9 ou apr\u00e8s 30 tours. Le joueur poss\u00e9dant le plus de cases gagne. En cas d\u2019\u00e9galit\u00e9\u2009: match nul\u2009!',
  },
]

export default function RulesModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full glass-candy border-2 border-pink-400/40
          flex items-center justify-center text-pink-200 hover:text-white hover:border-pink-400/70
          transition-all hover:shadow-neon-pink text-lg font-bold"
        aria-label="R\u00e8gles du jeu"
      >
        ?
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="relative glass-candy border-2 border-pink-400/30 p-6 md:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <h2 className="text-2xl title-candy mb-5">
                R\u00e8gles du jeu
              </h2>

              <div className="space-y-4">
                {SECTIONS.map((s) => (
                  <div key={s.title}>
                    <h3 className="text-sm font-extrabold text-pink-300 mb-1">{s.title}</h3>
                    <p className="text-sm text-gray-200/85 whitespace-pre-line leading-relaxed">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setOpen(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-500
                  text-white font-bold shadow-neon-pink hover:brightness-110 transition-all"
              >
                Compris\u2009!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
