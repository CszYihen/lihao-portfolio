# 李豪 · 个人简历

以简历阅读为核心的 React + TypeScript 网站：左侧为个人档案和目录，右侧按专业概述、实习经历、项目经历、教育与荣誉组织内容。手机端采用单列布局与快捷目录。

## 启动

需要 Node.js 20.19+ 或 22.12+。

```powershell
cd D:\Yihen\IdeaProject\lihao-portfolio
npm install
npm run dev
```

访问终端给出的地址，通常为 `http://localhost:5173`。

## 功能

- 展示求职方向、联系方式、教育背景、专业技能和实习经历。
- 五个项目按简历条目呈现，直接阅读技术要点，原地展开更多实现细节。
- 项目可按全部、实习、个人分类查看。
- 项目图集采用与简历一致的纸感预览框：完整截图、标题与页码、可滚动缩略图、轻量切换动效。
- 支持箭头按钮、键盘方向键、Home / End、手机横向滑动，以及原图放大和 Esc 关闭。
- 自动播放默认关闭；手动开启后每 6 秒切换，悬停、键盘聚焦、切换标签页或离开视口时暂停，手动选图后停止。关闭页面动效时停用自动播放。
- 目前媒体配置共 25 张项目图片；截图与流程图按各条目的 `kind` 分别展示。
- 阅读进度、章节进入、目录高亮、技术细节展开、图集切换等动效。
- 可关闭动效，遵循系统减少动态效果设置。
- 邮箱复制、邮件/电话链接、原始 PDF 下载。
- “打印 / 导出”调用浏览器打印，采用专用简历排版，隐藏截图与操作按钮并展开技术要点；可以选择保存为 PDF。

## 添加项目截图

**每个项目均支持多张，不需要改页面结构。**

1. 将图片放进 `public/projects/<项目>/`（支持 png / jpg / webp / gif）。
2. 保存后自动进入图集；可选在 `src/media.ts` 里用文件名覆盖标题或指定排序。

| 项目             | 图片目录                      | 自动发现配置        |
| ---------------- | ----------------------------- | ------------------- |
| 船舶管理云平台   | `public/projects/cloud89/`    | `src/media.ts`      |
| Yihen Drama      | `public/projects/drama/`      | `src/media.ts`      |
| 大模型复检云平台 | `public/projects/llm/`        | `src/media.ts`      |
| MAS              | `public/projects/mas/`        | `src/media.ts`      |
| 无感考勤         | `public/projects/attendance/` | `src/media.ts`      |

未配置标题时，会使用「项目名 · 界面截图 01」这类默认文案。自定义标题示例：

```ts
cloud89: projectImagesFromGlob(cloud89Modules, "projects/cloud89", "船舶管理云平台", {
  "image4.png": "单船监控中心 · 实时视频与告警概览",
}),
```

图片路径相对 `public/`。第一张为默认预览；未写进标题映射的新图会自动追加。维护细节见 [截图说明](docs/SCREENSHOTS.md)。

## 修改简历

| 文件                       | 作用                                   |
| -------------------------- | -------------------------------------- |
| `src/data.ts`              | 联系方式、项目简介、技术要点、技术栈   |
| `src/App.tsx`              | 简历结构、个人档案、教育与荣誉         |
| `src/Gallery.tsx`          | 图集入口与全屏浏览                     |
| `src/media.ts`             | 项目截图自动发现与可选标题             |
| `src/loadProjectImages.ts` | 扫描 `public/projects` 的工具函数      |
| `src/styles.css`           | 布局、配色、响应式、动效、打印排版     |
| `public/resume-lihao.pdf`  | “下载原版 PDF”对应的旧简历，可直接替换 |
| `docs/CONTENT_SOURCES.md`  | 简历信息与项目源码依据                 |

企业项目归入广州逐电科技有限公司实习经历，Yihen Drama 单列为个人项目。“独立开发”来自旧简历自述；实习项目按参与开发呈现。未编造实习起止时间、GitHub 链接或业务性能指标。

## 构建与部署

```powershell
npm run build
npm run preview
```

将 `dist/` 部署到静态网站服务即可。配置使用相对路径，支持子目录部署；请通过 HTTP 服务访问，不要直接双击 HTML 文件。

### GitHub Pages

仓库已包含 `.github/workflows/deploy-pages.yml`。推送到 `main` 后，GitHub Actions 会自动安装依赖、按仓库子路径构建并发布 `dist/`；也可以在仓库的 **Actions** 页面手动运行该工作流。首次发布需要在仓库 **Settings → Pages** 中将 **Source** 设为 **GitHub Actions**。

## 检查

```powershell
npm run check
npm run test:e2e
```

首次测试如缺少浏览器，运行 `npx playwright install chromium`。也可设置 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指向本机已有的 Chromium 测试浏览器。测试包含简历内容、项目筛选、技术展开、多图浏览、焦点、下载、复制、打印调用、动效偏好及不同屏幕宽度。
