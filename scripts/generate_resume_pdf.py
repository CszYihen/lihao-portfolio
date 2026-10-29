"""Draw the application PDF as its own document, independent of browser print CSS."""

from pathlib import Path
import re

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "resume-lihao.pdf"
PAGE_W, PAGE_H = A4
LEFT, RIGHT = 43, PAGE_W - 43
WIDTH = RIGHT - LEFT
INK = colors.HexColor("#20372D")
BODY = colors.HexColor("#36483E")
MUTED = colors.HexColor("#607268")
GREEN = colors.HexColor("#3E7554")
RULE = colors.HexColor("#D7E2D7")
PALE = colors.HexColor("#F3F7F2")
ONLINE = "https://cszyihen.github.io/lihao-portfolio/"


def register_fonts():
    candidates = [
        ("C:/Windows/Fonts/msyh.ttc", "C:/Windows/Fonts/msyhbd.ttc"),
        ("C:/Windows/Fonts/NotoSansSC-VF.ttf", "C:/Windows/Fonts/simhei.ttf"),
        ("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"),
    ]
    for regular, bold in candidates:
        if Path(regular).exists() and Path(bold).exists():
            pdfmetrics.registerFont(TTFont("Resume", regular))
            pdfmetrics.registerFont(TTFont("ResumeBold", bold))
            return
    raise RuntimeError("需要可用的中文字体：Noto Sans SC 或微软雅黑")


def line(c, x1, y, x2, color=RULE, width=0.7):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x1, y, x2, y)


def label(c, x, y, text, size=9, color=BODY, bold=False):
    c.setFont("ResumeBold" if bold else "Resume", size)
    c.setFillColor(color)
    c.drawString(x, y, text)


def right(c, x, y, text, size=8.5, color=MUTED, bold=False):
    c.setFont("ResumeBold" if bold else "Resume", size)
    c.setFillColor(color)
    c.drawRightString(x, y, text)


def wrap(text, width, size, bold=False):
    font = "ResumeBold" if bold else "Resume"
    tokens = re.findall(r"[A-Za-z0-9_+./%:-]+|\s+|.", text)
    lines, current = [], ""
    for token in tokens:
        trial = current + token
        if pdfmetrics.stringWidth(trial, font, size) <= width:
            current = trial
        else:
            if token in "，。；：！？）》】、" and current.strip():
                lines.append(current[:-1].strip())
                current = current[-1:] + token
                continue
            if current.strip():
                lines.append(current.strip())
            current = token.lstrip()
            while pdfmetrics.stringWidth(current, font, size) > width:
                cut = len(current) - 1
                while cut > 1 and pdfmetrics.stringWidth(current[:cut], font, size) > width:
                    cut -= 1
                lines.append(current[:cut])
                current = current[cut:]
    if current.strip():
        lines.append(current.strip())
    return lines


def paragraph(c, x, y, text, width, size=8.8, leading=13.8, color=BODY, bold=False):
    for part in wrap(text, width, size, bold):
        label(c, x, y, part, size, color, bold)
        y -= leading
    return y


def section(c, y, number, title, en):
    label(c, LEFT, y, number, 8, GREEN, True)
    label(c, LEFT + 25, y - 1, title, 12, INK, True)
    label(c, LEFT + 90, y, en.upper(), 7, MUTED)
    line(c, LEFT, y - 9, RIGHT)
    return y - 25


