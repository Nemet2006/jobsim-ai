'use client'

import { motion, type Variants, type HTMLMotionProps } from 'framer-motion'
import { type ReactNode } from 'react'

const fadeInUpVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const fadeInVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

const scaleInVariant: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } },
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const slideInRightVariant: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

interface MotionWrapProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className, ...props }: MotionWrapProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInVariant}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function FadeInUp({ children, delay = 0, className, ...props }: MotionWrapProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUpVariant}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function ScaleIn({ children, delay = 0, className, ...props }: MotionWrapProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={scaleInVariant}
      transition={{ delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({ children, className, ...props }: MotionWrapProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, ...props }: MotionWrapProps) {
  return (
    <motion.div variants={fadeInUpVariant} className={className} {...props}>
      {children}
    </motion.div>
  )
}

export function SlideInRight({ children, delay = 0, className, ...props }: MotionWrapProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideInRightVariant}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface HoverCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  href?: string
}

export function HoverLift({ children, className, onClick }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  )
}
