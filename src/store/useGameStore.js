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
  }
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
    const newPos = movePlayer(player.position, s.diceValue)

    const updatedPlayers = s.players.map((p) =>
      p.id === s.currentPlayer ? { ...p, position: newPos } : p
    )

    const landing = resolveLanding(s.tiles, newPos, s.currentPlayer)

    if (landing === 'OWN') {
      const victory = checkVictory(s.tiles, s.deck, s.turnCount + 1)
      if (victory !== null) {
        set({
          players: updatedPlayers,
          turnCount: s.turnCount + 1,
          phase: PHASES.GAME_OVER,
          winner: victory,
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
      newTiles = captureTile(s.tiles, tileIndex, s.currentPlayer)
      newPlayers = s.players.map((p) =>
        p.id === s.currentPlayer ? { ...p, score: countOwnedTiles(newTiles, p.id) } : { ...p, score: countOwnedTiles(newTiles, p.id) }
      )
    } else if (s.landingType === 'OPPONENT') {
      const penalized = applyDuelPenalty(player)
      newPlayers = s.players.map((p) => (p.id === s.currentPlayer ? penalized : p))
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
      set({ phase: PHASES.GAME_OVER, winner: victory, turnCount: s.turnCount + 1 })
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
    })
  },

  // --- Reset ---
  resetGame: () => set(buildInitialState()),
}))
