import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "images", "v4");
const campaignDir = path.join(root, "design", "brand-v4", "campaign");
const graphicsDir = path.join(root, "design", "brand-v4", "graphics");

await fs.mkdir(outDir, { recursive: true });

const outputs = [
  {
    source: path.join(campaignDir, "campaign-a-impossible-overhead.png"),
    name: "campaign-hero",
    width: 2400,
  },
  {
    source: path.join(campaignDir, "campaign-a-impossible-overhead.png"),
    name: "campaign-hero-mobile",
    width: 1200,
    height: 1500,
    position: "centre",
  },
  {
    source: path.join(campaignDir, "campaign-b-felt-halo-portrait.png"),
    name: "campaign-felt-halo",
    width: 1400,
  },
  {
    source: path.join(campaignDir, "campaign-c-social-baseline.png"),
    name: "campaign-social-baseline",
    width: 2200,
  },
  {
    source: path.join(graphicsDir, "01-folded-court-study.png"),
    name: "graphic-folded-court",
    width: 1400,
  },
  {
    source: path.join(graphicsDir, "02-racquet-obsession-study.png"),
    name: "graphic-racquet-obsession",
    width: 1400,
  },
  {
    source: path.join(graphicsDir, "03-one-more-set-collision.png"),
    name: "graphic-one-more-set",
    width: 1400,
  },
];

for (const output of outputs) {
  const image = sharp(output.source, { limitInputPixels: false }).rotate();
  const resized = output.height
    ? image.resize({
        width: output.width,
        height: output.height,
        fit: "cover",
        position: output.position || "centre",
      })
    : image.resize({ width: output.width, fit: "inside", withoutEnlargement: true });

  await Promise.all([
    resized.clone().avif({ quality: 78, effort: 5 }).toFile(path.join(outDir, `${output.name}.avif`)),
    resized.clone().webp({ quality: 88, effort: 5 }).toFile(path.join(outDir, `${output.name}.webp`)),
    resized.clone().jpeg({ quality: 91, mozjpeg: true }).toFile(path.join(outDir, `${output.name}.jpg`)),
  ]);
}

console.log(`Prepared ${outputs.length} Racquet Habit v4 raster assets.`);
