import path from "node:path";
import sharp from "sharp";

const projectRoot = path.resolve(import.meta.dirname, "..");
const rivieraImages = path.join(projectRoot, "public/images/riviera");
const sourcePath = path.join(
  rivieraImages,
  "tear-red-paper-seam-v3.webp",
);
const outputPath = path.join(rivieraImages, "tear-red-paper-overlay-v4.webp");

async function preparePaperPanel(name, seed) {
  const inputPath = path.join(rivieraImages, `${name}-paper-grain-v3.webp`);
  const panelPath = path.join(rivieraImages, `${name}-paper-grain-panel-v4.webp`);
  const normalizedSource = sharp(inputPath).removeAlpha();
  const [{ data: sourceData, info }, blurredData, stats] = await Promise.all([
    normalizedSource.clone().raw().toBuffer({ resolveWithObject: true }),
    normalizedSource.clone().blur(18).raw().toBuffer(),
    normalizedSource.clone().stats(),
  ]);

  if (!info.width || !info.height || info.channels < 3) {
    throw new Error(`Could not read dimensions for ${inputPath}`);
  }

  const normalizedData = Buffer.alloc(sourceData.length);
  const means = stats.channels.slice(0, 3).map((channel) => channel.mean);

  for (let index = 0; index < sourceData.length; index += info.channels) {
    for (let channel = 0; channel < 3; channel += 1) {
      const detail = sourceData[index + channel] - blurredData[index + channel];
      normalizedData[index + channel] = Math.max(
        0,
        Math.min(255, Math.round(means[channel] + detail * 1.08)),
      );
    }
  }

  const panelSize = 2400;
  const patchWidth = 360;
  const patchHeight = 240;
  const overlapX = 100;
  const overlapY = 70;
  const stepX = patchWidth - overlapX;
  const stepY = patchHeight - overlapY;
  const sums = new Float32Array(panelSize * panelSize * 3);
  const weights = new Float32Array(panelSize * panelSize);
  let randomState = seed >>> 0;

  const random = () => {
    randomState = (1664525 * randomState + 1013904223) >>> 0;
    return randomState / 4294967296;
  };

  const feather = (position, size, overlap) => {
    if (position < overlap) {
      return Math.sin((Math.PI * position) / (2 * overlap)) ** 2;
    }
    if (position >= size - overlap) {
      return Math.sin((Math.PI * (size - 1 - position)) / (2 * overlap)) ** 2;
    }
    return 1;
  };

  for (let top = -overlapY; top < panelSize; top += stepY) {
    for (let left = -overlapX; left < panelSize; left += stepX) {
      const sourceLeft = Math.floor(random() * (info.width - patchWidth + 1));
      const sourceTop = Math.floor(random() * (info.height - patchHeight + 1));
      const flipX = random() > 0.5;
      const flipY = random() > 0.5;

      for (let patchY = 0; patchY < patchHeight; patchY += 1) {
        const outputY = top + patchY;
        if (outputY < 0 || outputY >= panelSize) continue;
        const sourceY = sourceTop + (flipY ? patchHeight - 1 - patchY : patchY);
        const weightY = feather(patchY, patchHeight, overlapY);

        for (let patchX = 0; patchX < patchWidth; patchX += 1) {
          const outputX = left + patchX;
          if (outputX < 0 || outputX >= panelSize) continue;
          const sourceX = sourceLeft + (flipX ? patchWidth - 1 - patchX : patchX);
          const weight = weightY * feather(patchX, patchWidth, overlapX);
          const outputPixel = outputY * panelSize + outputX;
          const outputIndex = outputPixel * 3;
          const sourceIndex = (sourceY * info.width + sourceX) * info.channels;

          weights[outputPixel] += weight;
          for (let channel = 0; channel < 3; channel += 1) {
            sums[outputIndex + channel] += normalizedData[sourceIndex + channel] * weight;
          }
        }
      }
    }
  }

  const panelData = Buffer.alloc(panelSize * panelSize * 3);
  for (let pixel = 0; pixel < weights.length; pixel += 1) {
    const outputIndex = pixel * 3;
    const weight = weights[pixel] || 1;
    for (let channel = 0; channel < 3; channel += 1) {
      panelData[outputIndex + channel] = Math.round(sums[outputIndex + channel] / weight);
    }
  }

  await sharp(panelData, {
    raw: {
      width: panelSize,
      height: panelSize,
      channels: 3,
    },
  })
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toFile(panelPath);

  console.log(`Prepared ${path.relative(projectRoot, panelPath)}`);
}

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

await Promise.all([
  preparePaperPanel("blue", 20260724),
  preparePaperPanel("red", 20260725),
]);
