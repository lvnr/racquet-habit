import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const rootPath = fileURLToPath(new URL("../", import.meta.url));
const outputRoot = path.join(rootPath, "design", "brand-fixed", "production");
const snapshotDate = "2026-07-27";

const preferredSelections = {
  "racquet-habit-night-court-rh-monogram-tee": { color: "Navy", size: "M" },
  "racquet-habit-minimal-black-crop-top": { color: "Natural", size: "M" },
  "minimal-green-monogram-crop-top": { color: "Natural", size: "M" },
  "baseline-plaque-tee": { color: "Ivory", size: "M" },
  "society-monogram-founding-issue-hat": { color: "Maroon", size: "One size" },
  "society-monogram-founding-issue-crop-tee": { color: "Natural", size: "M" },
  "love-cherries-oversized-tee-2": { color: "White", size: "M" },
  "racquets-sunshine-something-bubbly-oversized-night-tee": { color: "Black", size: "M" },
  "racquets-sunshine-something-bubbly-crop-tee": { color: "White", size: "M" },
  "racquets-sunshine-something-bubbly-oversized-tee": { color: "White", size: "M" },
  "serve-chilled-tumbler": { color: "White", size: "20oz" },
  "court-side-hydration-travel-mug-with-a-handle": { color: "White", size: "40 oz" },
  "tennis-lunch-tennis-crop-tee": { color: "Brown", size: "M" },
  "tennis-lunch-tennis-tee": { color: "Midnight", size: "M" },
  "something-cold-organic-court-tote": { color: "Oyster", size: "One size" },
  "racquets-sunshine-something-cold-beach-towel": { color: "White", size: "36″×72″" },
  "out-of-office-court-cap": { color: "Maroon", size: "One size" },
  "love-cherries-magsafe-case": { color: "Glossy", size: "iPhone 17 Pro Max" },
  "love-cherries-crop-tee": { color: "Pale Pink", size: "M" },
  "love-cherries-oversized-tee": { color: "Ecru", size: "M" },
  "tennis-is-my-rest-day-tee-dtfx": { color: "Butter", size: "M" },
  "emotional-support-racquet-oversized-tee": { color: "Ecru", size: "M" },
  "signed-rally-founding-issue-crop-tee": { color: "Ecru", size: "M" },
  "signed-rally-founding-issue-oversized-tee": { color: "Ecru", size: "M" },
};

function parseVars(text) {
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index);
        let value = line.slice(index + 1);
        try {
          value = JSON.parse(value);
        } catch {
          // Keep unquoted values as-is.
        }
        return [key, value];
      }),
  );
}

function imageUrl(image) {
  return image?.url || image?.transformedUrl;
}

function variantMatches(variant, selection) {
  const color = variant.attributes?.color?.name;
  const size = variant.attributes?.size?.name;
  return (!selection.color || color === selection.color) && (!selection.size || size === selection.size);
}

async function downloadReference(url, destination) {
  try {
    await access(destination);
    return;
  } catch {
    // Download missing references.
  }

  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`Reference download failed (${response.status}): ${url}`);
      const source = Buffer.from(await response.arrayBuffer());
      await sharp(source)
        .rotate()
        .webp({ quality: 96, effort: 6 })
        .toFile(destination);
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_500));
    }
  }
  throw lastError;
}

const vars = parseVars(await readFile(path.join(rootPath, ".dev.vars"), "utf8"));
const token = vars.FOURTHWALL_STOREFRONT_TOKEN;
if (!token) throw new Error("FOURTHWALL_STOREFRONT_TOKEN is missing from .dev.vars");

const endpoint = new URL("https://storefront-api.fourthwall.com/v1/collections/all/products");
endpoint.searchParams.set("size", "50");
endpoint.searchParams.set("page", "0");
endpoint.searchParams.set("storefront_token", token);

const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
if (!response.ok) throw new Error(`Fourthwall storefront request failed (${response.status})`);
const payload = await response.json();
const products = (payload.results || []).filter((product) => product.state?.type === "AVAILABLE");

await mkdir(outputRoot, { recursive: true });
const catalogSnapshot = [];

for (const product of products) {
  const selection = preferredSelections[product.slug] || {};
  const selectedVariant =
    (product.variants || []).find((variant) => variantMatches(variant, selection)) ||
    (product.variants || []).find((variant) => !selection.color || variant.attributes?.color?.name === selection.color) ||
    product.variants?.[0];

  if (!selectedVariant) throw new Error(`No variant found for ${product.name}`);

  const productDir = path.join(outputRoot, product.slug);
  const referenceDir = path.join(productDir, "references", "fourthwall");
  await mkdir(referenceDir, { recursive: true });

  const hostedImages = [
    ...(selectedVariant.images || []).map(imageUrl),
    ...(product.images || []).map(imageUrl),
  ].filter(Boolean);
  const uniqueImages = [...new Set(hostedImages)].slice(0, 10);
  const localReferences = [];

  for (const [index, url] of uniqueImages.entries()) {
    const filename = `reference-${String(index + 1).padStart(2, "0")}.webp`;
    await downloadReference(url, path.join(referenceDir, filename));
    localReferences.push(`references/fourthwall/${filename}`);
  }

  const variants = (product.variants || []).map((variant) => ({
    id: variant.id,
    name: variant.name,
    color: variant.attributes?.color?.name,
    colorHex: variant.attributes?.color?.swatch,
    size: variant.attributes?.size?.name,
    state: variant.stock?.type,
    hostedImages: (variant.images || []).map(imageUrl).filter(Boolean),
  }));

  const manifest = {
    snapshotDate,
    source: "Fourthwall live storefront API",
    id: product.id,
    name: product.name,
    slug: product.slug,
    state: product.state?.type,
    selectedVariant: {
      id: selectedVariant.id,
      name: selectedVariant.name,
      color: selectedVariant.attributes?.color?.name,
      colorHex: selectedVariant.attributes?.color?.swatch,
      size: selectedVariant.attributes?.size?.name,
    },
    availableColors: [...new Set(variants.map((variant) => variant.color).filter(Boolean))],
    availableSizes: [...new Set(variants.map((variant) => variant.size).filter(Boolean))],
    localReferences,
    productHostedImages: (product.images || []).map(imageUrl).filter(Boolean),
    variants,
    shotPlan: {
      premiumCatalog: ["catalog-front", "catalog-back-or-secondary-angle"],
      preservationEditorial: ["editorial-heritage-01", "editorial-heritage-02", "editorial-heritage-03"],
      courtArchiveStudio: ["editorial-archive-01", "editorial-archive-02", "editorial-archive-03"],
    },
  };

  await writeFile(path.join(productDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  catalogSnapshot.push({
    id: product.id,
    name: product.name,
    slug: product.slug,
    selectedVariant: manifest.selectedVariant,
    availableColors: manifest.availableColors,
    availableSizes: manifest.availableSizes,
    localReferences,
  });
  console.log(`${product.slug}: ${localReferences.length} references (${manifest.selectedVariant.color}, ${manifest.selectedVariant.size})`);
}

await writeFile(
  path.join(outputRoot, `fourthwall-public-catalog-${snapshotDate}.json`),
  `${JSON.stringify({ snapshotDate, count: catalogSnapshot.length, products: catalogSnapshot }, null, 2)}\n`,
);

console.log(`Saved ${catalogSnapshot.length} public products to ${outputRoot}`);
