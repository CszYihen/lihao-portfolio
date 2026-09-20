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
    highlights: [
      { label: "计算机视觉 · 行为识别", tone: "focus" as const },
    ],
  },
  {
    school: "湖南理工大学",
    degree: "本科",
    major: "计算机科学与技术",
    period: "2020 — 2024",
    current: false,
    highlights: [
      { label: "2024 届优秀毕业生", tone: "honor" as const },
    ],
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
  internshipRole: "Java 后端开发实习",
  internshipPeriod: "2026年4月至今",
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
      "面向客船与危险品船的岸基监控平台，覆盖终端接入、位置上报、告警处理与证据管理、历史视频回放。",
    purpose:
      "面向客船与危险品船的智能监控平台，独立完成终端接入、位置上报、告警处理、证据留存与历史视频回放等后端能力。",
    tags: ["Spring Boot", "Netty / JT808", "Redis", "FFmpeg / HLS"],
    features: [
      {
        title: "高并发位置上报的异步批处理",
        detail:
          "基于 Netty 接入 JT808 船端消息，对高频位置上报做[[异步批处理]]积批落库，解耦协议收包与业务写入，缓解 IO 瓶颈。",
      },
      {
        title: "告警证据幂等上传与完整性校验",
        detail:
          "独立线程池并发上传证据附件，按告警与文件名实现[[幂等落库]]，冲突回读已有记录，并以[[SHA-256]]摘要校验完整性。",
      },
      {
        title: "会话续期与组织数据权限",
        detail:
          "[[JWT]] 验签结合[[Redis]]会话滑动续期，按组织树收敛查询与写入范围，避免跨组织数据越权。",
      },
      {
        title: "历史视频转码会话流控",
        detail:
          "经 JT1078 建立回放会话，FFmpeg 转 HLS；拖动时[[重置转码会话]]并等待关键帧，保障回放稳定。",
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
      "承接上游视觉识别结果，以自动化大模型复检为主，并支持人工审核，形成可追踪的告警研判链路。",
    purpose:
      "面向告警复检场景的业务平台。独立完成结果接入、规则编排、自动化大模型复检与人工审核协同等后端能力。",
    tags: ["Spring Boot", "SSE", "Redis", "规则引擎"],
    features: [
      {
        title: "自动化大模型复检编排",
        detail:
          "串联幂等检查、提示词渲染与模型调用，异常时[[超时降级转人工]]，避免错误结论直接回传上游。",
      },
      {
        title: "人工审核独占派单",
        detail:
          "按审核员负载分配任务，[[SETNX 锁]]独占处理并到期回池，保障人工审核不冲突、可追踪。",
      },
      {
        title: "API Key 最小负载调度",
        detail:
          "在 Redis 中按最小负载选取可用 Key，失败摘除与懒恢复，降低热点 Key 拖垮整条复检链路的风险。",
      },
      {
        title: "SSE 跨实例实时反馈",
        detail:
          "本机推送结合 Redis Pub/Sub，让[[SSE]]在多实例下定向通知审核进度与任务释放。",
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
      "船端告警采集与规则处理系统，关注事件接入、告警编排与岸基协同。",
    purpose:
      "船端侧告警处理系统。独立完成事件接入、规则判定、冷却控制与岸基上报协同等后端能力。",
    tags: ["Spring Boot", "告警规则", "GPS 轨迹", "消息协同"],
    features: [
      {
        title: "有界异步接入与超时丢弃",
        detail:
          "自建有界线程池承接 AI 推送，超时结果直接丢弃并记日志，避免积压拖垮告警处理链。",
      },
      {
        title: "滑动窗口规则触发",
        detail:
          "按算法策略维护 Redis[[滑动窗口]]计数，达阈值才生成告警，抑制抖动误报。",
      },
      {
        title: "冷却竞态串行控制",
        detail:
          "按任务与通道串行化「冷却检查 → 生成告警 → 打冷却」，避免冷却刚结束立刻重复触发。",
      },
      {
        title: "岸基上报熔断与回执闭环",
        detail:
          "JT808 上报失败达阈[[熔断]]，半开试探恢复；9212 成功回执后清 pending，抑制恢复风暴。",
      },
    ],
    flow: ["船端事件", "规则判定", "告警生成", "岸基协同"],
  },
  {
    id: "attendance",
    number: "04",
    title: "无感考勤与人员同步",
    english: "ATTENDANCE SYNC",
    category: "company",
    theme: "lime",
    summary:
      "对接人脸识别设备与监管上报：按告警场景分流处理，覆盖陌生人建档记录、闸机/区域告警及人员任务同步。",
    purpose:
      "无感考勤业务系统。独立完成告警分流、陌生人建档、人员任务同步与图片生命周期治理等后端能力。",
    tags: ["Spring Boot", "人脸设备", "告警分流", "任务同步"],
    features: [
      {
        title: "多场景告警自动化分流",
        detail:
          "按人脸、翻越/下钻闸机及区域告警类型[[分流]]，分别进入考勤上报或告警任务链路，避免一刀切处理。",
      },
      {
        title: "陌生人建档与控流上报",
        detail:
          "首次陌生人经质量校验后注册建档并生成进场告警；已登记陌生人按间隔[[控流上报]]，减少重复噪声。",
      },
      {
        title: "跨平台任务分发与重试",
        detail:
          "定时拉取监管侧任务并按类型分发，失败任务可恢复待处理，保证人员与人脸同步链路可追踪。",
      },
      {
        title: "图片与任务生命周期治理",
        detail:
          "留存抓拍与裁剪图，按过期策略定时清理历史任务及关联图片，控制存储膨胀。",
      },
    ],
    flow: ["设备告警", "场景分流", "陌生人/考勤任务", "监管上报"],
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
      "独立开发 AI 短剧创作平台，串联小说抽取、章节向量化、角色与场景资产、分镜管理及视频生成任务。",
    purpose:
      "个人开源项目。围绕小说文本抽取、章节拆分、角色与场景资产生成、分镜管理及视频任务，独立开发 AI 短剧创作平台，将模型能力组织成可管理的创作流程。",
    tags: ["LangChain4j", "Qdrant", "RabbitMQ", "WebSocket"],
    features: [
      {
        title: "章节向量化与检索增强",
        detail:
          "通过 RabbitMQ 异步拆分并向量化章节，写入 Qdrant；生成分镜时按章节[[检索增强]]相关文本，为长篇故事补充上下文。",
      },
      {
        title: "模型策略与任务编排",
        detail:
          "按任务类型选择模型与参数策略，统一编排生成、重试与状态回写，降低长耗时任务对接口响应的阻塞。",
      },
      {
        title: "资产与分镜工作台",
        detail:
          "管理角色、场景等资产并与分镜关联，让生成结果可回看、可调整，形成可持续迭代的创作闭环。",
      },
      {
        title: "长耗时任务进度反馈",
        detail:
          "通过 WebSocket 推送任务进度与结果，避免前端轮询，提升长链路生成过程的可感知性。",
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
