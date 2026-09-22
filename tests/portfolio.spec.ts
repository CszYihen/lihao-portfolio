import { readFile } from "node:fs/promises";
import { test, expect, type Locator, type Page } from "@playwright/test";

const email = "lihao_0216@sina.com";
const projectCases = [
  { id: "cloud89", title: "船舶管理云平台", images: 5 },
  { id: "llm", title: "大模型复检云平台", images: 6 },
  { id: "mas", title: "MAS 船端告警系统", images: 6 },
  { id: "attendance", title: "无感考勤", images: 5 },
  { id: "drama", title: "Yihen Drama", images: 4 },
];

async function expectLoaded(image: Locator) {
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((element) => {
        const img = element as HTMLImageElement;
        return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
      }),
    )
    .toBe(true);
}

async function expectNoPageOverflow(page: Page, label: string) {
  const size = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(size.document, `${label}: document overflow`).toBeLessThanOrEqual(
    size.viewport + 1,
  );
  expect(size.body, `${label}: body overflow`).toBeLessThanOrEqual(
    size.viewport + 1,
  );
}

let runtimeErrors: string[];
test.beforeEach(async ({ page }) => {
  runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
});
test.afterEach(() =>
  expect(runtimeErrors, "browser runtime errors").toEqual([]),
);

