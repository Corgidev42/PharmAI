import { create } from 'zustand'
import { PHASES, PLAYER_COLORS, PLAYER_NAMES, MAX_TURNS, SPECIAL_TILE, TOTAL_TILES } from '../game/constants.js'
import {
  rollDice,
  movePlayer,
  createInitialTiles,
  createPlayer,
  drawCard,
  drawChanceCard,
  checkAnswer,
  resolveLanding,
  captureTile,
  applyDuelPenalty,
  checkVictory,
  nextPlayerIndex,
  countOwnedTiles,
  applyPlayerBonus,
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
    /** Un paquet de cartes par joueur (index 0 et 1) — les questions du tour viennent du deck du joueur actif. */
    decks: [
      { theme: '', cards: [], currentIndex: 0 },
      { theme: '', cards: [], currentIndex: 0 },
    ],
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
    /** Animation cartoon à l’atterrissage */
    landingFx: null,
    /** Verrou pour éviter un double mouvement */
    isAnimatingMovement: false,
  }
}

function withSlide(subtitle, slideNote) {
  if (!slideNote) return subtitle
  return `${slideNote}\n\n${subtitle}`
}


const STEP_DELAY_MS = 110
const SLIDE_STEP_DELAY_MS = 90
const LANDING_FX_MS = 420

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function updatePlayerPosition(players, playerId, position) {
  return players.map((p) => (p.id === playerId ? { ...p, position } : p))
}

function backwardStep(position) {
  return (position - 1 + TOTAL_TILES) % TOTAL_TILES
}

function setDeckAt(decks, playerId, newDeck) {
  const out = [...decks]
  out[playerId] = newDeck
  return out
}

function getLandingFx(landingType) {
  if (landingType?.startsWith('SPECIAL_')) {
    return { kind: 'special', emoji: '◆', label: 'Effet' }
  }
  if (landingType === 'FREE' || landingType === 'CHANCE' || landingType === 'OPPONENT') {
    return { kind: 'question', emoji: '?', label: 'Question' }
  }
  return { kind: 'normal', emoji: '·', label: 'Stop' }
}

