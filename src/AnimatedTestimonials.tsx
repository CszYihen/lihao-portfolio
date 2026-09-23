import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useSystemReducedMotion } from "./useSystemReducedMotion";

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
  const systemReduced = useSystemReducedMotion();
  const motionOn = enabled && !systemReduced;
  const [active, setActive] = useState(0);
  const [nearView, setNearView] = useState(false);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showIndexFeedback, setShowIndexFeedback] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [compact, setCompact] = useState(() => window.innerWidth <= 740);
  const [stageRatio, setStageRatio] = useState(2);
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const feedbackTimer = useRef<number | null>(null);
  const hasActiveChanged = useRef(false);
  const imageRatios = useRef(new Map<string, number>());
  const count = testimonials.length;
  const canAutoplay =
    motionOn &&
    autoplay &&
    count >= 2 &&
    inView &&
    pageVisible &&
    !compact &&
    !hovered &&
    !focused;

  const rotates = useMemo(
    () => testimonials.map((_, i) => (motionOn ? randomRotateY(i + 1) : 0)),
    [testimonials, motionOn],
  );
  const visibleIndexes = useMemo(() => {
    if (!nearView || !count) return [];
    const visibleCount = Math.min(3, count);
    return Array.from(
      { length: visibleCount },
      (_, offset) => (active + offset) % count,
    );
  }, [active, count, nearView]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearView(true);
          nearObserver.disconnect();
        }
      },
      { rootMargin: "700px 0px" },
    );
    const visibleObserver = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 },
    );
    const onVisibility = () => setPageVisible(!document.hidden);
    const onResize = () => setCompact(window.innerWidth <= 740);
    nearObserver.observe(element);
    visibleObserver.observe(element);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, []);

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
    setStageRatio(imageRatios.current.get(testimonials[0]?.image) ?? 2);
  }, [testimonials]);

  useEffect(() => {
    const ratio = imageRatios.current.get(testimonials[active]?.image);
    if (ratio) setStageRatio(ratio);
    if (!hasActiveChanged.current) {
      hasActiveChanged.current = true;
      return;
    }
    setShowIndexFeedback(true);
    if (feedbackTimer.current !== null)
      window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(
      () => setShowIndexFeedback(false),
      900,
    );
    return () => {
      if (feedbackTimer.current !== null)
        window.clearTimeout(feedbackTimer.current);
    };
  }, [active, testimonials]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  if (!count) return null;
  const activeItem = testimonials[active];

  return (
    <div
      className={`animated-testimonials ${className}`}
      ref={root}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => {
        window.requestAnimationFrame(() => {
          if (
            !document.querySelector('[role="dialog"][aria-modal="true"]') &&
            !root.current?.contains(document.activeElement)
          ) {
            setFocused(false);
          }
        });
      }}
    >
      <div className="at-stage" style={{ aspectRatio: stageRatio }}>
        <AnimatePresence initial={false}>
          {visibleIndexes.map((index) => {
            const item = testimonials[index];
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
                  y: isActive && motionOn ? [0, -8, 0] : 0,
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
                    loading={isActive ? "eager" : "lazy"}
                    decoding="async"
                    onLoad={(event) => {
                      const image = event.currentTarget;
                      if (!image.naturalWidth || !image.naturalHeight) return;
                      const ratio = image.naturalWidth / image.naturalHeight;
                      imageRatios.current.set(item.image, ratio);
                      if (isActive) setStageRatio(ratio);
                    }}
                  />
                  <span className="at-expand" aria-hidden="true">
                    <Expand size={15} />
                    <span>点击查看大图</span>
                  </span>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <AnimatePresence>
          {showIndexFeedback && (
            <motion.span
              className="at-index-feedback"
              aria-hidden="true"
              initial={motionOn ? { opacity: 0, y: -4, scale: 0.96 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -3, scale: 0.98 }}
              transition={{ duration: motionOn ? 0.2 : 0 }}
            >
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
            </motion.span>
          )}
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
