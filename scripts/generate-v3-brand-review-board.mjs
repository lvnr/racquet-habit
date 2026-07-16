import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const designDir = path.join(root, "design", "brand-v3");
const outDir = path.join(designDir, "review");
const GREEN = "#103C2C";
const IVORY = "#F3EBD8";
const PURPLE = "#4E3265";
const RED = "#B83D34";
const NAVY = "#18283D";
const YELLOW = "#D7E63D";

await fs.mkdir(outDir, { recursive: true });

async function flattened(file, width, height) {
  return sharp(file)
    .resize({ width, height, fit: "contain", background: IVORY })
    .flatten({ background: IVORY })
    .png()
    .toBuffer();
}

const monogram = await sharp(path.join(root, "public", "brand-v3", "logo-rh-monogram-ivory.svg"), { density: 600 })
  .resize({ width: 420, height: 360, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
const wordmark = await flattened(path.join(designDir, "wordmark-calibration", "calibration-b.png"), 1220, 390);
const patch = await flattened(path.join(designDir, "patch-calibration", "society-patch-68mm-300ppi.png"), 1390, 420);
const patterns = await flattened(path.join(designDir, "proofs", "pattern-system-repeat-proof.png"), 1450, 520);
const serviceArc = await flattened(path.join(designDir, "service-arc-studies", "service-arc-b.png"), 1220, 365);

function textBlock({ width = 1600, height, title, meta, status, statusColor = PURPLE }) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="${IVORY}"/>
    <text x="0" y="44" font-family="Georgia, serif" font-size="38" fill="${GREEN}">${title}</text>
    <text x="0" y="82" font-family="Arial, sans-serif" font-size="15" letter-spacing="3" fill="${GREEN}">${meta}</text>
    <rect x="${width - 220}" y="12" width="220" height="48" rx="24" fill="${statusColor}"/>
    <text x="${width - 110}" y="43" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="3" fill="${IVORY}">${status}</text>
  </svg>`);
}

const board = await sharp({
  create: { width: 1800, height: 3040, channels: 3, background: IVORY },
})
  .composite([
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="460">
        <rect width="1800" height="460" fill="${GREEN}"/>
        <text x="90" y="110" font-family="Arial, sans-serif" font-size="18" letter-spacing="5" fill="${IVORY}">RACQUET HABIT · TENNIS ADDICTS SOCIETY</text>
        <text x="90" y="225" font-family="Georgia, serif" font-size="74" fill="${IVORY}">Brand Asset Review / 03</text>
        <text x="90" y="292" font-family="Arial, sans-serif" font-size="18" letter-spacing="4" fill="${IVORY}">APPROVED FOUNDATION + CONTROLLED CALIBRATION</text>
        <rect x="90" y="350" width="94" height="18" fill="${IVORY}"/><rect x="184" y="350" width="70" height="18" fill="${PURPLE}"/><rect x="254" y="350" width="54" height="18" fill="${RED}"/><rect x="308" y="350" width="44" height="18" fill="${NAVY}"/><rect x="352" y="350" width="18" height="18" fill="${YELLOW}"/>
      </svg>`),
      left: 0,
      top: 0,
    },
    { input: monogram, left: 1290, top: 48 },
    { input: textBlock({ height: 100, title: "01 / RH Monogram", meta: "FOUNDER-SELECTED MASTER · WEB + PRINT VECTORS COMPLETE", status: "APPROVED", statusColor: GREEN }), left: 90, top: 520 },
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="220">
        <rect width="1600" height="220" fill="${GREEN}"/>
        <text x="80" y="98" font-family="Georgia, serif" font-size="52" fill="${IVORY}">Interlocking serif R/H with a swept shared gesture.</text>
        <text x="80" y="154" font-family="Arial, sans-serif" font-size="17" letter-spacing="3" fill="${IVORY}">STANDARD · REVERSE · BLACK · EMBROIDERY-SAFE · FAVICON</text>
      </svg>`),
      left: 90,
      top: 640,
    },
    { input: textBlock({ height: 100, title: "02 / Primary Wordmark", meta: "COHERENT ROMAN + HIGH-CONTRAST ITALIC · LICENSING/REDRAW PENDING", status: "IN REVIEW" }), left: 90, top: 930 },
    { input: wordmark, left: 290, top: 1030 },
    { input: textBlock({ height: 100, title: "03 / Society Patch", meta: "THREE-ZONE CAPSULE · 68 MM SCALE PASS · TYPE PENDING", status: "IN REVIEW" }), left: 90, top: 1390 },
    { input: patch, left: 205, top: 1490 },
    { input: textBlock({ height: 100, title: "04 / Championship Patterns", meta: "STRIPE · STRING GRID · COURT FRAME · SEAM ARCS · DASH FIELD", status: "APPROVED", statusColor: GREEN }), left: 90, top: 1880 },
    { input: patterns, left: 175, top: 1980 },
    { input: textBlock({ height: 100, title: "05 / Service Arc", meta: "ASYMMETRIC BOUNCE GESTURE · TERMINAL REFINEMENT PENDING", status: "IN REVIEW" }), left: 90, top: 2510 },
    { input: serviceArc, left: 290, top: 2600 },
  ])
  .png()
  .toBuffer();

await fs.writeFile(path.join(outDir, "brand-asset-review-03.png"), board);
console.log("Generated Racquet Habit brand review board 03.");
