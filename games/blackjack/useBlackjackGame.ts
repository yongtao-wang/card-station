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

  // Load from localStorage on mount
  useEffect(() => {
    const chips = parseInt(localStorage.getItem('bj_playerChips') || '1000', 10)
    const wins = parseInt(localStorage.getItem('bj_wins') || '0', 10)
    const losses = parseInt(localStorage.getItem('bj_losses') || '0', 10)
    dispatch({ type: 'LOAD_SAVED_STATE', chips, wins, losses })

    return () => {
      cleanup()
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current)
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('bj_playerChips', String(state.playerChips))
    localStorage.setItem('bj_wins', String(state.wins))
    localStorage.setItem('bj_losses', String(state.losses))
  }, [state.playerChips, state.wins, state.losses])

  // Auto-play
  useEffect(() => {
    if (!state.autoPlayEnabled) return
    if (state.phase !== 'player-turn') return
    if (state.animationLock) return
    if (calculateHandValue(state.playerHand) > 21) return

    const decision = basicStrategyDecision(
      state.playerHand,
      state.dealerHand[0]
    )
    autoPlayTimeoutRef.current = setTimeout(() => {
      if (decision === 'hit') {
        hit()
      } else {
        stand()
      }
    }, 700)

    return () => {
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current)
    }
  }, [state.autoPlayEnabled, state.phase, state.animationLock, state.playerHand, state.dealerHand])

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

    // The deck is created inside the reducer via START_HAND.
    // We need to read it after dispatch. Since dispatch is sync in React,
    // we can schedule the deal sequence on the next tick.
    // However, we don't have the new deck here. Instead, we'll use a ref-based
    // approach: the deal sequence reads from state via an effect.
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

    // Read the deck cards we'll deal
    const card1 = { ...state.deck[0], faceDown: false }
    const card2 = { ...state.deck[1], faceDown: false }
    const card3 = { ...state.deck[2], faceDown: false }
    const card4 = { ...state.deck[3], faceDown: true }

    enqueue([
      // Player card 1
      async () => {
        dispatch({ type: 'DEAL_CARD_TO_PLAYER', card: card1 })
        await waitForAnimation()
      },
      // Dealer card 1
      async () => {
        dispatch({ type: 'DEAL_CARD_TO_DEALER', card: card2 })
        await waitForAnimation()
      },
      // Player card 2
      async () => {
        dispatch({ type: 'DEAL_CARD_TO_PLAYER', card: card3 })
        await waitForAnimation()
      },
      // Dealer card 2 (face down)
      async () => {
        dispatch({ type: 'DEAL_CARD_TO_DEALER', card: card4, faceDown: true })
        await waitForAnimation()
      },
      // Dealing complete
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

    // Pre-compute dealer hits from current state
    const revealedHand = state.dealerHand.map((c) => ({
      ...c,
      faceDown: false,
    }))
    const { hits } = computeDealerHits(revealedHand, state.deck)

    const steps: (() => Promise<void>)[] = []

    // Step 1: Flip the hole card
    steps.push(async () => {
      dispatch({ type: 'REVEAL_DEALER_HOLE_CARD' })
      await delay(600) // Let flip animation play (0.5s + buffer)
    })

    // Step 2: Dealer hits one by one
    for (const card of hits) {
      steps.push(async () => {
        dispatch({ type: 'DEALER_HIT', card })
        await waitForAnimation()
        await delay(300) // Brief pause between hits
      })
    }

    // Step 3: Dealer stands, pause, resolve
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
        await delay(1200)
        dispatch({ type: 'RESOLVE_HAND' })
        await delay(2000)
        if (mountedRef.current) {
          dispatch({ type: 'RETURN_TO_BETTING' })
        }
      },
    ])
  }, [state.phase])

  const hit = useCallback(() => {
    if (state.phase !== 'player-turn' || state.animationLock) return
    const card = { ...state.deck[0], faceDown: false }
    dispatch({ type: 'HIT', card })

    enqueue([
      async () => {
        await waitForAnimation()
        // Unlock after animation if not busted (reducer handles bust lock)
        if (mountedRef.current) {
          dispatch({ type: 'SET_ANIMATION_LOCK', locked: false })
        }
      },
    ])
  }, [state.phase, state.animationLock, state.deck])

  const stand = useCallback(() => {
    if (state.phase !== 'player-turn' || state.animationLock) return
    dispatch({ type: 'STAND' })
  }, [state.phase, state.animationLock])

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
      toggleAutoPlay,
      resetChips,
    },
    signalAnimationComplete,
  }
}
