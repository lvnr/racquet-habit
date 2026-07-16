import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const designDir = path.join(root, "design", "brand-v3");
const source = path.join(designDir, "concepts", "06-court-illustration-technical-guide.png");
const outDir = path.join(designDir, "illustrations-selected");
const cropDir = path.join(outDir, "raster-crops");
const maskDir = path.join(outDir, "masks");
const vectorDir = path.join(outDir, "vectors");
const publicDir = path.join(root, "public", "brand-v3", "illustrations");
const GREEN = "#103C2C";
const IVORY = "#F3EBD8";

await Promise.all([cropDir, maskDir, vectorDir, publicDir].map((dir) => fs.mkdir(dir, { recursive: true })));

const items = [
  { id: "chair", label: "Umpire chair", box: { left: 84, top: 166, width: 286, height: 344 } },
  { id: "scoreboard", label: "Flip scoreboard", box: { left: 444, top: 224, width: 324, height: 275 } },
  { id: "racquet", label: "Classic racquet", box: { left: 848, top: 93, width: 245, height: 402 } },
  { id: "ball-can", label: "Ball can", box: { left: 1190, top: 144, width: 230, height: 357 } },
  { id: "bench", label: "Court bench", box: { left: 54, top: 594, width: 375, height: 300 } },
  { id: "net-post", label: "Net post", box: { left: 472, top: 586, width: 300, height: 318 } },
  { id: "towel", label: "Folded towel", box: { left: 792, top: 681, width: 315, height: 226 } },
  { id: "court-bag", label: "Court bag", box: { left: 1132, top: 612, width: 340, height: 302 } },
];

function toPbm(raw, width, height) {
  const bytesPerRow = Math.ceil(width / 8);
  const data = Buffer.alloc(bytesPerRow * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (raw[y * width + x] < 128) {
        data[y * bytesPerRow + Math.floor(x / 8)] |= 1 << (7 - (x % 8));
      }
    }
  }
  return Buffer.concat([Buffer.from(`P4\n${width} ${height}\n`), data]);
}

function normalizePotrace(svg, title) {
  return svg
    .replace(/<metadata>[\s\S]*?<\/metadata>/, `<title>${title}</title>`)
    .replace(/fill="#000000"/g, `fill="${GREEN}"`)
    .replace(/<svg ([^>]*?)>/, `<svg $1 role="img" aria-label="${title}">`);
}

const proofs = [];

for (const item of items) {
  console.log(`Processing ${item.id}…`);
  const cropPath = path.join(cropDir, `${item.id}.png`);
  const maskPath = path.join(maskDir, `${item.id}.png`);
  const pbmPath = path.join(maskDir, `${item.id}.pbm`);
  const vectorPath = path.join(vectorDir, `illustration-${item.id}.svg`);

  const crop = await sharp(source)
    .extract(item.box)
    .extend({ top: 24, right: 24, bottom: 24, left: 24, background: IVORY })
    .png()
    .toBuffer();
  await fs.writeFile(cropPath, crop);

  const { data, info } = await sharp(crop)
    .greyscale()
    .threshold(170)
    .raw()
    .toBuffer({ resolveWithObject: true });
  await sharp(data, { raw: info }).png().toFile(maskPath);
  await fs.writeFile(pbmPath, toPbm(data, info.width, info.height));

  await execFileAsync("potrace", [
    pbmPath,
    "-s",
    "-o",
    vectorPath,
    "--turdsize",
    "3",
    "--alphamax",
    "1.05",
    "--opttolerance",
    "0.15",
  ]);

  const normalized = normalizePotrace(await fs.readFile(vectorPath, "utf8"), `Racquet Habit ${item.label} illustration`);
  await fs.writeFile(vectorPath, normalized);
  await fs.writeFile(path.join(publicDir, `illustration-${item.id}.svg`), normalized);

  const rasterPreview = await sharp(crop)
    .resize({ width: 390, height: 215, fit: "contain", background: IVORY })
    .flatten({ background: IVORY })
    .png()
    .toBuffer();
  const vectorPreview = await sharp(Buffer.from(normalized), { density: 360 })
    .resize({ width: 390, height: 215, fit: "contain", background: IVORY })
    .flatten({ background: IVORY })
    .png()
    .toBuffer();
  proofs.push({ ...item, rasterPreview, vectorPreview });
}

const composites = [];
for (let index = 0; index < proofs.length; index += 1) {
  const row = Math.floor(index / 4);
  const column = index % 4;
  const left = 62 + column * 465;
  const top = 180 + row * 565;
  composites.push({
    input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="430" height="565">
      <rect width="430" height="565" fill="${IVORY}"/>
      <rect x="1" y="1" width="428" height="563" fill="none" stroke="${GREEN}" stroke-width="2"/>
      <text x="20" y="35" font-family="Arial, sans-serif" font-size="15" letter-spacing="3" fill="${GREEN}">${String(index + 1).padStart(2, "0")} / ${proofs[index].label.toUpperCase()}</text>
      <text x="20" y="62" font-family="Arial, sans-serif" font-size="12" letter-spacing="3" fill="${GREEN}">GPT-IMAGE SOURCE</text>
      <path d="M20 288 H410" stroke="${GREEN}" stroke-width="1" opacity=".5"/>
      <text x="20" y="305" font-family="Arial, sans-serif" font-size="12" letter-spacing="3" fill="${GREEN}">VECTOR RECONSTRUCTION</text>
    </svg>`),
    left,
    top,
  });
  composites.push({ input: proofs[index].rasterPreview, left: left + 12, top: top + 70 });
  composites.push({ input: proofs[index].vectorPreview, left: left + 12, top: top + 310 });
}

const board = await sharp({
  create: { width: 1984, height: 1370, channels: 3, background: IVORY },
})
  .composite([
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1984" height="150">
        <rect width="1984" height="150" fill="${GREEN}"/>
        <text x="64" y="65" font-family="Georgia, serif" font-size="43" fill="${IVORY}">Court Objects / Raster-to-Vector Proof</text>
        <text x="64" y="108" font-family="Arial, sans-serif" font-size="15" letter-spacing="4" fill="${IVORY}">SELECTED TECHNICAL-HUMAN LINEWORK · THRESHOLD + PATH RECONSTRUCTION</text>
      </svg>`),
      left: 0,
      top: 0,
    },
    ...composites,
  ])
  .png()
  .toBuffer();

await fs.writeFile(path.join(outDir, "court-illustrations-vector-proof.png"), board);
console.log("Vectorized Racquet Habit court-object illustrations.");
