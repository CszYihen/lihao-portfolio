# 简历网站内容核对说明

本文件供简历所有者维护、核对网站文案，不作为公开展示页面。以下结论来自本地源代码与依赖清单，不包含内部地址或凭据。

共同边界：用户已明确这些项目属于广州逐电科技有限公司实习经历，并在 2026-09-20 确认由本人独立完成，因此网站可使用“独立完成”。代码可以证明项目具备某项能力，但不能单独证明上线规模、业务收益或实习起止日期；不添加未经验证的性能、用户量或提升比例。

以下来源路径均相对于 `D:/Yihen/IdeaProject`；行号为本次核对时的定位参考。

## 大模型复检云平台

### 业务定位与推荐文案

面向船舶安全告警的 AI 图片复检中台，串联告警接入、提示词配置、Qwen 推理、人工审核与结果追溯。

可用简介：

> 独立完成船舶安全告警 AI 复检平台，将模型推理、人工审核与告警处理串联成可追溯业务闭环。项目涵盖 Redis 负载调度、SSE 任务协同与配置化审核流程。

### 技术栈依据

- `llm-platform/LLM-Platform/pom.xml`：Java 17、Spring Boot 3.4.9、MyBatis-Plus、MySQL、Redis、Spring Security、JWT、Spring Web / WebFlux。
- `llm-platform/LLM-frontend/package.json`：Vue 3、TypeScript、Pinia、Vite。
- `llm-platform/LLM-Platform/src/main/java/com/yihen/Application.java:10`：启用定时任务与异步执行。

### 可信技术亮点

| 可展示的项目能力 | 代码证据 | 文案范围 |
| --- | --- | --- |
| 复检链路编排、幂等结果缓存、超时与异常降级 | `llm-platform/LLM-Platform/src/main/java/com/yihen/service/impl/ReviewOrchestratorServiceImpl.java:123` | 可说明提示词渲染、模型调用、结果解析与可选人工审核组成统一流程；不能据此声称已达到特定吞吐量或可用性。 |
| 任务与调用记录异步持久化 | `llm-platform/LLM-Platform/src/main/java/com/yihen/service/impl/ReviewPersistenceRecorderImpl.java:39` | 可说明使用异步方法处理任务、调用日志和用量统计，避免将全部数据库写入放在同步响应路径；不声称零数据丢失或给出未测试的延迟收益。 |
| 基于 Redis 的 API Key 负载选择、失败摘除与到期恢复 | `llm-platform/LLM-Platform/src/main/java/com/yihen/service/impl/ApiKeyServiceImpl.java:293`、`:395`、`:486`、`:919`、`:986` | 调度分参考近期调用量、处理中请求数和连续失败数；通过 ZSET 按分数选择，重试时跳过已失败的 Key。到期恢复为调用过程中触发的懒恢复，不表述为独立定时恢复服务。 |
| SSE 人工审核任务协同 | `llm-platform/LLM-Platform/src/main/java/com/yihen/service/impl/HumanReviewAssignmentServiceImpl.java:208`、`:310`；`llm-platform/LLM-Platform/src/main/java/com/yihen/sse/HumanReviewSsePublisher.java:129` | 可说明 SSE 定向推送、Redis Pub/Sub 跨实例转发、SETNX + TTL 任务分配，以及离线或锁过期后的回收；不声称已在大规模集群验证。 |
| JWT 认证与 RBAC 权限校验 | `llm-platform/LLM-Platform/src/main/java/com/yihen/config/SecurityConfig.java:61`；`llm-platform/LLM-Platform/src/main/java/com/yihen/controller/HumanReviewController.java:59` | 当前代码已包含 Spring Security 与方法级权限检查，可列为项目能力。 |

### 必须保留的边界

