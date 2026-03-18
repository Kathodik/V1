import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const variants = {
  fadeUp: {
    hidden: 'opacity-0 translate-y-12',
    visible: 'opacity-100 translate-y-0',
  },
  fadeDown: {
    hidden: 'opacity-0 -translate-y-12',
    visible: 'opacity-100 translate-y-0',
  },
  fadeLeft: {
    hidden: 'opacity-0 translate-x-16',
    visible: 'opacity-100 translate-x-0',
  },
  fadeRight: {
    hidden: 'opacity-0 -translate-x-16',
    visible: 'opacity-100 translate-x-0',
  },
  fadeIn: {
    hidden: 'opacity-0',
    visible: 'opacity-100',
  },
  scaleUp: {
    hidden: 'opacity-0 scale-90',
    visible: 'opacity-100 scale-100',
  },
  slideUp: {
    hidden: 'opacity-0 translate-y-20',
    visible: 'opacity-100 translate-y-0',
  },
};

const durations = {
  fast: 'duration-500',
  normal: 'duration-700',
  slow: 'duration-1000',
  slower: 'duration-[1200ms]',
};

export const AnimateOnScroll = ({
  children,
  variant = 'fadeUp',
  duration = 'normal',
  delay = 0,
  className = '',
  threshold,
}) => {
  const [ref, isVisible] = useScrollAnimation({ threshold });
  const v = variants[variant] || variants.fadeUp;
  const d = durations[duration] || durations.normal;

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${d} ${isVisible ? v.visible : v.hidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
