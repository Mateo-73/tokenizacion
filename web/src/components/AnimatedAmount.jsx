import { useEffect } from 'react';
import { m, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { amount } from '../lib/format.js';

const easeOutQuint = (t) => 1 - (1 - t) ** 5;

export function AnimatedAmount({ value, format = amount, countUp = false, className = '' }) {
  const numeric = Number(value) || 0;
  const reduceMotion = useReducedMotion();
  const current = useMotionValue(countUp ? 0 : numeric);
  const text = useTransform(current, (latest) => format(latest));

  useEffect(() => {
    const from = current.get();
    if (reduceMotion || from === numeric) {
      current.set(numeric);
      return undefined;
    }
    const duration = countUp ? 900 : 500;
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      current.set(progress === 1 ? numeric : from + (numeric - from) * easeOutQuint(progress));
      if (progress < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [numeric, reduceMotion, current, countUp]);

  if (reduceMotion) return <span className={className}>{format(numeric)}</span>;
  return <m.span className={className}>{text}</m.span>;
}