- 当前真正实现调用的 Provider 为 Qwen，证据是 `llm-platform/LLM-Platform/src/main/java/com/yihen/llm/impl/QwenLlmProviderStrategy.java:49`。
- `OpenAiLlmProviderStrategy.java:23` 和 `DeepSeekLlmProviderStrategy.java:23` 位于同一目录，均抛出“尚未接入”的业务异常。因此应写“接入 Qwen，通过策略模式预留模型扩展”，不能写“已集成 OpenAI / DeepSeek”。
- `llm-platform/docs/PRD-大模型复检云平台.md` 可以辅助理解业务背景，但其中部分权限规划与现有代码不同。实际能力以代码为准。
- PRD 中的可用性、降低误报等属于目标，未发现足以支持简历成果数字的实测数据，不能写成已实现的量化成果。
- “幂等结果缓存”不等于已证明并发场景严格只调用模型一次，不扩大为严格的全链路 exactly-once 保证。

## 无感考勤与人员同步系统

### 业务定位与推荐文案

连接人脸识别设备平台与山东考勤监管平台，处理人员资料、人脸信息、抓拍事件与平台下发任务。

可用简介：

> 独立完成无感考勤系统，打通人员资料、人脸信息与抓拍事件的跨平台同步。通过任务状态流转、失败重试入口和上报阈值配置，让设备侧事件进入可管理的业务流程。

### 技术栈依据

- `new-attendance-system/attendance-backend/pom.xml`：Java 17、Spring Boot 3.0.5、MyBatis-Plus、MySQL、JWT、Spring Web / WebFlux。
- `new-attendance-system/new-attendance-system-frontend/package.json`：Vue 3、Element Plus、Pinia、Vite。
- `new-attendance-system/attendance-backend/src/main/java/com/project/service/impl/PersonTaskSchedulerImpl.java:65`：使用 Spring `@Scheduled` 进行周期调度。

### 可信技术亮点

| 可展示的项目能力 | 代码证据 | 文案范围 |
| --- | --- | --- |
| 平台任务拉取、持久化和分类执行 | `new-attendance-system/attendance-backend/src/main/java/com/project/service/impl/PersonTaskSchedulerImpl.java:65`、`:101`；`new-attendance-system/attendance-backend/src/main/java/com/project/service/impl/PersonTaskDispatcherImpl.java:78` | 可说明心跳探测、任务拉取落库、类型分发、执行状态和错误信息记录；不表述为已验证的分布式调度框架。 |
| 人员、人脸及抓拍事件跨平台适配 | `new-attendance-system/attendance-backend/src/main/java/com/project/service/impl/PersonTaskDispatcherImpl.java:88`；`new-attendance-system/attendance-backend/src/main/java/com/project/client/shandong/ShandongPlatformClient.java:35`、`:66` | 可说明人员新增/删除、人脸创建/更新，以及抓拍事件上报等接口适配；不将设备识别算法本身描述为该系统自研能力。 |
| 识别质量阈值与按人员、任务类型控制上报间隔 | `new-attendance-system/attendance-backend/src/main/java/com/project/service/impl/FaceAlertServiceImpl.java:309`、`:326`、`:450` | 可说明配置化阈值、时间间隔判断、人脸裁剪与图片存储；不声称识别准确率有具体提升。 |
| 手动重试与任务生命周期维护 | `new-attendance-system/attendance-backend/src/main/java/com/project/controller/PersonTaskController.java:52`；`new-attendance-system/attendance-backend/src/main/java/com/project/service/impl/TaskCleanupServiceImpl.java:40`、`:51`、`:90` | 可说明提供失败任务手动重试入口，以及配置化历史任务和图片清理。 |

### 必须保留的边界

- `attendance-backend/pom.xml` 中 Redis starter 依赖被注释；`attendance-backend/src/main/java/com/project/config/RedisConfig.java` 的配置注解与主体实现也被注释。不将 Redis 列为本项目已经使用的技术。
- `PersonTaskServiceImpl.java:65` 的重试操作将任务恢复为待处理状态，控制器提供手动入口。虽然存在重试次数等字段，但本次核查未发现完整自动重试调度，故不写“自动重试机制”或“指数退避”。
- `PersonTaskSchedulerImpl.java:101` 扫描并顺序执行待处理任务，没有据此证明分布式抢占、并发执行保障或严格去重，不扩大描述。
- `rebuild-docs/rebuild/需求文档.md` 含需求和规划内容，部分命名与现有代码不同，展示时优先采用上述代码已实现的内容。

