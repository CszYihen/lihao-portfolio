import type { ProjectImage } from "./Gallery";
import { projectImagesFromGlob } from "./loadProjectImages";

/**
 * Auto-discover optimized screenshots under src/assets/projects/<id>/.
 * Add/remove image files in those folders — no manual list edits required.
 * Optional title maps only override captions for known filenames.
 */

const cloud89Modules = import.meta.glob(
  "./assets/projects/cloud89/*.{png,jpg,jpeg,webp,gif}",
  { eager: true, query: "?url", import: "default" },
);
const masModules = import.meta.glob(
  "./assets/projects/mas/*.{png,jpg,jpeg,webp,gif}",
  { eager: true, query: "?url", import: "default" },
);
const llmModules = import.meta.glob(
  "./assets/projects/llm/*.{png,jpg,jpeg,webp,gif}",
  { eager: true, query: "?url", import: "default" },
);
const attendanceModules = import.meta.glob(
  "./assets/projects/attendance/*.{png,jpg,jpeg,webp,gif}",
  { eager: true, query: "?url", import: "default" },
);
const dramaModules = import.meta.glob(
  "./assets/projects/drama/*.{png,jpg,jpeg,webp,gif}",
  { eager: true, query: "?url", import: "default" },
);

/** Add any number of screenshots per project. Paths are relative to public/. */
export const projectMedia: Record<string, ProjectImage[]> = {
  cloud89: projectImagesFromGlob(
    cloud89Modules,
    "projects/cloud89",
    "船舶管理云平台",
    {
      "image.webp": "船舶运行监控中心 · 告警与航行态势",
      "image1.webp": "实时视频墙 · 多通道监控",
      "image2.webp": "航规区域 · 地图绘制与规则配置",
      "image3.webp": "组织权限 · 企业与角色管理",
      "image4.webp": "单船监控中心 · 实时视频与告警概览",
    },
  ),
  mas: projectImagesFromGlob(masModules, "projects/mas", "MAS 船端告警", {
    "image1.webp": "船舶数据大屏 · 监控总览",
    "image2.webp": "告警记录列表 · 开发界面",
    "image3.webp": "告警任务配置 · 开发界面",
    "image4.webp": "GPS 轨迹与航速着色 · 调试界面",
    "image5.webp": "告警规则与联动处理 · 开发界面",
    "image6.webp": "船岸协同与处置闭环 · 开发界面",
  }),
  llm: projectImagesFromGlob(llmModules, "projects/llm", "复检云平台"),
  attendance: projectImagesFromGlob(
    attendanceModules,
    "projects/attendance",
    "无感考勤",
  ),
  drama: projectImagesFromGlob(
    dramaModules,
    "projects/drama",
    "Yihen Drama",
    {
      "workspace.webp": "创作工作台与项目管理",
      "assets.webp": "角色与场景资产管理",
      "storyboards.webp": "分镜编排与资产关联",
      "generation.webp": "首帧预览与视频生成工作区",
    },
    ["workspace.webp", "assets.webp", "storyboards.webp", "generation.webp"],
  ),
};
