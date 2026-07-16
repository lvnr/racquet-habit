const { chromium } = require("playwright");
const fs = require("node:fs/promises");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "design", "brand-v3", "site-qa");
const base = process.env.BASE_URL || "http://localhost:4321";

async function settleImages(page) {
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    for (const image of document.images) image.loading = "eager";
    await delay(100);
    const step = Math.max(320, Math.floor(window.innerHeight * 0.7));
    const pageHeight = document.documentElement.scrollHeight;
    for (let y = 0; y < pageHeight; y += step) {
      window.scrollTo(0, y);
      await delay(80);
    }
    window.scrollTo(0, 0);
    await Promise.race([
      Promise.all(
        [...document.images].map((image) => {
          if (image.complete) return Promise.resolve();
          return new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          });
        }),
      ),
      delay(5000),
    ]);
  });
  await page.waitForTimeout(250);
}

function recordAuditIssues(routeName, audit, issues) {
  if (audit.overflow > 1) issues.push(`${routeName}: horizontal overflow ${audit.overflow}px`);
  if (audit.missingAlt) issues.push(`${routeName}: ${audit.missingAlt} images missing alt`);
  if (audit.emptyLinks) issues.push(`${routeName}: ${audit.emptyLinks} empty unnamed links`);
  for (const image of audit.brokenImages) {
    issues.push(`${routeName}: image did not load: ${image}`);
  }
}

async function auditPage(page) {
  return page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent?.trim() || null,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    missingAlt: [...document.querySelectorAll("img")].filter((image) => !image.hasAttribute("alt")).length,
    emptyLinks: [...document.querySelectorAll("a")].filter((link) => !(link.textContent || "").trim() && !link.getAttribute("aria-label")).length,
    focusable: document.querySelectorAll("a[href], button, input, select, summary").length,
    brokenImages: [...document.images]
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src || image.alt || "(unknown image)"),
  }));
}

(async () => {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const issues = [];
  const routes = [
    { name: "home-desktop", url: "/", viewport: { width: 1440, height: 1000 }, fullPage: true },
    { name: "home-mobile", url: "/", viewport: { width: 390, height: 844 }, fullPage: true },
    { name: "shop-desktop", url: "/shop", viewport: { width: 1440, height: 1000 }, fullPage: true },
    { name: "shop-mobile", url: "/shop", viewport: { width: 390, height: 844 }, fullPage: true },
  ];

  for (const route of routes) {
    const page = await browser.newPage({ viewport: route.viewport, deviceScaleFactor: 1 });
    page.on("response", (response) => {
      if (response.status() >= 400) {
        issues.push(`${route.name}: HTTP ${response.status()}: ${response.url()}`);
      }
    });
    page.on("console", (message) => {
      if (message.type() === "error") issues.push(`${route.name}: console error: ${message.text()}`);
    });
    page.on("pageerror", (error) => issues.push(`${route.name}: page error: ${error.message}`));
    await page.goto(`${base}${route.url}`, { waitUntil: "networkidle" });
    await settleImages(page);
    await page.screenshot({ path: path.join(outDir, `${route.name}.png`), fullPage: route.fullPage });
    const audit = await auditPage(page);
    recordAuditIssues(route.name, audit, issues);
    console.log(route.name, JSON.stringify(audit));
    await page.close();
  }

  const discovery = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await discovery.goto(`${base}/shop`, { waitUntil: "networkidle" });
  const firstProductHref = await discovery.locator(".product-card__image").first().getAttribute("href");
  await discovery.close();
  if (firstProductHref) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on("response", (response) => {
      if (response.status() >= 400) {
        issues.push(`product-desktop: HTTP ${response.status()}: ${response.url()}`);
      }
    });
    page.on("console", (message) => {
      if (message.type() === "error") issues.push(`product-desktop: console error: ${message.text()}`);
    });
    page.on("pageerror", (error) => issues.push(`product-desktop: page error: ${error.message}`));
    await page.goto(`${base}${firstProductHref}`, { waitUntil: "networkidle" });
    await settleImages(page);
    await page.screenshot({ path: path.join(outDir, "product-desktop.png"), fullPage: true });
    const audit = await auditPage(page);
    recordAuditIssues("product-desktop", audit, issues);
    console.log("product-desktop", JSON.stringify(audit));
    await page.close();
  } else {
    issues.push("product-desktop: no product link discovered on /shop");
  }

  await browser.close();
  if (issues.length) {
    console.error("Visual QA issues:");
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
  } else {
    console.log("Visual QA passed without runtime, overflow, alt, or empty-link issues.");
  }
})();
