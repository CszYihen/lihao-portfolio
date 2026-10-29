"""Vector PDF using the website's profile sidebar and resume-paper composition."""
import json
import re
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'public/resume-lihao.pdf'
W,H = A4
L,R = 175,560
CW = R-L
INK='#203B2D'; BODY='#405248'; MUTED='#718071'; GREEN='#4C7945'
LINE='#D4E0CB'; PANEL='#F4F7EF'; DARK='#1D392D'; WHITE='#FCFDF9'
ONLINE='https://cszyihen.github.io/lihao-portfolio/'

def col(value): return colors.HexColor(value)
def text(c,x,y,s,size=8,color=BODY,bold=False):
    c.setFillColor(col(color));c.setFont('Bold' if bold else 'Regular',size);c.drawString(x,y,s)
def right(c,x,y,s,size=7,color=MUTED,bold=False):
    c.setFillColor(col(color));c.setFont('Bold' if bold else 'Regular',size);c.drawRightString(x,y,s)
def rule(c,x,y,x2,color=LINE):
    c.setStrokeColor(col(color));c.setLineWidth(.5);c.line(x,y,x2,y)
def box(c,x,y,w,h,fill=WHITE,stroke=LINE,r=5):
    c.setFillColor(col(fill));c.setStrokeColor(col(stroke));c.setLineWidth(.5)
    c.roundRect(x,y,w,h,r,fill=1,stroke=1)
def lines(s,width,size,bold=False):
    result=[];current='';font='Bold' if bold else 'Regular'
    for token in re.findall(r'[A-Za-z0-9_+./%:-]+|\s+|.',s):
        if pdfmetrics.stringWidth(current+token,font,size)<=width:current+=token
        elif token in '，。；：！？）》】、' and current:
            result.append(current[:-1].strip());current=current[-1:]+token
        else:
            if current.strip():result.append(current.strip())
            current=token.lstrip()
    if current.strip():result.append(current.strip())
    return result
def para(c,x,y,s,width,size=8,leading=11.2,color=BODY,bold=False):
    for row in lines(s,width,size,bold):text(c,x,y,row,size,color,bold);y-=leading
    return y
def heading(c,y,n,title,en):
    text(c,L,y,n,7,GREEN,True);text(c,L+18,y-1,title,10.5,INK,True)
    text(c,L+76,y,en,6.1,MUTED);rule(c,L,y-7,L+8,GREEN)
    return y-18

def sidebar(c,page):
    # Same dark identity card, monogram and fine orbital rings as the HTML sidebar.
    x=20;w=126;top=817;bottom=373
    box(c,x,bottom,w,top-bottom,DARK,DARK,8)
    c.saveState()
    clip=c.beginPath();clip.roundRect(x,bottom,w,top-bottom,8);c.clipPath(clip,stroke=0)
    c.setStrokeColor(col('#29483A'));c.setLineWidth(.35)
    for radius in [28,42,56,70,84]:c.circle(x+36,top-133,radius,stroke=1,fill=0)
    c.restoreState()
    text(c,x+13,top-22,'PERSONAL PROFILE',5.5,'#A9BBA1',True)
    box(c,x+13,top-75,34,34,'#BBD8A4','#BBD8A4',6)
    text(c,x+20,top-65,'LH',17,DARK,True)
    text(c,x+13,top-103,'李豪',23,'#F3F7EC',True)
    text(c,x+76,top-101,'LI HAO',5.8,'#A9BBA1')
    text(c,x+13,top-122,'Java 后端开发',8.3,'#C7D8BE',True)
    box(c,x+13,top-146,98,15,'#2A4534','#405D42',7)
    text(c,x+19,top-141,'2027 届 · 硕士在读',6.9,'#CBDDBE',True)
    para(c,x+13,top-167,'以 Java 为核心，关注企业侧设备物联、实时业务与 AI 应用开发。',99,7.6,12,'#B5C9AF')
    rule(c,x+13,top-214,x+w-13,'#3A5642')
    for i,(key,value) in enumerate([('求职方向','Java 后端实习'),('当前学历','计算机技术 · 硕士'),('就读院校','燕山大学')]):
        y=top-232-i*20;text(c,x+13,y,key,6.9,'#A3B89E');right(c,x+w-13,y,value,6.6,'#DFE8D7',True)
    for y,s,url in [(top-307,'lihao_0216@sina.com','mailto:lihao_0216@sina.com'),(top-331,'19118415578','tel:19118415578'),(top-355,'github.com/CszYihen','https://github.com/CszYihen')]:
        text(c,x+13,y,s,6.7,'#CADBBF');c.linkURL(url,(x+12,y-3,x+w-10,y+10),relative=0)
    rule(c,x+13,top-371,x+w-13,'#3A5642')
    text(c,x+13,top-390,'在线简历 · 项目截图与完整详情',6.3,'#D7E6CC',True)
    text(c,x+13,top-407,'cszyihen.github.io/',6.8,'#BED5AD')
    text(c,x+13,top-420,'lihao-portfolio/',6.8,'#BED5AD')
    c.linkURL(ONLINE,(x+12,top-426,x+w-10,top-380),relative=0)
    text(c,x+8,bottom-25,'简历目录',7,MUTED,True)
    for i,(n,title) in enumerate([('01','专业概述'),('02','实习经历'),('03','项目经历'),('04','学术与荣誉')]):
        y=bottom-49-i*27
        active=(page==1 and i==0) or (page==2 and i==2)
        if active:box(c,x+2,y-8,w-4,22,'#E4EDDF','#E4EDDF',4)
        text(c,x+9,y,n,6.5,MUTED);text(c,x+30,y,title,7.4,GREEN if active else BODY,active)

