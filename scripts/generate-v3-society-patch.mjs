import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "design", "brand-v3", "society-patch-selected");
const publicDir = path.join(root, "public", "brand-v3");
const exportDir = path.join(publicDir, "exports");
const GREEN = "#103C2C";
const IVORY = "#F3EBD8";
const PURPLE = "#4E3265";
const RED = "#B83D34";

await Promise.all([outDir, publicDir, exportDir].map((directory) => fs.mkdir(directory, { recursive: true })));

async function loadFont(filePath) {
  const bytes = await fs.readFile(filePath);
  return opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}

const utility = await loadFont(path.join(
  root,
  "design/brand-v3/fonts/IBMPlexMono-Medium.ttf",
));

function trackedPath(font, text, x, baseline, size, tracking = 0) {
  const paths = [];
  let cursor = x;
  for (const character of text) {
    const glyph = font.charToGlyph(character);
    paths.push(serializePath(glyph.getPath(cursor, baseline, size)));
    cursor += (glyph.advanceWidth / font.unitsPerEm) * size + tracking;
  }
  return { d: paths.join(" "), width: cursor - x - tracking };
}

function serializePath(pathObject, precision = 2) {
  const number = (value) => {
    if (!Number.isFinite(value)) throw new Error(`Invalid font-path coordinate: ${value}`);
    return Number(value.toFixed(precision));
  };
  return pathObject.commands.map((command) => {
    if (command.type === "Z") return "Z";
    if (command.type === "M" || command.type === "L") {
      return `${command.type}${number(command.x)} ${number(command.y)}`;
    }
    if (command.type === "Q") {
      return `Q${number(command.x1)} ${number(command.y1)} ${number(command.x)} ${number(command.y)}`;
    }
    if (command.type === "C") {
      return `C${number(command.x1)} ${number(command.y1)} ${number(command.x2)} ${number(command.y2)} ${number(command.x)} ${number(command.y)}`;
    }
    throw new Error(`Unsupported font-path command: ${command.type}`);
  }).join(" ");
}

function extractGroup(svg, label) {
  const match = svg.match(/<g transform="[^"]+"[\s\S]*?<\/g>/);
  if (!match) throw new Error(`Could not extract ${label} artwork`);
  return match[0];
}

const horizontalSource = await fs.readFile(path.join(publicDir, "logo-primary-horizontal.svg"), "utf8");
const monogramSource = await fs.readFile(path.join(publicDir, "logo-rh-monogram.svg"), "utf8");
const horizontalGroup = extractGroup(horizontalSource, "horizontal wordmark").replaceAll(GREEN, IVORY);
const monogramGroup = extractGroup(monogramSource, "RH monogram").replaceAll(GREEN, IVORY);

const society = trackedPath(utility, "TENNIS ADDICTS SOCIETY", 0, 0, 31, 4.8);
const societyX = 665 - society.width / 2;
const estA = trackedPath(utility, "EST.", 0, 0, 29, 3.3);
const estB = trackedPath(utility, "2026", 0, 0, 31, 3.3);
const estX = 1305;

const patch = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 360" role="img" aria-label="Racquet Habit three-zone Society woven patch">
  <rect width="1400" height="360" rx="72" fill="${GREEN}"/>
  <rect x="14" y="14" width="1372" height="332" rx="58" fill="none" stroke="${IVORY}" stroke-width="8"/>
  <path d="M292 18 V342 M1046 18 V342 M1246 52 V308" fill="none" stroke="${IVORY}" stroke-width="7"/>
  <g fill="none" stroke="${IVORY}" stroke-width="4.5" opacity=".98">
    <path d="M48 69 H252 M48 112 H252 M48 155 H252 M48 198 H252 M48 241 H252 M48 284 H252"/>
    <path d="M73 44 V316 M111 44 V316 M149 44 V316 M187 44 V316 M225 44 V316"/>
  </g>
  <path d="M49 211 C91 183 124 223 161 201 C192 183 218 188 252 210" fill="none" stroke="${PURPLE}" stroke-width="12" stroke-linecap="round"/>
  <g transform="translate(343 72) scale(.49)">${horizontalGroup}</g>
  <path d="M338 234 H992" fill="none" stroke="${IVORY}" stroke-width="4"/>
  <path d="${society.d}" transform="translate(${societyX.toFixed(2)} 284)" fill="${IVORY}"/>
  <g transform="translate(1060 49) scale(.255)">${monogramGroup}</g>
  <path d="${estA.d}" transform="translate(${(estX - estA.width / 2).toFixed(2)} 164)" fill="${IVORY}"/>
  <path d="M1278 185 H1333" stroke="${IVORY}" stroke-width="4"/>
  <path d="${estB.d}" transform="translate(${(estX - estB.width / 2).toFixed(2)} 229)" fill="${IVORY}"/>