export const useGameStore = create((set, get) => ({
  ...buildInitialState(),

  // --- Setup ---
  setPlayerName: (id, name) =>
    set((s) => ({
      players: s.players.map((p) => (p.id === id ? { ...p, name } : p)),
    })),

  /** Charge le deck d’un joueur précis (0 ou 1). */
  loadDeckForPlayer: (playerId, deckData) =>
    set((s) => ({
      decks: setDeckAt(s.decks, playerId, {
        theme: deckData.theme,
        cards: [...deckData.cards],
        currentIndex: 0,
      }),
      deckErrors: null,
    })),

  setDeckErrors: (errors) => set({ deckErrors: errors }),

  startGame: () => set({ phase: PHASES.ROLLING }),

  // --- Rolling ---
  roll: () => {
    const value = rollDice()
    set({ diceValue: value, phase: PHASES.MOVING })
    return value
  },

  // --- Movement resolution ---
  finishMovement: async () => {
    const s = get()
    if (s.isAnimatingMovement || s.phase !== PHASES.MOVING || !s.diceValue) return

    set({ isAnimatingMovement: true, landingFx: null })

    const player = s.players[s.currentPlayer]
    let movingPlayers = s.players
    let pos = player.position

    for (let i = 0; i < s.diceValue; i++) {
      pos = movePlayer(pos, 1)
      movingPlayers = updatePlayerPosition(movingPlayers, s.currentPlayer, pos)
      set({ players: movingPlayers })
      await sleep(STEP_DELAY_MS)
    }

    let serpents = 0
    let echelles = 0
    let guard = 0

    while (guard < 10) {
      guard++
      const special = s.tiles[pos]?.special
      if (!special) break

      if (special === SPECIAL_TILE.SERPENT) {
        for (let i = 0; i < 2; i++) {
          pos = backwardStep(pos)
          movingPlayers = updatePlayerPosition(movingPlayers, s.currentPlayer, pos)
          set({ players: movingPlayers })
          await sleep(SLIDE_STEP_DELAY_MS)
        }
        serpents++
        continue
      }

      if (special === SPECIAL_TILE.ECHELLE) {
        for (let i = 0; i < 2; i++) {
          pos = movePlayer(pos, 1)
          movingPlayers = updatePlayerPosition(movingPlayers, s.currentPlayer, pos)
          set({ players: movingPlayers })
          await sleep(SLIDE_STEP_DELAY_MS)
        }
        echelles++
        continue
      }

      break
    }

    const slideBits = []
    if (serpents) slideBits.push(`${serpents} serpent${serpents > 1 ? 's' : ''}`)
    if (echelles) slideBits.push(`${echelles} échelle${echelles > 1 ? 's' : ''}`)
    const slideNote = slideBits.length ? `${slideBits.join(' · ')} — case ajustée.` : null

    const newPos = pos
    const updatedPlayers = movingPlayers
    const landing = resolveLanding(s.tiles, newPos, s.currentPlayer)
    const pid = s.currentPlayer
    const myDeck = s.decks[pid]

    const fx = getLandingFx(landing)
    set({ landingFx: { id: Date.now(), tileIndex: newPos, ...fx } })
    await sleep(LANDING_FX_MS)
    set({ landingFx: null })

    if (landing === 'SPECIAL_DEPART') {
      const playersWithBonus = applyPlayerBonus(updatedPlayers, s.currentPlayer, 1)
      set({
        players: playersWithBonus,
        phase: PHASES.RESULT,
        specialFeedback: {
          kind: 'depart',
          title: 'Départ',
          subtitle: withSlide('+1 bonus.', slideNote),
          positive: true,
          neon: 'lime',
        },
        slideNote: null,
        diceValue: null,
        landingType: null,
        currentCard: null,
        lastAnswerCorrect: null,
        isAnimatingMovement: false,
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
          title: 'Fée',
          subtitle: withSlide('+1 bonus.', slideNote),
          positive: true,
          neon: 'pink',
        },
        slideNote: null,
        diceValue: null,
        landingType: null,
        currentCard: null,
        lastAnswerCorrect: null,
        isAnimatingMovement: false,
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
          title: 'Potion',
          subtitle: withSlide('+2 bonus.', slideNote),
          positive: true,
          neon: 'fuchsia',
        },
        slideNote: null,
        diceValue: null,
        landingType: null,
        currentCard: null,
        lastAnswerCorrect: null,
        isAnimatingMovement: false,
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
          title: 'Mégaphone',
          subtitle: withSlide('+1 bonus.', slideNote),
          positive: true,
          neon: 'amber',
        },
        slideNote: null,
        diceValue: null,
        landingType: null,
        currentCard: null,
        lastAnswerCorrect: null,
        isAnimatingMovement: false,
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
          title: 'Taxe',
          subtitle: withSlide('−1 bonus (plancher à 0).', slideNote),
          positive: false,
          neon: 'rose',
        },
        slideNote: null,
        diceValue: null,
        landingType: null,
        currentCard: null,
        lastAnswerCorrect: null,
        isAnimatingMovement: false,
      })
      return
    }

    if (landing === 'SPECIAL_NUAGE') {
      const playersWithBonus = applyPlayerBonus(updatedPlayers, s.currentPlayer, 1)
      set({
        players: playersWithBonus,
        phase: PHASES.RESULT,
        specialFeedback: {
          kind: 'nuage',
          title: 'Nuage',
          subtitle: withSlide('+1 bonus. Tu rejoues : relance le dé (même joueur).', slideNote),
          positive: true,
          neon: 'sky',
          extraTurn: true,
        },
        slideNote: null,
        diceValue: null,
        landingType: null,
        currentCard: null,
        lastAnswerCorrect: null,
        isAnimatingMovement: false,
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
        isAnimatingMovement: false,
      })
      return
    }

    if (landing === 'SPECIAL_CHANCE') {
      const { card, nextIndex, remainingCards } = drawChanceCard(myDeck.cards, myDeck.currentIndex)
      if (!card) {
        set({
          players: updatedPlayers,
          phase: PHASES.GAME_OVER,
          winner: checkVictory(s.tiles, s.decks, s.turnCount + 1) ?? -1,
          isAnimatingMovement: false,
        })
        return
      }
      const newDeckState = remainingCards
        ? { ...myDeck, cards: remainingCards }
        : { ...myDeck, currentIndex: nextIndex }
      set({
        players: updatedPlayers,
        currentCard: card,
        decks: setDeckAt(s.decks, pid, newDeckState),
        landingType: 'CHANCE',
        phase: PHASES.QUESTION,
        diceValue: null,
        slideNote,
        isAnimatingMovement: false,
      })
      return
    }

    if (landing === 'OWN') {
      const victory = checkVictory(s.tiles, s.decks, s.turnCount + 1)
      if (victory !== null) {
        set({
          players: updatedPlayers,
          turnCount: s.turnCount + 1,
          phase: PHASES.GAME_OVER,
          winner: victory,
          slideNote: null,
          isAnimatingMovement: false,
        })
        return
      }
      if (slideNote) {
        set({
          players: updatedPlayers,
          phase: PHASES.RESULT,
          specialFeedback: {
            kind: 'own_slide',
            title: 'Ta case',
            subtitle: `${slideNote}\n\nPropriété déjà à toi : fin de tour.`,
            positive: true,
            neon: 'sky',
          },
          slideNote: null,
          diceValue: null,
          landingType: null,
          currentCard: null,
          lastAnswerCorrect: null,
          isAnimatingMovement: false,
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
        isAnimatingMovement: false,
      })
      return
    }

    if (landing === 'FREE') {
      const { card, nextIndex } = drawCard(myDeck.cards, myDeck.currentIndex)
      if (!card) {
        set({
          players: updatedPlayers,
          phase: PHASES.GAME_OVER,
          winner: checkVictory(s.tiles, s.decks, s.turnCount + 1) ?? -1,
          isAnimatingMovement: false,
        })
        return
      }
      set({
        players: updatedPlayers,
        currentCard: card,
        decks: setDeckAt(s.decks, pid, { ...myDeck, currentIndex: nextIndex }),
        landingType: 'FREE',
        phase: PHASES.QUESTION,
        diceValue: null,
        slideNote,
        isAnimatingMovement: false,
      })
      return
    }

    const tileDifficulty = myDeck.cards.length > 0 ? 1 : 0
    const { card, nextIndex, remainingCards } = drawCard(
      myDeck.cards,
      myDeck.currentIndex,
      tileDifficulty
    )
    if (!card) {
      set({
        players: updatedPlayers,
        phase: PHASES.GAME_OVER,
        winner: checkVictory(s.tiles, s.decks, s.turnCount + 1) ?? -1,
        isAnimatingMovement: false,
      })
      return
    }
    const newDeckAfterDuel = remainingCards
      ? { ...myDeck, cards: remainingCards }
      : { ...myDeck, currentIndex: nextIndex }

    set({
      players: updatedPlayers,
      currentCard: card,
      decks: setDeckAt(s.decks, pid, newDeckAfterDuel),
      landingType: 'OPPONENT',
      phase: PHASES.DUEL,
      diceValue: null,
      slideNote,
      isAnimatingMovement: false,
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
        newPlayers = applyPlayerBonus(s.players, s.currentPlayer, 2).map((p) => ({
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
      landingFx: null,
    })
  },

  // --- After result display ---
  proceedAfterResult: () => {
    const s = get()
    const victory = checkVictory(s.tiles, s.decks, s.turnCount + 1)
    if (victory !== null) {
      set({
        phase: PHASES.GAME_OVER,
        winner: victory,
        turnCount: s.turnCount + 1,
        specialFeedback: null,
        slideNote: null,
        landingFx: null,
      })
      return
    }
    if (s.specialFeedback?.extraTurn) {
      set({
        phase: PHASES.ROLLING,
        diceValue: null,
        currentCard: null,
        landingType: null,
        lastAnswerCorrect: null,
        specialFeedback: null,
        slideNote: null,
        landingFx: null,
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
      landingFx: null,
    })
  },

  // --- Reset ---
  resetGame: () => set(buildInitialState()),
}))
