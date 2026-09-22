import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowDownToLine,
  ArrowUp,
  ArrowUpRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CirclePause,
  CirclePlay,
  Code2,
  Copy,
  FileText,
  Github,
  GraduationCap,
  Mail,
  Phone,
  Printer,
  Server,
  X,
} from "lucide-react";
import {
  categoryMeta,
  education,
  profile,
  projects,
  publications,
  scholarships,
  skills,
  type Project,
} from "./data";
import {
  BorderBeam,
  GlareCard,
  LinkPreview,
  Marquee,
  Ripple,
  TextGenerate,
} from "./effects";
import { Lightbox, ProjectGallery, type ProjectImage } from "./Gallery";
import { projectMedia } from "./media";
import { useSystemReducedMotion } from "./useSystemReducedMotion";
import companyPreview from "./assets/company/zhudian-home.webp";

const AnimationContext = createContext(true);
const asset = (src: string) =>
  /^(?:https?:)?\/\//.test(src) ||
  src.startsWith("/") ||
  src.startsWith("data:")
    ? src
    : `${import.meta.env.BASE_URL}${src}`;
const projectCover = (id: string) => {
  const cover = projectMedia[id]?.[0]?.src;
  return cover ? asset(cover) : "";
};
const navigation = [
  { id: "overview", number: "01", title: "专业概述" },
  { id: "experience", number: "02", title: "实习经历" },
  { id: "projects", number: "03", title: "项目经历" },
  { id: "honors", number: "04", title: "学术与荣誉" },
];

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Render [[term]] markers in project feature details as focus marks. */
function emphasize(text: string) {
  return text.split(/(\[\[[\s\S]+?\]\])/g).map((part, index) => {
    const matched = part.match(/^\[\[([\s\S]+?)\]\]$/);
    if (!matched) return part;
    return (
      <mark key={`${matched[1]}-${index}`} className="focus-mark">
        {matched[1]}
      </mark>
    );
  });
}

const projectSummaryTerms: Record<string, string[]> = {
  cloud89: [
    "岸基船舶管理平台",
    "实时位置",
    "Netty / JT808",
    "告警查询处置",
    "JT1078",
    "FFmpeg / HLS",
  ],
  llm: [
    "AI 图片复检中台",
    "减少误报",
    "工厂与策略模式",
    "不同模型厂商",
    "人工审核",
    "Redis API Key",
    "SSE",
  ],
  mas: [
    "本地安全告警系统",
    "滑动窗口",
    "重复告警",
    "JT808",
    "熔断",
    "9212 回执",
  ],
  attendance: [
    "工地现场",
    "无感打卡",
    "陌生人记录",
    "非法进入",
    "失败任务恢复",
  ],
  drama: [
    "AI 短剧创作平台",
    "角色、场景、分镜与视频资产",
    "RabbitMQ",
    "Qdrant",
    "策略与工厂",
    "MinIO",
    "Elasticsearch",
    "WebSocket",
  ],
};

function highlightProjectSummary(project: Project) {
  const terms = projectSummaryTerms[project.id] ?? [];
  if (!terms.length) return project.summary;
  const escaped = [...terms]
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const matcher = new RegExp(`(${escaped.join("|")})`, "g");
  let keywordIndex = 0;
  return project.summary.split(matcher).map((part, index) => {
    if (!terms.includes(part)) return part;
    const order = keywordIndex++;
    return (
      <mark
        className="project-summary-key"
        key={`${part}-${index}`}
        style={{ "--keyword-delay": `${order * 90}ms` } as CSSProperties}
      >
        {part}
      </mark>
    );
  });
}

const revealVariants = {
  fadeUp: {
    hidden: { opacity: 0, y: 36, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -28, filter: "blur(8px)" },
    visible: { opacity: 1, x: 0, filter: "blur(0px)" },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96, y: 18, filter: "blur(6px)" },
    visible: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
  },
} as const;

type RevealVariant = keyof typeof revealVariants;

function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "fadeUp",
  amount = 0.18,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
  amount?: number;
}) {
  const animated = useContext(AnimationContext);
  const preset = revealVariants[variant];
  return (
    <motion.div
      className={`reveal ${className}`}
      initial={animated ? "hidden" : false}
      animate={animated ? undefined : "visible"}
      whileInView="visible"
      viewport={{ once: true, amount, margin: "0px 0px -6% 0px" }}
      variants={preset}
      transition={{
        duration: animated ? 0.72 : 0,
        delay: animated ? delay : 0,
        ease: easeOutExpo,
      }}
    >
      {children}
    </motion.div>
  );
}

