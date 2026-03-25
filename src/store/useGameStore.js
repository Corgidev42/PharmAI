import { create } from 'zustand'
import { PHASES, PLAYER_COLORS, PLAYER_NAMES, MAX_TURNS } from '../game/constants.js'
import {
  rollDice,
  movePlayer,
  createInitialTiles,
  createPlayer,
  drawCard,
  checkAnswer,
  resolveLanding,
  captureTile,
  applyDuelPenalty,
  checkVictory,
  nextPlayerIndex,
  countOwnedTiles,
  applyPlayerBonus,
  applySerpentsEtEchelles,
  getRestSpecialCopy,
} from '../game/engine.js'

function buildInitialState() {
  return {
    phase: PHASES.START,
    currentPlayer: 0,
    players: [
      createPlayer(0, PLAYER_NAMES[0], PLAYER_COLORS[0]),
      createPlayer(1, PLAYER_NAMES[1], PLAYER_COLORS[1]),
    ],
    tiles: createInitialTiles(),
    deck: { theme: '', cards: [], currentIndex: 0 },
    diceValue: null,
    currentCard: null,
    landingType: null,
    lastAnswerCorrect: null,
    turnCount: 0,
    maxTurns: MAX_TURNS,
    winner: null,
    deckErrors: null,
    /** Événement case spéciale (Départ, Taxe, Parc…) affiché en modale sans question */
    specialFeedback: null,
    /** Message après glissade serpent/échelle (affiché au-dessus des questions / modales) */
    slideNote: null,
  }
}

function withSlide(subtitle, slideNote) {
  if (!slideNote) return subtitle
  return `${slideNote}\n\n${subtitle}`
}

