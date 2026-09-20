import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Minus, Plus, X } from "lucide-react";
import { AnimatedTestimonials } from "./AnimatedTestimonials";

export type ProjectImage = {
  src: string;
  title: string;
  kind: "screenshot" | "diagram";
};
const asset = (src: string) =>
  /^(?:https?:)?\/\//.test(src) ||
  src.startsWith("/") ||
  src.startsWith("data:")
    ? src
    : `${import.meta.env.BASE_URL}${src}`;

/** Image-only project gallery (Inspira Animated Testimonials stack). */
export function ProjectGallery({
  images,
  onOpen,
  animated = true,
}: {
  title?: string;
  images: ProjectImage[];
  onOpen: (index: number) => void;
  animated?: boolean;
}) {
  const testimonials = useMemo(
    () =>
      images.map((image) => ({
        name: image.title,
        image: asset(image.src),
      })),
    [images],
  );
  if (images.length === 0) return null;

  return (
    <div className="project-gallery">
      <AnimatedTestimonials
        testimonials={testimonials}
        autoplay={animated}
        enabled={animated}
        duration={5200}
        onOpen={onOpen}
      />
    </div>
  );
}

export function Lightbox({
  title,
  images,
  initialIndex,
  onClose,
  animated,
  returnFocus,
}: {
  title: string;
  images: ProjectImage[];
  initialIndex: number;
  onClose: () => void;
  animated: boolean;
  returnFocus?: HTMLElement | null;
}) {
  const LENS = 152;
  const LENS_ZOOM = 2.35;
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(false);
  const [lens, setLens] = useState<{
    x: number;
    y: number;
    bgX: number;
    bgY: number;
    bgW: number;
    bgH: number;
  } | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const count = images.length;
  const current = images[index];
  const step = (direction: number) => {
    setIndex((value) => (value + direction + count) % count);
    setZoom(false);
    setLens(null);
  };
  const updateLens = (clientX: number, clientY: number) => {
    const img = imageRef.current;
    if (!img || zoom) {
      setLens(null);
      return;
    }
    const rect = img.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    setLens({
      x,
      y,
      bgX: -(x * LENS_ZOOM - LENS / 2),
      bgY: -(y * LENS_ZOOM - LENS / 2),
      bgW: rect.width * LENS_ZOOM,
      bgH: rect.height * LENS_ZOOM,
    });
  };
  useEffect(() => {
    const previous =
      returnFocus ?? (document.activeElement as HTMLElement | null);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((value) => (value + 1) % count);
        setZoom(false);
        setLens(null);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((value) => (value - 1 + count) % count);
        setZoom(false);
        setLens(null);
      }
      if (event.key === "Tab") {
        const controls = dialog.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href]",
        );
        if (!controls?.length) return;
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [count, onClose, returnFocus]);
  useEffect(() => {
    if (viewport.current) viewport.current.scrollTo(0, 0);
    setLens(null);
  }, [index, zoom]);
  return (
    <motion.div
      className="lightbox-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: animated ? 0.2 : 0 }}
      onClick={onClose}
    >
      <div
        className="lightbox"
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lightbox-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="lightbox-header">
          <div>
            <span>PROJECT GALLERY</span>
            <h2 id="lightbox-title">{title}</h2>
          </div>
          <div className="lightbox-actions">
            <button
              className="lightbox-icon"
              onClick={() => {
                setZoom((value) => !value);
                setLens(null);
              }}
              aria-label={zoom ? "缩小图片" : "放大图片"}
              aria-pressed={zoom}
            >
              {zoom ? <Minus size={19} /> : <Plus size={19} />}
            </button>
            <button
              ref={closeButton}
              className="lightbox-icon"
              aria-label="关闭图集"
              onClick={onClose}
            >
              <X size={22} />
            </button>
          </div>
        </header>
        <div
          className={`lightbox-viewport ${zoom ? "zoomed" : ""}`}
          ref={viewport}
        >
          <div
            className={`lightbox-stage${lens ? " is-lensing" : ""}`}
            onMouseMove={(event) => {
              if (zoom) return;
              updateLens(event.clientX, event.clientY);
            }}
            onMouseLeave={() => setLens(null)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={current.src}
                ref={imageRef}
                src={asset(current.src)}
                alt={current.title}
                initial={animated ? { opacity: 0, scale: 0.985 } : false}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: animated ? 0.16 : 0 }}
                draggable={false}
              />
            </AnimatePresence>
            {lens && !zoom && (
              <div
                className="lightbox-lens"
                aria-hidden="true"
                style={{
                  width: LENS,
                  height: LENS,
                  left: lens.x - LENS / 2,
                  top: lens.y - LENS / 2,
                  backgroundImage: `url(${asset(current.src)})`,
                  backgroundSize: `${lens.bgW}px ${lens.bgH}px`,
                  backgroundPosition: `${lens.bgX}px ${lens.bgY}px`,
                }}
              />
            )}
          </div>
        </div>
        <div className="lightbox-caption" aria-live="polite">
          <div>
            <span className="lightbox-kind">
              {current.kind === "diagram" ? "流程图" : "界面截图"}
            </span>
            <span>{current.title}</span>
          </div>
          <div className="lightbox-paging">
            <button
              className="lightbox-icon"
              onClick={() => step(-1)}
              disabled={count < 2}
              aria-label="上一张图片"
            >
              <ArrowLeft size={19} />
            </button>
            <span>
              {String(index + 1).padStart(2, "0")}{" "}
              <i>/ {String(count).padStart(2, "0")}</i>
            </span>
            <button
              className="lightbox-icon"
              onClick={() => step(1)}
              disabled={count < 2}
              aria-label="下一张图片"
            >
              <ArrowRight size={19} />
            </button>
          </div>
        </div>
        <div className="lightbox-filmstrip">
          {images.map((image, i) => (
            <button
              key={image.src}
              className={i === index ? "active" : ""}
              aria-label={`查看第${i + 1}张：${image.title}`}
              aria-pressed={i === index}
              onClick={() => {
                setIndex(i);
                setZoom(false);
                setLens(null);
              }}
            >
              <img src={asset(image.src)} alt="" />
              <span>{String(i + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
        <p className="lightbox-help">
          ← → 切换图片 <span>·</span> ESC 关闭 <span>·</span> 悬停放大镜查看细节{" "}
          <span>·</span> 点击 + 全幅放大
        </p>
      </div>
    </motion.div>
  );
}
