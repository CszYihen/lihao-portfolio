# 项目图片维护

每个项目目录下的图片会由 Vite `import.meta.glob` **自动发现**并进入图集。把新截图丢进对应文件夹即可，一般不必再改代码。

## 当前图片

数量以各 `src/assets/projects/<id>/` 目录实际文件为准（当前 26 张 WebP）。

| 项目             | 图片目录                      | 配置入口       |
| ---------------- | ----------------------------- | -------------- |
| 船舶管理云平台   | `src/assets/projects/cloud89/`    | `src/media.ts` |
| Yihen Drama      | `src/assets/projects/drama/`      | `src/media.ts` |
| 大模型复检云平台 | `src/assets/projects/llm/`        | `src/media.ts` |
| MAS              | `src/assets/projects/mas/`        | `src/media.ts` |
| 无感考勤系统     | `src/assets/projects/attendance/` | `src/media.ts` |

## 新增图片

1. 将优化后的 WebP 图片放入上表对应目录，建议使用简短英文文件名（如 `image5.webp`）。
2. 重启或热更新后图集自动包含新文件。
3. （可选）在 `src/media.ts` 的标题映射里为该文件名写中文标题；不写则显示「项目名 · 界面截图 0N」。
4. （可选）对非自然序文件名（如 drama 的 `workspace.webp`）传入 `order` 数组固定顺序。

## 说明

- 图片由 Vite 作为源码资源导入，构建时会生成带内容哈希的文件名。
- 默认按文件名自然排序（`image.webp` → `image1.webp` → `image4.webp`）。
- 图片用于展示功能界面，其中的业务数据不作为项目业绩。
