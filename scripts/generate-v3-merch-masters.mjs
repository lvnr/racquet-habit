import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = path.join(root, "public", "brand-v3");
const outDir = path.join(root, "public", "merch-v3");

await fs.mkdir(outDir, { recursive: true });

async function squareMaster(source, target, artworkWidth, canvasWidth) {
  const artwork = await sharp(source, { density: 600 })
    .resize({ width: artworkWidth, height: artworkWidth, fit: "inside" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: canvasWidth,
      height: canvasWidth,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: artwork, gravity: "center" }])
    .png()
    .withMetadata({ density: 300 })
    .toFile(path.join(outDir, target));
}

await Promise.all([
  squareMaster(
    path.join(brandDir, "logo-rh-monogram-embroidery-black.svg"),
    "rh-monogram-embroidery-black-1800.png",
    1600,
    1800,
  ),
  squareMaster(
    path.join(brandDir, "logo-rh-monogram-embroidery-ivory.svg"),
    "rh-monogram-embroidery-ivory-1800.png",
    1600,
    1800,
  ),
  squareMaster(
    path.join(brandDir, "logo-rh-monogram.svg"),
    "rh-monogram-screenprint-green-3600.png",
    3000,
    3600,
  ),
]);

console.log("Generated Racquet Habit v3 supplier-ready monogram masters.");
