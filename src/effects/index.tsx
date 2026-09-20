import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type BorderBeamProps = {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
};

/** Port of thelatstest BorderBeam (Inspira UI). */
export function BorderBeam({
  className = "",
  size = 180,
  duration = 12,
  borderWidth = 1.5,
  colorFrom = "#7eb87a",
  colorTo = "#2f6b52",
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      className={`border-beam ${className}`}
      style={
        {
          "--bb-size": size,
          "--bb-duration": `${duration}s`,
          "--bb-border": borderWidth,
          "--bb-from": colorFrom,
          "--bb-to": colorTo,
          "--bb-delay": `${delay}s`,
        } as CSSProperties
      }
      aria-hidden="true"
    />
  );
}

type TextGenerateProps = {
  text: string;
  className?: string;
  delay?: number;
  enabled?: boolean;
};

/** Port of thelatstest TextGenerateEffect — CJK character reveal. */
export function TextGenerate({
  text,
  className = "",
  delay = 0,
  enabled = true,
}: TextGenerateProps) {
  const [active, setActive] = useState(enabled ? -1 : text.length);
  const length = text.length;

  useEffect(() => {
    if (!enabled) {
      setActive(length);
      return;
    }
    setActive(-1);
    let i = 0;
    let timer = 0;
    const start = window.setTimeout(() => {
      const tick = () => {
        setActive(i);
        i += 1;
        if (i < length) timer = window.setTimeout(tick, 32);
      };
      tick();
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(timer);
    };
  }, [text, delay, enabled, length]);

  return (
    <span className={`text-generate ${className}`}>
      {[...text].map((ch, idx) => (
        <span
          key={`${ch}-${idx}`}
          className={`text-generate-unit ${idx <= active ? "is-shown" : ""}`}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

type NumberTickerProps = {
  value: number;
  className?: string;
  duration?: number;
  enabled?: boolean;
};

/** Port of thelatstest NumberTicker — count-up on first view. */
export function NumberTicker({
  value,
  className = "",
  duration = 900,
  enabled = true,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(enabled ? 0 : value);
  const started = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setDisplay(value);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const animate = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(value * eased));
          if (t < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration, enabled]);

  return (
    <span ref={ref} className={`number-ticker ${className}`}>
      {display}
    </span>
  );
}

type GlareCardProps = {
  children: ReactNode;
  className?: string;
  enabled?: boolean;
};

/** Lightweight glare hover inspired by thelatstest GlareCard. */
export function GlareCard({
  children,
  className = "",
  enabled = true,
}: GlareCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty("--glare-x", `${x}%`);
    ref.current.style.setProperty("--glare-y", `${y}%`);
    ref.current.style.setProperty("--glare-opacity", "1");
  };

  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.setProperty("--glare-opacity", "0");
  };

  return (
    <div
      ref={ref}
      className={`glare-card ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
      {enabled && <div className="glare-card-shine" aria-hidden="true" />}
    </div>
  );
}

type RippleProps = {
  className?: string;
  baseCircleSize?: number;
  baseCircleOpacity?: number;
  spaceBetweenCircle?: number;
  circleOpacityDowngradeRatio?: number;
  waveSpeed?: number;
  numberOfCircles?: number;
};

/**
 * Port of Inspira UI Ripple.
 * @see https://inspira-ui.com/docs/cn/components/backgrounds/ripple
 */
export function Ripple({
  className = "",
  baseCircleSize = 140,
  baseCircleOpacity = 0.28,
  spaceBetweenCircle = 62,
  circleOpacityDowngradeRatio = 0.04,
  waveSpeed = 90,
  numberOfCircles = 5,
}: RippleProps) {
  return (
    <div className={`ripple ${className}`} aria-hidden="true">
      {Array.from({ length: numberOfCircles }, (_, index) => (
        <span
          key={index}
          className="ripple-circle"
          style={{
            width: baseCircleSize + index * spaceBetweenCircle,
            height: baseCircleSize + index * spaceBetweenCircle,
            opacity: Math.max(
              0,
              baseCircleOpacity - index * circleOpacityDowngradeRatio,
            ),
            borderStyle: index === numberOfCircles - 1 ? "dashed" : "solid",
            animationDelay: `${index * waveSpeed}ms`,
          }}
        />
      ))}
    </div>
  );
}

type MarqueeProps = {
  items: string[];
  className?: string;
  enabled?: boolean;
};

/** Simple marquee strip inspired by thelatstest Marquee. */
export function Marquee({ items, className = "", enabled = true }: MarqueeProps) {
  const row = [...items, ...items];
  return (
    <div
      className={`marquee ${className} ${enabled ? "" : "is-static"}`}
      aria-hidden="true"
    >
      <div className="marquee-track">
        {row.map((item, i) => (
          <span key={`${item}-${i}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

type LinkPreviewProps = {
  children: ReactNode;
  url: string;
  className?: string;
  linkClassName?: string;
  width?: number;
  height?: number;
  isStatic?: boolean;
  imageSrc?: string;
  enabled?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  target?: string;
  rel?: string;
  "aria-label"?: string;
};

/**
 * Port of Inspira UI Link Preview (from Aceternity).
 * @see https://inspira-ui.com/docs/cn/components/miscellaneous/link-preview
 */
export function LinkPreview({
  children,
  url,
  className = "",
  linkClassName = "",
  width = 220,
  height = 138,
  isStatic = false,
  imageSrc = "",
  enabled = true,
  onClick,
  target,
  rel,
  "aria-label": ariaLabel,
}: LinkPreviewProps) {
  const [visible, setVisible] = useState(false);
  const [popped, setPopped] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const linkRef = useRef<HTMLAnchorElement>(null);
  const popTimer = useRef(0);

  const previewSrc = (() => {
    if (isStatic) return imageSrc;
    if (!url || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:")) {
      return imageSrc;
    }
    const params = new URLSearchParams({
      url,
      screenshot: "true",
      meta: "false",
      embed: "screenshot.url",
      colorScheme: "light",
      "viewport.isMobile": "true",
      "viewport.deviceScaleFactor": "1",
      "viewport.width": String(width * 3),
      "viewport.height": String(height * 3),
    });
    return `https://api.microlink.io/?${params.toString()}`;
  })();

  const canPreview =
    enabled &&
    !!previewSrc &&
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  useEffect(() => {
    return () => window.clearTimeout(popTimer.current);
  }, []);

  const placePreview = (clientX: number) => {
    const link = linkRef.current;
    if (!link) return;
    const rect = link.getBoundingClientRect();
    const offset = 16;
    let x = clientX - width / 2;
    x = Math.min(Math.max(8, x), window.innerWidth - width - 8);
    let y = rect.top - height - offset;
    if (y < 8) y = rect.bottom + offset;
    setCoords({ x, y });
  };

  const show = (clientX: number) => {
    if (!canPreview) return;
    placePreview(clientX);
    setVisible(true);
    window.clearTimeout(popTimer.current);
    popTimer.current = window.setTimeout(() => setPopped(true), 40);
  };

  const hide = () => {
    window.clearTimeout(popTimer.current);
    setVisible(false);
    setPopped(false);
  };

  return (
    <span className={`link-preview ${className}`.trim()}>
      <a
        ref={linkRef}
        href={url}
        className={linkClassName}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        onClick={onClick}
        onMouseEnter={(event) => show(event.clientX)}
        onMouseMove={(event) => {
          if (!visible) return;
          placePreview(event.clientX);
        }}
        onMouseLeave={hide}
        onFocus={(event) => show(event.currentTarget.getBoundingClientRect().left + width / 2)}
        onBlur={hide}
      >
        {children}
      </a>
      {visible &&
        previewSrc &&
        createPortal(
          <div
            className={`link-preview-float${popped ? " is-popped" : ""}`}
            style={{
              left: coords.x,
              top: coords.y,
              width,
              height,
            }}
            aria-hidden="true"
          >
            <div className="link-preview-card">
              <img
                src={previewSrc}
                alt=""
                width={width}
                height={height}
                loading="eager"
                decoding="async"
              />
            </div>
          </div>,
          document.body,
        )}
    </span>
  );
}
