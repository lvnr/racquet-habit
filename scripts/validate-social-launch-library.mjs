import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const LAUNCH = path.join(ROOT, "marketing/assets/launch");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function expectedSize(file) {
  const relative = path.relative(LAUNCH, file);
  if (relative.startsWith("pinterest/")) return [1000, 1500];
  if (relative.startsWith("stories/")) return [1080, 1920];
  if (relative.startsWith("highlights/")) return [1080, 1920];
  if (relative.startsWith("video-keyframes/")) return [1080, 1920];
  if (relative.includes("IG06-one-more-set/") || relative.includes("IG11-pov-one-more-set/")) {
    return [1080, 1920];
  }
  if (relative.startsWith("instagram/")) return [1080, 1350];
  if (relative.startsWith("facebook/FB03-one-more-set/")) return [1080, 1920];
  if (relative.startsWith("facebook/")) return [1080, 1350];
  if (relative === "P1-hero-4x5-v1.png") return [1080, 1350];
  return null;
}

const required = [
  "README.md",
  "P1-hero-4x5-v1.png",
  "instagram/IG05-out-of-office/IG05-out-of-office-01-professional.png",
  "instagram/IG05-out-of-office/IG05-out-of-office-02-professional.png",
  "instagram/IG06-one-more-set/IG06-cover.png",
  "instagram/IG08-serve-chilled/IG08-serve-chilled-01-still-life.png",
  "instagram/IG10-tennis-lunch-tennis/IG10-01-authentic.png",
  "instagram/IG10-tennis-lunch-tennis/IG10-03-professional.png",
  "instagram/IG11-pov-one-more-set/IG11-cover.png",
  "video-keyframes/V01-one-more-set/V01-01-dawn-entry.png",
  "video-keyframes/V01-one-more-set/V01-05-night-close.png",
  "video-keyframes/V04-after-last-set/V04-01-empty-court.png",
  "video-keyframes/V11-bag-dump/V11-01-bag-dump.png",
  "video-keyframes/V12-hydration/V12-01-products.png",
  "00-review/01-instagram-publish-order.jpg",
  "00-review/02-instagram-profile-grid.jpg",
  "00-review/03-authentic-vs-professional.jpg",
  "00-review/04-video-keyframes.jpg",
  "00-review/05-pinterest-editorial.jpg",
];

const errors = [];
for (const relative of required) {
  try {
    await fs.access(path.join(LAUNCH, relative));
  } catch {
    errors.push(`missing required file: ${relative}`);
  }
}

const allFiles = await walk(LAUNCH);
const finalPngs = allFiles.filter(
  (file) =>
    file.endsWith(".png") &&
    !file.includes(`${path.sep}source${path.sep}`) &&
    expectedSize(file),
);

for (const file of finalPngs) {
  try {
    const metadata = await sharp(file).metadata();
    const expected = expectedSize(file);
    if (metadata.width !== expected[0] || metadata.height !== expected[1]) {
      errors.push(
        `wrong size: ${path.relative(LAUNCH, file)} = ${metadata.width}x${metadata.height}, expected ${expected[0]}x${expected[1]}`,
      );
    }
  } catch (error) {
    errors.push(`unreadable image: ${path.relative(LAUNCH, file)}: ${error.message}`);
  }
}

const counts = {};
for (const area of ["instagram", "pinterest", "stories", "highlights", "video-keyframes", "facebook"]) {
  counts[area] = finalPngs.filter((file) =>
    path.relative(LAUNCH, file).startsWith(`${area}${path.sep}`),
  ).length;
}

const expectedCounts = {
  instagram: 38,
  pinterest: 36,
  stories: 8,
  highlights: 6,
  "video-keyframes": 8,
  facebook: 13,
};

for (const [area, expected] of Object.entries(expectedCounts)) {
  if (counts[area] !== expected) {
    errors.push(`wrong ${area} count: ${counts[area]}, expected ${expected}`);
  }
}

if (errors.length) {
  console.error(`Launch library validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Launch library validation passed.");
console.log(JSON.stringify({ counts, checkedFinalPngs: finalPngs.length }, null, 2));