test("resume content, five projects and category filtering", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("李豪");
  await expect(page.locator(".resume-document-header")).toContainText(
    "Java 后端开发实习",
  );
  await expect(page.locator("#overview")).toContainText("船舶管理云平台");
  await expect(page.locator("#overview")).toContainText("企业项目");
  await expect(page.locator("#overview .overview-signals")).toBeVisible();
  await expect(page.locator("#overview .overview-signals")).toContainText(
    "IJCAI · CCF-A",
  );
  await expect(page.locator("#overview .overview-panel")).toBeVisible();
  await expect(page.locator("#overview #education.education-card")).toBeVisible();
  await expect(page.locator("#education .education-status")).toContainText(
    "在读",
  );
  await expect(
    page.locator('#overview a[href="#project-cloud89"]'),
  ).toBeVisible();
  await expect(page.locator("#experience")).toContainText(
    "广州逐电科技有限公司",
  );
  const companyWebsite = page.getByRole("link", {
    name: "广州逐电科技有限公司官方网站",
  });
  await expect(companyWebsite).toHaveAttribute(
    "href",
    "http://42.193.140.103:81/",
  );
  await expect(companyWebsite).toHaveAttribute("target", "_blank");
  await companyWebsite.hover();
  const companyPreview = page.locator(".link-preview-float img");
  await expect(companyPreview).toBeVisible();
  await expect(companyPreview).toHaveAttribute("src", /zhudian-home.*\.webp/);
  await expect(page.locator("#education")).toContainText("燕山大学");
  await expect(page.locator("#education")).toContainText("湖南理工大学");
  await expect(page.locator("#education")).toContainText("2024 — 2027");
  await expect(page.locator("#education")).toContainText("2020 — 2024");
  await expect(page.locator(".education-timeline-item")).toHaveCount(2);
  await expect(page.locator(".education-timeline-line")).toHaveCount(1);
  await expect(page.locator(".education-timeline-dot")).toHaveCount(2);
  await expect(page.locator(".education-timeline-item").first()).toContainText(
    "燕山大学",
  );
  await expect(page.locator(".education-timeline-item").nth(1)).toContainText(
    "湖南理工大学",
  );
  await expect(page.locator(".edu-chip-focus")).toContainText(
    "计算机视觉 · 行为识别",
  );
  await expect(page.locator(".edu-chip-honor")).toContainText(
    "2024 届优秀毕业生",
  );
  await expect(page.locator("#honors")).toContainText("IJCAI");
  await expect(page.locator("#honors")).toContainText("CCF-A");
  await expect(page.locator("#honors")).toContainText(
    "Towards Generalized Action Recognition on Low-Resolutions with Domain-Invariant Representation",
  );
  await expect(page.locator(".academic-split")).toBeVisible();
  await expect(page.locator(".academic-split .scholarship-card")).toContainText(
    "国家励志奖学金",
  );
  await expect(page.locator(".academic-split .scholarship-card")).toContainText(
    "三等学业奖学金",
  );
  await expect(page.locator(".academic-split .scholarship-card")).toContainText(
    "一等国家助学金",
  );
  await expect(page.locator(".scholarship-stage-grad")).toContainText(
    "研究生期间",
  );
  await expect(page.locator(".scholarship-stage-undergrad").first()).toContainText(
    "本科期间",
  );
  await expect(page.locator(".competition-card")).toContainText("F 奖");
  await expect(page.locator(".publication-mark")).toContainText("IJCAI");
  await expect(page.locator(".publication-mark")).toContainText("CCF-A");
  await expect(page.locator(".project-entry")).toHaveCount(5);
  await expect(page.locator(".project-entry").nth(3)).toHaveAttribute(
    "id",
    "project-attendance",
  );
  await expect(page.locator(".project-entry").nth(4)).toHaveAttribute(
    "id",
    "project-drama",
  );
  await expect(
    page.locator('#project-drama a[href="https://github.com/CszYihen/Yihen-Drama"]'),
  ).toBeVisible();
  await expect(
    page.locator('.profile-github[href="https://github.com/CszYihen"]'),
  ).toBeVisible();
  for (const project of projectCases)
    await expect(page.locator(`#project-${project.id} h3`)).toContainText(
      project.title,
    );
  await expect(page.locator("#project-attendance")).toContainText(
    "工地人员无感打卡",
  );
  await expect(page.locator("#project-attendance")).toContainText(
    "陌生人与非法进入告警",
  );
  for (const project of projectCases) {
    expect(
      await page
        .locator(`#project-${project.id} .project-summary-key`)
        .count(),
    ).toBeGreaterThanOrEqual(4);
  }
  expect(
    await page.locator("#project-cloud89").evaluate((entry) =>
      getComputedStyle(entry, "::before").content,
    ),
  ).toBe("none");
  const filters = page.getByRole("group", { name: "项目分类" });
  await filters.getByRole("button", { name: /^个人项目/ }).click();
  await expect(page.locator(".project-entry")).toHaveCount(1);
  await expect(page.locator("#project-drama")).toBeVisible();
  await expect(
    filters.getByRole("button", { name: /^个人项目/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("status").filter({ hasText: "显示 1 个项目" }),
  ).toHaveCount(1);
  await filters.getByRole("button", { name: /^企业项目/ }).click();
  await expect(page.locator(".project-entry")).toHaveCount(4);
  await expect(page.locator("#project-drama")).toHaveCount(0);
  await filters.getByRole("button", { name: /^全部/ }).click();
  await expect(page.locator(".project-entry")).toHaveCount(5);
  // Company project links restore their target after personal-only filtering.
  await filters.getByRole("button", { name: /^个人项目/ }).click();
  await page
    .locator(".internship-project-links")
    .getByRole("link", { name: "MAS 船端告警系统" })
    .click();
  await expect(page.locator(".project-entry")).toHaveCount(5);
  await expect(page).toHaveURL(/#project-mas$/);
  await expect(page.locator("#project-cloud89")).toContainText("独立完成");
});

test("each project expands and collapses its technical details", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const project of projectCases) {
    const entry = page.locator(`#project-${project.id}`);
    const details = entry.locator(".additional-features");
    const toggle = entry.locator(".detail-toggle");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(details).toHaveAttribute("inert", "");
    await expect(details).toHaveAttribute("aria-hidden", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(details).not.toHaveAttribute("inert", "");
    await expect(details).toHaveAttribute("aria-hidden", "false");
    await expect(details.getByText("业务链路", { exact: true })).toBeVisible();
    expect(await details.locator(".project-flow-node").count()).toBeGreaterThan(
      2,
    );
    await expect(details.locator(".project-flow-node").first()).toHaveCSS(
      "opacity",
      "1",
    );
    expect(
      await details.locator(".project-highlights li").count(),
    ).toBeGreaterThan(0);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(details).toHaveAttribute("inert", "");
    await expect(details).toHaveCSS("height", "0px");
  }
});

test("every project gallery loads, changes thumbnails and opens the selected image", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const project of projectCases) {
    const entry = page.locator(`#project-${project.id}`);
    await entry.locator(".animated-testimonials").scrollIntoViewIfNeeded();
    const preview = entry.locator('.at-card[data-active="true"] .at-image-btn').last();
    await expectLoaded(preview.locator("img"));
    await expect(preview).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect
      .poll(() =>
        preview.evaluate((button) => {
          const image = button.querySelector("img")!;
          const bounds = button.getBoundingClientRect();
          return Math.abs(
            image.naturalWidth / image.naturalHeight - bounds.width / bounds.height,
          );
        }),
      )
      .toBeLessThan(0.02);
    const next = entry.getByRole("button", { name: "下一张" });
    if (project.images > 1) {
      await expect(entry.locator(".at-controls .at-nav")).toHaveCount(2);
      const firstSource = await preview.locator("img").getAttribute("src");
      await next.click();
      await expect(preview.locator("img")).not.toHaveAttribute(
        "src",
        firstSource!,
      );
      await expectLoaded(preview.locator("img"));
    } else {
      await expect(entry.locator(".at-controls")).toHaveCount(0);
    }
    const selectedSource = await preview.locator("img").getAttribute("src");
    const selectedTitle = await preview.locator("img").getAttribute("alt");
    await preview.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: project.title, exact: true }),
    ).toBeVisible();
    await expect(dialog.locator(".lightbox-viewport img")).toHaveAttribute(
      "src",
      selectedSource!,
    );
    await expect(dialog.locator(".lightbox-viewport img")).toHaveAttribute(
      "alt",
      selectedTitle!,
    );
    await expectLoaded(dialog.locator(".lightbox-viewport img"));
    await expect(dialog.locator(".lightbox-filmstrip button")).toHaveCount(
      project.images,
    );
    if (project.images === 1) {
      await expect(
        dialog.getByRole("button", { name: "上一张图片" }),
      ).toBeDisabled();
      await expect(
        dialog.getByRole("button", { name: "下一张图片" }),
      ).toBeDisabled();
    }
    await dialog.getByRole("button", { name: "关闭图集" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(preview).toBeFocused();
  }
});

