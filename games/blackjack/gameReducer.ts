import {
  BlackjackState,
  GameAction,
  PLAYER_INIT_CHIPS,
} from './types'
import { calculateHandValue, createDeck, shuffleDeck } from './gameLogic'

export const initialState: BlackjackState = {
  phase: 'betting',
  deck: [],
  playerHand: [],
  dealerHand: [],
  playerChips: PLAYER_INIT_CHIPS,
  currentBet: 0,
  betAmount: 0,
  wins: 0,
  losses: 0,
  message: '',
  animationLock: false,
  autoPlayEnabled: false,
  showResetDropdown: false,
  isClosingDropdown: false,
}

export function gameReducer(
  state: BlackjackState,
  action: GameAction
): BlackjackState {
  switch (action.type) {
    case 'LOAD_SAVED_STATE':
      return {
        ...state,
        playerChips: action.chips,
        wins: action.wins,
        losses: action.losses,
        showResetDropdown: action.chips <= 0,
      }

    case 'RESET_CHIPS':
      return {
        ...state,
        playerChips: PLAYER_INIT_CHIPS,
        wins: 0,
        losses: 0,
        message: 'Chips and stats reset!',
        showResetDropdown: false,
        isClosingDropdown: false,
      }

    case 'ADD_TO_BET': {
      const newBet = state.betAmount + action.amount
      if (newBet > state.playerChips) {
        return { ...state, message: 'Not enough chips!' }
      }
      return { ...state, betAmount: newBet, message: '' }
    }

    case 'START_HAND': {
      if (state.playerChips < state.betAmount || state.betAmount <= 0) {
        return { ...state, message: 'Not enough chips to bet.' }
      }
      const newDeck = shuffleDeck(createDeck())
      return {
        ...state,
        phase: 'dealing',
        deck: newDeck,
        playerHand: [],
        dealerHand: [],
        currentBet: state.betAmount,
        playerChips: state.playerChips - state.betAmount,
        message: 'Dealing cards...',
        animationLock: true,
      }
    }

    case 'DEAL_CARD_TO_PLAYER': {
      return {
        ...state,
        playerHand: [...state.playerHand, action.card],
        deck: state.deck.slice(1),
      }
    }

    case 'DEAL_CARD_TO_DEALER': {
      const card = action.faceDown
        ? { ...action.card, faceDown: true }
        : action.card
      return {
        ...state,
        dealerHand: [...state.dealerHand, card],
        deck: state.deck.slice(1),
      }
    }

    case 'DEALING_COMPLETE': {
      const playerValue = calculateHandValue(state.playerHand)
      const dealerVisibleCard = state.dealerHand.find((c) => !c.faceDown)
      const dealerFullValue = calculateHandValue(
        state.dealerHand.map((c) => ({ ...c, faceDown: false }))
      )

      // Natural blackjack check
      if (playerValue === 21) {
        if (dealerFullValue === 21) {
          // Both have blackjack — push, but need to reveal dealer first
          return {
            ...state,
            phase: 'dealer-revealing',
            message: 'Blackjack! Revealing dealer hand...',
            animationLock: true,
          }
        }
        // Player natural blackjack — skip to dealer reveal then pay 3:2
        return {
          ...state,
          phase: 'dealer-revealing',
          message: 'Blackjack!',
          animationLock: true,
        }
      }

      return {
        ...state,
        phase: 'player-turn',
        message: 'Your turn!',
        animationLock: false,
      }
    }

    case 'HIT': {
      const newHand = [...state.playerHand, action.card]
      const value = calculateHandValue(newHand)
      const deck = state.deck.slice(1)

      if (value > 21) {
        return {
          ...state,
          playerHand: newHand,
          deck,
          phase: 'player-busted',
          message: 'Busted!',
          animationLock: true,
        }
      }

      return {
        ...state,
        playerHand: newHand,
        deck,
        animationLock: true,
      }
    }

    case 'STAND':
      return {
        ...state,
        phase: 'dealer-revealing',
        message: "Dealer's turn...",
        animationLock: true,
      }

    case 'REVEAL_DEALER_HOLE_CARD':
      return {
        ...state,
        dealerHand: state.dealerHand.map((card) => ({
          ...card,
          faceDown: false,
        })),
      }

    case 'DEALER_HIT': {
      return {
        ...state,
        dealerHand: [...state.dealerHand, action.card],
        phase: 'dealer-hitting',
      }
    }

    case 'DEALER_STAND':
      return {
        ...state,
        phase: 'resolving',
      }

    case 'RESOLVE_HAND': {
      const playerValue = calculateHandValue(state.playerHand)
      const dealerValue = calculateHandValue(state.dealerHand)
      const isPlayerNatural =
        state.playerHand.length === 2 && playerValue === 21
      const isDealerNatural =
        state.dealerHand.length === 2 && dealerValue === 21

      let msg = ''
      let chips = state.playerChips
      let wins = state.wins
      let losses = state.losses

      if (playerValue > 21) {
        msg = 'You busted! Dealer wins.'
        losses++
      } else if (isPlayerNatural && isDealerNatural) {
        msg = 'Both have Blackjack! Push.'
        chips += state.currentBet
      } else if (isPlayerNatural) {
        msg = 'Blackjack! You win!'
        chips += Math.floor(state.currentBet * 2.5) // 3:2 payout
        wins++
      } else if (dealerValue > 21) {
        msg = 'Dealer busted! You win!'
        chips += state.currentBet * 2
        wins++
      } else if (playerValue > dealerValue) {
        msg = 'You win!'
        chips += state.currentBet * 2
        wins++
      } else if (playerValue < dealerValue) {
        msg = 'Dealer wins.'
        losses++
      } else {
        msg = 'Push! Bet returned.'
        chips += state.currentBet
      }

      return {
        ...state,
        phase: 'result',
        playerChips: chips,
        wins,
        losses,
        message: msg,
        animationLock: false,
        showResetDropdown: chips <= 0,
      }
    }

    case 'RETURN_TO_BETTING':
      return {
        ...state,
        phase: 'betting',
        betAmount: 0,
        currentBet: 0,
      }

    case 'SET_ANIMATION_LOCK':
      return { ...state, animationLock: action.locked }

    case 'SET_MESSAGE':
      return { ...state, message: action.message }

    case 'TOGGLE_AUTO_PLAY':
      return { ...state, autoPlayEnabled: !state.autoPlayEnabled }

    case 'SET_CLOSING_DROPDOWN':
      return { ...state, isClosingDropdown: action.closing }

    default:
      return state
  }
}
