import { useReducer, useEffect, useCallback, useRef } from 'react'
import { gameReducer, initialState } from './gameReducer'
import { useAnimationSequencer } from './useAnimationSequencer'
import {
  calculateHandValue,
  basicStrategyDecision,
  computeDealerHits,
} from './gameLogic'

export function useBlackjackGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const { signalAnimationComplete, waitForAnimation, delay, enqueue, cleanup, mountedRef } =
    useAnimationSequencer()
  const autoPlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const insuranceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeHand = state.hands[state.activeHandIndex]
  const activeCards = activeHand?.cards ?? []

  // Load from localStorage on mount
  useEffect(() => {
    const chips = parseInt(localStorage.getItem('bj_playerChips') || '1000', 10)
    const wins = parseInt(localStorage.getItem('bj_wins') || '0', 10)
    const losses = parseInt(localStorage.getItem('bj_losses') || '0', 10)
    dispatch({ type: 'LOAD_SAVED_STATE', chips, wins, losses })

    return () => {
      cleanup()
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current)
      if (insuranceTimeoutRef.current) clearTimeout(insuranceTimeoutRef.current)
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('bj_playerChips', String(state.playerChips))
    localStorage.setItem('bj_wins', String(state.wins))
    localStorage.setItem('bj_losses', String(state.losses))
  }, [state.playerChips, state.wins, state.losses])

  // Auto-play: always decline insurance
  useEffect(() => {
    if (!state.autoPlayEnabled) return
    if (state.phase !== 'insurance-prompt') return

    autoPlayTimeoutRef.current = setTimeout(() => {
      declineInsurance()
    }, 700)

    return () => {
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current)
    }
  }, [state.autoPlayEnabled, state.phase])

  // Auto-play: player turn decisions
  useEffect(() => {
    if (!state.autoPlayEnabled) return
    if (state.phase !== 'player-turn') return
    if (state.animationLock) return
    if (!activeHand || calculateHandValue(activeCards) > 21) return

    const canSplit = activeCards.length === 2
      && activeCards[0].rank === activeCards[1].rank
      && state.playerChips >= activeHand.bet
      && state.hands.length === 1 // only allow one split in auto-play
    const canDouble = activeCards.length === 2 && state.playerChips >= activeHand.bet
    const canSurrenderNow = activeCards.length === 2 && state.hands.length === 1

    const decision = basicStrategyDecision(
      activeCards,
      state.dealerHand[0],
      canSplit,
      canDouble,
      canSurrenderNow
    )

    autoPlayTimeoutRef.current = setTimeout(() => {
      if (decision === 'split') {
        split()
      } else if (decision === 'double') {
        doubleDown()
      } else if (decision === 'surrender') {
        surrender()
      } else if (decision === 'hit') {
        hit()
      } else {
        stand()
      }
    }, 700)

    return () => {
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current)
    }
  }, [state.autoPlayEnabled, state.phase, state.animationLock, state.hands, state.activeHandIndex, state.dealerHand])

  const addToBet = useCallback(
    (amount: number) => {
      if (state.phase !== 'betting') return
      dispatch({ type: 'ADD_TO_BET', amount })
    },
    [state.phase]
  )

  const startHand = useCallback(() => {
    if (state.playerChips < state.betAmount || state.betAmount <= 0) {
      dispatch({ type: 'SET_MESSAGE', message: 'Not enough chips to bet.' })
      return
    }
    dispatch({ type: 'START_HAND' })
  }, [state.playerChips, state.betAmount])

  // Effect to kick off dealing sequence when phase becomes 'dealing'
  const dealingStartedRef = useRef(false)
  useEffect(() => {
    if (state.phase !== 'dealing') {
      dealingStartedRef.current = false
      return
    }
    if (dealingStartedRef.current) return
    if (state.deck.length < 4) return
    dealingStartedRef.current = true

    const card1 = { ...state.deck[0], faceDown: false }
    const card2 = { ...state.deck[1], faceDown: false }
    const card3 = { ...state.deck[2], faceDown: false }
    const card4 = { ...state.deck[3], faceDown: true }

    enqueue([
      async () => {
        dispatch({ type: 'DEAL_CARD_TO_PLAYER', card: card1 })
        await waitForAnimation()
      },
      async () => {
        dispatch({ type: 'DEAL_CARD_TO_DEALER', card: card2 })
        await waitForAnimation()
      },
      async () => {
        dispatch({ type: 'DEAL_CARD_TO_PLAYER', card: card3 })
        await waitForAnimation()
      },
      async () => {
        dispatch({ type: 'DEAL_CARD_TO_DEALER', card: card4, faceDown: true })
        await waitForAnimation()
      },
      async () => {
        dispatch({ type: 'DEALING_COMPLETE' })
      },
    ])
  }, [state.phase, state.deck])

  // Effect to run dealer turn when phase becomes 'dealer-revealing'
  const dealerRevealStartedRef = useRef(false)
  useEffect(() => {
    if (state.phase !== 'dealer-revealing') {
      dealerRevealStartedRef.current = false
      return
    }
    if (dealerRevealStartedRef.current) return
    dealerRevealStartedRef.current = true

    const revealedHand = state.dealerHand.map((c) => ({
      ...c,
      faceDown: false,
    }))
    const { hits } = computeDealerHits(revealedHand, state.deck)

    // Check if all player hands are busted — skip dealer play
    const allBusted = state.hands.every((h) => h.result === 'busted')

    const steps: (() => Promise<void>)[] = []

    steps.push(async () => {
      dispatch({ type: 'REVEAL_DEALER_HOLE_CARD' })
      await delay(600)
    })

    if (!allBusted) {
      for (const card of hits) {
        steps.push(async () => {
          dispatch({ type: 'DEALER_HIT', card })
          await waitForAnimation()
          await delay(300)
        })
      }
    }

    steps.push(async () => {
      dispatch({ type: 'DEALER_STAND' })
      await delay(800)
      dispatch({ type: 'RESOLVE_HAND' })
      await delay(2000)
      if (mountedRef.current) {
        dispatch({ type: 'RETURN_TO_BETTING' })
      }
    })

    enqueue(steps)
  }, [state.phase])

  // Effect to handle player bust -> resolve
  const bustHandledRef = useRef(false)
  useEffect(() => {
    if (state.phase !== 'player-busted') {
      bustHandledRef.current = false
      return
    }
    if (bustHandledRef.current) return
    bustHandledRef.current = true

    enqueue([
      async () => {
        // Keep behavior consistent with dealer-revealing: always flip the dealer hole card
        // before resolving, even if the player already busted.
        if (state.dealerHand.some((c) => c.faceDown)) {
          dispatch({ type: 'REVEAL_DEALER_HOLE_CARD' })
          await delay(600)
        } else {
          await delay(300)
        }

        await delay(600)
        dispatch({ type: 'RESOLVE_HAND' })
        await delay(2000)
        if (mountedRef.current) {
          dispatch({ type: 'RETURN_TO_BETTING' })
        }
      },
    ])
  }, [state.phase])

  // Effect to handle switching between split hands
  // The reducer sets phase to 'switching-hand' when a hand is done and more remain.
  // This effect deals a card to the new active hand. The reducer's DEAL_CARD_TO_HAND
  // handles the phase transition to 'player-turn' (or 'dealer-revealing' for split aces).
  const switchingHandRef = useRef(false)
  useEffect(() => {
    if (state.phase !== 'switching-hand') {
      switchingHandRef.current = false
      return
    }
    if (switchingHandRef.current) return
    switchingHandRef.current = true

    const hand = state.hands[state.activeHandIndex]
    if (!hand || hand.cards.length >= 2) return

    const card = { ...state.deck[0], faceDown: false }
    enqueue([
      async () => {
        await delay(500)
        dispatch({ type: 'DEAL_CARD_TO_HAND', handIndex: state.activeHandIndex, card })
        await waitForAnimation()
        // Phase transition is handled by the reducer in DEAL_CARD_TO_HAND
      },
    ])
  }, [state.phase, state.activeHandIndex])

  const hit = useCallback(() => {
    if (state.phase !== 'player-turn') return
    if (state.animationLock) return
    const card = { ...state.deck[0], faceDown: false }
    dispatch({ type: 'HIT', card })

    enqueue([
      async () => {
        await waitForAnimation()
        if (mountedRef.current) {
          dispatch({ type: 'SET_ANIMATION_LOCK', locked: false })
        }
      },
    ])
  }, [state.phase, state.animationLock, state.deck])

  const stand = useCallback(() => {
    if (state.phase !== 'player-turn') return
    if (state.animationLock) return
    dispatch({ type: 'STAND' })
  }, [state.phase, state.animationLock])

  const doubleDown = useCallback(() => {
    if (state.phase !== 'player-turn') return
    if (state.animationLock) return
    if (!activeHand || activeCards.length !== 2) return
    if (state.playerChips < activeHand.bet) return

    const card = { ...state.deck[0], faceDown: false }
    dispatch({ type: 'DOUBLE_DOWN', card })

    enqueue([
      async () => {
        await waitForAnimation()
        if (mountedRef.current) {
          dispatch({ type: 'SET_ANIMATION_LOCK', locked: false })
        }
      },
    ])
  }, [state.phase, state.animationLock, state.deck, activeHand, activeCards, state.playerChips])

  const split = useCallback(() => {
    if (state.phase !== 'player-turn') return
    if (state.animationLock) return
    if (!activeHand || activeCards.length !== 2) return
    if (activeCards[0].rank !== activeCards[1].rank) return
    if (state.playerChips < activeHand.bet) return

    const isAces = activeCards[0].rank === 'A'
    dispatch({ type: 'SPLIT' })

    // Deal a card to the first split hand
    // Note: SPLIT doesn't consume deck cards, so deck[0] is the next card
    const card1 = { ...state.deck[0], faceDown: false }

    enqueue([
      async () => {
        await delay(300)
        dispatch({ type: 'DEAL_CARD_TO_HAND', handIndex: state.activeHandIndex, card: card1 })
        await waitForAnimation()

        if (isAces) {
          // For split aces: deal card to second hand too
          // deck[0] was consumed by first DEAL_CARD_TO_HAND, so use deck[1]
          const card2 = { ...state.deck[1], faceDown: false }
          await delay(300)
          dispatch({ type: 'DEAL_CARD_TO_HAND', handIndex: state.activeHandIndex + 1, card: card2 })
          await waitForAnimation()
          // Reducer handles transition to dealer-revealing when all hands are stood
        } else {
          // For non-aces: reducer transitions to player-turn via DEAL_CARD_TO_HAND
          // (phase transition happens in reducer when switching-hand + 2 cards)
          // But we're currently in player-turn, not switching-hand.
          // The DEAL_CARD_TO_HAND for hand 0 gives it 2 cards. Phase stays player-turn.
          dispatch({ type: 'SET_ANIMATION_LOCK', locked: false })
          dispatch({ type: 'SET_MESSAGE', message: 'Playing hand 1. Your turn!' })
        }
      },
    ])
  }, [state.phase, state.animationLock, state.deck, activeHand, activeCards, state.playerChips, state.activeHandIndex])

  const surrender = useCallback(() => {
    if (state.phase !== 'player-turn') return
    if (state.animationLock) return
    if (state.hands.length !== 1) return
    if (!activeHand || activeCards.length !== 2) return

    dispatch({ type: 'SURRENDER' })

    enqueue([
      async () => {
        await delay(800)
        dispatch({ type: 'RESOLVE_HAND' })
        await delay(2000)
        if (mountedRef.current) {
          dispatch({ type: 'RETURN_TO_BETTING' })
        }
      },
    ])
  }, [state.phase, state.animationLock, state.hands.length, activeHand, activeCards])

  const takeInsurance = useCallback(() => {
    if (state.phase !== 'insurance-prompt') return
    dispatch({ type: 'TAKE_INSURANCE' })
    dispatch({ type: 'SET_ANIMATION_LOCK', locked: true })
    if (insuranceTimeoutRef.current) clearTimeout(insuranceTimeoutRef.current)
    insuranceTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) dispatch({ type: 'RESOLVE_INSURANCE' })
    }, 300)
  }, [state.phase])

  const declineInsurance = useCallback(() => {
    if (state.phase !== 'insurance-prompt') return
    dispatch({ type: 'DECLINE_INSURANCE' })
    dispatch({ type: 'SET_ANIMATION_LOCK', locked: true })
    if (insuranceTimeoutRef.current) clearTimeout(insuranceTimeoutRef.current)
    insuranceTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) dispatch({ type: 'RESOLVE_INSURANCE' })
    }, 150)
  }, [state.phase])

  const toggleAutoPlay = useCallback(() => {
    dispatch({ type: 'TOGGLE_AUTO_PLAY' })
  }, [])

  const resetChips = useCallback(() => {
    dispatch({ type: 'SET_CLOSING_DROPDOWN', closing: true })
    setTimeout(() => {
      dispatch({ type: 'RESET_CHIPS' })
    }, 300)
  }, [])

  return {
    state,
    actions: {
      addToBet,
      startHand,
      hit,
      stand,
      doubleDown,
      split,
      surrender,
      takeInsurance,
      declineInsurance,
      toggleAutoPlay,
      resetChips,
    },
    signalAnimationComplete,
  }
}
