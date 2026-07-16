import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "design", "brand-v3", "service-arc-selected");
const publicDir = path.join(root, "public", "brand-v3");
const exportDir = path.join(publicDir, "exports");
const GREEN = "#103C2C";
const IVORY = "#F3EBD8";
const PURPLE = "#4E3265";
const RED = "#B83D34";

await Promise.all([outDir, publicDir, exportDir].map((directory) => fs.mkdir(directory, { recursive: true })));

function arcSvg(color, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 280" role="img" aria-label="${label}">
  <path d="M20 62 C218 10 377 42 554 184 C620 237 672 262 722 253" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"/>
  <circle cx="739" cy="252" r="8" fill="${color}"/>
  <path d="M761 243 C828 216 911 142 1080 34" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"/>
</svg>\n`;
}

function bounceSvg(color, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${label}">
  <g fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round">
    <path d="M32 3 V17"/>
    <path d="M52.5 11.5 L42.5 21.5"/>
    <path d="M61 32 H47"/>
    <path d="M52.5 52.5 L42.5 42.5"/>
    <path d="M32 61 V47"/>
    <path d="M11.5 52.5 L21.5 42.5"/>
    <path d="M3 32 H17"/>
    <path d="M11.5 11.5 L21.5 21.5"/>
  </g>
</svg>\n`;
}

const variants = [
  ["", GREEN, "Racquet Habit service arc"],
  ["-ivory", IVORY, "Racquet Habit service arc — ivory"],
  ["-black", "#000000", "Racquet Habit service arc — black"],
];

for (const [suffix, color, label] of variants) {
  const arc = arcSvg(color, label);
  const bounce = bounceSvg(color, `${label} bounce mark`);
  await fs.writeFile(path.join(outDir, `logo-racquet-flourish${suffix}.svg`), arc);
  await fs.writeFile(path.join(outDir, `mark-bounce${suffix}.svg`), bounce);
  await fs.writeFile(path.join(publicDir, `logo-racquet-flourish${suffix}.svg`), arc);
  await fs.writeFile(path.join(publicDir, `mark-bounce${suffix}.svg`), bounce);

  for (const scale of [1, 2, 4]) {
    await sharp(Buffer.from(arc), { density: 144, limitInputPixels: false })
      .resize({ width: 660 * scale })
      .png()
      .toFile(path.join(exportDir, `logo-racquet-flourish${suffix}@${scale}x.png`));
    await sharp(Buffer.from(bounce), { density: 144, limitInputPixels: false })
      .resize({ width: 64 * scale })
      .png()
      .toFile(path.join(exportDir, `mark-bounce${suffix}@${scale}x.png`));
  }
}

const arc = arcSvg(GREEN, "Racquet Habit service arc");
const bounce = bounceSvg(GREEN, "Racquet Habit bounce mark");
const arcLarge = await sharp(Buffer.from(arc), { density: 144, limitInputPixels: false })
  .resize({ width: 1512 })
  .png()
  .withMetadata({ density: 300 })
  .toBuffer();
const arc120 = await sharp(Buffer.from(arc), { density: 144, limitInputPixels: false })
  .resize({ width: 1417 })
  .png()
  .withMetadata({ density: 300 })
  .toBuffer();
const bounce10 = await sharp(Buffer.from(bounce), { density: 144, limitInputPixels: false })
  .resize({ width: 10, height: 10, fit: "contain" })
  .png()
  .toBuffer();
const bounce64 = await sharp(Buffer.from(bounce), { density: 144, limitInputPixels: false })
  .resize({ width: 96, height: 96, fit: "contain" })
  .png()
  .toBuffer();

await fs.writeFile(path.join(outDir, "service-arc-120mm-300ppi.png"), arc120);
await fs.writeFile(path.join(outDir, "bounce-mark-10px.png"), bounce10);

const board = await sharp({
  create: { width: 1800, height: 1000, channels: 4, background: IVORY },
})
  .composite([
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="180">
        <rect width="1800" height="180" fill="${GREEN}"/>
        <text x="80" y="74" font-family="Georgia, serif" font-size="48" fill="${IVORY}">Service Arc / Production Candidate</text>
        <text x="82" y="124" font-family="Arial, sans-serif" font-size="17" letter-spacing="4" fill="${IVORY}">HUMAN CADENCE · SOLID IMPACT · DELIBERATE GAP · EIGHT-RAY MICRO MARK</text>
      </svg>`),
      left: 0,
      top: 0,
    },
    { input: arcLarge, left: 100, top: 260 },
    { input: bounce64, left: 1340, top: 700 },
    { input: bounce10, left: 1565, top: 742 },
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="220">
        <text x="102" y="44" font-family="Arial, sans-serif" font-size="18" letter-spacing="3" fill="${PURPLE}">120 MM / PRINT MASTER</text>
        <text x="1336" y="44" font-family="Arial, sans-serif" font-size="18" letter-spacing="3" fill="${PURPLE}">96 PX</text>
        <text x="1540" y="44" font-family="Arial, sans-serif" font-size="18" letter-spacing="3" fill="${PURPLE}">10 PX</text>
        <circle cx="1710" cy="42" r="6" fill="${RED}"/>
      </svg>`),
      left: 0,
      top: 830,
    },
  ])
  .png()
  .toBuffer();

await fs.writeFile(path.join(outDir, "service-arc-production-proof.png"), board);
console.log("Generated Racquet Habit service arc and bounce mark.");
