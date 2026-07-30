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
const tempRoot = path.join(repoRoot, "tmp", "color-catalog-contact-sheets");

fs.rmSync(tempRoot, { recursive: true, force: true });
fs.mkdirSync(tempRoot, { recursive: true });

const runMagick = (args) => {
  const result = spawnSync("magick", args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `magick ${args.join(" ")}`);
  }
};

const allSheets = [];
const productNames = fs
  .readdirSync(productionRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const productSlug of productNames) {
  const productRoot = path.join(productionRoot, productSlug);
  const manifestPath = path.join(productRoot, "manifest.json");
  if (!fs.existsSync(manifestPath)) continue;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const colors = manifest.colorReferences ?? [];
  if (colors.length < 2) continue;

  const productTemp = path.join(tempRoot, productSlug);
  fs.mkdirSync(productTemp, { recursive: true });
  const productSheets = [];

  for (const color of colors) {
    const colorRoot = path.join(
      productRoot,
      "catalog",
      "colors",
      color.colorSlug,
    );
    const front = path.join(colorRoot, "catalog-front.png");
    const back = path.join(colorRoot, "catalog-back.png");
    const sheet = path.join(colorRoot, "catalog-sheet.png");

    if (!fs.existsSync(front) || !fs.existsSync(back)) {
      throw new Error(`Missing catalog pair: ${productSlug}/${color.colorSlug}`);
    }
    // Rebuild every sheet from the current native front/back assets. This avoids
    // retaining a stale low-resolution sheet after either view is regenerated.
    runMagick([front, back, "+append", sheet]);

    const labeled = path.join(productTemp, `${color.colorSlug}.png`);
    fs.symlinkSync(sheet, labeled);
    productSheets.push(labeled);

    const globalLabeled = path.join(
      tempRoot,
      `${productSlug}--${color.colorSlug}.png`,
    );
    fs.symlinkSync(sheet, globalLabeled);
    allSheets.push(globalLabeled);
  }

  runMagick([
    "montage",
    ...productSheets,
    "-thumbnail",
    "360x240",
    "-tile",
    "3x",
    "-geometry",
    "+14+34",
    "-background",
    "#eeeae0",
    "-fill",
    "#173f35",
    "-pointsize",
    "18",
    "-set",
    "label",
    "%t",
    path.join(productRoot, "catalog-colors-final-contact-sheet.jpg"),
  ]);
}

const pageSize = 24;
const pagePaths = [];
for (let index = 0; index < allSheets.length; index += pageSize) {
  const page = allSheets.slice(index, index + pageSize);
  const pagePath = path.join(
    productionRoot,
    `catalog-colors-global-contact-${String(index / pageSize + 1).padStart(2, "0")}.jpg`,
  );
  runMagick([
    "montage",
    ...page,
    "-thumbnail",
    "300x200",
    "-tile",
    "4x",
    "-geometry",
    "+12+34",
    "-background",
    "#eeeae0",
    "-fill",
    "#173f35",
    "-pointsize",
    "14",
    "-set",
    "label",
    "%t",
    pagePath,
  ]);
  pagePaths.push(pagePath);
}

console.log(
  JSON.stringify({
    products: productNames.length,
    colorways: allSheets.length,
    globalPages: pagePaths,
  }),
);
