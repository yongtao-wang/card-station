'use client'

import { motion, useSpring, useTransform } from 'motion/react'

import { useEffect } from 'react'

export default function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, {
    stiffness: 75,
    damping: 15,
    mass: 1,
  })
  const rounded = useTransform(spring, (latest) =>
    Math.round(latest).toLocaleString()
  )

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{rounded}</motion.span>
}