def page_base(c,page):
    c.setFillColor(col('#F0F4EC'));c.rect(0,0,W,H,fill=1,stroke=0)
    c.setStrokeColor(col('#E0E8D9'));c.setLineWidth(.25)
    for x in range(0,int(W)+1,18):c.line(x,0,x,H)
    for y in range(0,int(H)+1,18):c.line(0,y,W,y)
    box(c,159,19,420,798,'#DDE5D7','#DDE5D7',4)
    box(c,157,21,420,798,WHITE,LINE,4)
    sidebar(c,page)
    rule(c,L,43,R)
    text(c,L,31,'在线简历  cszyihen.github.io/lihao-portfolio/',6,MUTED)
    c.linkURL(ONLINE,(L,26,R-25,40),relative=0)
    right(c,R,31,f'{page} / 2',6,MUTED)

def project(c,y,p):
    personal=p['title'].startswith('Yihen');accent='#756586' if personal else GREEN
    title=p['title'].replace(' · AI 短剧创作平台','')
    box(c,L,y-8,20,20,'#EFEDF7' if personal else '#EAF2E1',LINE,4)
    if personal:
        text(c,L+4,y-1,'</>',8,accent,True)
    else:
        c.setStrokeColor(col(accent));c.setLineWidth(.65)
        for offset in [0,6]:
            c.roundRect(L+5,y-3+offset,10,4,1,fill=0,stroke=1)
            c.circle(L+7,y-1+offset,.45,fill=1,stroke=0)
    text(c,L+27,y,title,10.2,INK,True)
    right(c,R,y+1,p['period'],6.3,MUTED)
    text(c,L+27,y-12,'个人 GitHub 项目 · 开发' if personal else '逐电科技 · 企业项目开发',6.8,MUTED)
    badge='个人项目' if personal else '企业项目'
    box(c,R-42,y-18,42,12,'#F3F0F8' if personal else PANEL,LINE,3)
    text(c,R-37,y-14,badge,6.3,accent,True)
    pid='drama' if personal else {'船舶管理云平台':'cloud89','MAS 船端告警系统':'mas','大模型复检云平台':'llm','无感考勤':'attendance'}[p['title']]
    c.linkURL(ONLINE+'#project-'+pid,(L+25,y-3,R-80,y+12),relative=0)
    y-=27
    x=L
    for tag in p['tags'].split(' / '):
        width=pdfmetrics.stringWidth(tag,'Regular',6.4)+11
        if x+width>R:y-=14;x=L
        box(c,x,y-3,width,12,PANEL,LINE,2);text(c,x+5,y,tag,6.4,BODY);x+=width+4
    y-=17
    y=para(c,L,y,p['summary'],CW,7.7,10.2)
    y-=2
    text(c,L,y,'项目技术要点',7.3,GREEN,True);y-=12
    for title,detail in p['bullets']:
        c.setFillColor(col(accent));c.circle(L+2,y+2.2,1.2,fill=1,stroke=0)
        text(c,L+9,y,title,7.6,INK,True);y-=9.5
        y=para(c,L+9,y,detail,CW-9,7.5,10);y-=2
    rule(c,L,y+6,R)
    return y-8

