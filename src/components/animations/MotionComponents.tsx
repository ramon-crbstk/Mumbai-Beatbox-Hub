import React from 'react';
import { motion, useReducedMotion, Variants, Transition } from 'motion/react';

// Framer-style smooth easing curve
export const SMOOTH_EASE = [0.21, 0.47, 0.32, 0.98] as const;

export type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  scale?: number;
  viewportAmount?: number;
  once?: boolean;
  className?: string;
  id?: string;
}

/**
 * Reusable scroll-reveal component that triggers smooth Framer-style entry animations
 * when entering the viewport. Fully respects prefers-reduced-motion.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.55,
  distance = 28,
  scale = 0.95,
  viewportAmount = 0.15,
  once = true,
  className = '',
  id,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: distance, x: 0, scale: 1 };
      case 'down':
        return { opacity: 0, y: -distance, x: 0, scale: 1 };
      case 'left':
        return { opacity: 0, x: distance, y: 0, scale: 1 };
      case 'right':
        return { opacity: 0, x: -distance, y: 0, scale: 1 };
      case 'scale':
        return { opacity: 0, scale, x: 0, y: 0 };
      case 'none':
      default:
        return { opacity: 0, x: 0, y: 0, scale: 1 };
    }
  };

  const transition: Transition = {
    duration,
    delay,
    ease: SMOOTH_EASE,
  };

  return (
    <motion.div
      id={id}
      initial={getInitialPosition()}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount: viewportAmount }}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  viewportAmount?: number;
  once?: boolean;
  className?: string;
  id?: string;
}

/**
 * Container that orchestrates staggered entry animations for its StaggerItem children.
 */
export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.08,
  delayChildren = 0.05,
  viewportAmount = 0.12,
  once = true,
  className = '',
  id,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      id={id}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: viewportAmount }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'scale' | 'none';
  distance?: number;
  scale?: number;
  duration?: number;
  id?: string;
}

/**
 * Stagger item meant to be used inside StaggerContainer.
 */
export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className = '',
  direction = 'up',
  distance = 24,
  scale = 0.96,
  duration = 0.5,
  id,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  const getInitial = () => {
    if (direction === 'scale') {
      return { opacity: 0, scale, y: 0 };
    }
    if (direction === 'none') {
      return { opacity: 0, scale: 1, y: 0 };
    }
    return { opacity: 0, y: distance, scale: 1 };
  };

  const itemVariants: Variants = {
    hidden: getInitial(),
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration,
        ease: SMOOTH_EASE,
      },
    },
  };

  return (
    <motion.div id={id} variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};

interface ScaleRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  scale?: number;
  viewportAmount?: number;
  once?: boolean;
  className?: string;
  id?: string;
}

/**
 * Scale-in reveal animation tailored for images, video cards, and badge accents.
 */
export const ScaleReveal: React.FC<ScaleRevealProps> = ({
  children,
  delay = 0,
  duration = 0.55,
  scale = 0.93,
  viewportAmount = 0.15,
  once = true,
  className = '',
  id,
}) => {
  return (
    <ScrollReveal
      id={id}
      direction="scale"
      scale={scale}
      delay={delay}
      duration={duration}
      viewportAmount={viewportAmount}
      once={once}
      className={className}
    >
      {children}
    </ScrollReveal>
  );
};

interface FloatingElementProps {
  children: React.ReactNode;
  yOffset?: number;
  duration?: number;
  className?: string;
}

/**
 * Subtle floating ambient motion for decorative badges or hero accents.
 */
export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  yOffset = 5,
  duration = 4.2,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={{
        y: [-yOffset, yOffset, -yOffset],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