def project(c, y, title, period, tags, summary, bullets):
    personal = title.startswith("Yihen")
    accent = colors.HexColor("#655575") if personal else GREEN
    c.setFillColor(accent)
    c.roundRect(LEFT, y - 5, 3, 17, 1.5, fill=1, stroke=0)
    label(c, LEFT + 12, y, title, 11.1, INK, True)
    project_id = "drama" if personal else {"船舶管理云平台": "cloud89", "MAS 船端告警系统": "mas", "大模型复检云平台": "llm", "无感考勤": "attendance"}[title]
    title_width = pdfmetrics.stringWidth(title, "ResumeBold", 11.1)
    c.linkURL(ONLINE + "#project-" + project_id, (LEFT + 12, y - 3, LEFT + 12 + title_width, y + 13), relative=0)
    right(c, RIGHT, y + 1, period, 8.2, MUTED)
    y -= 18
    c.setFillColor(colors.HexColor("#F0EDF4") if personal else PALE)
    c.roundRect(LEFT + 12, y - 4, 57 if personal else 44, 14, 3, fill=1, stroke=0)
    label(c, LEFT + 17, y, "个人开源项目" if personal else "企业项目", 7.2, accent, True)
    label(c, LEFT + (77 if personal else 65), y, tags, 7.4, MUTED)
    y -= 17
    y = paragraph(c, LEFT + 12, y, summary, WIDTH - 20, 8.9, 14)
    y -= 3
    for heading, detail in bullets:
        c.setFillColor(GREEN)
        c.circle(LEFT + 17, y + 3, 1.7, fill=1, stroke=0)
        label(c, LEFT + 24, y, heading, 8.8, INK, True)
        y -= 13
        y = paragraph(c, LEFT + 24, y, detail, WIDTH - 33, 8.7, 13.5)
        y -= 2
    line(c, LEFT + 12, y + 1, RIGHT)
    return y - 13


def footer(c, page):
    line(c, LEFT, 36, RIGHT)
    label(c, LEFT, 22, "在线简历  " + ONLINE, 7.5, MUTED)
    c.linkURL(ONLINE, (LEFT, 17, LEFT + 265, 33), relative=0)
    right(c, RIGHT, 22, f"LI HAO  /  {page:02d}", 7.5, MUTED)


