'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useMotionValue, useSpring, motion } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  value,
  duration: _duration = 1.2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { duration: 1200, bounce: 0 })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (inView) motionValue.set(value)
  }, [inView, value, motionValue])

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplay(latest.toFixed(decimals))
    })
    return unsubscribe
  }, [spring, decimals])

  return (
    <motion.span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </motion.span>
  )
}