def overview(c):
    text(c,L,796,'个人简历  /  RESUME',6.5,MUTED,True)
    text(c,L,779,'Java 后端开发实习',18,INK,True)
    text(c,L,766,'李豪 · 燕山大学计算机技术硕士 · 2027 届',7.3,MUTED)
    rule(c,L,757,R)
    y=heading(c,742,'01','专业概述','PROFILE')
    signal_w=(CW-10)/3
    for i,(cap,title,sub) in enumerate([('学术成果','IJCAI · CCF-A','第一作者 · CCF-A 会议论文'),('实习方向','Java 后端开发','逐电科技 · 企业项目实践'),('项目重心','物联 · 告警 · AI','5 项项目 · 设备到岸基协同')]):
        x=L+i*(signal_w+5);box(c,x,y-33,signal_w,34,PANEL,LINE,5)
        box(c,x+7,y-22,14,14,'#E6F0DD',LINE,3)
        text(c,x+11,y-18,str(i+1),6.3,GREEN,True)
        text(c,x+27,y-8,cap,6.3,MUTED,True);text(c,x+27,y-18,title,7.4,INK,True);text(c,x+27,y-27,sub,5.5,MUTED)
    y-=40
    left_w=218;right_x=L+224;right_w=CW-224
    box(c,L,y-94,left_w,94,WHITE,LINE,5)
    para(c,L+9,y-14,'计算机技术硕士在读，聚焦 Java 后端与企业级物联网系统，具备设备接入、业务处理到 AI 研判的项目实践。',left_w-18,7.1,11,INK,True)
    text(c,L+9,y-43,'重点企业项目',6.3,MUTED,True)
    for i,t in enumerate(['船舶管理云平台','大模型复检云平台','MAS 船端告警']):
        x=L+9+i*67;box(c,x,y-62,63,14,PANEL,LINE,3);text(c,x+4,y-57,t,5.6,GREEN,True)
    text(c,L+9,y-74,'核心实践',6.3,MUTED,True)
    text(c,L+9,y-88,'协议接入 · 异步编排 · 告警闭环 · 模型接入',6.5,BODY)
    box(c,right_x,y-94,right_w,94,PANEL,LINE,5)
    text(c,right_x+9,y-13,'教育背景',7.2,INK,True);rule(c,right_x+9,y-20,R-8)
    c.setStrokeColor(col('#ADC69D'));c.setLineWidth(.6);c.line(right_x+10,y-33,right_x+10,y-68)
    for offset,school,period,major in [(35,'燕山大学','2024 - 2027','硕士 · 计算机技术'),(70,'湖南理工大学','2020 - 2024','本科 · 计算机科学与技术')]:
        c.setFillColor(col(GREEN));c.circle(right_x+10,y-offset+2,1.8,fill=1,stroke=0)
        text(c,right_x+18,y-offset,school,7.5,INK,True);right(c,R-8,y-offset,period,5.8)
        text(c,right_x+18,y-offset-13,major,6.5,GREEN)
    y-=101
    box(c,L,y-50,CW,50,PANEL,LINE,4)
    for i,(title,items) in enumerate([('后端开发','Java · Spring Boot · Spring Cloud · MyBatis-Plus · Spring Security'),('数据中间件','MySQL · Redis · RabbitMQ · Elasticsearch · MinIO · Qdrant'),('AI 与通信','Netty / JT808 · LangChain4j · WebSocket · FFmpeg / HLS'),('工程工具','Git · Docker · Linux · Nginx · RESTful API')]):
        yy=y-11-i*11;text(c,L+9,yy,title,6.3,GREEN,True);text(c,L+65,yy,items,6.2,BODY)
    y=heading(c,y-63,'02','实习经历','EXPERIENCE')
    box(c,L,y-52,CW,52,'#F0F5E9',LINE,5)
    text(c,L+10,y-13,'广州逐电科技有限公司',8.6,INK,True);right(c,R-10,y-13,'2026.04 - 至今',6.5)
    text(c,L+10,y-26,'Java 后端开发实习',6.7,GREEN,True)
    para(c,L+10,y-38,'开发船舶管理云平台与 MAS 船端告警系统，打通设备接入、告警留证和岸基上报；参与大模型复检与工地无感考勤，负责核心后端链路。',CW-20,6.8,10)
    return heading(c,y-66,'03','项目经历','PROJECTS')

