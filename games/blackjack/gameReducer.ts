import {
  BlackjackState,
  GameAction,
  Hand,
  PLAYER_INIT_CHIPS,
} from './types'
import { calculateHandValue, createDeck, shuffleDeck } from './gameLogic'

function createHand(bet: number): Hand {
  return { cards: [], bet, result: 'pending', isDoubled: false }
}

export const initialState: BlackjackState = {
  phase: 'betting',
  deck: [],
  hands: [],
  activeHandIndex: 0,
  dealerHand: [],
  playerChips: PLAYER_INIT_CHIPS,
  betAmount: 0,
  insuranceBet: 0,
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
        hands: [createHand(state.betAmount)],
        activeHandIndex: 0,
        dealerHand: [],
        playerChips: state.playerChips - state.betAmount,
        insuranceBet: 0,
        message: 'Dealing cards...',
        animationLock: true,
      }
    }

    case 'DEAL_CARD_TO_PLAYER': {
      const newHands = [...state.hands]
      newHands[0] = { ...newHands[0], cards: [...newHands[0].cards, action.card] }
      return {
        ...state,
        hands: newHands,
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
      const hand = state.hands[0]
      const playerValue = calculateHandValue(hand.cards)
      const dealerUpcard = state.dealerHand.find((c) => !c.faceDown)
      const dealerFullValue = calculateHandValue(
        state.dealerHand.map((c) => ({ ...c, faceDown: false }))
      )

      // Insurance prompt: dealer shows Ace
      if (dealerUpcard?.rank === 'A') {
        return {
          ...state,
          phase: 'insurance-prompt',
          message: 'Insurance? Dealer shows an Ace.',
          animationLock: false,
        }
      }

      // Natural blackjack check
      if (playerValue === 21) {
        if (dealerFullValue === 21) {
          return {
            ...state,
            phase: 'dealer-revealing',
            message: 'Blackjack! Revealing dealer hand...',
            animationLock: true,
          }
        }
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

    case 'TAKE_INSURANCE': {
      const hand = state.hands[state.activeHandIndex]
      const insuranceAmount = Math.floor(hand.bet / 2)
      if (state.playerChips < insuranceAmount) return state
      return {
        ...state,
        insuranceBet: insuranceAmount,
        playerChips: state.playerChips - insuranceAmount,
        message: 'Insurance taken.',
      }
    }

    case 'DECLINE_INSURANCE':
      return { ...state, insuranceBet: 0 }

    case 'RESOLVE_INSURANCE': {
      const dealerFullValue = calculateHandValue(
        state.dealerHand.map((c) => ({ ...c, faceDown: false }))
      )
      const dealerHasBlackjack = dealerFullValue === 21 && state.dealerHand.length === 2
      const hand = state.hands[0]
      const playerValue = calculateHandValue(hand.cards)
      const playerHasBlackjack = playerValue === 21 && hand.cards.length === 2

      if (dealerHasBlackjack) {
        let chips = state.playerChips
        if (state.insuranceBet > 0) {
          chips += state.insuranceBet * 3 // return bet + 2:1 winnings
        }
        if (playerHasBlackjack) {
          chips += hand.bet // push on main bet
          return {
            ...state,
            phase: 'dealer-revealing',
            playerChips: chips,
            message: 'Dealer has Blackjack! Insurance pays. Main bet pushes.',
            animationLock: true,
          }
        }
        return {
          ...state,
          phase: 'dealer-revealing',
          playerChips: chips,
          message: state.insuranceBet > 0
            ? 'Dealer has Blackjack! Insurance pays.'
            : 'Dealer has Blackjack!',
          animationLock: true,
        }
      }

      // Dealer does NOT have blackjack — insurance bet lost
      if (playerHasBlackjack) {
        return {
          ...state,
          phase: 'dealer-revealing',
          message: 'Blackjack!',
          insuranceBet: 0,
          animationLock: true,
        }
      }
      return {
        ...state,
        phase: 'player-turn',
        message: 'Your turn!',
        insuranceBet: 0,
        animationLock: false,
      }
    }

    case 'HIT': {
      const hi = state.activeHandIndex
      const hand = state.hands[hi]
      const newCards = [...hand.cards, action.card]
      const value = calculateHandValue(newCards)
      const deck = state.deck.slice(1)
      const newHands = [...state.hands]
      newHands[hi] = { ...hand, cards: newCards }

      if (value > 21) {
        newHands[hi] = { ...newHands[hi], result: 'busted' }

        // If more split hands to play, switch to next
        if (hi < state.hands.length - 1) {
          return {
            ...state,
            hands: newHands,
            deck,
            activeHandIndex: hi + 1,
            phase: 'switching-hand',
            message: `Hand ${hi + 1} busted! Playing hand ${hi + 2}...`,
            animationLock: true,
          }
        }

        return {
          ...state,
          hands: newHands,
          deck,
          phase: 'player-busted',
          message: 'Busted!',
          animationLock: true,
        }
      }

      return {
        ...state,
        hands: newHands,
        deck,
        animationLock: true,
      }
    }

    case 'STAND': {
      const hi = state.activeHandIndex
      const newHands = [...state.hands]
      newHands[hi] = { ...newHands[hi], result: 'stood' }

      // If more split hands to play, switch to next
      if (hi < state.hands.length - 1) {
        return {
          ...state,
          hands: newHands,
          activeHandIndex: hi + 1,
          phase: 'switching-hand',
          message: `Hand ${hi + 1} stands. Playing hand ${hi + 2}...`,
          animationLock: true,
        }
      }

      return {
        ...state,
        hands: newHands,
        phase: 'dealer-revealing',
        message: "Dealer's turn...",
        animationLock: true,
      }
    }

    case 'DOUBLE_DOWN': {
      const hi = state.activeHandIndex
      const hand = state.hands[hi]
      if (hand.cards.length !== 2) return state
      if (state.playerChips < hand.bet) return state

      const newCards = [...hand.cards, action.card]
      const value = calculateHandValue(newCards)
      const deck = state.deck.slice(1)
      const newHands = [...state.hands]
      newHands[hi] = {
        ...hand,
        cards: newCards,
        bet: hand.bet * 2,
        isDoubled: true,
      }

      const newChips = state.playerChips - hand.bet

      if (value > 21) {
        newHands[hi] = { ...newHands[hi], result: 'busted' }

        if (hi < state.hands.length - 1) {
          return {
            ...state,
            hands: newHands,
            deck,
            playerChips: newChips,
            activeHandIndex: hi + 1,
            phase: 'switching-hand',
            message: `Hand ${hi + 1} busted after double! Playing hand ${hi + 2}...`,
            animationLock: true,
          }
        }

        return {
          ...state,
          hands: newHands,
          deck,
          playerChips: newChips,
          phase: 'player-busted',
          message: 'Busted!',
          animationLock: true,
        }
      }

      newHands[hi] = { ...newHands[hi], result: 'stood' }

      if (hi < state.hands.length - 1) {
        return {
          ...state,
          hands: newHands,
          deck,
          playerChips: newChips,
          activeHandIndex: hi + 1,
          phase: 'switching-hand',
          message: `Doubled! Playing hand ${hi + 2}...`,
          animationLock: true,
        }
      }

      return {
        ...state,
        hands: newHands,
        deck,
        playerChips: newChips,
        phase: 'dealer-revealing',
        message: "Doubled! Dealer's turn...",
        animationLock: true,
      }
    }

    case 'SPLIT': {
      const hi = state.activeHandIndex
      const hand = state.hands[hi]
      if (hand.cards.length !== 2) return state
      if (hand.cards[0].rank !== hand.cards[1].rank) return state
      if (state.playerChips < hand.bet) return state

      const hand1: Hand = {
        cards: [hand.cards[0]],
        bet: hand.bet,
        result: 'pending',
        isDoubled: false,
      }
      const hand2: Hand = {
        cards: [hand.cards[1]],
        bet: hand.bet,
        result: 'pending',
        isDoubled: false,
      }

      const newHands = [...state.hands]
      newHands.splice(hi, 1, hand1, hand2)

      return {
        ...state,
        hands: newHands,
        playerChips: state.playerChips - hand.bet,
        animationLock: true,
        message: 'Split! Playing hand 1...',
      }
    }

    case 'DEAL_CARD_TO_HAND': {
      const newHands = [...state.hands]
      const hand = newHands[action.handIndex]
      const newCards = [...hand.cards, action.card]
      newHands[action.handIndex] = { ...hand, cards: newCards }

      // Auto-stand split aces after receiving second card
      const isSplitAces = hand.cards.length === 1 && hand.cards[0].rank === 'A'
      if (isSplitAces) {
        newHands[action.handIndex] = { ...newHands[action.handIndex], result: 'stood' }

        // If all hands are done (both split aces dealt), go to dealer
        const allDone = newHands.every((h) => h.result !== 'pending')
        if (allDone) {
          return {
            ...state,
            hands: newHands,
            deck: state.deck.slice(1),
            phase: 'dealer-revealing',
            message: "Dealer's turn...",
            animationLock: true,
          }
        }
      }

      // If switching hands and card gives hand 2+ cards, transition to player-turn
      if (state.phase === 'switching-hand' && newCards.length >= 2 && !isSplitAces) {
        return {
          ...state,
          hands: newHands,
          deck: state.deck.slice(1),
          phase: 'player-turn',
          message: `Playing hand ${action.handIndex + 1}. Your turn!`,
          animationLock: false,
        }
      }

      return {
        ...state,
        hands: newHands,
        deck: state.deck.slice(1),
      }
    }

    case 'SURRENDER': {
      if (state.hands.length !== 1) return state
      const hand = state.hands[0]
      if (hand.cards.length !== 2) return state

      const newHands = [{ ...hand, result: 'surrendered' as const }]
      return {
        ...state,
        hands: newHands,
        phase: 'resolving',
        message: 'Surrendered.',
        animationLock: true,
      }
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
      const dealerValue = calculateHandValue(state.dealerHand)
      let chips = state.playerChips
      let wins = state.wins
      let losses = state.losses
      const messages: string[] = []
      const multiHand = state.hands.length > 1

      for (let i = 0; i < state.hands.length; i++) {
        const hand = state.hands[i]
        const playerValue = calculateHandValue(hand.cards)
        const prefix = multiHand ? `Hand ${i + 1}: ` : ''

        if (hand.result === 'surrendered') {
          chips += Math.floor(hand.bet / 2)
          losses++
          messages.push(`${prefix}Surrendered.`)
          continue
        }

        if (playerValue > 21) {
          losses++
          messages.push(`${prefix}Busted.`)
          continue
        }

        const isPlayerNatural = hand.cards.length === 2 && playerValue === 21 && !multiHand
        const isDealerNatural = state.dealerHand.length === 2 && dealerValue === 21

        if (isPlayerNatural && isDealerNatural) {
          chips += hand.bet
          messages.push(`${prefix}Both Blackjack! Push.`)
        } else if (isPlayerNatural) {
          chips += Math.floor(hand.bet * 2.5) // 3:2 payout
          wins++
          messages.push(`${prefix}Blackjack!`)
        } else if (dealerValue > 21) {
          chips += hand.bet * 2
          wins++
          messages.push(`${prefix}Dealer busted!`)
        } else if (playerValue > dealerValue) {
          chips += hand.bet * 2
          wins++
          messages.push(`${prefix}Win!`)
        } else if (playerValue < dealerValue) {
          losses++
          messages.push(`${prefix}Dealer wins.`)
        } else {
          chips += hand.bet
          messages.push(`${prefix}Push.`)
        }
      }

      return {
        ...state,
        phase: 'result',
        playerChips: chips,
        wins,
        losses,
        message: messages.join(' '),
        animationLock: false,
        showResetDropdown: chips <= 0,
      }
    }

    case 'RETURN_TO_BETTING':
      return {
        ...state,
        phase: 'betting',
        betAmount: 0,
        hands: [],
        activeHandIndex: 0,
        insuranceBet: 0,
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
