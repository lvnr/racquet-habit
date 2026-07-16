import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "design", "brand-v3", "service-arc-studies");
const GREEN = "#103C2C";
const IVORY = "#F3EBD8";
const PURPLE = "#4E3265";

await fs.mkdir(outDir, { recursive: true });

function burst(cx, cy, scale = 1) {
  const rays = [
    [0, -30, 0, -14],
    [22, -22, 11, -11],
    [30, 0, 14, 0],
    [22, 22, 11, 11],
    [0, 30, 0, 14],
    [-22, 22, -11, 11],
    [-30, 0, -14, 0],
    [-22, -22, -11, -11],
  ];
  return `<g transform="translate(${cx} ${cy}) scale(${scale})" fill="none" stroke="${GREEN}" stroke-width="5" stroke-linecap="round">${rays
    .map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1} L${x2} ${y2}"/>`)
    .join("")}</g>`;
}

function option(id, description, leftPath, rightPath, impactX, impactY, microX = 1240) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 420" role="img" aria-label="Racquet Habit service arc study ${id}">
    <rect width="1400" height="420" fill="${IVORY}"/>
    <text x="72" y="72" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="5" fill="${PURPLE}">${id}</text>
    <text x="126" y="72" font-family="Arial, sans-serif" font-size="17" letter-spacing="3" fill="${GREEN}">${description}</text>
    <path d="${leftPath}" fill="none" stroke="${GREEN}" stroke-width="13" stroke-linecap="round"/>
    <circle cx="${impactX}" cy="${impactY}" r="8" fill="${GREEN}"/>
    <path d="${rightPath}" fill="none" stroke="${GREEN}" stroke-width="13" stroke-linecap="round"/>
    ${burst(impactX, impactY, 0.72)}
    ${burst(microX, 230, 1)}
    <text x="1175" y="305" font-family="Arial, sans-serif" font-size="13" letter-spacing="3" fill="${GREEN}">10 PX MARK</text>
  </svg>`;
}

const studies = [
  option(
    "A",
    "GEOMETRIC / CONTROLLED",
    "M108 148 C310 112 490 146 688 298 C724 326 757 347 790 350",
    "M824 348 C916 335 1010 270 1114 171",
    802,
    350,
  ),
  option(
    "B",
    "HUMAN CADENCE / ASYMMETRIC",
    "M101 162 C297 112 447 145 628 287 C693 338 747 365 799 356",
    "M834 348 C897 322 971 252 1108 153",
    814,
    356,
  ),
  option(
    "C",
    "COMPACT / GARMENT PLACEMENT",
    "M270 153 C430 126 557 168 681 291 C720 330 753 347 786 341",
    "M820 334 C887 307 948 248 1023 174",
    802,
    341,
  ),
];

const buffers = [];
for (let index = 0; index < studies.length; index += 1) {
  const name = String.fromCharCode(97 + index);
  await fs.writeFile(path.join(outDir, `service-arc-${name}.svg`), `${studies[index]}\n`);
  const png = await sharp(Buffer.from(studies[index])).png().toBuffer();
  await fs.writeFile(path.join(outDir, `service-arc-${name}.png`), png);
  buffers.push(png);
}

const board = await sharp({
  create: { width: 1400, height: 1440, channels: 3, background: IVORY },
})
  .composite([
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="180">
        <rect width="1400" height="180" fill="${GREEN}"/>
        <text x="72" y="76" font-family="Georgia, serif" font-size="45" fill="${IVORY}">Service Arc / Production Study</text>
        <text x="72" y="121" font-family="Arial, sans-serif" font-size="16" letter-spacing="4" fill="${IVORY}">TWO ARCS · IMPACT GAP · EIGHT-RAY MICRO MARK · ONE COLOUR</text>
      </svg>`),
      left: 0,
      top: 0,
    },
    ...buffers.map((input, index) => ({ input, left: 0, top: 180 + index * 420 })),
  ])
  .png()
  .toBuffer();

await fs.writeFile(path.join(outDir, "service-arc-study-board.png"), board);
console.log("Generated Racquet Habit service-arc studies.");