def honors(c,y):
    y=heading(c,y,'04','学术与荣誉','HONORS')
    pw=230;sx=L+237;sw=CW-237
    box(c,L,y-70,pw,70,WHITE,LINE,5);text(c,L+9,y-14,'学术论文',7.5,INK,True)
    box(c,L+9,y-35,39,13,DARK,DARK,2);text(c,L+16,y-31,'IJCAI',6.5,'#F5F8F0',True)
    box(c,L+9,y-51,39,12,'#B99532','#B99532',2);text(c,L+16,y-47,'CCF-A',6.3,'#FFFFFF',True)
    para(c,L+57,y-28,'Towards Generalized Action Recognition on Low-Resolutions with Domain-Invariant Representation',pw-67,6.7,9.6,INK,True)
    text(c,L+57,y-61,'第一作者 · IJCAI 2026',6.3,GREEN)
    c.linkURL('https://www.ijcai.org/proceedings/2026/0146.pdf',(L,y-70,L+pw,y),relative=0)
    box(c,sx,y-70,sw,70,'#FAF7EF','#E6D9B1',5);text(c,sx+8,y-14,'奖学金',7.5,'#806724',True)
    for i,t in enumerate(['2026 一等学业奖学金','2025 三等学业奖学金','2023 一等国家助学金','2022 国家励志奖学金']):text(c,sx+8,y-28-i*10,t,6.5,BODY)
    y-=79
    box(c,L,y-50,CW,50,WHITE,LINE,5);text(c,L+9,y-12,'竞赛与荣誉',7.2,INK,True)
    for i,t in enumerate(['数维杯国际大学生数学建模挑战赛 F 奖 · 亚太地区数学建模竞赛三等奖','蓝桥杯湖南赛区 C/C++ B 组三等奖 · 中国大学生计算机设计大赛省级三等奖','2023 全国大学生数学建模竞赛湖南赛区三等奖 · 2024 届优秀毕业生']):text(c,L+9,y-24-i*10,t,6.3,BODY)
    y-=58
    box(c,L,y-20,CW,20,PANEL,LINE,4);text(c,L+9,y-13,'语言与证书',6.6,INK,True);text(c,L+70,y-13,'CET-6 · 全国计算机等级考试二级 · 普通话二级乙等',6.4,BODY)
    return y-20

def build():
    pdfmetrics.registerFont(TTFont('Regular','C:/Windows/Fonts/msyh.ttc'))
    pdfmetrics.registerFont(TTFont('Bold','C:/Windows/Fonts/msyhbd.ttc'))
    projects=json.loads((ROOT/'scripts/resume_content.json').read_text(encoding='utf-8'))
    c=canvas.Canvas(str(OUTPUT),pagesize=A4,pageCompression=1)
    c.setTitle('李豪 - Java 后端开发实习简历');c.setAuthor('李豪')
    page_base(c,1);y=overview(c)
    for p in projects[:2]:y=project(c,y,p)
    print(f'Page 1 end: {y:.1f}')
    if y<46:raise RuntimeError('Page 1 overflow')
    c.showPage();page_base(c,2)
    text(c,L,802,'Java 后端开发实习 · 李豪',7.3,MUTED);rule(c,L,793,R)
    y=heading(c,780,'03','项目经历','PROJECTS / CONTINUED')
    for p in projects[2:]:y=project(c,y,p)
    y=honors(c,y+1);print(f'Page 2 end: {y:.1f}')
    if y<51:raise RuntimeError('Page 2 overflow')
    c.save();print(f'Generated {OUTPUT}')

if __name__=='__main__':build()
