import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public", "brand-v3");
const designDir = path.join(root, "design", "brand-v3");
const outDir = path.join(designDir, "review");
const GREEN = "#103C2C";
const IVORY = "#F3EBD8";
const PURPLE = "#4E3265";
const RED = "#B83D34";
const NAVY = "#18283D";
const YELLOW = "#D7E63D";

await fs.mkdir(outDir, { recursive: true });

async function render(file, width, height, background = IVORY) {
  return sharp(file, { density: 360 })
    .resize({ width, height, fit: "contain", background })
    .flatten({ background })
    .png()
    .toBuffer();
}

function label(number, title, detail, x, y, width = 1520) {
  return {
    input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="104">
      <text x="0" y="22" font-family="Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="4" fill="${PURPLE}">${number}</text>
      <text x="0" y="64" font-family="Georgia, serif" font-size="34" fill="${GREEN}">${title}</text>
      <text x="${width}" y="62" text-anchor="end" font-family="Arial, sans-serif" font-size="13" letter-spacing="3" fill="${GREEN}">${detail}</text>
      <path d="M0 94 H${width}" stroke="${GREEN}" stroke-width="1" opacity=".45"/>
    </svg>`),
    left: x,
    top: y,
  };
}

const [editorial, horizontal, monogramReverse, patch, serviceArc, patternProof, illustrationProof, merchProof] = await Promise.all([
  render(path.join(publicDir, "logo-primary-editorial.svg"), 650, 290),
  render(path.join(publicDir, "logo-primary-horizontal.svg"), 720, 180),
  render(path.join(publicDir, "logo-rh-monogram-ivory.svg"), 360, 300, GREEN),
  render(path.join(publicDir, "logo-society-patch.svg"), 780, 280),
  render(path.join(publicDir, "logo-racquet-flourish.svg"), 780, 260),
  render(path.join(designDir, "proofs", "pattern-system-repeat-proof.png"), 1500, 480),
  render(path.join(designDir, "illustrations-selected", "court-illustrations-vector-proof.png"), 1500, 580),
  render(path.join(designDir, "merch-selected", "collection-01-production-artwork-proof.png"), 1500, 720),
]);

const board = await sharp({
  create: { width: 1800, height: 3860, channels: 3, background: IVORY },
})
  .composite([
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="430">
        <rect width="1800" height="430" fill="${GREEN}"/>
        <text x="90" y="92" font-family="Arial, sans-serif" font-size="17" letter-spacing="5" fill="${IVORY}">RACQUET HABIT · TENNIS ADDICTS SOCIETY · EST. 2026</text>
        <text x="90" y="205" font-family="Georgia, serif" font-size="70" fill="${IVORY}">Production Identity Review / 04</text>
        <text x="90" y="270" font-family="Arial, sans-serif" font-size="16" letter-spacing="4" fill="${IVORY}">APPROVED FOUNDATION · OUTLINED ARTWORK · MATERIAL TESTS PENDING</text>
        <rect x="90" y="334" width="116" height="19" fill="${IVORY}"/><rect x="206" y="334" width="76" height="19" fill="${PURPLE}"/><rect x="282" y="334" width="56" height="19" fill="${RED}"/><rect x="338" y="334" width="46" height="19" fill="${NAVY}"/><rect x="384" y="334" width="19" height="19" fill="${YELLOW}"/>
      </svg>`),
      left: 0,
      top: 0,
    },
    { input: monogramReverse, left: 1340, top: 70 },

    label("01", "Wordmark family + RH monogram", "APPROVED DIGITAL MASTER", 90, 490),
    { input: editorial, left: 150, top: 610 },
    { input: horizontal, left: 825, top: 665 },
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1520" height="62">
        <text x="0" y="28" font-family="Arial, sans-serif" font-size="14" letter-spacing="3" fill="${GREEN}">EDITORIAL / CAMPAIGN</text>
        <text x="760" y="28" font-family="Arial, sans-serif" font-size="14" letter-spacing="3" fill="${GREEN}">HORIZONTAL / COMMERCE</text>
        <text x="1520" y="28" text-anchor="end" font-family="Arial, sans-serif" font-size="14" letter-spacing="3" fill="${GREEN}">RH / SMALL MARK</text>
      </svg>`),
      left: 90,
      top: 885,
    },

    label("02", "Society patch + service arc", "68 MM PATCH / 120 MM PRINT", 90, 990),
    { input: patch, left: 90, top: 1110 },
    { input: serviceArc, left: 930, top: 1120 },

    label("03", "Championship pattern system", "FIVE ORIGINAL REPEATS", 90, 1435),
    { input: patternProof, left: 150, top: 1550 },

    label("04", "Court-object illustration family", "EIGHT ONE-COLOUR VECTORS", 90, 2070),
    { input: illustrationProof, left: 150, top: 2185 },

    label("05", "Collection 01 production artwork", "EIGHT OUTLINED MASTERS", 90, 2850),
    { input: merchProof, left: 150, top: 2960 },
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="90">
        <rect width="1800" height="90" fill="${GREEN}"/>
        <text x="90" y="54" font-family="Arial, sans-serif" font-size="14" letter-spacing="4" fill="${IVORY}">NEXT / CAMPAIGN HERO · COURT STILL LIFE · TOURNAMENT POSTER · PACKAGING PHOTOGRAPHY</text>
      </svg>`),
      left: 0,
      top: 3770,
    },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

await fs.writeFile(path.join(outDir, "brand-asset-review-04.png"), board);
console.log("Generated Racquet Habit production identity review board 04.");
