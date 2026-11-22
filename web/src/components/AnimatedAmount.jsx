import { useEffect } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { amount } from '../lib/format.js';

export function AnimatedAmount({ value, format = amount, className = '' }) {
  const numeric = Number(value) || 0;
  const reduceMotion = useReducedMotion();
  const valueMotion = useMotionValue(0);
  const spring = useSpring(valueMotion, { stiffness: 140, damping: 26, mass: 0.8 });
  const formatted = useTransform(spring, (current) => format(current));
  useEffect(() => { if (!reduceMotion) valueMotion.set(numeric); }, [numeric, reduceMotion, valueMotion]);
  return <motion.span className={className}>{reduceMotion ? format(numeric) : formatted}</motion.span>;
}
