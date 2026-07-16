import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicRoot = path.resolve("public");
const roots = [
  path.join(publicRoot, "brand-v3"),
  path.join(publicRoot, "merch-v3"),
];
const expected = [
  "brand-v3/logo-primary-editorial.svg",
  "brand-v3/logo-primary-horizontal.svg",
  "brand-v3/logo-rh-monogram.svg",
  "brand-v3/logo-rh-monogram-ivory.svg",
  "brand-v3/logo-rh-monogram-black.svg",
  "brand-v3/logo-rh-monogram-embroidery.svg",
  "brand-v3/logo-society-patch.svg",
  "brand-v3/logo-society-patch-one-colour.svg",
  "brand-v3/logo-racquet-flourish.svg",
  "brand-v3/mark-bounce.svg",
  "brand-v3/mark-rh-icon.svg",
  "brand-v3/patterns/pattern-championship-stripe.svg",
  "brand-v3/patterns/pattern-string-grid.svg",
  "brand-v3/patterns/pattern-court-frame.svg",
  "brand-v3/patterns/pattern-ball-seam.svg",
  "brand-v3/patterns/pattern-dash-field.svg",
  "brand-v3/illustrations/illustration-chair.svg",
  "brand-v3/illustrations/illustration-scoreboard.svg",
  "brand-v3/illustrations/illustration-racquet.svg",
  "brand-v3/illustrations/illustration-ball-can.svg",
  "brand-v3/illustrations/illustration-bench.svg",
  "brand-v3/illustrations/illustration-net-post.svg",
  "brand-v3/illustrations/illustration-towel.svg",
  "brand-v3/illustrations/illustration-court-bag.svg",
  "merch-v3/vectors/apparel-society-tee-back.svg",
  "merch-v3/vectors/apparel-last-set-back.svg",
  "merch-v3/vectors/accessory-championship-towel.svg",
  "merch-v3/vectors/accessory-society-tote.svg",
  "merch-v3/vectors/drinkware-one-more-set-mug-wrap.svg",
  "merch-v3/vectors/drinkware-court-vessel-wrap.svg",
  "merch-v3/vectors/hospitality-after-set-coffee-label.svg",
  "merch-v3/vectors/hospitality-fifth-set-drink-label.svg",
];

const errors = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

for (const relativePath of expected) {
  try {
    if (!(await stat(path.join(publicRoot, relativePath))).isFile()) {
      errors.push(`${relativePath}: not a file`);
    }
  } catch {
    errors.push(`${relativePath}: missing`);
  }
}

const files = (await Promise.all(roots.map(walk))).flat();
for (const file of files) {
  const relativePath = path.relative(publicRoot, file);
  if (file.endsWith(".svg")) {
    const source = await readFile(file, "utf8");
    if (!/<svg\b/.test(source)) errors.push(`${relativePath}: missing SVG root`);
    if (!/viewBox=["'][^"']+["']/.test(source)) errors.push(`${relativePath}: missing viewBox`);
    if (!/(aria-label|aria-labelledby)=/.test(source)) errors.push(`${relativePath}: missing accessible name`);
    if (/<text\b/i.test(source)) errors.push(`${relativePath}: contains live text`);
    if (/font-family\s*=|@font-face|<foreignObject\b/i.test(source)) {
      errors.push(`${relativePath}: contains a font or foreign object dependency`);
    }
    if (/(?:href|src)=["'](?:https?:|data:)/i.test(source)) {
      errors.push(`${relativePath}: contains an embedded or remote dependency`);
    }
    if (/<script\b|\son\w+=/i.test(source)) errors.push(`${relativePath}: contains scriptable content`);
    if (/NaN|undefined|Infinity/.test(source)) errors.push(`${relativePath}: contains invalid numeric output`);
  }

  if (/\.(?:png|jpe?g|webp)$/i.test(file)) {
    try {
      const metadata = await sharp(file).metadata();
      if (!metadata.width || !metadata.height) errors.push(`${relativePath}: missing raster dimensions`);
    } catch (error) {
      errors.push(`${relativePath}: unreadable raster (${error.message})`);
    }
  }
}

if (errors.length) {
  console.error(`v3 asset validation failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`v3 asset validation passed (${files.length} files checked)`);
}
