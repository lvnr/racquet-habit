import { mkdir } from "node:fs/promises";
import { glob } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceRoot = path.resolve("public/images/products/white-court");
const outputRoot = path.resolve("public/images/pinterest-catalog");
let generated = 0;

for await (const source of glob("public/images/products/white-court/**/catalog-front.webp")) {
  const relative = path.relative(sourceRoot, path.resolve(source));
  const segments = relative.split(path.sep);
  const productSlug = segments[0];
  const colorIndex = segments.indexOf("colors");
  const colorSlug = colorIndex >= 0 ? segments[colorIndex + 1] : "default";
  const destinationDirectory = path.join(outputRoot, productSlug);
  const destination = path.join(destinationDirectory, `${colorSlug}.jpg`);
  await mkdir(destinationDirectory, { recursive: true });

  const metadata = await sharp(source).metadata();
  const sourceAspect = (metadata.width || 1) / (metadata.height || 1);
  const image = sharp(source);
  if (sourceAspect > 1.1) image.rotate(270);
  await image
    .resize(1000, 1500, { fit: "cover", position: "attention" })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(destination);
  generated += 1;
}

console.log(`Generated ${generated} Pinterest catalog images in ${outputRoot}`);
