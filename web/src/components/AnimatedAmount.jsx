import { useEffect } from 'react';
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { amount } from '../lib/format.js';

export function AnimatedAmount({ value, format = amount, countUp = false, className = '' }) {
  const numeric = Number(value) || 0;
  const reduceMotion = useReducedMotion();
  const target = useMotionValue(countUp ? 0 : numeric);
  const spring = useSpring(target, { bounce: 0, visualDuration: countUp ? 0.8 : 0.45, restDelta: 0.001 });
  const text = useTransform(spring, (latest) => {
    const goal = target.get();
    return format(Math.abs(goal - latest) < 0.01 ? goal : latest);
  });

  useEffect(() => {
    target.set(numeric);
  }, [numeric, target]);

  if (reduceMotion) return <span className={className}>{format(numeric)}</span>;
  return <m.span className={className}>{text}</m.span>;
}
