import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const rootPath = fileURLToPath(new URL("../", import.meta.url));
const outputRoot = path.join(rootPath, "design", "brand-fixed", "production");
const snapshotDate = new Date().toISOString().slice(0, 10);

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

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function pickVariant(variants) {
  const preferredSizes = ["M", "One size", "40 oz", "20oz", "36″×72″", "iPhone 17 Pro Max"];
  for (const size of preferredSizes) {
    const match = variants.find((variant) => variant.attributes?.size?.name === size);
    if (match) return match;
  }
  return variants[0];
}

async function downloadReference(url, destination) {
  const temporary = `${destination}.download`;
  let lastError;

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`Reference download failed (${response.status}): ${url}`);
      const source = Buffer.from(await response.arrayBuffer());
      await sharp(source).rotate().webp({ quality: 96, effort: 6 }).toFile(temporary);
      await rename(temporary, destination);
      return;
    } catch (error) {
      lastError = error;
      await rm(temporary, { force: true });
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

const snapshotProducts = [];

for (const product of products) {
  const productDir = path.join(outputRoot, product.slug);
  const manifestPath = path.join(productDir, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const variantsByColor = new Map();

  for (const variant of product.variants || []) {
    const color = variant.attributes?.color?.name;
    if (!color) continue;
    const list = variantsByColor.get(color) || [];
    list.push(variant);
    variantsByColor.set(color, list);
  }

  const colorReferences = await Promise.all(
    [...variantsByColor].map(async ([color, colorVariants]) => {
      const variant = pickVariant(colorVariants);
      const hostedUrls = [...new Set((variant.images || []).map(imageUrl).filter(Boolean))].slice(0, 2);
      const colorSlug = slugify(color);
      const referenceDir = path.join(productDir, "references", "fourthwall", "colors", colorSlug);
      await mkdir(referenceDir, { recursive: true });

      const localReferences = hostedUrls.map((url, index) => {
        const filename = `reference-${String(index + 1).padStart(2, "0")}.webp`;
        return {
          url,
          filename,
          localReference: path.posix.join(
            "references",
            "fourthwall",
            "colors",
            colorSlug,
            filename,
          ),
        };
      });
      await Promise.all(
        localReferences.map(({ url, filename }) =>
          downloadReference(url, path.join(referenceDir, filename)),
        ),
      );

      return {
        color,
        colorSlug,
        colorHex: variant.attributes?.color?.swatch,
        selectedVariant: {
          id: variant.id,
          name: variant.name,
          size: variant.attributes?.size?.name,
        },
        hostedUrls,
        localReferences: localReferences.map(({ localReference }) => localReference),
      };
    }),
  );

  manifest.snapshotDate = snapshotDate;
  manifest.availableColors = [...variantsByColor.keys()];
  manifest.colorReferences = colorReferences;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  snapshotProducts.push({
    id: product.id,
    name: product.name,
    slug: product.slug,
    availableColors: manifest.availableColors,
    colorReferences,
  });

  console.log(`${product.slug}: ${colorReferences.length} color reference sets`);
}

const snapshotPath = path.join(outputRoot, `fourthwall-public-catalog-${snapshotDate}.json`);
await writeFile(
  snapshotPath,
  `${JSON.stringify(
    { snapshotDate, count: snapshotProducts.length, products: snapshotProducts },
    null,
    2,
  )}\n`,
);

console.log(`Saved current color references for ${snapshotProducts.length} products`);
