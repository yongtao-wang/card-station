'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { CARD_OFFSET_MOBILE, CARD_OFFSET_DESKTOP } from './types'
import { useBlackjackGame } from './useBlackjackGame'
import { DealerHand } from './components/DealerHand'
import { PlayerHand } from './components/PlayerHand'
import { BettingControls } from './components/BettingControls'
import { GameControls } from './components/GameControls'
import { PlayerStats } from './components/PlayerStats'
import { BetDisplay } from './components/BetDisplay'
import { MessageBar } from './components/MessageBar'
import styles from './blackjack.module.css'

export default function BlackJack() {
  const [cardOffset, setCardOffset] = useState(CARD_OFFSET_MOBILE)
  const { state, actions, signalAnimationComplete } = useBlackjackGame()

  const activeHand = state.hands[state.activeHandIndex]
  const activeCards = activeHand?.cards ?? []

  const canDouble =
    state.phase === 'player-turn' &&
    activeCards.length === 2 &&
    state.playerChips >= (activeHand?.bet ?? 0)

  const canSplit =
    state.phase === 'player-turn' &&
    activeCards.length === 2 &&
    activeCards[0]?.rank === activeCards[1]?.rank &&
    state.playerChips >= (activeHand?.bet ?? 0)

  const canSurrender =
    state.phase === 'player-turn' &&
    state.hands.length === 1 &&
    activeCards.length === 2

  const insuranceCost = Math.floor((activeHand?.bet ?? 0) / 2)
  const canAffordInsurance = state.playerChips >= insuranceCost

  useEffect(() => {
    const updateCardOffset = () => {
      setCardOffset(
        window.innerWidth >= 640 ? CARD_OFFSET_DESKTOP : CARD_OFFSET_MOBILE
      )
    }
    updateCardOffset()
    window.addEventListener('resize', updateCardOffset)
    return () => window.removeEventListener('resize', updateCardOffset)
  }, [])

  return (
    <div className='sm:p-4'>
      <motion.div
        className={styles.board}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <PlayerStats
          chips={state.playerChips}
          wins={state.wins}
          losses={state.losses}
          showResetDropdown={state.showResetDropdown}
          isClosingDropdown={state.isClosingDropdown}
          resetChips={actions.resetChips}
        />

        <h1 className={styles.gameTitle}>Blackjack 1v1</h1>

        <div className='flex flex-col items-center m-2 sm:m-4 min-h-[300px] sm:min-h-[360px]'>
          <DealerHand
            hand={state.dealerHand}
            phase={state.phase}
            cardOffset={cardOffset}
            onAnimationComplete={signalAnimationComplete}
          />

          <BetDisplay
            betAmount={state.betAmount}
            hands={state.hands}
            isBetting={state.phase === 'betting'}
          />

          <PlayerHand
            hands={state.hands}
            activeHandIndex={state.activeHandIndex}
            phase={state.phase}
            cardOffset={cardOffset}
            onAnimationComplete={signalAnimationComplete}
          />
        </div>

        <div className='grid grid-cols-2 items-end sm:grid-cols-1 sm:gap-4'>
          <div className='flex items-center justify-center p-4'>
            <BettingControls
              phase={state.phase}
              addToBet={actions.addToBet}
            />
          </div>
          <div className='flex flex-col justify-center items-center p-4 min-h-[48px] sm:min-h-[96px]'>
            <GameControls
              phase={state.phase}
              animationLock={state.animationLock}
              autoPlayEnabled={state.autoPlayEnabled}
              canDouble={canDouble}
              canSplit={canSplit}
              canSurrender={canSurrender}
              canAffordInsurance={canAffordInsurance}
              insuranceCost={insuranceCost}
              startHand={actions.startHand}
              hit={actions.hit}
              stand={actions.stand}
              doubleDown={actions.doubleDown}
              split={actions.split}
              surrender={actions.surrender}
              takeInsurance={actions.takeInsurance}
              declineInsurance={actions.declineInsurance}
              toggleAutoPlay={actions.toggleAutoPlay}
            />
          </div>
        </div>

        <MessageBar
          message={state.message}
          autoPlayEnabled={state.autoPlayEnabled}
        />
      </motion.div>

      {/* Blackjack Game Introduction */}
      <motion.div
        className={styles.howToPlay}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className='text-xl sm:text-2xl font-bold mb-2'>
          Blackjack 1v1 Online – Rules & How to Play
        </h2>
        <p className='mb-3 sm:mb-4 text-sm sm:text-base'>
          Welcome to <strong>Blackjack 1v1</strong>! Play free blackjack online
          against our dealer bot and enjoy a realistic casino card game
          experience in your browser. Practice blackjack strategy, card
          counting, and betting tips as you try to beat the dealer and win
          chips. Whether you&apos;re a beginner or an advanced player, you can
          learn blackjack rules, practice your skills, and master the game.
        </p>
        <h3 className='text-lg sm:text-xl font-semibold mb-2'>
          How to Play Blackjack
        </h3>
        <ul className='list-disc ml-4 sm:ml-6 mb-3 sm:mb-4 text-sm sm:text-base'>
          <li>
            Place your bet and click{' '}
            <span className='font-semibold'>Deal</span> to start your hand.
          </li>
          <li>
            Try to get as close to 21 as possible without going over (bust).
          </li>
          <li>
            Choose <span className='font-semibold'>Hit</span> to draw another
            card, or <span className='font-semibold'>Stand</span> to end your
            turn.
          </li>
          <li>
            <span className='font-semibold'>Double Down</span> to double your
            bet, receive one card, and auto-stand.
          </li>
          <li>
            <span className='font-semibold'>Split</span> matching pairs into
            two hands, each played independently.
          </li>
          <li>
            <span className='font-semibold'>Surrender</span> to forfeit half
            your bet and end the hand.
          </li>
          <li>
            <span className='font-semibold'>Insurance</span> is offered when
            the dealer shows an Ace — a side bet paying 2:1 if the dealer has
            blackjack.
          </li>
          <li>The dealer must hit until reaching at least 17.</li>
          <li>
            If you beat the dealer or the dealer busts, you win double your
            bet!
          </li>
          <li>
            If you run out of chips, you&apos;ll be prompted to reset your
            balance to 1000 chips.
          </li>
        </ul>
        <h3 className='text-lg sm:text-xl font-semibold mb-2'>
          Auto Play Strategy Instruction
        </h3>
        <p className='mb-2 sm:mb-3 text-sm sm:text-base'>
          <strong>Auto Play</strong> uses a simplified{' '}
          <em>basic strategy</em> that considers your current hand
          (hard/soft total), the dealer&apos;s upcard, and available actions
          (double, split, surrender).
        </p>
        <ul className='list-disc ml-4 sm:ml-6 mb-2 sm:mb-3 text-sm sm:text-base'>
          <li>
            <strong>Hard hands:</strong> Stand on 17+; 13–16 stand vs dealer
            2–6, otherwise hit; 12 stands vs 4–6, otherwise hit; 11 or less
            hit.
          </li>
          <li>
            <strong>Soft hands:</strong> 19+ stand; 18 stands vs 2/7/8, hits
            vs 9/A; soft 13–17 hit.
          </li>
          <li>
            <strong>Double:</strong> Hard 11 always; 10 vs 2–9; 9 vs 3–6.
            Soft 13–17 vs 5–6; soft 18 vs 3–6.
          </li>
          <li>
            <strong>Split:</strong> Always A/A and 8/8. Never 10s or 5s.
          </li>
          <li>
            <strong>Surrender:</strong> 16 vs 9/10/A; 15 vs 10.
          </li>
          <li>
            <strong>Insurance:</strong> Always declined (basic strategy).
          </li>
        </ul>
        <p className='mb-0 text-sm sm:text-base'>
          Toggle <strong>Auto Play</strong> with the button above. When
          enabled, it acts only on your turn with a short delay, then yields
          to the dealer as usual.
        </p>
        <p className='text-xs sm:text-sm text-gray-600'>
          Enjoy this online blackjack game and improve your skills. Play
          blackjack for fun, learn the rules, and test your luck against the
          dealer AI. Good luck!
        </p>
      </motion.div>
    </div>
  )
}