test("lightbox keyboard, paging, filmstrip, zoom, focus trap and inert background", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator("#project-drama .animated-testimonials")
    .evaluate((element) => element.scrollIntoView({ block: "center" }));
  const preview = page.locator('#project-drama .at-card[data-active="true"] .at-image-btn').last();
  const returnFocusName = await preview.getAttribute("aria-label");
  await preview.click();
  const dialog = page.getByRole("dialog");
  const picture = dialog.locator(".lightbox-viewport img");
  await expect(dialog.getByRole("button", { name: "关闭图集" })).toBeFocused();
  await expect(page.locator(".resume-app")).toHaveAttribute("inert", "");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page
    .locator(".print-button")
    .evaluate((element) => (element as HTMLElement).focus());
  await expect(dialog.getByRole("button", { name: "关闭图集" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(picture).toHaveAttribute("alt", "角色与场景资产管理");
  await page.keyboard.press("ArrowLeft");
  await expect(picture).toHaveAttribute("alt", "创作工作台与项目管理");
  await page.keyboard.press("ArrowLeft");
  await expect(picture).toHaveAttribute("alt", "首帧预览与视频生成工作区");
  await dialog.getByRole("button", { name: "下一张图片" }).click();
  await expect(picture).toHaveAttribute("alt", "创作工作台与项目管理");
  await dialog.getByRole("button", { name: "上一张图片" }).click();
  await expect(picture).toHaveAttribute("alt", "首帧预览与视频生成工作区");
  await dialog.getByRole("button", { name: /^查看第3张：/ }).click();
  await expect(picture).toHaveAttribute("alt", "分镜编排与资产关联");
  await expect(
    dialog.getByRole("button", { name: /^查看第3张：/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await dialog.getByRole("button", { name: "放大图片", exact: true }).click();
  await expect(dialog.locator(".lightbox-viewport")).toHaveClass(/zoomed/);
  await expect(
    dialog.getByRole("button", { name: "缩小图片" }),
  ).toHaveAttribute("aria-pressed", "true");
  await dialog.getByRole("button", { name: "缩小图片" }).click();
  await expect(dialog.locator(".lightbox-viewport")).not.toHaveClass(/zoomed/);
  await dialog.getByRole("button", { name: "放大图片", exact: true }).click();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator(".lightbox-viewport")).not.toHaveClass(/zoomed/);
  const firstControl = dialog.getByRole("button", {
    name: "放大图片",
    exact: true,
  });
  const lastControl = dialog.getByRole("button", { name: /^查看第4张：/ });
  await firstControl.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(lastControl).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(firstControl).toBeFocused();
  await expectLoaded(picture);
  await page.screenshot({ path: ".qa/resume-gallery-desktop.png" });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".resume-app")).not.toHaveAttribute("inert", "");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(
    page.getByRole("button", { name: returnFocusName!, exact: true }),
  ).toBeFocused();
});

test("original PDF download, email copy, contact links and print action", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(() => {
    const state = window as Window & { __printCalls?: number };
    state.__printCalls = 0;
    window.print = () => {
      state.__printCalls = (state.__printCalls ?? 0) + 1;
    };
  });
  await page.goto("/");
  await expect(
    page.locator(".profile-contact").getByRole("link", { name: email }),
  ).toHaveAttribute("href", `mailto:${email}`);
  await expect(
    page.locator(".profile-contact").getByRole("link", { name: "19118415578" }),
  ).toHaveAttribute("href", "tel:19118415578");
  const resume = page.getByRole("link", { name: "下载 PDF 简历" });
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    resume.click(),
  ]);
  expect(download.suggestedFilename()).toBe("李豪-Java后端简历.pdf");
  expect(await download.failure()).toBeNull();
  const response = await page.request.get(
    new URL((await resume.getAttribute("href"))!, page.url()).href,
  );
  expect(response.ok()).toBe(true);
  const pdf = await response.body();
  expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  expect(pdf.equals(await readFile("public/resume-lihao.pdf"))).toBe(true);
  await page.getByRole("button", { name: "复制邮箱", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "邮箱已复制" }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(email);
  await page.getByRole("button", { name: "关闭提示" }).click();
  await expect(page.locator(".toast")).toHaveCount(0);
  await page.getByRole("button", { name: "打印 / 导出" }).click();
  expect(
    await page.evaluate(
      () => (window as Window & { __printCalls?: number }).__printCalls,
    ),
  ).toBe(1);
});

