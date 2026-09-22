export type ProjectCategory = "company" | "personal";

export type Project = {
  id: string;
  number: string;
  title: string;
  english: string;
  category: ProjectCategory;
  theme: string;
  summary: string;
  purpose: string;
  tags: string[];
  features: { title: string; detail: string }[];
  flow: string[];
  /** Personal / open-source repo URL when available. */
  github?: string;
};

export type EducationHighlight = {
  label: string;
  tone: "honor" | "focus";
};

export const education = [
  {
    school: "燕山大学",
    degree: "硕士",
    major: "计算机技术",
    period: "2024 — 2027",
    current: true,
    highlights: [{ label: "计算机视觉 · 行为识别", tone: "focus" as const }],
  },
  {
    school: "湖南理工大学",
    degree: "本科",
    major: "计算机科学与技术",
    period: "2020 — 2024",
    current: false,
    highlights: [{ label: "2024 届优秀毕业生", tone: "honor" as const }],
  },
];

/** Scholarships / grants shown in the honors section. */
export const scholarships = [
  {
    title: "三等学业奖学金",
    year: "2025",
    stage: "grad" as const,
    stageLabel: "研究生期间",
  },
  {
    title: "一等国家助学金",
    year: "2023",
    stage: "undergrad" as const,
    stageLabel: "本科期间",
  },
  {
    title: "国家励志奖学金",
    year: "2022",
    stage: "undergrad" as const,
    stageLabel: "本科期间",
  },
];

export const categoryMeta: Record<
  ProjectCategory,
  { label: string; short: string; subtitle: string; role: string }
> = {
  company: {
    label: "企业项目",
    short: "企业",
    subtitle: "逐电科技",
    role: "独立完成",
  },
  personal: {
    label: "个人项目",
    short: "个人",
    subtitle: "个人 GitHub 项目",
    role: "独立开发",
  },
};

export const publications = [
  {
    venue: "IJCAI",
    role: "一作",
    tier: "CCF-A",
    year: "研究生期间",
    title:
      "Towards Generalized Action Recognition on Low-Resolutions with Domain-Invariant Representation",
    note: "国际人工智能联合会议（IJCAI）· CCF-A 类会议论文",
  },
];

export const profile = {
  name: "李豪",
  email: "lihao_0216@sina.com",
  phone: "19118415578",
  company: "广州逐电科技有限公司",
  companyWebsite: "http://42.193.140.103:81/",
  internshipRole: "Java 后端开发实习",
  internshipPeriod: "2026年4月至今",
  github: "https://github.com/CszYihen",
  resume: `${import.meta.env.BASE_URL}resume-lihao.pdf`,
};