export const useGameStore = create((set, get) => ({
  ...buildInitialState(),

  // --- Setup ---
  setPlayerName: (id, name) =>
    set((s) => ({
      players: s.players.map((p) => (p.id === id ? { ...p, name } : p)),
    })),

  loadDeck: (deckData) =>
    set({
      deck: { theme: deckData.theme, cards: [...deckData.cards], currentIndex: 0 },
      deckErrors: null,
    }),

  setDeckErrors: (errors) => set({ deckErrors: errors }),

  startGame: () => set({ phase: PHASES.ROLLING }),

  // --- Rolling ---
  roll: () => {
    const value = rollDice()
    set({ diceValue: value, phase: PHASES.MOVING })
    return value
  },

  // --- Movement resolution ---
  finishMovement: () => {
    const s = get()
    const player = s.players[s.currentPlayer]
    const rawPos = movePlayer(player.position, s.diceValue)
    const { finalIndex, slideNote } = applySerpentsEtEchelles(rawPos, s.tiles)
    const newPos = finalIndex

    const updatedPlayers = s.players.map((p) =>
      p.id === s.currentPlayer ? { ...p, position: newPos } : p
    )

    const landing = resolveLanding(s.tiles, newPos, s.currentPlayer)

    if (landing === 'SPECIAL_DEPART') {
      const playersWithBonus = applyPlayerBonus(updatedPlayers, s.currentPlayer, 1)
      set({
        players: playersWithBonus,
        phase: PHASES.RESULT,
        specialFeedback: {
          kind: 'depart',
          title: '🌟 Super départ !',
          subtitle: withSlide('Prime toute mignonne : +1 point bonus ✨', slideNote),
          positive: true,
          neon: 'lime',
        },
        slideNote: null,
        diceValue: null,
        landingType: null,
        currentCard: null,
        lastAnswerCorrect: null,
      })
      return
    }

    if (landing === 'SPECIAL_FEE_BONBONS') {
      const playersWithBonus = applyPlayerBonus(updatedPlayers, s.currentPlayer, 1)
      set({
        players: playersWithBonus,
        phase: PHASES.RESULT,
        specialFeedback: {
          kind: 'fee',
          title: '🧚 Fée des bonbons',
          subtitle: withSlide('Elle te file un sucre magique : +1 bonus !', slideNote),
          positive: true,
          neon: 'pink',
        },
        slideNote: null,
        diceValue: null,
        landingType: null,
        currentCard: null,
        lastAnswerCorrect: null,
      })
      return
    }

    if (landing === 'SPECIAL_POTION_DOUX') {
      const playersWithBonus = applyPlayerBonus(updatedPlayers, s.currentPlayer, 2)
      set({
        players: playersWithBonus,
        phase: PHASES.RESULT,
        specialFeedback: {
          kind: 'potion',
          title: '🧪 Potion rose',
          subtitle: withSlide('Gloups ! Ça pétille : +2 bonus !', slideNote),
          positive: true,
          neon: 'fuchsia',
        },
        slideNote: null,
        diceValue: null,
        landingType: null,
        currentCard: null,
        lastAnswerCorrect: null,
      })
      return
    }

    if (landing === 'SPECIAL_MEGAPHONE') {
      const playersWithBonus = applyPlayerBonus(updatedPlayers, s.currentPlayer, 1)
      set({
        players: playersWithBonus,
        phase: PHASES.RESULT,
        specialFeedback: {
          kind: 'megaphone',
          title: '📣 Mégaphone kawaii',
          subtitle: withSlide('Tout le monde t’entend briller : +1 bonus !', slideNote),
          positive: true,
          neon: 'amber',
        },
        slideNote: null,
        diceValue: null,
        landingType: null,
        currentCard: null,
        lastAnswerCorrect: null,
      })
      return
    }

    if (landing === 'SPECIAL_TAX') {
      const playersAfterTax = applyPlayerBonus(updatedPlayers, s.currentPlayer, -1)
      set({
        players: playersAfterTax,
        phase: PHASES.RESULT,
        specialFeedback: {
          kind: 'tax',
          title: '💸 Taxe des licornes',
          subtitle: withSlide('Elles ont besoin de paillettes : −1 bonus (min. 0).', slideNote),
          positive: false,
          neon: 'rose',
        },
        slideNote: null,
        diceValue: null,
        landingType: null,
        currentCard: null,
        lastAnswerCorrect: null,
      })
      return
    }

    if (landing === 'SPECIAL_REST') {
      const tile = s.tiles[newPos]
      const copy = getRestSpecialCopy(tile.special)
      set({
        players: updatedPlayers,
        phase: PHASES.RESULT,
        specialFeedback: {
          kind: 'rest',
          title: copy.title,
          subtitle: withSlide(copy.subtitle, slideNote),
          positive: true,
          neon: 'cyan',
        },
        slideNote: null,
        diceValue: null,
        landingType: null,
        currentCard: null,
        lastAnswerCorrect: null,
      })
      return
    }

    if (landing === 'SPECIAL_CHANCE') {
      const { card, nextIndex } = drawCard(s.deck.cards, s.deck.currentIndex)
      if (!card) {
        set({
          players: updatedPlayers,
          phase: PHASES.GAME_OVER,
          winner: checkVictory(s.tiles, s.deck, s.turnCount + 1) ?? -1,
        })
        return
      }
      set({
        players: updatedPlayers,
        currentCard: card,
        deck: { ...s.deck, currentIndex: nextIndex },
        landingType: 'CHANCE',
        phase: PHASES.QUESTION,
        diceValue: null,
        slideNote,
      })
      return
    }

    if (landing === 'OWN') {
      const victory = checkVictory(s.tiles, s.deck, s.turnCount + 1)
      if (victory !== null) {
        set({
          players: updatedPlayers,
          turnCount: s.turnCount + 1,
          phase: PHASES.GAME_OVER,
          winner: victory,
          slideNote: null,
        })
        return
      }
      if (slideNote) {
        set({
          players: updatedPlayers,
          phase: PHASES.RESULT,
          specialFeedback: {
            kind: 'own_slide',
            title: '🏠 Toujours chez toi',
            subtitle: `${slideNote}\n\nC’est ta propriété : repos, au joueur suivant !`,
            positive: true,
            neon: 'sky',
          },
          slideNote: null,
          diceValue: null,
          landingType: null,
          currentCard: null,
          lastAnswerCorrect: null,
        })
        return
      }
      set({
        players: updatedPlayers,
        phase: PHASES.ROLLING,
        currentPlayer: nextPlayerIndex(s.currentPlayer),
        turnCount: s.turnCount + 1,
        diceValue: null,
        landingType: null,
        slideNote: null,
      })
      return
    }

    if (landing === 'FREE') {
      const { card, nextIndex } = drawCard(s.deck.cards, s.deck.currentIndex)
      if (!card) {
        set({
          players: updatedPlayers,
          phase: PHASES.GAME_OVER,
          winner: checkVictory(s.tiles, s.deck, s.turnCount + 1) ?? -1,
        })
        return
      }
      set({
        players: updatedPlayers,
        currentCard: card,
        deck: { ...s.deck, currentIndex: nextIndex },
        landingType: 'FREE',
        phase: PHASES.QUESTION,
        diceValue: null,
        slideNote,
      })
      return
    }

    // OPPONENT tile -> duel
    const tileDifficulty = s.deck.cards.length > 0 ? 1 : 0
    const { card, nextIndex, remainingCards } = drawCard(
      s.deck.cards,
      s.deck.currentIndex,
      tileDifficulty
    )
    if (!card) {
      set({
        players: updatedPlayers,
        phase: PHASES.GAME_OVER,
        winner: checkVictory(s.tiles, s.deck, s.turnCount + 1) ?? -1,
      })
      return
    }
    const newDeck = remainingCards
      ? { ...s.deck, cards: remainingCards }
      : { ...s.deck, currentIndex: nextIndex }

    set({
      players: updatedPlayers,
      currentCard: card,
      deck: newDeck,
      landingType: 'OPPONENT',
      phase: PHASES.DUEL,
      diceValue: null,
      slideNote,
    })
  },

  // --- Answering ---
  submitAnswer: (answer) => {
    const s = get()
    const correct = checkAnswer(s.currentCard, answer)
    const player = s.players[s.currentPlayer]
    const tileIndex = player.position

    let newTiles = s.tiles
    let newPlayers = s.players

    if (correct) {
      if (s.landingType === 'CHANCE') {
        newPlayers = applyPlayerBonus(s.players, s.currentPlayer, 1).map((p) => ({
          ...p,
          score: countOwnedTiles(s.tiles, p.id),
        }))
        newTiles = s.tiles
      } else {
        newTiles = captureTile(s.tiles, tileIndex, s.currentPlayer)
        newPlayers = s.players.map((p) => ({
          ...p,
          score: countOwnedTiles(newTiles, p.id),
        }))
      }
    } else if (s.landingType === 'OPPONENT') {
      const penalized = applyDuelPenalty(player)
      newPlayers = s.players.map((p) => (p.id === s.currentPlayer ? penalized : p))
    } else if (!correct && s.landingType === 'CHANCE') {
      newPlayers = s.players
      newTiles = s.tiles
    }

    set({
      tiles: newTiles,
      players: newPlayers,
      lastAnswerCorrect: correct,
      phase: PHASES.RESULT,
    })
  },

  // --- After result display ---
  proceedAfterResult: () => {
    const s = get()
    const victory = checkVictory(s.tiles, s.deck, s.turnCount + 1)
    if (victory !== null) {
      set({
        phase: PHASES.GAME_OVER,
        winner: victory,
        turnCount: s.turnCount + 1,
        specialFeedback: null,
        slideNote: null,
      })
      return
    }
    set({
      phase: PHASES.ROLLING,
      currentPlayer: nextPlayerIndex(s.currentPlayer),
      turnCount: s.turnCount + 1,
      diceValue: null,
      currentCard: null,
      landingType: null,
      lastAnswerCorrect: null,
      specialFeedback: null,
      slideNote: null,
    })
  },

  // --- Reset ---
  resetGame: () => set(buildInitialState()),
}))
