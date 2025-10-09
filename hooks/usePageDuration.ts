'use client'

import { useEffect, useRef } from 'react'

import { track } from '@vercel/analytics'
import { usePathname } from 'next/navigation'

export function usePageDuration() {
  const pathname = usePathname()
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const startTime = Date.now()
    startTimeRef.current = startTime

    const reportDuration = () => {
      const duration = Date.now() - startTime
      console.log('[Tracker]', pathname, 'duration:', duration)
      track('page_duration', {
        path: pathname,
        duration,
      })
    }

    // Page close or refresh
    window.addEventListener('beforeunload', reportDuration)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) reportDuration()
    })

    // Page navigation cleanup (equivalent to leaving the current page)
    return () => {
      reportDuration()
      window.removeEventListener('beforeunload', reportDuration)
    }
  }, [pathname])
}
