import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productionDir = path.join(root, "design", "brand-fixed", "production");
const productOutputRoot = path.join(
  root,
  "public",
  "images",
  "products",
  "white-court",
);
const identitySourceRoot = path.join(
  root,
  "design",
  "brand-fixed",
  "identity",
);
const identityOutputRoot = path.join(root, "public", "brand-white-court");

const PRODUCT_COUNT = 24;
const CATALOG_WIDTH = 1600;
const EDITORIAL_WIDTH = 1920;

const identityAssets = [
  {
    source: "Wordmark Horizontal 1.png",
    output: "wordmark-horizontal.webp",
    width: 2000,
  },
  {
    source: "Monogram Bold.png",
    output: "monogram-bold.webp",
    width: 1200,
  },
  {
    source: "Monogram Thin.png",
    output: "monogram-thin.webp",
    width: 1200,
  },
  {
    source: "Monogram Bold Inverse.png",
    output: "monogram-bold-inverse.webp",
    width: 1200,
  },
];

const patternAssets = [
  {
    source: "Monogram Bold.png",
    output: "monogram-pattern.webp",
  },
  {
    source: "Monogram Bold Inverse.png",
    output: "monogram-pattern-inverse.webp",
  },
];

async function listPngs(directory) {
  return (await fs.readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".png"))
    .map((entry) => entry.name)
    .sort();
}

async function assertFile(filePath) {
  const stat = await fs.stat(filePath);
  if (!stat.isFile()) {
    throw new Error(`Expected a file: ${path.relative(root, filePath)}`);
  }
}

async function writePhoto(source, output, width) {
  await sharp(source, { limitInputPixels: false })
    .rotate()
    .resize({
      width,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 86,
      alphaQuality: 100,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(output);
}

async function writeIdentity(source, output, width) {
  await sharp(source, { limitInputPixels: false })
    .rotate()
    .resize({
      width,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      lossless: true,
      effort: 6,
    })
    .toFile(output);
}

async function writePattern(source, output) {
  const tileWidth = 256;
  const tileHeight = 176;
  const markWidth = 96;
  const { data: mark, info } = await sharp(source, { limitInputPixels: false })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width: markWidth })
    .png()
    .toBuffer({ resolveWithObject: true });
  const halfMarkWidth = Math.round(info.width / 2);
  const halfMarkHeight = Math.round(info.height / 2);
  const placements = [
    { left: -halfMarkWidth, top: -halfMarkHeight },
    { left: tileWidth - halfMarkWidth, top: -halfMarkHeight },
    { left: -halfMarkWidth, top: tileHeight - halfMarkHeight },
    { left: tileWidth - halfMarkWidth, top: tileHeight - halfMarkHeight },
    {
      left: Math.round(tileWidth / 2) - halfMarkWidth,
      top: Math.round(tileHeight / 2) - halfMarkHeight,
    },
  ];

  await sharp({
    create: {
      width: tileWidth,
      height: tileHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(placements.map((placement) => ({ input: mark, ...placement })))
    .webp({ lossless: true, effort: 6 })
    .toFile(output);
}

const productionEntries = await fs.readdir(productionDir, {
  withFileTypes: true,
});
const productSlugs = [];

for (const entry of productionEntries) {
  if (!entry.isDirectory()) continue;

  const manifestPath = path.join(productionDir, entry.name, "manifest.json");
  try {
    await assertFile(manifestPath);
    productSlugs.push(entry.name);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

productSlugs.sort();

if (productSlugs.length !== PRODUCT_COUNT) {
  throw new Error(
    `Expected ${PRODUCT_COUNT} manifested product directories, found ${productSlugs.length}.`,
  );
}

const productJobs = [];

for (const slug of productSlugs) {
  const productDir = path.join(productionDir, slug);
  const catalogDir = path.join(productDir, "catalog");
  const editorialDir = path.join(productDir, "editorial-court-archive");
  const catalogPngs = await listPngs(catalogDir);
  const editorialPngs = await listPngs(editorialDir);

  if (catalogPngs.length !== 2) {
    throw new Error(
      `${slug}: expected exactly 2 catalog PNGs, found ${catalogPngs.length}.`,
    );
  }

  if (editorialPngs.length !== 3) {
    throw new Error(
      `${slug}: expected exactly 3 court editorial PNGs, found ${editorialPngs.length}.`,
    );
  }

  if (!catalogPngs.includes("catalog-front.png")) {
    throw new Error(`${slug}: missing catalog-front.png.`);
  }

  const alternateCatalogPngs = catalogPngs.filter(
    (name) => name === "catalog-back.png" || name === "catalog-secondary.png",
  );
  if (alternateCatalogPngs.length !== 1) {
    throw new Error(
      `${slug}: expected one catalog-back.png or catalog-secondary.png.`,
    );
  }

  const expectedEditorialPngs = [
    "editorial-01.png",
    "editorial-02.png",
    "editorial-03.png",
  ];
  if (
    editorialPngs.some(
      (name, index) => name !== expectedEditorialPngs[index],
    )
  ) {
    throw new Error(
      `${slug}: editorial PNGs must be editorial-01.png through editorial-03.png.`,
    );
  }

  const outputDir = path.join(productOutputRoot, slug);
  await fs.mkdir(outputDir, { recursive: true });

  productJobs.push(
    {
      source: path.join(catalogDir, "catalog-front.png"),
      output: path.join(outputDir, "catalog-front.webp"),
      width: CATALOG_WIDTH,
    },
    {
      source: path.join(catalogDir, alternateCatalogPngs[0]),
      output: path.join(outputDir, "catalog-back-or-secondary.webp"),
      width: CATALOG_WIDTH,
    },
    ...expectedEditorialPngs.map((name, index) => ({
      source: path.join(editorialDir, name),
      output: path.join(
        outputDir,
        `editorial-${String(index + 1).padStart(2, "0")}.webp`,
      ),
      width: EDITORIAL_WIDTH,
    })),
  );
}

await fs.mkdir(identityOutputRoot, { recursive: true });

for (const asset of identityAssets) {
  await assertFile(path.join(identitySourceRoot, asset.source));
}
for (const asset of patternAssets) {
  await assertFile(path.join(identitySourceRoot, asset.source));
}
for (const job of productJobs) {
  await writePhoto(job.source, job.output, job.width);
}

for (const asset of identityAssets) {
  await writeIdentity(
    path.join(identitySourceRoot, asset.source),
    path.join(identityOutputRoot, asset.output),
    asset.width,
  );
}
for (const asset of patternAssets) {
  await writePattern(
    path.join(identitySourceRoot, asset.source),
    path.join(identityOutputRoot, asset.output),
  );
}
const outputPaths = [
  ...productJobs.map((job) => job.output),
  ...identityAssets.map((asset) =>
    path.join(identityOutputRoot, asset.output),
  ),
  ...patternAssets.map((asset) =>
    path.join(identityOutputRoot, asset.output),
  ),
];
const outputStats = await Promise.all(
  outputPaths.map((outputPath) => fs.stat(outputPath)),
);
const totalBytes = outputStats.reduce((sum, stat) => sum + stat.size, 0);
const totalMiB = (totalBytes / 1024 / 1024).toFixed(2);

console.log(
  `Prepared ${productSlugs.length} products: ${productJobs.length} product assets + ${identityAssets.length + patternAssets.length} identity assets (${totalMiB} MiB total).`,
);
