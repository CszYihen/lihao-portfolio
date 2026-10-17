import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { preview } from "vite";

const pdfPath = resolve("public/resume-lihao.pdf");
const builtPdfPath = resolve("dist/resume-lihao.pdf");

const server = await preview({
  preview: { host: "127.0.0.1", port: 4179, strictPort: false },
});
let browser;

try {
  const address = server.httpServer.address();
  if (!address || typeof address === "string") {
    throw new Error("无法获取本地预览端口");
  }

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${address.port}/`, {
    waitUntil: "networkidle",
  });
  await page.locator(".project-entry").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
  });
  await copyFile(pdfPath, builtPdfPath);
  console.log(`已更新 ${pdfPath} 和 ${builtPdfPath}`);
} finally {
  await browser?.close();
  await new Promise((resolveClose, rejectClose) => {
    server.httpServer.close((error) =>
      error ? rejectClose(error) : resolveClose(),
    );
  });
}
