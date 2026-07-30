import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productionRoot = path.join(
  repoRoot,
  "design",
  "brand-fixed",
  "production",
);
const planPath = path.join(productionRoot, "color-catalog-generation-plan.json");

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const productKind = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes("cap") || lower.includes("hat")) return "premium unstructured cotton tennis cap";
  if (lower.includes("crop")) return "premium women's cropped cotton tee";
  if (lower.includes("oversized")) return "premium heavyweight oversized cotton tee";
  return "premium heavyweight cotton tee";
};

const jobs = [];
const productDirectories = fs
  .readdirSync(productionRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const productSlug of productDirectories) {
  const productRoot = path.join(productionRoot, productSlug);
  const manifestPath = path.join(productRoot, "manifest.json");
  if (!fs.existsSync(manifestPath)) continue;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const colors = manifest.colorReferences ?? [];
  if (colors.length < 2) continue;

  const selectedColorSlug = slugify(manifest.selectedVariant?.color ?? "");
  const masterFront = path.join(productRoot, "catalog", "catalog-front.png");
  const masterBackCandidates = [
    path.join(productRoot, "catalog", "catalog-back.png"),
    path.join(productRoot, "catalog", "catalog-secondary.png"),
  ];
  const masterBack = masterBackCandidates.find((candidate) => fs.existsSync(candidate));

  for (const color of colors) {
    const outputDirectory = path.join(
      productRoot,
      "catalog",
      "colors",
      color.colorSlug,
    );
    fs.mkdirSync(outputDirectory, { recursive: true });

    const frontOutput = path.join(outputDirectory, "catalog-front.png");
    const backOutput = path.join(outputDirectory, "catalog-back.png");

    if (color.colorSlug === selectedColorSlug) {
      if (!fs.existsSync(frontOutput) && fs.existsSync(masterFront)) {
        fs.copyFileSync(masterFront, frontOutput);
      }
      if (!fs.existsSync(backOutput) && masterBack) {
        fs.copyFileSync(masterBack, backOutput);
      }
    }

    if (fs.existsSync(frontOutput) && fs.existsSync(backOutput)) continue;

    const references = (color.localReferences ?? [])
      .slice(0, 2)
      .map((reference) => path.join(productRoot, reference))
      .filter((reference) => fs.existsSync(reference));

    if (references.length < 2) {
      console.warn(
        `Skipping ${productSlug}/${color.colorSlug}: expected two current Fourthwall references.`,
      );
      continue;
    }

    const kind = productKind(manifest.name);
    const prompt = [
      `Create one wide, perfectly divided TWO-PANEL luxury ecommerce catalog photograph of the exact ${color.color} ${kind} named "${manifest.name}".`,
      "LEFT PANEL: exact straight-on front view. RIGHT PANEL: exact straight-on back view.",
      "Treat the attached current Fourthwall images as binding product references: preserve the exact garment silhouette, exact fabric color and undertone, exact placement, scale, colors, spelling, and content of every printed or embroidered design. Do not redesign, reinterpret, simplify, add, remove, mirror, or invent any artwork.",
      "Both objects are unworn, photographed separately, floating naturally with realistic cotton structure, fine stitching, collar or cap construction, gentle folds, and a restrained contact shadow.",
      "Use the same premium soft off-white seamless studio background in both panels, subtle warm-neutral color grading, large diffused key light, delicate tonal separation, and high-end fashion-retail retouching. Quiet, expensive, precise, photorealistic, no props, no model, no labels, no captions, no divider line.",
      "Keep both products fully visible with generous identical margins, equal scale, equal vertical alignment, and no cropping. The canvas must be landscape with two equal halves.",
    ].join(" ");

    jobs.push({
      productSlug,
      productName: manifest.name,
      productKind: kind,
      color: color.color,
      colorSlug: color.colorSlug,
      colorHex: color.colorHex ?? null,
      references,
      outputDirectory,
      frontOutput,
      backOutput,
      sheetOutput: path.join(outputDirectory, "catalog-sheet.png"),
      prompt,
    });
  }
}

fs.writeFileSync(
  planPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      productionRoot,
      jobCount: jobs.length,
      jobs,
    },
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify({
    planPath,
    jobCount: jobs.length,
    products: new Set(jobs.map((job) => job.productSlug)).size,
  }),
);
