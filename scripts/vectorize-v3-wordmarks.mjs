import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "design", "brand-v3", "concepts", "01-wordmark-reset-comparison.png");
const outDir = path.join(root, "design", "brand-v3", "wordmark-selected");
const cropDir = path.join(outDir, "raster-crops");
const maskDir = path.join(outDir, "masks");
const vectorDir = path.join(outDir, "vectors");
const publicDir = path.join(root, "public", "brand-v3");
const exportDir = path.join(publicDir, "exports");
const GREEN = "#103C2C";
const IVORY = "#F3EBD8";
const PURPLE = "#4E3265";
const RED = "#B83D34";

await Promise.all([outDir, cropDir, maskDir, vectorDir, publicDir, exportDir].map((directory) => fs.mkdir(directory, { recursive: true })));

const items = [
  {
    id: "primary-editorial",
    label: "Primary editorial / Direction C",
    box: { left: 430, top: 650, width: 690, height: 292 },
  },
  {
    id: "primary-horizontal",
    label: "Horizontal signature / Direction A",
    box: { left: 170, top: 105, width: 1215, height: 185 },
  },
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

function normalizePotrace(svg, title, fill = GREEN) {
  return svg
    .replace(/<metadata>[\s\S]*?<\/metadata>/, `<title>${title}</title>`)
    .replace(/fill="#000000"/g, `fill="${fill}"`)
    .replace(/<svg ([^>]*?)>/, `<svg $1 role="img" aria-label="${title}">`);
}

function recolor(svg, color, title) {
  return svg
    .replaceAll(GREEN, color)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/aria-label="[^"]*"/, `aria-label="${title}"`);
}

const results = [];

for (const item of items) {
  const crop = await sharp(source)
    .extract(item.box)
    .extend({ top: 30, right: 30, bottom: 30, left: 30, background: IVORY })
    .png()
    .toBuffer();
  const cropPath = path.join(cropDir, `${item.id}.png`);
  await fs.writeFile(cropPath, crop);

  const { data, info } = await sharp(crop)
    .greyscale()
    .threshold(166)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const maskPath = path.join(maskDir, `${item.id}.png`);
  const pbmPath = path.join(maskDir, `${item.id}.pbm`);
  await sharp(data, { raw: info }).png().toFile(maskPath);
  await fs.writeFile(pbmPath, toPbm(data, info.width, info.height));

  const vectorPath = path.join(vectorDir, `logo-${item.id}.svg`);
  await execFileAsync("potrace", [
    pbmPath,
    "-s",
    "-o",
    vectorPath,
    "--turdsize",
    "5",
    "--alphamax",
    "1.02",
    "--opttolerance",
    "0.12",
  ]);

  const title = `Racquet Habit ${item.label}`;
  const vector = normalizePotrace(await fs.readFile(vectorPath, "utf8"), title);
  const ivoryVector = recolor(vector, IVORY, `${title} — ivory`);
  const blackVector = recolor(vector, "#000000", `${title} — black`);
  await fs.writeFile(vectorPath, vector);
  await fs.writeFile(path.join(vectorDir, `logo-${item.id}-ivory.svg`), ivoryVector);
  await fs.writeFile(path.join(vectorDir, `logo-${item.id}-black.svg`), blackVector);
  await fs.writeFile(path.join(publicDir, `logo-${item.id}.svg`), vector);
  await fs.writeFile(path.join(publicDir, `logo-${item.id}-ivory.svg`), ivoryVector);
  await fs.writeFile(path.join(publicDir, `logo-${item.id}-black.svg`), blackVector);

  const baseWidth = item.id === "primary-editorial" ? 600 : 720;
  for (const [variant, artwork] of [["", vector], ["-ivory", ivoryVector], ["-black", blackVector]]) {
    for (const scale of [1, 2, 4]) {
      await sharp(Buffer.from(artwork), { density: 144, limitInputPixels: false })
        .resize({ width: baseWidth * scale, fit: "contain" })
        .png()
        .toFile(path.join(exportDir, `logo-${item.id}${variant}@${scale}x.png`));
    }
  }

  results.push({ ...item, crop, vector });
}

const proofCells = [];
for (let index = 0; index < results.length; index += 1) {
  const item = results[index];
  const top = 190 + index * 520;
  const sourcePreview = await sharp(item.crop)
    .resize({ width: 820, height: 270, fit: "contain", background: IVORY })
    .flatten({ background: IVORY })
    .png()
    .toBuffer();
  const vectorPreview = await sharp(Buffer.from(item.vector), { density: 144, limitInputPixels: false })
    .resize({ width: 820, height: 270, fit: "contain", background: IVORY })
    .flatten({ background: IVORY })
    .png()
    .toBuffer();
  const small = await sharp(Buffer.from(item.vector), { density: 144, limitInputPixels: false })
    .resize({ width: 160, fit: "contain", background: IVORY })
    .flatten({ background: IVORY })
    .png()
    .toBuffer();

  proofCells.push(
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1780" height="500">
        <rect width="1780" height="500" fill="${IVORY}" stroke="${GREEN}" stroke-width="2"/>
        <text x="30" y="42" font-family="Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="3" fill="${PURPLE}">${String(index + 1).padStart(2, "0")} / ${item.label.toUpperCase()}</text>
        <text x="30" y="82" font-family="Arial, sans-serif" font-size="13" letter-spacing="3" fill="${GREEN}">GPT-IMAGE SOURCE</text>
        <text x="930" y="82" font-family="Arial, sans-serif" font-size="13" letter-spacing="3" fill="${GREEN}">VECTOR RECONSTRUCTION</text>
        <text x="1545" y="455" font-family="Arial, sans-serif" font-size="12" letter-spacing="2" fill="${GREEN}">160 PX TEST</text>
        <circle cx="1730" cy="44" r="6" fill="${RED}"/>
      </svg>`),
      left: 70,
      top,
    },
    { input: sourcePreview, left: 95, top: top + 115 },
    { input: vectorPreview, left: 955, top: top + 115 },
    { input: small, left: 1585, top: top + 315 },
  );
}

const proof = await sharp({
  create: { width: 1920, height: 1300, channels: 3, background: IVORY },
})
  .composite([
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="150">
        <rect width="1920" height="150" fill="${GREEN}"/>
        <text x="70" y="62" font-family="Georgia, serif" font-size="43" fill="${IVORY}">Wordmark / Raster-to-Vector Proof</text>
        <text x="70" y="108" font-family="Arial, sans-serif" font-size="15" letter-spacing="4" fill="${IVORY}">DIRECTION C PRIMARY · DIRECTION A HORIZONTAL · ONE-COLOUR PATH RECONSTRUCTION</text>
      </svg>`),
      left: 0,
      top: 0,
    },
    ...proofCells,
  ])
  .png()
  .toBuffer();

await fs.writeFile(path.join(outDir, "wordmark-vector-proof.png"), proof);
console.log("Vectorized selected Racquet Habit wordmarks.");