test("motion preference persists and paused reveals remain readable", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
  await page.getByRole("button", { name: "暂停页面动效" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await expect(
    page.getByRole("button", { name: "开启页面动效" }),
  ).toHaveAttribute("aria-pressed", "false");
  for (const reveal of await page.locator("#honors .reveal").all()) {
    await expect(reveal).toHaveCSS("opacity", "1");
    expect(
      await reveal.evaluate(
        (element) =>
          new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    ).toBe(0);
  }
  expect(await page.evaluate(() => localStorage.getItem("lihao-motion"))).toBe(
    "off",
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await page.getByRole("button", { name: "开启页面动效" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
});

test("system reduced motion overrides an enabled preference", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("lihao-motion", "on"));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  const control = page.getByRole("button", { name: "遵循系统减少动效设置" });
  await expect(control).toBeDisabled();
  await expect(control).toHaveAttribute("aria-pressed", "false");
  for (const reveal of await page.locator("#honors .reveal").all()) {
    await expect(reveal).toHaveCSS("opacity", "1");
  }
  await expect(page.locator(".profile-spark")).toHaveCSS(
    "animation-name",
    "none",
  );
  const gallery = page.locator("#project-drama .animated-testimonials");
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery).toBeVisible();
  await expect(gallery.locator(".at-controls")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
  await expect(gallery.locator(".at-image-btn").first()).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await expect(gallery.locator(".at-controls")).toBeVisible();
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`${width}px responsive resume and gallery have no overflow or broken images`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoPageOverflow(page, `${width}px resume`);
    if (width < 700) {
      const profileSpacing = await page.evaluate(() => {
        const badge = document.querySelector(".graduate-badge")!.getBoundingClientRect();
        const summary = document.querySelector(".profile-summary")!.getBoundingClientRect();
        const facts = document.querySelector(".profile-facts")!.getBoundingClientRect();
        return {
          badgeSummaryGap: summary.top - badge.bottom,
          summaryFactsGap: facts.top - summary.bottom,
        };
      });
      expect(profileSpacing.badgeSummaryGap, `${width}px badge overlap`).toBeGreaterThanOrEqual(0);
      expect(profileSpacing.summaryFactsGap, `${width}px summary overlap`).toBeGreaterThanOrEqual(0);
    }
    for (const project of projectCases) {
      const gallery = page.locator(`#project-${project.id} .project-gallery`);
      await gallery.scrollIntoViewIfNeeded();
      for (const image of await gallery.locator("img").all())
        await expectLoaded(image);
      await expectNoPageOverflow(page, `${width}px ${project.id}`);
    }
    const overflow = await page
      .locator(
        "h1, h2, h3, .profile-contact, .project-entry, .resume-paper, .project-description, .project-highlights p",
      )
      .evaluateAll((elements) =>
        elements
          .filter(
            (element) =>
              element.clientWidth > 0 &&
              element.scrollWidth > element.clientWidth + 2,
          )
          .map((element) => ({
            text: element.textContent?.slice(0, 80),
            width: element.clientWidth,
            scroll: element.scrollWidth,
          })),
      );
    expect(overflow, `${width}px readable content overflow`).toEqual([]);
    if (width === 1440 || width === 390) {
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({
        path: `.qa/resume-${width === 1440 ? "desktop" : "mobile"}.png`,
        fullPage: true,
      });
      await page.locator("#project-drama").scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `.qa/resume-projects-${width === 1440 ? "desktop" : "mobile"}.png`,
      });
    }
    const preview = page.locator('#project-drama .at-card[data-active="true"] .at-image-btn').last();
    await preview.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expectLoaded(dialog.locator(".lightbox-viewport img"));
    await expectNoPageOverflow(page, `${width}px gallery`);
    const bounds = await dialog.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(-1);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    await dialog.getByRole("button", { name: "下一张图片" }).click();
    await expect(dialog.locator(".lightbox-viewport img")).toHaveAttribute(
      "alt",
      "角色与场景资产管理",
    );
    await expectLoaded(dialog.locator(".lightbox-viewport img"));
    if (width === 390)
      await page.screenshot({ path: ".qa/resume-gallery-mobile.png" });
    await dialog.getByRole("button", { name: "关闭图集" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(preview).toBeFocused();
  });
}
