import path from "node:path";
import sharp from "sharp";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(
  projectRoot,
  "public/images/riviera/tear-red-paper-seam-v3.webp",
);
const outputPath = path.join(
  projectRoot,
  "public/images/riviera/tear-red-paper-overlay-v4.webp",
);

const source = sharp(sourcePath).ensureAlpha();
const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });

for (let x = 0; x < info.width; x += 1) {
  let paperEdge = Math.round(info.height * 0.45);

  for (let y = 0; y < info.height * 0.72; y += 1) {
    const index = (y * info.width + x) * info.channels;
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];

    if (red > 130 && red > green * 1.3 && red > blue * 1.18) {
      paperEdge = y;
    }
  }

  const solidUntil = paperEdge + 18;
  const transparentFrom = paperEdge + 62;

  for (let y = 0; y < info.height; y += 1) {
    const index = (y * info.width + x) * info.channels;

    if (y <= solidUntil) {
      data[index + 3] = 255;
    } else if (y >= transparentFrom) {
      data[index + 3] = 0;
    } else {
      data[index + 3] = Math.round(
        255 * (1 - (y - solidUntil) / (transparentFrom - solidUntil)),
      );
    }
  }
}

await sharp(data, {
  raw: {
    width: info.width,
    height: info.height,
    channels: info.channels,
  },
})
  .webp({ quality: 94, alphaQuality: 100 })
  .toFile(outputPath);

console.log(`Prepared ${path.relative(projectRoot, outputPath)}`);