</svg>\n`;

const oneColour = patch.replaceAll(PURPLE, IVORY).replace(
  "Racquet Habit three-zone Society woven patch",
  "Racquet Habit one-colour three-zone Society woven patch",
);
const blackProof = oneColour
  .replaceAll(GREEN, "#000000")
  .replaceAll(IVORY, "#FFFFFF")
  .replace(
    "Racquet Habit one-colour three-zone Society woven patch",
    "Racquet Habit black production three-zone Society woven patch",
  );

await fs.writeFile(path.join(outDir, "logo-society-patch.svg"), patch);
await fs.writeFile(path.join(outDir, "logo-society-patch-one-colour.svg"), oneColour);
await fs.writeFile(path.join(outDir, "logo-society-patch-black-proof.svg"), blackProof);
await fs.writeFile(path.join(publicDir, "logo-society-patch.svg"), patch);
await fs.writeFile(path.join(publicDir, "logo-society-patch-one-colour.svg"), oneColour);
await fs.writeFile(path.join(publicDir, "logo-society-patch-black-proof.svg"), blackProof);

for (const [name, artwork] of [["", patch], ["-one-colour", oneColour], ["-black-proof", blackProof]]) {
  for (const [scale, width] of [[1, 680], [2, 1360], [4, 2720]]) {
    await sharp(Buffer.from(artwork), { density: 144, limitInputPixels: false })
      .resize({ width })
      .png()
      .toFile(path.join(exportDir, `logo-society-patch${name}@${scale}x.png`));
  }
}

const patchLarge = await sharp(Buffer.from(patch), { density: 144, limitInputPixels: false })
  .resize({ width: 1540 })
  .png()
  .toBuffer();
const patch68 = await sharp(Buffer.from(patch), { density: 144, limitInputPixels: false })
  .resize({ width: 803 })
  .png()
  .withMetadata({ density: 300 })
  .toBuffer();
const patch38 = await sharp(Buffer.from(patch), { density: 144, limitInputPixels: false })
  .resize({ width: 449 })
  .png()
  .withMetadata({ density: 300 })
  .toBuffer();

await fs.writeFile(path.join(outDir, "society-patch-68mm-300ppi.png"), patch68);
await fs.writeFile(path.join(outDir, "society-patch-38mm-300ppi.png"), patch38);

const board = await sharp({
  create: { width: 1800, height: 1100, channels: 4, background: IVORY },
})
  .composite([
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="180">
        <rect width="1800" height="180" fill="${IVORY}"/>
        <text x="80" y="72" font-family="Georgia, serif" font-size="48" fill="${GREEN}">Society Patch / Production Candidate</text>
        <text x="82" y="122" font-family="Arial, sans-serif" font-size="17" letter-spacing="4" fill="${PURPLE}">SELECTED THREE-ZONE STRUCTURE · APPROVED WORDMARK + RH · OPEN-LICENSED UTILITY PATHS</text>
      </svg>`),
      left: 0,
      top: 0,
    },
    { input: patchLarge, left: 130, top: 210 },
    { input: patch68, left: 135, top: 690 },
    { input: patch38, left: 1170, top: 730 },
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="160">
        <text x="135" y="35" font-family="Arial, sans-serif" font-size="18" letter-spacing="3" fill="${GREEN}">68 MM / TARGET WOVEN PATCH</text>
        <text x="1170" y="35" font-family="Arial, sans-serif" font-size="18" letter-spacing="3" fill="${GREEN}">38 MM / REDUCED TEST</text>
        <circle cx="1710" cy="32" r="6" fill="${RED}"/>
      </svg>`),
      left: 0,
      top: 970,
    },
  ])
  .png()
  .toBuffer();

await fs.writeFile(path.join(outDir, "society-patch-production-proof.png"), board);
console.log("Generated Racquet Habit Society patch production candidate.");