## 船舶管理云平台

### 业务定位与技术栈

面向客船与危险品船运营企业的岸基智能监控平台，连接船端数据接入、位置上报、告警证据、告警处置及视频工作台。可用简介：“独立完成船舶智能监控云平台，串联终端接入、告警证据、组织权限与历史视频，让船端数据进入岸基业务流程。”

- 业务来源：`逐电89云平台/docs/PRD-客船危险品船智能监控云平台.md`；具体能力以代码为准。
- 依赖来源：`逐电89云平台/89-cloud-platform/pom.xml`、`逐电89云平台/89-cloud-platform/platform-server/pom.xml`。
- 技术栈：Java 17、Spring Boot 3.4、Netty / JT808、MyBatis-Plus、MySQL、Redis、Spring Security、JWT、FFmpeg / HLS；另有可配置 Kafka 桥接。

下表代码路径前缀为 `逐电89云平台/89-cloud-platform/platform-server/src/main/java/com/yihen/`。

| 可展示的项目能力 | 代码证据 | 文案范围 |
| --- | --- | --- |
| 船端位置消息异步批处理、事件与 Kafka 桥接 | `jt808/endpoint/jt808/LocationEndpoint.java:18`；`kafka/bridge/Jt808EventToKafkaBridge.java:19` | 可以描述异步接入和事件解耦；配置中的批次大小不是实测吞吐量。 |
| 告警附件异步上传与幂等处理 | `jt808/service/AlarmEvidenceAsyncWriter.java:34` | 独立线程池上传对象存储，通过告警 ID 与文件名识别重复附件，处理唯一键冲突，记录上传状态与 SHA-256；不扩大为零丢失保证。 |
| JWT、Redis 会话与组织数据权限 | `filter/JwtAuthFilter.java:43`；`service/md/MdDataScopeSupport.java:25` | 可说明验签、滑动续期、组织树查询范围与写入权限检查。 |
| JT1078 历史视频回放和 HLS 转码 | `service/VideoHistoryService.java:49`；`video/history/HlsTranscodeSession.java:19` | 可说明建立回放会话、将 H.264 / H.265 裸流转为 HLS，以及拖动回放后的转码会话重置；不声称覆盖所有设备兼容性。 |

### 必须保留的边界

- 用户明确本项目属于广州逐电科技有限公司实习经历，并确认由本人独立完成。
- PRD 将全国监管平台对接列为二期，不能写成已完成生产监管对接。Kafka 桥接代码存在，但 README 标明默认关闭。
- PRD 中的运营目标和服务指标不是已核实的业绩，不作为个人量化成果。

## MAS 单船抓拍告警分析系统

### 业务定位与技术栈

部署于船端或边缘侧，接收 AI 抓拍结果，通过配置化规则生成正式告警，再经 JT808 上报并关联回执。可用简介：“独立完成船端抓拍告警分析系统，围绕规则策略、滑动窗口、冷却控制和上报回执，将识别结果转为可处置的告警。”

- 业务来源：`mas/masback/docs/PRD_单船抓拍告警分析系统.md`。
- 依赖来源：`mas/masback/pom.xml`、`mas/masback/monitoring-system/pom.xml`、`mas/masback/jtt808-client/pom.xml`。
- 技术栈：Java 17、Spring Boot 3.4、MyBatis-Plus、MySQL、Redis、Netty / JT808、WebClient、JWT、Apache POI。

下表代码路径前缀为 `mas/masback/monitoring-system/src/main/java/com/yihen/`。