/** Wrap key terms with [[...]] for UI emphasis in project feature details. */
export const projects: Project[] = [
  {
    id: "cloud89",
    number: "01",
    title: "船舶管理云平台",
    english: "MARITIME INTELLIGENCE",
    category: "company",
    theme: "lime",
    summary:
      "面向客船与危险品船运营企业的岸基船舶管理平台，集中管理船舶、船员、货物、证书及航次等基础资料，并在地图中查看船舶在线状态、实时位置和历史轨迹。系统通过 Netty / JT808 接入船端终端，将航行数据、区域告警与图片 / 视频证据汇聚到岸基工作台，支持告警查询处置、设备指令下发及实时 / 历史视频查看。独立完成高频位置异步批处理、告警附件幂等留存与完整性校验、组织数据权限，以及 JT1078 配合 FFmpeg / HLS 的历史视频回放链路。",
    purpose:
      "用于岸基人员统一掌握船舶、人员与航行状态，及时查看告警证据并完成远程处置，形成从船端采集到岸基监管的完整链路。",
    tags: ["Spring Boot", "Netty / JT808", "Redis", "FFmpeg / HLS"],
    features: [
      {
        title: "船舶定位与轨迹管理",
        detail:
          "基于 Netty / JT808 接入船端设备，对高频位置消息做[[异步批处理]]积批落库，支撑船舶在线状态、实时定位和历史轨迹查询，同时避免协议收包线程被数据库 IO 阻塞。",
      },
      {
        title: "告警证据与处置留痕",
        detail:
          "统一保存告警记录、处理结果及图片 / 视频证据；使用独立线程池上传附件，按告警与文件名实现[[幂等落库]]，并以[[SHA-256]]摘要校验文件完整性。",
      },
      {
        title: "组织权限与船舶资料管理",
        detail:
          "承载船舶、船员、货物、证书和航次等业务资料；通过[[JWT]]验签、[[Redis]]会话滑动续期及组织树数据范围控制，隔离不同企业和下级组织的数据。",
      },
      {
        title: "实时与历史视频回放",
        detail:
          "通过 JT1078 下发实时 / 历史视频指令，使用 FFmpeg 转为 HLS；用户拖动历史进度时[[重置转码会话]]并等待关键帧，保障浏览器端回放稳定。",
      },
    ],
    flow: ["船端设备", "JT808 接入", "业务处理", "岸基工作台"],
  },
  {
    id: "llm",
    number: "02",
    title: "大模型复检云平台",
    english: "LLM REVIEW CLOUD",
    category: "company",
    theme: "lime",
    summary:
      "面向船舶安全告警的 AI 图片复检中台，用于对上游视觉识别平台产生的告警进行二次判断，减少误报直接进入处置流程。系统接收告警图片、船舶与算法信息，按告警类型加载模型、提示词和结果模板，调用 Qwen 输出结构化结论；开启人工审核的告警类型或模型调用异常时可转入人工处理，最终将结论回写上游并完整保存任务、模型调用和人工修正记录。独立完成幂等复检编排、超时降级、Redis API Key 最小负载调度及 SSE 跨实例审核协同。",
    purpose:
      "承接上游视觉识别结果，以大模型自动复检为主、人工审核为补充，降低告警误报并形成结果可回写、过程可追溯的研判链路。",
    tags: ["Spring Boot", "SSE", "Redis", "规则引擎"],
    features: [
      {
        title: "配置化大模型复检",
        detail:
          "按告警类型关联模型配置、提示词与结构化结果模板，串联图片读取、幂等检查、提示词渲染和 Qwen 调用；异常或超时时[[降级转人工]]，避免错误结论直接回写。",
      },
      {
        title: "人工审核与任务协同",
        detail:
          "将需要人工确认的任务按审核员负载派发，使用[[SETNX 锁]]保证同一任务仅被一人处理；断开或超时后自动释放回池，并记录审核结果与修正内容。",
      },
      {
        title: "模型资源负载调度",
        detail:
          "在 Redis 中按最小负载选择可用 API Key，维护并发占用、失败摘除与懒恢复，降低单个热点 Key 限流或失效拖垮复检链路的风险。",
      },
      {
        title: "实时反馈与全链路追溯",
        detail:
          "本机推送结合 Redis Pub/Sub，让[[SSE]]在多实例下定向通知审核进度与任务释放；统一留存复检任务、模型调用、耗时和结果来源，便于统计与问题追踪。",
      },
    ],
    flow: ["识别结果", "规则筛选", "大模型复检", "人工审核", "结论回写"],
  },
  {
    id: "mas",
    number: "03",
    title: "MAS 船端告警系统",
    english: "MARITIME ALARM SYSTEM",
    category: "company",
    theme: "lime",
    summary:
      "部署在船端或边缘设备的本地安全告警系统，接收摄像头 AI 平台推送的人员行为、疲劳、烟火等识别结果，结合告警任务、航行状态和算法参数进行二次判定。系统通过时效过滤、滑动窗口和冷却规则抑制瞬时误报与重复告警，触发后保存抓拍图片 / 视频、生成本地告警记录，并可联动音柱播报和通过 JT808 上报岸基平台。独立完成有界异步接入、规则触发的并发控制、岸基上报熔断与半开恢复，以及 9212 回执收口，形成从船端识别到岸基确认的告警闭环。",
    purpose:
      "用于船上安全事件的本地识别、降噪和留证，在弱网环境下持续处理告警，并将有效事件可靠同步至岸基平台。",
    tags: ["Spring Boot", "告警规则", "GPS 轨迹", "消息协同"],
    features: [
      {
        title: "AI 识别结果异步接入",
        detail:
          "使用有界线程池承接 AI 平台高频推送，先校验任务、通道与结果时效，过期数据直接丢弃并留日志，防止识别结果积压拖垮船端告警链路。",
      },
      {
        title: "场景化告警规则判定",
        detail:
          "按告警类型、通道、航行 / 锚泊 / 靠泊状态及算法参数匹配任务，通过 Redis[[滑动窗口]]累计有效识别，达到阈值后才生成正式告警，抑制瞬时抖动误报。",
      },
      {
        title: "告警降噪与证据留存",
        detail:
          "按任务与通道串行执行「冷却检查 → 告警生成 → 冷却写入」，避免并发重复触发；同步保存抓拍图片、视频与水印信息，并按配置联动现场音柱播报。",
      },
      {
        title: "弱网下的岸基上报闭环",
        detail:
          "通过 JT808 将告警及附件上报岸基，失败达到阈值后[[熔断]]并退避重试，网络恢复时半开探测并限速补发；收到 9212 回执后更新状态、清理待确认记录。",
      },
    ],
    flow: ["船端事件", "规则判定", "告警生成", "岸基协同"],
  },
  {
    id: "attendance",
    number: "04",
    title: "无感考勤",
    english: "SITE ATTENDANCE",
    category: "company",
    theme: "lime",
    summary:
      "面向工地现场人员通行与安全监管，连接人脸识别设备平台和考勤监管平台。系统根据现场抓拍自动完成实名人员无感打卡与进出记录，对未建档人员生成陌生人记录，并识别翻越 / 下钻闸机、闯入限制区域等非法进入事件，形成告警并上报监管端。独立完成事件按考勤、陌生人和非法进入场景分流，人脸质量与上报间隔控制，监管任务拉取、人员及人脸数据同步，并提供失败任务恢复、执行状态追踪和历史图片清理，使工地考勤与安全事件形成可追踪的管理链路。",
    purpose:
      "用于工地人员自动打卡与通行安全管理，统一处理实名考勤、陌生人标记、非法进入告警及监管平台数据同步。",
    tags: ["Spring Boot", "人脸识别", "工地考勤", "非法进入告警"],
    features: [
      {
        title: "工地人员无感打卡",
        detail:
          "接收现场人脸设备抓拍结果，匹配已登记人员后自动生成[[考勤与进出记录]]并上报，无需人工刷卡，降低工地集中上下班时的通行阻塞。",
      },
      {
        title: "陌生人与非法进入告警",
        detail:
          "对未匹配人员进行质量校验、[[陌生人标记]]与建档；将翻越 / 下钻闸机、限制区域闯入等事件分流为非法进入告警，并通过间隔控制减少重复上报。",
      },
      {
        title: "人员与人脸任务同步",
        detail:
          "定时拉取监管平台任务并按人员、人脸等类型分类执行；失败任务恢复为待处理状态，保证工地人员档案和设备底库同步链路可追踪。",
      },
      {
        title: "图片与任务生命周期治理",
        detail:
          "留存抓拍与裁剪图，按过期策略定时清理历史任务及关联图片，控制存储膨胀。",
      },
    ],
    flow: ["现场抓拍", "身份识别", "考勤 / 异常分流", "监管平台"],
  },
  {
    id: "drama",
    number: "05",
    title: "Yihen Drama",
    english: "AI SHORT DRAMA STUDIO",
    category: "personal",
    theme: "violet",
    github: "https://github.com/CszYihen/Yihen-Drama",
    summary:
      "个人独立开发的 AI 短剧创作平台，将小说文本逐步转换为可编辑的角色、场景、分镜与视频资产。用户可创建项目和章节，由大模型提取角色与场景，生成并维护人物 / 场景图片，为每个镜头编排角色、场景和描述，再生成首帧、视频提示词及分镜视频；平台同时提供模型、提示词和创作资产的统一管理。独立设计 RabbitMQ 章节异步处理与 Qdrant 检索增强，使用策略与工厂统一文本、图像和视频模型调用，以 MinIO、Elasticsearch 管理和检索资产，并通过动态轮询与 WebSocket 回传长耗时任务状态。",
    purpose:
      "将分散的文本、图像和视频模型组织成连续的短剧生产流程，让创作者能够逐步生成、调整和复用角色、场景、分镜与视频资产。",
    tags: ["LangChain4j", "Qdrant", "RabbitMQ", "WebSocket"],
    features: [
      {
        title: "小说解析与检索增强",
        detail:
          "通过 RabbitMQ 异步处理章节文本，提取角色与场景并完成向量化后写入 Qdrant；生成分镜时按章节[[检索增强]]相关内容，为长篇故事补充人物关系与前文上下文。",
      },
      {
        title: "多类型模型统一接入",
        detail:
          "通过策略与工厂模式统一文本、文生图、视频、语音和向量模型，支持配置厂商、API Key、默认实例与任务参数，让各创作步骤能够切换模型而不侵入业务流程。",
      },
      {
        title: "角色、场景与分镜工作台",
        detail:
          "集中管理角色和场景图片，支持生成、重生、上传替换与 Elasticsearch 搜索；分镜可编辑描述、关联角色和场景，并继续生成首帧与镜头视频。",
      },
      {
        title: "生成任务状态协同",
        detail:
          "后端动态轮询第三方生成任务并更新状态，通过 WebSocket 按项目推送进度、结果和失败原因，使多个镜头并发生成时仍能精准更新对应资产。",
      },
    ],
    flow: ["小说文本", "章节向量化", "资产 / 分镜", "视频任务"],
  },
];

export const skills = [
  {
    number: "01",
    title: "后端与业务构建",
    english: "BACKEND ENGINEERING",
    description: "从接口设计到业务建模，把需求变成清晰、可维护的服务。",
    items: [
      "Java",
      "Spring Boot",
      "Spring Cloud",
      "MyBatis-Plus",
      "Spring Security",
    ],
  },
  {
    number: "02",
    title: "数据与异步协同",
    english: "DATA & MESSAGING",
    description: "在存储、检索与消息之间，组织完整的数据流转链路。",
    items: ["MySQL", "Redis", "RabbitMQ", "Elasticsearch", "MinIO", "Qdrant"],
  },
  {
    number: "03",
    title: "AI 与实时连接",
    english: "AI & CONNECTIVITY",
    description: "让模型和设备接入真实业务，让长耗时任务及时反馈。",
    items: ["LangChain4j", "WebSocket"],
  },
  {
    number: "04",
    title: "工程化与交付",
    english: "BUILD & DELIVERY",
    description: "关注运行环境、服务部署与协作，让代码走出编辑器。",
    items: ["Git", "Docker", "Linux", "Nginx", "RESTful API"],
  },
];
