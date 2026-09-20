import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";

export type AnimatedTestimonial = {
  name: string;
  image: string;
};

type AnimatedTestimonialsProps = {
  testimonials: AnimatedTestimonial[];
  autoplay?: boolean;
  duration?: number;
  className?: string;
  enabled?: boolean;
  onOpen?: (index: number) => void;
};

function randomRotateY(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return Math.floor((x - Math.floor(x)) * 21) - 10;
}

/**
 * Image-only port of Inspira UI Animated Testimonials (stack + nav).
 * @see https://inspira-ui.com/docs/cn/components/testimonials/animated-testimonials
 */
export function AnimatedTestimonials({
  testimonials,
  autoplay = true,
  duration = 5500,
  className = "",
  enabled = true,
  onOpen,
}: AnimatedTestimonialsProps) {
  const systemReduced = useReducedMotion();
  const motionOn = enabled && !systemReduced;
  const [active, setActive] = useState(0);
  const timer = useRef<number | null>(null);
  const count = testimonials.length;
  const canAutoplay = motionOn && autoplay && count >= 2;

  const rotates = useMemo(
    () => testimonials.map((_, i) => (motionOn ? randomRotateY(i + 1) : 0)),
    [testimonials, motionOn],
  );

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const handleNext = useCallback(() => {
    if (!count) return;
    setActive((value) => (value + 1) % count);
  }, [count]);

  const handlePrev = useCallback(() => {
    if (!count) return;
    setActive((value) => (value - 1 + count) % count);
  }, [count]);

  const startTimer = useCallback(() => {
    clearTimer();
    if (!canAutoplay) return;
    timer.current = window.setInterval(handleNext, duration);
  }, [canAutoplay, clearTimer, duration, handleNext]);

  useEffect(() => {
    setActive(0);
    startTimer();
    return clearTimer;
  }, [testimonials, duration, startTimer, clearTimer]);

  useEffect(() => {
    if (canAutoplay) startTimer();
    else clearTimer();
  }, [canAutoplay, startTimer, clearTimer]);

  if (!count) return null;
  const activeItem = testimonials[active];

  return (
    <div className={`animated-testimonials ${className}`}>
      <div className="at-stage">
        <AnimatePresence initial={false}>
          {testimonials.map((item, index) => {
            const isActive = index === active;
            return (
              <motion.div
                key={`${item.image}-${index}`}
                className="at-card"
                data-active={isActive ? "true" : undefined}
                initial={
                  motionOn
                    ? {
                        opacity: 0,
                        scale: 0.9,
                        rotate: rotates[index],
                      }
                    : false
                }
                  animate={{
                    opacity: isActive ? 1 : motionOn ? 0.65 : 0,
                    scale: isActive ? 1 : 0.94,
                    rotate: isActive ? 0 : rotates[index],
                    zIndex: isActive ? 40 : count + 2 - index,
                    y: isActive && motionOn ? [0, -18, 0] : 0,
                  }}
                  exit={
                    motionOn
                      ? { opacity: 0, scale: 0.9, rotate: rotates[index] }
                      : undefined
                  }
                  transition={{
                    duration: motionOn ? 0.4 : 0,
                    ease: "easeInOut",
                  }}
                style={{ pointerEvents: isActive ? "auto" : "none" }}
                aria-hidden={!isActive}
              >
                <button
                  type="button"
                  className="at-image-btn"
                  onClick={() => onOpen?.(index)}
                  aria-label={`放大查看：${item.name}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    draggable={false}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <span className="at-expand">
                    <Expand size={15} />
                  </span>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {count >= 2 && (
        <div className="at-controls">
          <button
            type="button"
            className="at-nav"
            aria-label="上一张"
            onClick={() => {
              handlePrev();
              startTimer();
            }}
          >
            <ChevronLeft size={20} strokeWidth={2.25} />
          </button>
          <button
            type="button"
            className="at-nav"
            aria-label="下一张"
            onClick={() => {
              handleNext();
              startTimer();
            }}
          >
            <ChevronRight size={20} strokeWidth={2.25} />
          </button>
        </div>
      )}

      <p className="visually-hidden" aria-live="polite">
        {activeItem.name}（{active + 1}/{count}）
      </p>
    </div>
  );
}