| 可展示的项目能力 | 代码证据 | 文案范围 |
| --- | --- | --- |
| 有界异步处理与超时过滤 | `service/impl/AiPushServiceImpl.java:55` | 使用 ThreadPoolExecutor、ArrayBlockingQueue 和 CallerRunsPolicy；入队前过滤超时识别结果。不能据此声称已完成高并发压力验证。 |
| 策略化规则与 Redis 滑动窗口 | `service/impl/AiPushServiceImpl.java:420`；`ai/strategy/camera/CameraBlockedAlarmStrategy.java:141` | 按算法选择处理策略；通过 ZSet 维护时间窗口和触发记录，支持配置化规则。 |
| 并发重复告警控制 | `ai/strategy/AbstractAiAlarmStrategy.java:72`、`:121` | 按任务与通道使用 JVM 细粒度锁，将冷却检查、告警生成、冷却标记串行化，Redis 保存冷却状态。 |
| 平台级熔断与成功回执闭环 | `jt808/service/impl/JT808AlertCircuitBreakerServiceImpl.java:28`；`jt808/service/impl/JT808AlertReportAckServiceImpl.java:31` | 连续失败后打开熔断，到期半开试探；收到 9212 成功回执后更新状态、清理 pending 数据并恢复熔断。 |

### 必须保留的边界

- 用户明确本项目属于广州逐电科技有限公司实习经历，并确认由本人独立完成。
- 告警锁和熔断均为单 JVM 实现，不能表述为分布式锁或分布式熔断。
- 上游平台负责 AI 算法识别；本系统主要承接结果、进行规则判定与告警编排，不将底层视觉算法训练描述为个人自研成果。
- `mas/masback/README.md` 沿用上游 JT808 开源框架介绍，其高并发、测试覆盖和性能宣传不能直接转为用户履历指标。

## Yihen Drama AI 短剧创作平台

### 来源与可展示能力

用户将本项目明确标为 GitHub 项目，可作为个人项目展示。源码根目录为 `Yihen-Drama-main/Yihen-Drama-main/`。

- `README.md` 描述文本输入、信息提取、角色与场景资产、分镜管理和视频生成流程；`yihen-drama/README.md` 与 `yihen-drama/pom.xml` 提供 Spring Boot、MySQL、Redis、RabbitMQ、Elasticsearch、MinIO 等技术栈依据。
- `README.md:258` 说明章节内容通过异步消息进入 Qdrant 向量入库链路；实现可定位到 `yihen-drama/src/main/java/com/yihen/listener/episode/EpisodeListener.java`、`core/model/impl/EpisodeExtractOrchestrator.java`、`util/QdrantUtils.java`。
- `yihen-drama/src/main/java/com/yihen/core/model/strategy/` 下包含图像、音频、视频、向量模型的策略接口与工厂，可说明通过策略与工厂组织多种生成能力，不据此宣称所有供应商都已接入。
- `yihen-drama/src/main/java/com/yihen/core/model/schedule/VideoTaskDynamicPoller.java` 根据有无任务调整轮询间隔，空闲时逐步退避；单任务异常隔离，后续调度在 finally 中继续安排。
- `yihen-drama/src/main/java/com/yihen/websocket/TaskStatusWebSocketHandler.java` 支持任务状态推送；Elasticsearch 用于项目或资产检索，MinIO 用于媒体资源存储，可交叉查看 `listener/project/ProjectListener.java`、`util/MinioUtil.java`。

### 必须保留的边界

- `README.md:165` 将视频编辑、拼接和导出标注为“持续迭代中”，不能宣称完整视频编辑导出流程已经全部完成。
- 项目公开仓库为 `https://github.com/CszYihen/Yihen-Drama`，页面可提供该链接。
- “独立开发”的依据是用户旧简历中的自述，不是通过仓库归属或提交记录独立验证的结果。为便于后续核对，应将个人角色声明与代码能力证据区分。
- 无已验证的用户量、生成速度提升、费用节省或准确率数据，不补写量化成果。

## 基础信息与教育经历

来源：用户提供的 `李豪 - Java后端实习简历.pdf`，以下为旧简历信息，未使用外部资料补充。

| 字段 | 旧简历提供的信息 |
| --- | --- |
| 姓名 | 李豪 |
| 手机 | 19118415578 |
| 邮箱 | lihao_0216@sina.com |
| 硕士教育 | 燕山大学，2024—2027 |
| 本科教育 | 湖南理工大学，2020—2024 |

教育起止年份按旧简历保留；2027 年为简历所列硕士阶段结束年份，不能表述为目前已经取得硕士学位。实习起止日期、到岗时间、求职状态及其他未明确的个人信息，不根据项目文件时间推断。
