import { create } from 'zustand'
import {
  PHASES,
  PLAYER_COLORS,
  PLAYER_NAMES,
  MAX_TURNS,
  LAST_TILE_INDEX,
  BOARD_STEP_MS,
  SPECIAL_TILE,
} from '../game/constants.js'
import {
  rollDice,
  stepForward,
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
    decks: [
      { theme: '', cards: [], currentIndex: 0 },
      { theme: '', cards: [], currentIndex: 0 },
    ],
    diceValue: null,
    currentCard: null,
    landingType: null,
    lastAnswerCorrect: null,
    /** Dernière réponse soumise (texte d’option QCM ou booléen OPEN) — feedback visuel en phase RESULT. */
    lastSubmittedAnswer: null,
    turnCount: 0,
    maxTurns: MAX_TURNS,
    winner: null,
    deckErrors: null,
    specialFeedback: null,
    slideNote: null,
    landingFx: null,
    isAnimatingMovement: false,
    /** Glissement le long du ruban SVG : le pion anime puis appelle acknowledgeSlide. */
    slidePath: null,
  }
}

function withSlide(subtitle, slideNote) {
  if (!slideNote) return subtitle
  return `${slideNote}\n\n${subtitle}`
}

const STEP_DELAY_MS = BOARD_STEP_MS
const LANDING_FX_MS = 420

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function updatePlayerPosition(players, playerId, position) {
  return players.map((p) => (p.id === playerId ? { ...p, position } : p))
}

function setDeckAt(decks, playerId, newDeck) {
  const out = [...decks]
  out[playerId] = newDeck
  return out
}

/** Résolu quand le pion a fini l’anim sur le ruban (évite de bloquer finishMovement). */
let pendingSlideResolve = null

function getLandingFx(landingType) {
  if (landingType === 'SPECIAL_FIN') {
    return { kind: 'special', emoji: '🏁', label: 'Arrivée' }
  }
  if (landingType?.startsWith('SPECIAL_')) {
    return { kind: 'special', emoji: '◆', label: 'Effet' }
  }
  if (landingType === 'FREE' || landingType === 'OPPONENT') {
    return { kind: 'question', emoji: '?', label: 'Question' }
  }
  return { kind: 'normal', emoji: '·', label: 'Stop' }
}

export const useGameStore = create((set, get) => ({
  ...buildInitialState(),

  setPlayerName: (id, name) =>
    set((s) => ({
      players: s.players.map((p) => (p.id === id ? { ...p, name } : p)),
    })),

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

  roll: () => {
    const value = rollDice()
    set({ diceValue: value, phase: PHASES.MOVING })
    return value
  },

  acknowledgeSlide: () => {
    const s = get()
    const sp = s.slidePath
    const resolve = pendingSlideResolve
    pendingSlideResolve = null
    if (sp) {
      const movingPlayers = updatePlayerPosition(s.players, sp.playerId, sp.toIndex)
      set({ players: movingPlayers, slidePath: null })
    }
    if (resolve) resolve()
  },

  finishMovement: async () => {
    const s = get()
    if (s.isAnimatingMovement || s.phase !== PHASES.MOVING || !s.diceValue) return

    set({ isAnimatingMovement: true, landingFx: null, slidePath: null })

    const player = s.players[s.currentPlayer]
    let movingPlayers = s.players
    let pos = player.position

    for (let i = 0; i < s.diceValue; i++) {
      if (pos >= LAST_TILE_INDEX) break
      pos = stepForward(pos)
      movingPlayers = updatePlayerPosition(movingPlayers, s.currentPlayer, pos)
      set({ players: movingPlayers })
      await sleep(STEP_DELAY_MS)
    }

    let slideNote = null
    let serpents = 0
    let echelles = 0
    let guardSlide = 0
    while (guardSlide < 24) {
      guardSlide++
      const tile = s.tiles[pos]
      if (!tile?.special) break
      const st = tile.special
      if (st !== SPECIAL_TILE.SERPENT && st !== SPECIAL_TILE.ECHELLE) break
      const target = tile.slideTo
      if (target == null || target === pos) break
      const clamped = Math.max(0, Math.min(LAST_TILE_INDEX, target))
      if (st === SPECIAL_TILE.SERPENT) serpents++
      if (st === SPECIAL_TILE.ECHELLE) echelles++
      const slideKind = st === SPECIAL_TILE.SERPENT ? 'snake' : 'ladder'
      await new Promise((resolve) => {
        pendingSlideResolve = resolve
        set({
          slidePath: {
            playerId: s.currentPlayer,
            fromIndex: pos,
            toIndex: clamped,
            kind: slideKind,
          },
        })
      })
      pos = get().players[s.currentPlayer].position
      movingPlayers = get().players
    }
    if (serpents || echelles) {
      const bits = []
      if (serpents) bits.push(`${serpents} serpent${serpents > 1 ? 's' : ''}`)
      if (echelles) bits.push(`${echelles} échelle${echelles > 1 ? 's' : ''}`)
      slideNote = `${bits.join(' · ')} — déplacement.`
    }

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

    if (landing === 'SPECIAL_FIN') {
      const playersWithBonus = applyPlayerBonus(updatedPlayers, s.currentPlayer, 2)
      set({
        players: playersWithBonus,
        phase: PHASES.RESULT,
        specialFeedback: {
          kind: 'fin',
          title: 'Arrivée !',
          subtitle: withSlide('Tu as atteint la case 100 — +2 bonus. Course vers le haut !', slideNote),
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

  submitAnswer: (answer) => {
    const s = get()
    const correct = checkAnswer(s.currentCard, answer)
    const player = s.players[s.currentPlayer]
    const tileIndex = player.position

    let newTiles = s.tiles
    let newPlayers = s.players

    if (correct) {
      newTiles = captureTile(s.tiles, tileIndex, s.currentPlayer)
      newPlayers = s.players.map((p) => ({
        ...p,
        score: countOwnedTiles(newTiles, p.id),
      }))
    } else if (s.landingType === 'OPPONENT') {
      const penalized = applyDuelPenalty(player)
      newPlayers = s.players.map((p) => (p.id === s.currentPlayer ? penalized : p))
    }

    set({
      tiles: newTiles,
      players: newPlayers,
      lastAnswerCorrect: correct,
      lastSubmittedAnswer: answer,
      phase: PHASES.RESULT,
      landingFx: null,
    })
  },

  proceedAfterResult: () => {
    const s = get()
    const victory = checkVictory(s.tiles, s.decks, s.turnCount + 1)
    if (victory !== null) {
      set({
        phase: PHASES.GAME_OVER,
        winner: victory,
        turnCount: s.turnCount + 1,
        lastSubmittedAnswer: null,
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
      lastSubmittedAnswer: null,
      specialFeedback: null,
      slideNote: null,
      landingFx: null,
    })
  },

  resetGame: () => set(buildInitialState()),
}))