def build():
    register_fonts()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle("李豪 - Java 后端开发实习简历")
    c.setAuthor("李豪")
    c.setSubject("Java 后端开发实习申请")

    # Page 1 - profile, work, and the two largest maritime systems.
    c.setFillColor(PALE)
    c.roundRect(LEFT, 754, WIDTH, 52, 5, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.roundRect(LEFT, 754, 4, 52, 2, fill=1, stroke=0)
    label(c, LEFT + 17, 779, "李豪", 23, INK, True)
    label(c, LEFT + 89, 780, "JAVA BACKEND", 8, GREEN, True)
    label(c, LEFT + 17, 763, "Java 后端开发实习  ·  2027 届  ·  燕山大学硕士在读", 9, BODY)
    right(c, RIGHT - 13, 786, "19118415578  ·  lihao_0216@sina.com", 8.6, BODY)
    right(c, RIGHT - 13, 767, "github.com/CszYihen", 8, MUTED)
    c.linkURL("mailto:lihao_0216@sina.com", (RIGHT - 155, 780, RIGHT - 12, 798), relative=0)
    c.linkURL("https://github.com/CszYihen", (RIGHT - 124, 761, RIGHT - 12, 776), relative=0)
    y = section(c, 738, "01", "教育背景", "Education")
    label(c, LEFT + 2, y, "燕山大学", 9.4, INK, True)
    label(c, LEFT + 75, y, "计算机技术 · 硕士", 8.7)
    right(c, RIGHT, y, "2024 - 2027", 8.4)
    y -= 17
    label(c, LEFT + 2, y, "湖南理工大学", 9.4, INK, True)
    label(c, LEFT + 75, y, "计算机科学与技术 · 本科", 8.7)
    right(c, RIGHT, y, "2020 - 2024", 8.4)
    y = section(c, y - 26, "02", "技术能力", "Skills")
    skill_rows = [
        ("后端开发", "Java · Spring Boot · Spring Cloud · MyBatis-Plus · Spring Security"),
        ("数据与消息", "MySQL · Redis · RabbitMQ · Elasticsearch · MinIO · Qdrant"),
        ("设备与 AI", "Netty / JT808 · JT1078 · FFmpeg / HLS · LangChain4j · WebSocket"),
        ("工程工具", "Docker · Linux · Nginx · Git · RESTful API"),
    ]
    for heading, items in skill_rows:
        label(c, LEFT + 2, y, heading, 8.4, GREEN, True)
        label(c, LEFT + 76, y, items, 8.35, BODY)
        y -= 15
    y = section(c, y - 8, "03", "实习经历", "Experience")
    label(c, LEFT + 2, y, "广州逐电科技有限公司", 10.4, INK, True)
    right(c, RIGHT, y, "2026.04 - 至今", 8.3)
    y -= 15
    label(c, LEFT + 2, y, "Java 后端开发实习", 8.5, GREEN, True)
    y -= 16
    y = paragraph(c, LEFT + 2, y, "围绕船舶智能监管，开发船舶管理云平台与 MAS 船端告警系统，打通 JT808 设备接入、告警留证与岸基上报；参与大模型复检及工地无感考勤，负责核心后端链路与可靠性设计。", WIDTH - 4, 8.65, 13.2)
    y = section(c, y - 12, "04", "项目经历", "Engineering Projects")
    y = project(c, y, "船舶管理云平台", "2026.08 - 至今", "Spring Boot / Netty · JT808 / Redis / FFmpeg · HLS", "面向客船与危险品船运营企业的岸基监管平台，集中呈现实时船位、历史轨迹、区域告警和图片 / 视频证据，支撑船端采集到岸基处置的业务链路。", [
        ("高频定位接入与异步批处理", "将 JT808 高频定位从 Netty 协议线程异步移交，积批保存轨迹与最新位置，避免数据库 IO 阻塞收包线程，同时支撑实时船位和历史轨迹查询。"),
        ("全国平台可靠出站", "事件与事务 Outbox 同库提交，提交后发送并由 Worker 兜底；以业务键去重、CAS 抢占和指数退避处理并发与失败，按船聚合位置快照。全国平台联调仍在推进。"),
        ("证据完整性与船端视频回放", "附件按告警和文件名幂等留存并校验 SHA-256；经 JT1078 联动 NVR，以 FFmpeg / HLS 转码回放，拖动进度时重建会话并等待关键帧，避免旧流污染。"),
    ])
    y = project(c, y, "MAS 船端告警系统", "2026.05 - 至今", "Spring Boot / Redis / JT808 / 区域围栏", "部署在船端边缘设备，承接摄像头 AI 平台的行为、疲劳及烟火识别结果，结合任务与航行状态二次判定，完成本地留证、安全播报与岸基上报。", [
        ("异步接入与并发告警降噪", "有界线程池承接高频推送并校验时效；Redis 滑动窗口累计有效识别，按任务和通道串行执行冷却检查、告警生成与冷却写入，抑制抖动及并发重复告警。"),
        ("区域围栏与状态感知", "按版本幂等同步区域配置，持续判定靠近、进出及限速事件并联动音柱播报；针对定位连续缺失告警，结合靠泊状态暂停巡检计时，减少误报。"),
        ("弱网下的上报闭环", "告警及附件经 JT808 上报；失败达到阈值后熔断退避，网络恢复时半开探测并限速补发，收到 9212 回执后更新状态、清理待确认记录。"),
    ])
    if y < 43:
        raise RuntimeError(f"第一页内容超出页脚：{y:.1f}")
    footer(c, 1)
    c.showPage()

    # Page 2 - remaining projects and evidence of research / achievement.
    label(c, LEFT, 795, "项目经历", 18, INK, True)
    right(c, RIGHT, 798, "LI HAO   /   JAVA BACKEND", 8, MUTED)
    line(c, LEFT, 782, RIGHT, GREEN, 1.2)
    y = 761
    y = project(c, y, "大模型复检云平台", "2026.07 - 2026.08", "Spring Boot / 工厂 + 策略模式 / Redis / SSE", "面向船舶视觉告警的 AI 图片复检中台，承接上游告警图片与算法信息，自动二次研判并按需转人工审核，将结论回写上游，形成可追溯的研判链路。", [
        ("配置化复检与多厂商模型接入", "按告警类型关联模型、提示词和结构化模板，使用工厂 + 策略模式选择调用实现；扩展厂商无需修改主流程，模型异常或超时自动降级转人工。"),
        ("审核任务互斥与跨实例通知", "按审核员负载派发任务，以 SETNX 锁保证同一任务仅由一人处理；断开或超时后释放回池，结合 Redis Pub/Sub 与 SSE 定向通知进度和任务释放。"),
        ("模型资源调度与追溯", "Redis 按最小负载选择 API Key，维护并发占用、失败摘除与懒恢复；留存任务、模型调用、耗时及人工修正记录，支持定位故障与分析研判结果。"),
    ])
    y = project(c, y, "无感考勤", "2026.04 - 2026.05", "Spring Boot / 人脸识别 / 工地考勤 / 任务同步", "连接工地人脸设备平台与考勤监管平台，利用现场抓拍完成实名人员无感打卡和进出记录；标记陌生人，识别闸机翻越及限制区域闯入等非法进入行为。", [
        ("按业务场景分流事件", "将实名考勤、陌生人与非法进入分别接入业务链路；先校验人脸质量，再按上报间隔控制重复事件，降低监管告警噪声。"),
        ("人员与人脸任务同步", "定时拉取监管任务，按人员资料、人脸信息分类执行；失败任务恢复为待处理，记录执行状态，便于排查同步异常。"),
        ("图片与任务生命周期治理", "保存现场抓拍及裁剪图片，按过期策略清理历史任务和关联图片，控制存储持续增长，同时保留有效业务记录。"),
    ])
    y = project(c, y, "Yihen Drama · AI 短剧创作平台", "2026.01 - 2026.03", "LangChain4j / RabbitMQ / Qdrant / WebSocket", "个人 GitHub 开源项目，将小说文本逐步转换为可编辑的角色、场景、分镜与视频资产，贯通章节解析、图像生成、分镜编排与镜头视频生成流程。", [
        ("异步章节解析与检索增强", "RabbitMQ 承接章节文本处理，提取角色与场景并向量化写入 Qdrant；生成分镜时检索人物关系及前文内容，补充长篇故事上下文。"),
        ("多类型模型统一接入", "以工厂 + 策略模式统一文本、图像、视频、语音和向量模型，配置厂商、API Key 与任务参数，使创作步骤能够切换模型而不侵入业务流程。"),
        ("生成任务与资产状态协同", "动态轮询第三方长耗时任务，经 WebSocket 按项目推送进度、结果及失败原因；以 MinIO 和 Elasticsearch 管理、搜索角色与场景资产。"),
    ])
    y = section(c, y + 1, "05", "学术与荣誉", "Research & Honors")
    y = paragraph(c, LEFT + 2, y, "IJCAI 2026 · CCF-A 类会议论文第一作者", WIDTH - 4, 9.2, 14, INK, True)
    y = paragraph(c, LEFT + 2, y - 1, "Towards Generalized Action Recognition on Low-Resolutions with Domain-Invariant Representation", WIDTH - 4, 8.4, 12.5, BODY)
    c.linkURL("https://www.ijcai.org/proceedings/2026/0146.pdf", (LEFT, y + 10, RIGHT, y + 39), relative=0)
    y -= 9
    y = paragraph(c, LEFT + 2, y, "2026 一等学业奖学金  ·  2025 三等学业奖学金  ·  2023 一等国家助学金  ·  2022 国家励志奖学金", WIDTH - 4, 8.4, 12.5)
    y -= 6
    y = paragraph(c, LEFT + 2, y, "数维杯国际大学生数学建模挑战赛 F 奖；2024 届优秀毕业生；CET-6、计算机等级考试二级。", WIDTH - 4, 8.4, 12.5)
    if y < 45:
        raise RuntimeError(f"第二页内容超出页脚：{y:.1f}")
    footer(c, 2)
    c.save()
    print(f"Generated {OUTPUT} (2 pages; page 2 content ends at {y:.1f} pt)")


if __name__ == "__main__":
    build()
