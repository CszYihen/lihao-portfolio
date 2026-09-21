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
- 项目图集采用图片堆叠式轮播，仅展示界面截图，支持箭头、键盘、手机横向滑动和全屏查看。
- 图集接近视口后才加载，每个项目最多挂载当前图及后两张；桌面端仅在图集可见、页面激活且未悬停时自动切换，手机端采用手动浏览。
- 目前共 26 张 WebP 项目图片，约 2.2 MB；图片保留完整比例，不会裁掉界面内容。
- 阅读进度、章节进入、目录高亮、技术细节展开、图集切换等动效。
- 可关闭动效，遵循系统减少动态效果设置。
- 邮箱复制、邮件/电话/GitHub 链接、同步版 PDF 下载。
- “打印 / 导出”调用浏览器打印，采用两页 A4 专用排版，隐藏截图与操作按钮并保留重点技术要点；可以选择保存为 PDF。

## 添加项目截图

**每个项目均支持多张，不需要改页面结构。**

1. 将优化后的图片放进 `src/assets/projects/<项目>/`，建议使用 WebP。
2. 保存后自动进入图集；可选在 `src/media.ts` 里用文件名覆盖无障碍文本或指定排序。

| 项目             | 图片目录                      | 自动发现配置        |
| ---------------- | ----------------------------- | ------------------- |
| 船舶管理云平台   | `src/assets/projects/cloud89/`    | `src/media.ts`      |
| Yihen Drama      | `src/assets/projects/drama/`      | `src/media.ts`      |
| 大模型复检云平台 | `src/assets/projects/llm/`        | `src/media.ts`      |
| MAS              | `src/assets/projects/mas/`        | `src/media.ts`      |
| 无感考勤         | `src/assets/projects/attendance/` | `src/media.ts`      |

未配置标题时，会使用「项目名 · 界面截图 01」这类默认文案。自定义标题示例：

```ts
cloud89: projectImagesFromGlob(cloud89Modules, "projects/cloud89", "船舶管理云平台", {
  "image4.webp": "单船监控中心 · 实时视频与告警概览",
}),
```

第一张为默认预览；未写进标题映射的新图会自动追加。维护细节见 [截图说明](docs/SCREENSHOTS.md)。

## 修改简历

| 文件                       | 作用                                   |
| -------------------------- | -------------------------------------- |
| `src/data.ts`              | 联系方式、项目简介、技术要点、技术栈   |
| `src/App.tsx`              | 简历结构、个人档案、教育与荣誉         |
| `src/Gallery.tsx`          | 图集入口与全屏浏览                     |
| `src/media.ts`             | 项目截图自动发现与可选标题             |
| `src/loadProjectImages.ts` | 扫描项目图片模块的工具函数             |
| `src/styles.css`           | 布局、配色、响应式、动效、打印排版     |
| `public/resume-lihao.pdf`  | 与网页内容同步的可下载 PDF 简历        |
| `docs/CONTENT_SOURCES.md`  | 简历信息与项目源码依据                 |

企业项目归入广州逐电科技有限公司实习经历，并按本人确认统一标注“独立完成”；Yihen Drama 单列为个人 GitHub 项目。未编造实习起止时间或业务性能指标。

## 构建与部署

```powershell
npm run build
npm run preview
```

线上地址：[https://cszyihen.github.io/lihao-portfolio/](https://cszyihen.github.io/lihao-portfolio/)。配置支持 GitHub Pages 子目录部署。

### GitHub Pages

仓库已包含 `.github/workflows/deploy-pages.yml`。推送到 `main` 后，GitHub Actions 会自动安装依赖、按仓库子路径构建并发布 `dist/`；也可以在仓库的 **Actions** 页面手动运行该工作流。首次发布需要在仓库 **Settings → Pages** 中将 **Source** 设为 **GitHub Actions**。

## 检查

```powershell
npm run check
npm run test:e2e
```

首次测试如缺少浏览器，运行 `npx playwright install chromium`。也可设置 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指向本机已有的 Chromium 测试浏览器。测试包含简历内容、项目筛选、技术展开、多图浏览、焦点、下载、复制、打印调用、动效偏好及不同屏幕宽度。
