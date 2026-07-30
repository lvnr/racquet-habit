import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productionRoot = path.join(
  repoRoot,
  "design",
  "brand-fixed",
  "production",
);
const planPath = path.join(
  productionRoot,
  "fullres-color-catalog-generation-plan.json",
);

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const productKind = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes("cap") || lower.includes("hat")) {
    return "premium unstructured cotton tennis cap";
  }
  if (lower.includes("crop")) return "premium women's cropped cotton tee";
  if (lower.includes("oversized")) {
    return "premium heavyweight oversized cotton tee";
  }
  return "premium heavyweight cotton tee";
};

const isFullResolution = (file) => {
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) return false;
  const result = spawnSync(
    "magick",
    ["identify", "-format", "%w %h", file],
    { encoding: "utf8" },
  );
  if (result.status !== 0) return false;
  const [width, height] = result.stdout.trim().split(/\s+/).map(Number);
  return width >= 1000 && height >= 1400;
};

const jobs = [];

for (const entry of fs
  .readdirSync(productionRoot, { withFileTypes: true })
  .filter((candidate) => candidate.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name))) {
  const productRoot = path.join(productionRoot, entry.name);
  const manifestPath = path.join(productRoot, "manifest.json");
  if (!fs.existsSync(manifestPath)) continue;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const colors = manifest.colorReferences ?? [];
  if (colors.length < 2) continue;

  const selectedColorSlug = slugify(manifest.selectedVariant?.color ?? "");
  const kind = productKind(manifest.name);

  for (const color of colors) {
    if (color.colorSlug === selectedColorSlug) continue;

    const references = (color.localReferences ?? [])
      .slice(0, 2)
      .map((reference) => path.join(productRoot, reference))
      .filter((reference) => fs.existsSync(reference));

    if (references.length < 2) {
      console.warn(
        `Skipping ${entry.name}/${color.colorSlug}: two Fourthwall references are required.`,
      );
      continue;
    }

    const outputDirectory = path.join(
      productRoot,
      "catalog",
      "colors",
      color.colorSlug,
    );

    for (const view of ["front", "back"]) {
      const outputPath = path.join(outputDirectory, `catalog-${view}.png`);
      if (isFullResolution(outputPath)) continue;

      const referenceRole =
        view === "front"
          ? "Image 1 is the authoritative FRONT reference; Image 2 confirms the same product and color from the back."
          : "Image 2 is the authoritative BACK reference; Image 1 confirms the same product and color from the front.";
      const viewDirection =
        view === "front"
          ? "Show one exact straight-on FRONT view only."
          : "Show one exact straight-on BACK view only.";

      const prompt = [
        "Use case: product-mockup.",
        "Asset type: launch-ready full-resolution ecommerce catalog image.",
        `Primary request: photograph the exact ${color.color} ${kind} named "${manifest.name}".`,
        `Input images: ${referenceRole}`,
        `Composition/framing: ${viewDirection} One product only, centered on a genuinely VERTICAL 4:5 PORTRAIT canvas. The product fills roughly 72% of the frame while remaining completely visible with generous equal margins. Do not create a square image, landscape image, diptych, split screen, contact sheet, alternate angle, or second product.`,
        "Scene/backdrop: seamless warm off-white luxury studio sweep with subtle tonal depth.",
        "Style/medium: photorealistic premium fashion-retail product photography, comparable to a top-tier independent fashion store.",
        "Lighting/mood: large diffused key light, very soft fill, restrained contact shadow, quiet expensive grading, accurate whites and fabric color.",
        "Materials/textures: preserve realistic cotton weave, stitching, garment weight, ribbing, seams, embroidery, print integration, and natural structure without plastic smoothness.",
        "Constraints: the current Fourthwall references are binding. Preserve the exact garment silhouette, exact color and undertone, and exact placement, scale, colors, spelling, and content of every printed or embroidered design. Do not redesign, reinterpret, simplify, add, remove, mirror, or invent any artwork. No model, props, hanger, labels, captions, border, watermark, or visible studio equipment.",
        "Output intent: a single native full-resolution portrait render at approximately 1000 pixels wide by 1500 pixels tall or larger, matching the original approved catalog scale. This must be independently rendered at full resolution, never enlarged or derived from a multi-panel sheet.",
      ].join("\n");

      jobs.push({
        productSlug: entry.name,
        productName: manifest.name,
        color: color.color,
        colorSlug: color.colorSlug,
        colorHex: color.colorHex ?? null,
        view,
        references,
        outputDirectory,
        outputPath,
        prompt,
      });
    }
  }
}

fs.writeFileSync(
  planPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      minimumWidth: 1000,
      minimumHeight: 1400,
      jobCount: jobs.length,
      colorwayCount: jobs.length / 2,
      jobs,
    },
    null,
    2,
  )}\n`,
);

const counts = {};
for (const job of jobs) {
  counts[job.productSlug] ??= { views: 0, colorways: new Set() };
  counts[job.productSlug].views += 1;
  counts[job.productSlug].colorways.add(job.colorSlug);
}

console.log(
  JSON.stringify({
    planPath,
    jobCount: jobs.length,
    colorwayCount: jobs.length / 2,
    products: Object.fromEntries(
      Object.entries(counts).map(([product, count]) => [
        product,
        { views: count.views, colorways: count.colorways.size },
      ]),
    ),
  }),
);
