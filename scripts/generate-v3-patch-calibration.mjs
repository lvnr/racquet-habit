import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "design", "brand-v3", "patch-calibration");
const fontDir = path.join(process.env.HOME, "Library", "Fonts");
const GREEN = "#103C2C";
const IVORY = "#F3EBD8";
const PURPLE = "#4E3265";

await fs.mkdir(outDir, { recursive: true });

async function loadFont(name) {
  const bytes = await fs.readFile(path.join(fontDir, name));
  return opentype.parse(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  );
}

const serif = await loadFont("TestTiemposHeadline-Medium.otf");
const sans = await loadFont("GT-America-Standard-Medium-Trial.otf");

function textPath(font, text, x, baseline, size, tracking = 0) {
  const parts = [];
  let cursor = x;
  for (const char of text) {
    const glyph = font.charToGlyph(char);
    parts.push(glyph.getPath(cursor, baseline, size).toPathData(2));
    cursor += (glyph.advanceWidth / font.unitsPerEm) * size + tracking;
  }
  return parts.join(" ");
}

function traceData(svgSource) {
  const pathMatch = svgSource.match(/<path d="([\s\S]*?)"\/>/);
  const viewBoxMatch = svgSource.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!pathMatch || !viewBoxMatch) throw new Error("Invalid monogram trace source");
  return { d: pathMatch[1], width: Number(viewBoxMatch[1]), height: Number(viewBoxMatch[2]) };
}

const trace = traceData(
  await fs.readFile(
    path.join(root, "design", "brand-v3", "references", "rh-monogram-source-trace.svg"),
    "utf8",
  ),
);

const title = textPath(serif, "RACQUET HABIT", 317, 145, 76, 2.4);
const society = textPath(sans, "TENNIS ADDICTS SOCIETY", 323, 218, 27, 4.2);
const est = textPath(sans, "EST. 2026", 1115, 224, 26, 3.4);

const patch = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 300" role="img" aria-label="Racquet Habit three-zone Society patch calibration">
  <rect width="1400" height="300" rx="54" fill="${GREEN}"/>
  <rect x="14" y="14" width="1372" height="272" rx="42" fill="none" stroke="${IVORY}" stroke-width="8"/>
  <path d="M283 16 V284 M1030 16 V284" stroke="${IVORY}" stroke-width="7"/>
  <g fill="none" stroke="${IVORY}" stroke-width="4" opacity=".98">
    <path d="M47 64 H250 M47 99 H250 M47 134 H250 M47 169 H250 M47 204 H250 M47 239 H250"/>
    <path d="M70 42 V258 M106 42 V258 M142 42 V258 M178 42 V258 M214 42 V258"/>
  </g>
  <path d="M47 174 C91 148 126 189 164 166 C194 147 218 153 250 172" fill="none" stroke="${PURPLE}" stroke-width="11" stroke-linecap="round"/>
  <path d="${title}" fill="${IVORY}"/>
  <path d="M319 172 H981" stroke="${IVORY}" stroke-width="4"/>
  <path d="${society}" fill="${IVORY}"/>
  <g transform="translate(1058 35) scale(.245)">
    <g transform="translate(0 ${trace.height}) scale(.1 -.1)" fill="${IVORY}">
      <path d="${trace.d}"/>
    </g>
  </g>
  <path d="${est}" fill="${IVORY}"/>
</svg>\n`;

await fs.writeFile(path.join(outDir, "society-patch-calibration.svg"), patch);

const sizes = [
  ["38mm", 449],
  ["68mm", 803],
  ["250mm", 2953],
];

for (const [name, width] of sizes) {
  await sharp(Buffer.from(patch))
    .resize({ width })
    .png({ compressionLevel: 9 })
    .withMetadata({ density: 300 })
    .toFile(path.join(outDir, `society-patch-${name}-300ppi.png`));
}

const patchLarge = await sharp(Buffer.from(patch)).resize({ width: 1500 }).flatten({ background: IVORY }).png().toBuffer();
const patch68 = await sharp(Buffer.from(patch)).resize({ width: 803 }).flatten({ background: IVORY }).png().toBuffer();
const patch38 = await sharp(Buffer.from(patch)).resize({ width: 449 }).flatten({ background: IVORY }).png().toBuffer();

const board = await sharp({
  create: { width: 1800, height: 1100, channels: 4, background: IVORY },
})
  .composite([
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="180">
        <rect width="1800" height="180" fill="${IVORY}"/>
        <text x="80" y="78" font-family="Georgia, serif" font-size="48" fill="${GREEN}">Society Patch / Scale Calibration</text>
        <text x="82" y="126" font-family="Arial, sans-serif" font-size="17" letter-spacing="4" fill="${PURPLE}">SELECTED THREE-ZONE STRUCTURE · APPROVED RH MONOGRAM · SHAPE TEST ONLY</text>
      </svg>`),
      left: 0,
      top: 0,
    },
    { input: patchLarge, left: 150, top: 210 },
    { input: patch68, left: 170, top: 640 },
    { input: patch38, left: 1130, top: 680 },
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="180">
        <text x="170" y="42" font-family="Arial, sans-serif" font-size="18" letter-spacing="3" fill="${GREEN}">68 MM / WOVEN PATCH</text>
        <text x="1130" y="42" font-family="Arial, sans-serif" font-size="18" letter-spacing="3" fill="${GREEN}">38 MM / MINIMUM USE</text>
        <text x="170" y="92" font-family="Arial, sans-serif" font-size="16" letter-spacing="2" fill="${GREEN}">FINAL TYPOGRAPHY PENDING WORDMARK REDRAW + FONT LICENSE</text>
      </svg>`),
      left: 0,
      top: 940,
    },
  ])
  .png()
  .toBuffer();

await fs.writeFile(path.join(outDir, "society-patch-calibration-board.png"), board);
console.log("Generated Racquet Habit Society patch calibration.");