function Stagger({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const animated = useContext(AnimationContext);
  return (
    <motion.div
      className={className}
      initial={animated ? "hidden" : false}
      animate={animated ? undefined : "visible"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -4% 0px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: animated ? 0.08 : 0,
            delayChildren: animated ? delay : 0,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const animated = useContext(AnimationContext);
  return (
    <motion.div
      className={`reveal ${className}`}
      variants={
        animated
          ? revealVariants.fadeUp
          : { hidden: { opacity: 1 }, visible: { opacity: 1 } }
      }
      transition={{ duration: animated ? 0.55 : 0, ease: easeOutExpo }}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({
  number,
  title,
  english,
  children,
}: {
  number: string;
  title: string;
  english: string;
  children?: ReactNode;
}) {
  const animated = useContext(AnimationContext);
  return (
    <div className="section-heading">
      <motion.div
        initial={animated ? { opacity: 0, x: -16 } : false}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: animated ? 0.55 : 0, ease: easeOutExpo }}
      >
        <span className="section-number">{number}</span>
        <h2>{title}</h2>
        <span className="section-english">{english}</span>
      </motion.div>
      {children}
    </div>
  );
}

function ProjectEntry({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (title: string, images: ProjectImage[], index: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const animated = useContext(AnimationContext);
  const images = projectMedia[project.id] ?? [];
  const entryRef = useRef<HTMLElement>(null);
  const isReading = useInView(entryRef, {
    amount: 0.36,
    margin: "-12% 0px -36% 0px",
  });
  const hasEntered = useInView(entryRef, { amount: 0.16, once: true });
  return (
    <motion.article
      ref={entryRef}
      className={`project-entry${isReading ? " is-reading" : ""}${hasEntered ? " has-entered" : ""}`}
      id={`project-${project.id}`}
      whileHover={
        animated
          ? { y: -2, transition: { duration: 0.28, ease: easeOutExpo } }
          : undefined
      }
    >
      <time
        className={`project-timeline-marker${project.category === "personal" ? " personal" : ""}`}
        aria-label={project.period.label}
      >
        <span>{project.period.start}</span>
        <span className="project-timeline-end">
          <i aria-hidden="true" />
          {project.period.end}
        </span>
      </time>
      <div className="project-entry-header">
        <motion.div
          className={`project-icon ${project.category === "personal" ? "personal" : ""}`}
          whileHover={
            animated
              ? { scale: 1.06, rotate: -3, transition: { duration: 0.25 } }
              : undefined
          }
        >
          {project.category === "personal" ? (
            <Code2 size={20} />
          ) : (
            <Server size={19} />
          )}
        </motion.div>
        <div className="project-heading">
          <h3>
            {project.title}
            {project.id === "drama" && <span>AI 短剧创作平台</span>}
          </h3>
          <div className="project-subtitle">
            <span>{categoryMeta[project.category].subtitle}</span>
            <i />
            <span>{categoryMeta[project.category].role}</span>
          </div>
        </div>
        <div className="project-heading-actions">
          {project.github && (
            <LinkPreview
              className="project-github-preview"
              linkClassName="project-github"
              url={project.github}
              isStatic
              imageSrc={projectCover(project.id)}
              width={220}
              height={138}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} GitHub 仓库`}
            >
              <Github size={14} />
              GitHub
              <ArrowUpRight size={12} />
            </LinkPreview>
          )}
          <span
            className={`project-category ${project.category === "personal" ? "personal" : ""}`}
          >
            {categoryMeta[project.category].label}
          </span>
        </div>
      </div>
      <div className="project-tech">
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <p className="project-description">{highlightProjectSummary(project)}</p>
      <div className={`project-body ${images.length ? "with-gallery" : ""}`}>
        <div className="project-narrative">
          <div className="project-role-label">
            {project.category === "personal" ? "主要实现" : "项目技术要点"}
          </div>
          <ul className="project-highlights">
            {project.features.slice(0, 2).map((feature) => (
              <li key={feature.title}>
                <strong>{feature.title}</strong>
                <p>{emphasize(feature.detail)}</p>
              </li>
            ))}
          </ul>
          <motion.div
            className="additional-features"
            id={`${project.id}-details`}
            initial={false}
            animate={{
              height: expanded ? "auto" : 0,
              opacity: expanded ? 1 : 0,
            }}
            transition={{ duration: animated ? 0.3 : 0 }}
            inert={!expanded}
            aria-hidden={!expanded}
          >
            <ul className="project-highlights">
              {project.features.slice(2).map((feature) => (
                <li key={feature.title}>
                  <strong>{feature.title}</strong>
                  <p>{emphasize(feature.detail)}</p>
                </li>
              ))}
            </ul>
            <div className="project-flow">
              <span>业务链路</span>
              {project.flow.map((item, i) => (
                <span
                  className="project-flow-node"
                  key={item}
                  style={{ "--flow-index": i } as CSSProperties}
                >
                  {i > 0 && <b>→</b>}
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
          <button
            className="detail-toggle"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-controls={`${project.id}-details`}
          >
            {expanded
              ? "收起技术细节"
              : `展开其余 ${project.features.length - 2} 项技术细节`}
            <ChevronDown
              size={14}
              style={{ transform: expanded ? "rotate(180deg)" : undefined }}
            />
          </button>
        </div>
        <ProjectGallery
          title={project.title}
          images={images}
          animated={!!animated}
          onOpen={(index) => onOpen(project.title, images, index)}
        />
      </div>
    </motion.article>
  );
}

export default function App() {
  const systemReduced = useSystemReducedMotion();
  const [motionEnabled, setMotionEnabled] = useState(() => {
    try {
      return localStorage.getItem("lihao-motion") !== "off";
    } catch {
      return true;
    }
  });
  const animated = motionEnabled && !systemReduced;
  const [activeSection, setActiveSection] = useState("overview");
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<{
    title: string;
    images: ProjectImage[];
    index: number;
  } | null>(null);
  const [toast, setToast] = useState("");
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lightboxTrigger = useRef<HTMLElement | null>(null);
  const projectListRef = useRef<HTMLDivElement>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: projectTimelineProgress } = useScroll({
    target: projectListRef,
    offset: ["start 46%", "end 54%"],
  });
  const smoothProjectTimelineProgress = useSpring(projectTimelineProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.28,
  });
  const renderedTimelineProgress = animated
    ? smoothProjectTimelineProgress
    : projectTimelineProgress;
  const projectTimelineCursor = useTransform(
    renderedTimelineProgress,
    [0, 1],
    ["0%", "100%"],
  );
  useEffect(() => {
    document.documentElement.dataset.motion = animated ? "on" : "off";
    try {
      localStorage.setItem("lihao-motion", motionEnabled ? "on" : "off");
    } catch {
      /* Optional preference storage. */
    }
  }, [animated, motionEnabled]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActiveSection(entry.target.id);
      },
      { rootMargin: "-8% 0px -65% 0px", threshold: 0 },
    );
    navigation.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);
  useEffect(
    () => () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    },
    [],
  );
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setToast("邮箱已复制");
    } catch {
      setToast(`请手动复制：${profile.email}`);
    }
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(""), 3200);
  };
  const openGallery = (
    title: string,
    images: ProjectImage[],
    index: number,
  ) => {
    lightboxTrigger.current = document.activeElement as HTMLElement | null;
    setLightbox({ title, images, index });
  };
  const printResume = () => {
    flushSync(() => setFilter("all"));
    window.print();
  };
  const filtered = projects.filter(
    (project) => filter === "all" || project.category === filter,
  );

  return (
    <MotionConfig reducedMotion={animated ? "never" : "always"}>
      <AnimationContext.Provider value={animated}>
        <div className="resume-app" inert={!!lightbox}>
          <a className="skip-link" href="#resume-main">
            跳转到简历正文
          </a>
          <motion.div
            className="reading-progress"
            style={{ scaleX: scrollYProgress }}
            transition={{ ease: "linear" }}
          />
          <header className="topbar">
            <a href="#top" className="topbar-brand">
              <span className="brand-mark">
                L<span>H</span>
              </span>
              <span>李豪的个人简历</span>
            </a>
            <div className="topbar-right">
              <span className="topbar-caption">JAVA BACKEND · RÉSUMÉ</span>
              <button
                className="motion-switch"
                onClick={() => setMotionEnabled((value) => !value)}
                aria-label={
                  systemReduced
                    ? "遵循系统减少动效设置"
                    : animated
                      ? "暂停页面动效"
                      : "开启页面动效"
                }
                aria-pressed={animated}
                disabled={!!systemReduced}
              >
                {animated ? (
                  <CirclePause size={14} />
                ) : (
                  <CirclePlay size={14} />
                )}
                <span>
                  {systemReduced
                    ? "静态阅读"
                    : animated
                      ? "动效开启"
                      : "动效关闭"}
                </span>
              </button>
            </div>
          </header>
          <div className="resume-layout" id="top">
            <aside className="profile-sidebar" aria-label="个人资料">
              <motion.div
                className="sidebar-inner"
                initial={animated ? { opacity: 0, x: -24 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: animated ? 0.8 : 0,
                  ease: easeOutExpo,
                }}
              >
                <div className={`profile-card ${animated ? "has-ripple" : ""}`}>
                  {animated && (
                    <BorderBeam
                      colorFrom="#c4dfb0"
                      colorTo="#7eb87a"
                      duration={14}
                      size={160}
                    />
                  )}
                  {animated && (
                    <Ripple
                      baseCircleSize={110}
                      baseCircleOpacity={0.22}
                      spaceBetweenCircle={54}
                      circleOpacityDowngradeRatio={0.035}
                      numberOfCircles={5}
                      waveSpeed={100}
                    />
                  )}
                  <div className="profile-card-top">
                    <span className="profile-stamp">PERSONAL PROFILE</span>
                    <span className="profile-spark" aria-hidden="true">
                      ✳
                    </span>
                  </div>
                  <div className="identity-row">
                    <div className="profile-monogram" aria-hidden="true">
                      <span>L</span>
                      <span>H</span>
                      <i />
                    </div>
                    <div className="mobile-identity">
                      <h1>
                        李豪<span>LI HAO</span>
                      </h1>
                      <p className="profile-role">Java 后端开发</p>
                    </div>
                  </div>
                  <div className="graduate-badge">
                    <span />
                    2027 届 · 硕士在读
                  </div>
                  <p className="profile-summary">
                    以 Java 为核心，关注企业侧设备物联、
                    <br />
                    实时业务与 AI 应用开发。
                  </p>
                  <div className="profile-divider" />
                  <dl className="profile-facts">
                    <div>
                      <dt>求职方向</dt>
                      <dd>Java 后端开发实习</dd>
                    </div>
                    <div>
                      <dt>当前学历</dt>
                      <dd>计算机技术 · 硕士</dd>
                    </div>
                    <div>
                      <dt>就读院校</dt>
                      <dd>燕山大学</dd>
                    </div>
                  </dl>
                  <div className="profile-contact">
                    <a href={`mailto:${profile.email}`}>
                      <Mail size={15} />
                      <span>{profile.email}</span>
                      <ArrowUpRight size={13} />
                    </a>
                    <a href={`tel:${profile.phone}`}>
                      <Phone size={14} />
                      <span>{profile.phone}</span>
                    </a>
                    <a
                      className="profile-github"
                      href={profile.github}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Github size={14} />
                      <span>github.com/CszYihen</span>
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                  <a
                    className="profile-download"
                    href={profile.resume}
                    download="李豪-Java后端简历.pdf"
                  >
                    <FileText size={15} />
                    <span>下载 PDF 简历</span>
                    <ArrowDownToLine size={15} />
                  </a>
                </div>
                <nav className="resume-nav" aria-label="简历导航">
                  <span className="nav-label">简历目录</span>
                  {navigation.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      aria-current={
                        activeSection === item.id ? "location" : undefined
                      }
                      onClick={() => setActiveSection(item.id)}
                    >
                      <span className="nav-index">{item.number}</span>
                      <span>{item.title}</span>
                      {activeSection === item.id && (
                        <motion.span
                          className="nav-active-dot"
                          layoutId={animated ? "nav-active" : undefined}
                        />
                      )}
                    </a>
                  ))}
                </nav>
                <div className="sidebar-footnote">
                  <span className="availability-dot" />
                  欢迎交流后端开发机会
                  <a href={`mailto:${profile.email}`} aria-label="发送邮件">
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </motion.div>
            </aside>
            <main className="resume-paper" id="resume-main">
              <Reveal variant="fadeUp">
                <div className="resume-document-header">
                  <div>
                    <div className="document-eyebrow">
                      <span />
                      个人简历 <i>/</i> RESUME
                    </div>
                    <h2>
                      <TextGenerate
                        text="Java 后端开发实习"
                        enabled={!!animated}
                        delay={120}
                      />
                    </h2>
                    <p>
                      李豪 <span>·</span> 燕山大学计算机技术硕士 <span>·</span>{" "}
                      2027 届
                    </p>
                  </div>
                  <button className="print-button" onClick={printResume}>
                    <Printer size={15} />
                    <span>打印 / 导出</span>
                  </button>
                </div>
              </Reveal>
              <div className="mobile-section-nav" aria-label="快捷目录">
                {navigation.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={activeSection === item.id ? "active" : ""}
                  >
                    {item.title}
                  </a>
                ))}
              </div>
              <section
                className="resume-section overview-section"
                id="overview"
              >
                <Reveal>
                  <SectionTitle
                    number="01"
                    title="专业概述"
                    english="PROFILE"
                  />
                </Reveal>
                <div className="overview-board">
                  <Reveal>
                    <ul className="overview-signals" aria-label="关键信息">
                      <li>
                        <span
                          className="overview-signal-icon"
                          aria-hidden="true"
                        >
                          <BookOpen size={15} />
                        </span>
                        <div className="overview-signal-copy">
                          <span className="overview-signal-label">
                            学术成果
                          </span>
                          <strong>IJCAI · CCF-A</strong>
                          <small>第一作者 · CCF-A 会议论文</small>
                        </div>
                      </li>
                      <li>
                        <span
                          className="overview-signal-icon"
                          aria-hidden="true"
                        >
                          <BriefcaseBusiness size={15} />
                        </span>
                        <div className="overview-signal-copy">
                          <span className="overview-signal-label">
                            实习方向
                          </span>
                          <strong>Java 后端开发</strong>
                          <small>逐电科技 · 企业项目实践</small>
                        </div>
                      </li>
                      <li>
                        <span
                          className="overview-signal-icon"
                          aria-hidden="true"
                        >
                          <Server size={15} />
                        </span>
                        <div className="overview-signal-copy">
                          <span className="overview-signal-label">
                            项目重心
                          </span>
                          <strong>物联 · 告警 · AI</strong>
                          <small>5 项项目 · 设备到岸基协同</small>
                        </div>
                      </li>
                    </ul>
                  </Reveal>
                  <Reveal>
                    <div className="overview-panel">
                      <div className="overview-main">
                        <p className="overview-lead">
                          计算机技术硕士在读，聚焦
                          <strong> Java 后端与企业级物联网系统</strong>
                          ，具备从设备接入、业务处理到 AI 研判的完整项目实践。
                        </p>
                        <div className="overview-block">
                          <span className="overview-block-label">
                            重点企业项目
                          </span>
                          <div className="overview-project-chips">
                            {projects
                              .filter(
                                (project) =>
                                  project.category === "company" &&
                                  project.id !== "attendance",
                              )
                              .map((project) => (
                                <LinkPreview
                                  key={project.id}
                                  url={`#project-${project.id}`}
                                  isStatic
                                  imageSrc={projectCover(project.id)}
                                  width={200}
                                  height={126}
                                  onClick={() => setFilter("all")}
                                >
                                  {project.title}
                                  <ArrowUpRight size={11} />
                                </LinkPreview>
                              ))}
                          </div>
                        </div>
                        <div className="overview-block">
                          <span className="overview-block-label">能力覆盖</span>
                          <ul className="overview-capabilities">
                            <li>设备接入</li>
                            <li>实时通信</li>
                            <li>告警处理</li>
                            <li>岸基业务</li>
                            <li>AI 研判</li>
                          </ul>
                        </div>
                        <div className="overview-note">
                          <span className="overview-note-icon" aria-hidden="true">
                            <Code2 size={15} />
                          </span>
                          <div>
                            <span className="overview-note-label">补充实践</span>
                            <p>
                              参与
                              <LinkPreview
                                url="#project-attendance"
                                isStatic
                                imageSrc={projectCover("attendance")}
                                width={220}
                                height={138}
                                onClick={() => setFilter("all")}
                              >
                                无感考勤
                              </LinkPreview>
                              ，并完成 AI 短剧开源项目{" "}
                              <LinkPreview
                                url="#project-drama"
                                isStatic
                                imageSrc={projectCover("drama")}
                                width={220}
                                height={138}
                                onClick={() => setFilter("all")}
                              >
                                Yihen Drama
                              </LinkPreview>
                              。
                            </p>
                          </div>
                        </div>
                      </div>
                      <aside
                        className="education-card"
                        id="education"
                        aria-labelledby="education-card-title"
                      >
                        <div className="education-card-header">
                          <span
                            className="education-card-icon"
                            aria-hidden="true"
                          >
                            <GraduationCap size={14} />
                          </span>
                          <h3 id="education-card-title">教育背景</h3>
                          <span className="education-card-en">ACADEMIC</span>
                        </div>
                        <ol
                          className="education-timeline"
                          aria-label="教育经历时间轴"
                        >
                          {education.map((item, educationIndex) => (
                            <li
                              key={`${item.school}-${item.degree}`}
                              className={`education-timeline-item${item.current ? " current" : ""}`}
                            >
                              <div
                                className="education-timeline-rail"
                                aria-hidden="true"
                              >
                                {educationIndex < education.length - 1 && (
                                  <motion.span
                                    className="education-timeline-line"
                                    initial={animated ? { scaleY: 0 } : false}
                                    whileInView={{ scaleY: 1 }}
                                    viewport={{ once: true, amount: 0.7 }}
                                    transition={{
                                      duration: animated ? 0.65 : 0,
                                      delay: animated ? 0.3 : 0,
                                      ease: easeOutExpo,
                                    }}
                                  />
                                )}
                                <motion.span
                                  className="education-timeline-dot"
                                  initial={
                                    animated
                                      ? { scale: 0.2, opacity: 0 }
                                      : false
                                  }
                                  whileInView={{ scale: 1, opacity: 1 }}
                                  viewport={{ once: true, amount: 0.7 }}
                                  transition={{
                                    duration: animated ? 0.42 : 0,
                                    delay: animated
                                      ? educationIndex === 0
                                        ? 0.05
                                        : 0.78
                                      : 0,
                                    ease: easeOutExpo,
                                  }}
                                />
                              </div>
                              <motion.article
                                initial={
                                  animated
                                    ? { opacity: 0, x: 12, filter: "blur(3px)" }
                                    : false
                                }
                                whileInView={{
                                  opacity: 1,
                                  x: 0,
                                  filter: "blur(0px)",
                                }}
                                viewport={{ once: true, amount: 0.55 }}
                                transition={{
                                  duration: animated ? 0.52 : 0,
                                  delay: animated
                                    ? educationIndex === 0
                                      ? 0.12
                                      : 0.86
                                    : 0,
                                  ease: easeOutExpo,
                                }}
                              >
                                <div className="education-heading">
                                  <h4>{item.school}</h4>
                                  <time>{item.period}</time>
                                  {item.current && (
                                    <span className="education-status">
                                      在读
                                    </span>
                                  )}
                                </div>
                                <div className="education-meta">
                                  <div className="education-study">
                                    <span className="degree">{item.degree}</span>
                                    <span className="education-major">
                                      {item.major}
                                    </span>
                                    {item.highlights?.map((mark) => (
                                      <span
                                        key={mark.label}
                                        className={`edu-chip edu-chip-${mark.tone}`}
                                      >
                                        {mark.label}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </motion.article>
                            </li>
                          ))}
                        </ol>
                      </aside>
                    </div>
                  </Reveal>
                </div>
                <Marquee
                  className="skill-marquee"
                  enabled={!!animated}
                  items={[
                    "Java",
                    "Spring Boot",
                    "Netty",
                    "Redis",
                    "RabbitMQ",
                    "LangChain4j",
                    "Qdrant",
                    "Docker",
                  ]}
                />
                <Stagger className="skill-matrix" delay={0.12}>
                  {skills.map((skill, i) => (
                    <StaggerItem className="skill-row" key={skill.number}>
                      <span className="skill-row-label">
                        <span>{["01", "02", "03", "04"][i]}</span>
                        {["后端开发", "数据中间件", "AI 与通信", "工程工具"][i]}
                      </span>
                      <div>
                        {skill.items.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </section>
              <section className="resume-section" id="experience">
                <Reveal variant="scaleIn">
                  <SectionTitle
                    number="02"
                    title="实习经历"
                    english="EXPERIENCE"
                  />
                  <GlareCard enabled={!!animated} className="internship-glare">
                    <div className="internship">
                      {animated && (
                        <BorderBeam
                          colorFrom="#a8c68a"
                          colorTo="#4f7340"
                          duration={16}
                          size={140}
                        />
                      )}
                      <span className="company-icon">
                        <BriefcaseBusiness size={22} />
                      </span>
                      <div className="internship-content">
                        <div className="company-line">
                          <h3>
                            <LinkPreview
                              url={profile.companyWebsite}
                              isStatic
                              imageSrc={companyPreview}
                              width={420}
                              height={208}
                              linkClassName="company-website"
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${profile.company}官方网站`}
                            >
                              {profile.company}
                              <ArrowUpRight size={14} />
                            </LinkPreview>
                          </h3>
                          <span>企业实习</span>
                        </div>
                        <div className="internship-meta">
                          <p className="internship-role">
                            {profile.internshipRole}
                          </p>
                          <time
                            className="internship-period"
                            dateTime="2026-04"
                          >
                            {profile.internshipPeriod}
                          </time>
                        </div>
                        <p className="internship-description">
                          聚焦航运智能监控后端：在{" "}
                          <mark className="focus-mark">船舶管理云平台</mark>
                          负责{" "}
                          <mark className="focus-mark">JT808 设备接入</mark>、
                          <mark className="focus-mark">告警处理与证据留存</mark>
                          、<mark className="focus-mark">视频回放</mark>
                          等岸基能力；在复检云平台落地{" "}
                          <mark className="focus-mark">自动化大模型复检</mark>
                          ，并支持 <mark className="focus-mark">人工审核</mark>
                          ；在 MAS 推进船端告警与船岸协同。另参与面向工地场景的无感考勤，完成{" "}
                          <mark className="focus-mark">
                            人脸识别自动打卡
                          </mark>
                          、{" "}
                          <mark className="focus-mark">
                            陌生人标记与非法进入告警
                          </mark>
                          及人员、人脸数据同步。
                        </p>
                        <div className="internship-project-links">
                          {projects
                            .filter((project) => project.category === "company")
                            .map((project) => (
                              <LinkPreview
                                key={project.id}
                                url={`#project-${project.id}`}
                                isStatic
                                imageSrc={projectCover(project.id)}
                                width={200}
                                height={126}
                                onClick={() => setFilter("all")}
                              >
                                {project.title}
                                <ArrowUpRight size={11} />
                              </LinkPreview>
                            ))}
                        </div>
                      </div>
                    </div>
                  </GlareCard>
                </Reveal>
              </section>
              <section
                className="resume-section projects-section"
                id="projects"
              >
                <Reveal>
                  <SectionTitle number="03" title="项目经历" english="PROJECTS">
                    <div className="project-heading-actions">
                      <div
                        className="project-filters"
                        role="group"
                        aria-label="项目分类"
                      >
                        {[
                          {
                            id: "all",
                            label: "全部",
                            count: projects.length,
                          },
                          {
                            id: "company",
                            label: "企业项目",
                            count: projects.filter(
                              (p) => p.category === "company",
                            ).length,
                          },
                          {
                            id: "personal",
                            label: "个人项目",
                            count: projects.filter(
                              (p) => p.category === "personal",
                            ).length,
                          },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setFilter(item.id)}
                            aria-pressed={filter === item.id}
                            className={filter === item.id ? "active" : ""}
                          >
                            {filter === item.id && animated && (
                              <motion.span
                                className="filter-pill"
                                layoutId="filter-pill"
                                transition={{
                                  type: "spring",
                                  stiffness: 380,
                                  damping: 32,
                                }}
                              />
                            )}
                            <span className="filter-label">{item.label}</span>
                            <span>{item.count}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </SectionTitle>
                  <span className="sr-only" role="status">
                    显示 {filtered.length} 个项目
                  </span>
                </Reveal>
                <div className="project-list" ref={projectListRef}>
                  <div className="project-timeline-motion-track" aria-hidden="true">
                    <motion.span
                      className="project-timeline-progress"
                      style={{ scaleY: renderedTimelineProgress }}
                    />
                    <motion.span
                      className="project-timeline-cursor"
                      style={{ top: projectTimelineCursor }}
                    />
                  </div>
                  {filtered.map((project, index) => (
                    <Reveal
                      key={project.id}
                      className="project-timeline-item"
                      delay={Math.min(index * 0.06, 0.24)}
                      variant="scaleIn"
                      amount={0.12}
                    >
                      <ProjectEntry project={project} onOpen={openGallery} />
                    </Reveal>
                  ))}
                </div>
              </section>
              <section className="resume-section education-section" id="honors">
                <Reveal>
                  <SectionTitle
                    number="04"
                    title="学术与荣誉"
                    english="HONORS"
                  />
                </Reveal>
                <Reveal delay={0.06} variant="scaleIn">
                  <div className="academic-split">
                    <div className="publication-block">
                      <div className="publication-heading">
                        <BookOpen size={17} />
                        <h3>学术论文</h3>
                        <span>PUBLICATION</span>
                      </div>
                      {publications.map((paper) => (
                        <article key={paper.title} className="publication-card">
                          {animated && (
                            <BorderBeam
                              colorFrom="#c9a227"
                              colorTo="#2f6b52"
                              duration={18}
                              size={120}
                            />
                          )}
                          <div className="publication-mark" aria-hidden="true">
                            <span className="pub-venue">{paper.venue}</span>
                            <span className="pub-tier">{paper.tier}</span>
                          </div>
                          <div className="publication-body">
                            <h4 className="publication-title">{paper.title}</h4>
                            <div className="publication-meta">
                              <span className="pub-role">{paper.role}</span>
                              <span className="pub-year">{paper.year}</span>
                            </div>
                            <p className="publication-note">{paper.note}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                    <aside className="scholarship-card" aria-label="奖学金">
                      <div className="scholarship-card-heading">
                        <Award size={15} />
                        <h4>奖学金</h4>
                        <span>SCHOLARSHIP</span>
                      </div>
                      <ul>
                        {scholarships.map((item) => (
                          <li key={`${item.year}-${item.title}`}>
                            <div className="scholarship-main">
                              <span className="scholarship-title">
                                {item.title}
                              </span>
                              <span className="scholarship-year">
                                {item.year}
                              </span>
                            </div>
                            <span
                              className={`scholarship-stage scholarship-stage-${item.stage}`}
                            >
                              {item.stageLabel}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </aside>
                  </div>
                </Reveal>
                <Reveal delay={0.1} variant="fadeUp">
                  <div className="competition-card">
                    <div className="competition-card-heading">
                      <Award size={17} />
                      <h4>竞赛与荣誉</h4>
                      <span>CONTESTS</span>
                    </div>
                    <ul>
                      <li>
                        <span>2022 年数维杯国际大学生数学建模挑战赛</span>
                        <strong>F 奖</strong>
                      </li>
                      <li>
                        <span>2022 年第十二届亚太地区大学生数学建模竞赛</span>
                        <strong>三等奖</strong>
                      </li>
                      <li>
                        <span>
                          第十三届蓝桥杯湖南赛区 C/C++ 程序设计大学 B 组
                        </span>
                        <strong>三等奖</strong>
                      </li>
                      <li>
                        <span>
                          第十五届中国大学生计算机设计大赛人工智能挑战赛
                        </span>
                        <strong>省级三等奖</strong>
                      </li>
                      <li>
                        <span>2023 年全国大学生数学建模竞赛湖南赛区</span>
                        <strong>三等奖</strong>
                      </li>
                    </ul>
                  </div>
                  <div className="certificates">
                    <span>语言与证书</span>
                    <b>CET-6 英语六级</b>
                    <b>全国计算机等级考试二级</b>
                    <b>普通话二级乙等</b>
                  </div>
                </Reveal>
              </section>
              <footer className="resume-footer">
                <div>
                  <span className="footer-label">CONTACT</span>
                  <p>感谢阅读，期待进一步交流。</p>
                  <a href={`mailto:${profile.email}`}>
                    {profile.email}
                    <ArrowUpRight size={13} />
                  </a>
                </div>
                <button className="copy-button" onClick={copyEmail}>
                  <Copy size={14} />
                  复制邮箱
                </button>
              </footer>
            </main>
          </div>
          <footer className="page-footer">
            <span>李豪 · 个人简历</span>
            <span>内容来自个人经历与项目实践</span>
            <a href="#top">
              回到顶部
              <ArrowUp size={12} />
            </a>
          </footer>
          <AnimatePresence>
            {toast && (
              <motion.div
                className="toast"
                role="status"
                initial={{
                  opacity: 0,
                  y: 16,
                  scale: 0.96,
                  filter: "blur(6px)",
                }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 12, scale: 0.98, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease: easeOutExpo }}
              >
                <Check size={15} />
                {toast}
                <button aria-label="关闭提示" onClick={() => setToast("")}>
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {lightbox && (
            <Lightbox
              title={lightbox.title}
              images={lightbox.images}
              initialIndex={lightbox.index}
              returnFocus={lightboxTrigger.current}
              onClose={closeLightbox}
              animated={!!animated}
            />
          )}
        </AnimatePresence>
      </AnimationContext.Provider>
    </MotionConfig>
  );
}
