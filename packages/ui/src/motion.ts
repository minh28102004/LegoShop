import type { Transition, Variants } from 'framer-motion'

const easeSmooth = [0.4, 0, 0.2, 1] as const
const easeIn = [0.4, 0, 1, 1] as const
const easeOutExpo = [0.19, 1, 0.22, 1] as const

export const smoothTransition: Transition = {
  type: 'tween',
  ease: easeSmooth,
  duration: 0.4,
}

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}

export const bouncySpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
}

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: smoothTransition },
  exit: { opacity: 0, transition: { duration: 0.2, ease: easeIn } },
}

export const fadeInSlow: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.8, ease: easeSmooth },
  },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

export const slideUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
}

export const slideDown: Variants = {
  initial: { opacity: 0, y: -24 },
  animate: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: 16, transition: { duration: 0.2 } },
}

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 64 },
  animate: { opacity: 1, x: 0, transition: smoothTransition },
  exit: { opacity: 0, x: 64, transition: { duration: 0.25 } },
}

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -64 },
  animate: { opacity: 1, x: 0, transition: smoothTransition },
  exit: { opacity: 0, x: -64, transition: { duration: 0.25 } },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: springTransition },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.15 } },
}

export const scaleInBounce: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: bouncySpring },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
}

export function staggerChildren(staggerDelay: number = 0.07): Variants {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
    exit: {
      transition: {
        staggerChildren: staggerDelay / 2,
        staggerDirection: -1,
      },
    },
  }
}

export const heroTitle: Variants = {
  initial: { opacity: 0, y: 40, filter: 'blur(8px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: easeOutExpo },
  },
}

export const heroSubtitle: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo, delay: 0.2 },
  },
}

export const heroCTA: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeSmooth, delay: 0.4 },
  },
}

export const cardHover: Variants = {
  rest: { scale: 1, boxShadow: 'var(--shadow-sm)' },
  hover: {
    scale: 1.02,
    boxShadow: 'var(--shadow-lg)',
    transition: springTransition,
  },
  tap: { scale: 0.98 },
}

export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } },
}

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.15 } },
}

export const drawerContent: Variants = {
  initial: { x: '100%' },
  animate: {
    x: 0,
    transition: { type: 'spring', stiffness: 350, damping: 35 },
  },
  exit: { x: '100%', transition: { duration: 0.25, ease: easeIn } },
}

export const drawerContentLeft: Variants = {
  initial: { x: '-100%' },
  animate: {
    x: 0,
    transition: { type: 'spring', stiffness: 350, damping: 35 },
  },
  exit: { x: '-100%', transition: { duration: 0.25, ease: easeIn } },
}

export const scrollRevealUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
}

export const scrollRevealFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: easeSmooth },
  },
}
