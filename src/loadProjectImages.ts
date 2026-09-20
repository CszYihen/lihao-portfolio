import type { ProjectImage } from "./Gallery";

/** Collect image filenames discovered by Vite `import.meta.glob`. */
function filenamesFromGlob(
  modules: Record<string, unknown>,
  preferredOrder: string[] = [],
): string[] {
  const files = Object.keys(modules)
    .map((path) => path.split(/[/\\]/).pop() ?? "")
    .filter(Boolean);
  return files.sort((a, b) => {
    const ia = preferredOrder.indexOf(a);
    const ib = preferredOrder.indexOf(b);
    const ra = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
    const rb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}

/**
 * Build gallery entries from a public/projects/<id>/ folder.
 * Drop new screenshots into the folder — they appear automatically on next build/dev.
 * Optional `titles` map customizes captions by filename; others get序号标题.
 * Optional `order` pins known files first; remaining files follow natural sort.
 */
export function projectImagesFromGlob(
  modules: Record<string, unknown>,
  folder: string,
  label: string,
  titles: Record<string, string> = {},
  order: string[] = [],
): ProjectImage[] {
  return filenamesFromGlob(modules, order).map((file, index) => ({
    src: `${folder}/${file}`,
    title:
      titles[file] ??
      `${label} · 界面截图 ${String(index + 1).padStart(2, "0")}`,
    kind: "screenshot" as const,
  }));
}
