import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const baseUrl = process.env.PODCAST_BASE_URL ?? "http://127.0.0.1:3001";
const slug = process.env.PODCAST_TEST_SLUG ?? "gpt-5-6-complete-guide";
const emptySlug = process.env.PODCAST_EMPTY_SLUG ?? "exponential-ai-life";
const progressKey = `book-reader-progress:${slug}`;
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "desktop-compact", width: 1366, height: 768 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "mobile-compact", width: 360, height: 640 },
  { name: "mobile-landscape", width: 844, height: 390 },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function inspectLayout(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(`${baseUrl}/books/${slug}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  const metrics = await page.evaluate(() => {
    const root = document.querySelector(".podcast-app");
    const controls = Array.from(root?.querySelectorAll("button, a, input, select") ?? [])
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
    const overlaps = [];
    for (let firstIndex = 0; firstIndex < controls.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < controls.length; secondIndex += 1) {
        const first = controls[firstIndex].getBoundingClientRect();
        const second = controls[secondIndex].getBoundingClientRect();
        const width = Math.min(first.right, second.right) - Math.max(first.left, second.left);
        const height = Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);
        if (width > 1 && height > 1) overlaps.push([firstIndex, secondIndex]);
      }
    }
    return {
      viewport: { width: innerWidth, height: innerHeight },
      body: { width: document.body.scrollWidth, height: document.body.scrollHeight },
      root: root ? { width: root.scrollWidth, height: root.scrollHeight } : null,
      controls: controls.length,
      overlaps,
      errorOverlay: Boolean(document.querySelector("[data-nextjs-dialog]")),
    };
  });

  assert(metrics.root, `${viewport.name}: Podcast root did not render`);
  assert(metrics.body.width <= metrics.viewport.width, `${viewport.name}: horizontal page overflow`);
  assert(metrics.body.height <= metrics.viewport.height, `${viewport.name}: whole-page scrolling detected`);
  assert(metrics.root.width <= metrics.viewport.width, `${viewport.name}: Podcast root overflows horizontally`);
  assert(metrics.root.height <= metrics.viewport.height, `${viewport.name}: Podcast root overflows vertically`);
  assert(metrics.controls >= 12, `${viewport.name}: expected at least 12 visible controls`);
  assert(metrics.overlaps.length === 0, `${viewport.name}: interactive controls overlap`);
  assert(!metrics.errorOverlay, `${viewport.name}: Next.js error overlay detected`);
  assert(errors.length === 0, `${viewport.name}: ${errors.join(" | ")}`);

  const screenshotPath = path.join(process.cwd(), "tmp", `podcast-ux-${viewport.name}.png`);
  await page.screenshot({ path: screenshotPath });
  await context.close();
  return { ...viewport, controls: metrics.controls, screenshotPath };
}

async function verifyInteraction(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  assert(await page.getByRole("link", { name: /開始收聽/ }).count() > 0, "Homepage has no listen-first CTA");
  await page.evaluate((key) => localStorage.removeItem(key), progressKey);

  await page.goto(`${baseUrl}/books/${slug}`, { waitUntil: "domcontentloaded" });
  const slider = page.locator('input[aria-label^="Podcast 播放進度"]');
  await slider.waitFor({ state: "visible" });
  await page.waitForTimeout(250);
  assert(await page.getByRole("link", { name: "閱讀電子書" }).isVisible(), "Ebook action is missing");

  await slider.fill("90");
  await page.waitForFunction((key) => {
    const stored = JSON.parse(localStorage.getItem(key) || "null");
    return stored?.version === 3 && Math.abs(stored.podcastCurrentTime - 90) < 1;
  }, progressKey);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Number(document.querySelector('input[aria-label^="Podcast 播放進度"]')?.value) === 90);

  await page.getByRole("button", { name: "繼續 Podcast" }).click();
  await page.waitForFunction(() => document.querySelector(".podcast-state")?.textContent?.includes("播放中"));
  await page.getByLabel("Podcast 播放速度").selectOption("2");
  await page.getByRole("button", { name: "暫停 Podcast" }).click();

  const restoredSlider = page.locator('input[aria-label^="Podcast 播放進度"]');
  const beforeKeyboardSeek = Number(await restoredSlider.inputValue());
  await restoredSlider.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(100);
  const afterKeyboardSeek = Number(await restoredSlider.inputValue());
  assert(
    afterKeyboardSeek > beforeKeyboardSeek && afterKeyboardSeek <= beforeKeyboardSeek + 1.1,
    `Keyboard seeking failed: ${beforeKeyboardSeek} -> ${afterKeyboardSeek}`,
  );

  const autoNext = page.getByRole("switch", { name: "自動下一集" });
  await autoNext.click();
  assert(await autoNext.getAttribute("aria-checked") === "false", "Auto-next toggle failed");

  await page.getByLabel("選擇 Podcast 單集").selectOption("1");
  await page.waitForFunction(() => document.querySelector("#podcast-episode-title")?.textContent?.includes("Sol"));
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "null"), progressKey);
  assert(stored.podcastChapterIndex === 1, "Episode selection was not persisted");
  assert(stored.podcastRate === 2, "Playback rate was not persisted");

  await page.getByRole("link", { name: "閱讀電子書" }).click();
  await page.waitForURL(`**/books/${slug}/read`);
  assert(await page.getByText("Book Reader").isVisible(), "Ebook reader did not load");
  assert(await page.locator(".podcast-panel").count() === 0, "Ebook reader still includes the full Podcast panel");
  assert(await page.getByRole("link", { name: "返回 Podcast" }).isVisible(), "Ebook reader has no Podcast return route");

  await page.goto(`${baseUrl}/books/${emptySlug}`, { waitUntil: "domcontentloaded" });
  assert(await page.locator(".podcast-empty-state").isVisible(), "No-audio book has no empty state");
  assert(await page.getByRole("link", { name: /開始閱讀/ }).isVisible(), "No-audio empty state has no ebook action");
  assert(errors.length === 0, `Interaction browser errors: ${errors.join(" | ")}`);

  await context.close();
  return {
    resumeSeconds: 90,
    rate: 2,
    episodeIndex: stored.podcastChapterIndex,
    ebookRoute: `/books/${slug}/read`,
    emptyState: true,
  };
}

const browser = await chromium.launch({ headless: true });
try {
  const layouts = [];
  for (const viewport of viewports) layouts.push(await inspectLayout(browser, viewport));
  const interaction = await verifyInteraction(browser);
  console.log(JSON.stringify({ status: "passed", baseUrl, layouts, interaction }, null, 2));
} finally {
  await browser.close();
}
