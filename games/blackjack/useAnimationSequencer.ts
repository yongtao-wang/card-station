import { useRef, useCallback } from 'react'

type ResolveFunction = () => void

/**
 * Queue-based animation sequencer.
 * Processes animation steps one at a time, waiting for each to complete
 * via onAnimationComplete callbacks before proceeding.
 */
export function useAnimationSequencer() {
  const resolveRef = useRef<ResolveFunction | null>(null)
  const mountedRef = useRef(true)
  const processingRef = useRef(false)
  const queueRef = useRef<(() => Promise<void>)[]>([])

  const cleanup = useCallback(() => {
    mountedRef.current = false
    resolveRef.current = null
    queueRef.current = []
    processingRef.current = false
  }, [])

  /** Called by AnimatedCard's onAnimationComplete to signal step is done */
  const signalAnimationComplete = useCallback(() => {
    if (resolveRef.current) {
      const resolve = resolveRef.current
      resolveRef.current = null
      resolve()
    }
  }, [])

  /** Returns a promise that resolves when signalAnimationComplete is called */
  const waitForAnimation = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const delay = useCallback((ms: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (mountedRef.current) resolve()
      }, ms)
    })
  }, [])

  /** Enqueue steps and process them sequentially */
  const enqueue = useCallback(
    (steps: (() => Promise<void>)[]) => {
      queueRef.current.push(...steps)
      if (!processingRef.current) {
        processingRef.current = true
        processQueue()
      }
    },
    // processQueue is stable via refs
    []
  )

  async function processQueue() {
    while (queueRef.current.length > 0 && mountedRef.current) {
      const step = queueRef.current.shift()!
      await step()
    }
    processingRef.current = false
  }

  return {
    signalAnimationComplete,
    waitForAnimation,
    delay,
    enqueue,
    cleanup,
    mountedRef,
  }
}
