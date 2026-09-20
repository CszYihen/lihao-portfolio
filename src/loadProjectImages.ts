import type { ProjectImage } from "./Gallery";

/** Collect image filenames discovered by Vite `import.meta.glob`. */
function filenamesFromGlob(
  modules: Record<string, unknown>,
  preferredOrder: string[] = [],
): { file: string; src: string }[] {
  const files = Object.entries(modules)
    .map(([path, source]) => ({
      file: path.split(/[/\\]/).pop() ?? "",
      src: typeof source === "string" ? source : "",
    }))
    .filter(({ file, src }) => file && src);
  return files.sort((a, b) => {
    const ia = preferredOrder.indexOf(a.file);
    const ib = preferredOrder.indexOf(b.file);
    const ra = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
    const rb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
    if (ra !== rb) return ra - rb;
    return a.file.localeCompare(b.file, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}

/**
 * Build gallery entries from a src/assets/projects/<id>/ folder.
 * Drop new screenshots into the folder — Vite emits and fingerprints them automatically.
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
  return filenamesFromGlob(modules, order).map(({ file, src }, index) => ({
    src: src || `${folder}/${file}`,
    title:
      titles[file] ??
      `${label} · 界面截图 ${String(index + 1).padStart(2, "0")}`,
    kind: "screenshot" as const,
  }));
}
