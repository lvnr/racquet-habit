import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = path.join(root, "public", "brand-v3");
const outDir = path.join(root, "public", "merch-v3");
const vectorDir = path.join(outDir, "vectors");
const proofDir = path.join(root, "design", "brand-v3", "merch-selected");
const GREEN = "#103C2C";
const IVORY = "#F3EBD8";
const PURPLE = "#4E3265";
const RED = "#B83D34";
const YELLOW = "#D7E63D";

await Promise.all([outDir, vectorDir, proofDir].map((directory) => fs.mkdir(directory, { recursive: true })));

async function loadFont(filePath) {
  const bytes = await fs.readFile(filePath);
  return opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}

const serif = await loadFont(path.join(
  root,
  "design/brand-v3/fonts/InstrumentSerif-Regular.ttf",
));
const italic = await loadFont(path.join(
  root,
  "design/brand-v3/fonts/InstrumentSerif-Italic.ttf",
));
const mono = await loadFont(path.join(
  root,
  "design/brand-v3/fonts/IBMPlexMono-Medium.ttf",
));

function trackedPath(font, text, x, baseline, size, tracking = 0) {
  const parts = [];
  let cursor = x;
  for (const character of text) {
    const glyph = font.charToGlyph(character);
    parts.push(serializePath(glyph.getPath(cursor, baseline, size)));
    cursor += (glyph.advanceWidth / font.unitsPerEm) * size + tracking;
  }
  return { d: parts.join(" "), width: cursor - x - tracking };
}

// opentype.js 1.3.4's optimized `toPathData()` serializer can emit NaN at
// certain exact outline scales even when every path command is valid. Keep the
// geometry deterministic by serializing the command list directly.
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

function centeredPath(font, text, center, baseline, size, tracking, fill) {
  const artwork = trackedPath(font, text, 0, 0, size, tracking);
  return `<path d="${artwork.d}" transform="translate(${(center - artwork.width / 2).toFixed(2)} ${baseline})" fill="${fill}"/>`;
}

function centeredFit(font, text, center, baseline, maxWidth, size, tracking, fill) {
  const measure = trackedPath(font, text, 0, 0, size, tracking);
  if (measure.width > maxWidth) {
    const scale = maxWidth / measure.width;
    return centeredPath(font, text, center, baseline, size * scale, tracking * scale, fill);
  }
  return centeredPath(font, text, center, baseline, size, tracking, fill);
}

async function loadAsset(relativePath, color) {
  let source = await fs.readFile(path.join(brandDir, relativePath), "utf8");
  if (color) source = source.replaceAll(GREEN, color);
  const viewBox = source.match(/viewBox="([\d.-]+) ([\d.-]+) ([\d.]+) ([\d.]+)"/);
  const body = source
    .replace(/^<\?xml[\s\S]*?\?>\s*/i, "")
    .replace(/^<!DOCTYPE[\s\S]*?>\s*/i, "")
    .match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1]
    .replace(/<title[\s\S]*?<\/title>/g, "") ?? "";
  if (!viewBox || !body) throw new Error(`Invalid SVG asset: ${relativePath}`);
  return {
    body,
    minX: Number(viewBox[1]),
    minY: Number(viewBox[2]),
    width: Number(viewBox[3]),
    height: Number(viewBox[4]),
  };
}

function place(asset, x, y, width, height = Number.POSITIVE_INFINITY) {
  const scale = Math.min(width / asset.width, height / asset.height);
  const dx = x - asset.minX * scale;
  const dy = y - asset.minY * scale;
  return `<g transform="translate(${dx.toFixed(3)} ${dy.toFixed(3)}) scale(${scale.toFixed(6)})">${asset.body}</g>`;
}

function svg(width, height, label, body, background) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
  ${background ? `<rect width="${width}" height="${height}" fill="${background}"/>` : ""}
  ${body}
</svg>\n`;
}

const [wordmarkGreen, wordmarkIvory, monogramGreen, monogramIvory, patch, arcGreen, arcIvory, bounceGreen, bounceIvory, chairGreen, bagGreen] = await Promise.all([
  loadAsset("logo-primary-horizontal.svg"),
  loadAsset("logo-primary-horizontal-ivory.svg"),
  loadAsset("logo-rh-monogram.svg"),
  loadAsset("logo-rh-monogram-ivory.svg"),
  loadAsset("logo-society-patch.svg"),
  loadAsset("logo-racquet-flourish.svg"),
  loadAsset("logo-racquet-flourish-ivory.svg"),
  loadAsset("mark-bounce.svg"),
  loadAsset("mark-bounce-ivory.svg"),
  loadAsset("illustrations/illustration-chair.svg"),
  loadAsset("illustrations/illustration-court-bag.svg"),
]);

const artworks = [];

artworks.push({
  id: "apparel-society-tee-back",
  label: "Society Tee / back print",
  width: 4500,
  height: 5400,
  previewBackground: IVORY,
  artwork: svg(4500, 5400, "Racquet Habit Society Tee back artwork", `
    ${centeredFit(mono, "COLLECTION 01 / THE LAST SET", 2250, 500, 3600, 112, 20, GREEN)}
    ${place(patch, 430, 1040, 3640)}
    ${centeredFit(serif, "A DIFFICULT HABIT", 2250, 3600, 3850, 360, 4, GREEN)}
    ${centeredPath(italic, "to break.", 2250, 4130, 520, -5, GREEN)}
    ${place(bounceGreen, 2188, 4480, 124)}
    ${centeredFit(mono, "RACQUET HABIT · TENNIS ADDICTS SOCIETY · EST. 2026", 2250, 4910, 3900, 78, 13, GREEN)}
  `),
});

artworks.push({
  id: "apparel-last-set-back",
  label: "The Last Set / back print",
  width: 4500,
  height: 5400,
  previewBackground: GREEN,
  artwork: svg(4500, 5400, "Racquet Habit Last Set Tee back artwork", `
    ${place(monogramIvory, 1910, 360, 680)}
    ${centeredPath(serif, "THE LAST", 2250, 1850, 700, 1, IVORY)}
    ${centeredPath(serif, "SET IS A", 2250, 2670, 700, 1, IVORY)}
    ${centeredPath(italic, "Myth", 2250, 3570, 910, -8, IVORY)}
    ${place(arcIvory, 450, 3710, 3600)}
    ${centeredPath(mono, "ONE MORE SET / COLLECTION 01", 2250, 4850, 94, 17, IVORY)}
  `),
});

artworks.push({
  id: "accessory-championship-towel",
  label: "Championship towel / edge-to-edge",
  width: 4800,
  height: 2400,
  previewBackground: IVORY,
  artwork: svg(4800, 2400, "Racquet Habit Championship court towel artwork", `
    <defs>
      <pattern id="grid" width="180" height="180" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0 V180 M60 0 V180 M120 0 V180 M180 0 V180" stroke="${IVORY}" stroke-width="5" opacity=".14"/>
      </pattern>
    </defs>
    <rect width="4800" height="2400" fill="url(#grid)"/>
    <rect y="90" width="4800" height="55" fill="${IVORY}"/>
    <rect y="163" width="4800" height="24" fill="${PURPLE}"/>
    <rect y="2213" width="4800" height="24" fill="${PURPLE}"/>
    <rect y="2255" width="4800" height="55" fill="${IVORY}"/>
    ${place(wordmarkIvory, 800, 820, 3200)}
    ${centeredFit(mono, "ONE MORE SET · MEMBERS IN GOOD STANDING", 2400, 1780, 3800, 104, 22, IVORY)}
  `, GREEN),
});

artworks.push({
  id: "accessory-society-tote",
  label: "Society tote / front print",
  width: 3600,
  height: 4200,
  previewBackground: IVORY,
  artwork: svg(3600, 4200, "Racquet Habit Society tote front artwork", `
    ${place(monogramGreen, 1090, 280, 1420)}
    ${centeredFit(mono, "TENNIS ADDICTS SOCIETY", 1800, 2110, 2900, 118, 25, GREEN)}
    ${place(bagGreen, 1110, 2350, 1380)}
    <path d="M760 3640 H2840" stroke="${PURPLE}" stroke-width="22"/>
    ${centeredFit(mono, "FOR THE SPARE RACQUET YOU DID NOT NEED", 1800, 3860, 2850, 74, 14, GREEN)}
  `),
});

artworks.push({
  id: "drinkware-one-more-set-mug-wrap",
  label: "One More Set mug / wrap",
  width: 3300,
  height: 1350,
  previewBackground: IVORY,
  artwork: svg(3300, 1350, "Racquet Habit One More Set mug wrap artwork", `
    ${place(bounceGreen, 180, 525, 200)}
    ${place(wordmarkGreen, 520, 470, 1480)}
    <path d="M2160 270 V1080" stroke="${PURPLE}" stroke-width="18"/>
    ${centeredPath(serif, "ONE MORE", 2725, 640, 270, 1, GREEN)}
    ${centeredPath(italic, "Set", 2725, 975, 360, -4, GREEN)}
  `),
});

artworks.push({
  id: "drinkware-court-vessel-wrap",
  label: "Court vessel / wrap",
  width: 3600,
  height: 1200,
  previewBackground: IVORY,
  artwork: svg(3600, 1200, "Racquet Habit Court vessel wrap artwork", `
    ${place(monogramGreen, 210, 200, 720)}
    ${place(arcGreen, 1080, 260, 1840)}
    ${place(bounceGreen, 3100, 470, 150)}
    ${centeredFit(mono, "COURT HOURS ARE NEVER OVER", 2050, 1040, 2450, 86, 17, GREEN)}
  `),
});

artworks.push({
  id: "hospitality-after-set-coffee-label",
  label: "After Set coffee / concept label",
  width: 2400,
  height: 3000,
  previewBackground: IVORY,
  artwork: svg(2400, 3000, "Racquet Habit After Set limited roast concept label", `
    <rect x="54" y="54" width="2292" height="2892" fill="none" stroke="${GREEN}" stroke-width="18"/>
    ${place(wordmarkGreen, 330, 260, 1740)}
    ${centeredFit(mono, "GUEST ROASTER 001 / YEREVAN", 1200, 790, 1960, 80, 14, GREEN)}
    ${place(chairGreen, 700, 920, 1000)}
    ${centeredFit(serif, "AFTER SET", 1200, 2260, 1900, 360, 1, GREEN)}
    ${centeredFit(italic, "Limited Roast", 1200, 2555, 1900, 260, -3, PURPLE)}
    <circle cx="1200" cy="2720" r="22" fill="${RED}"/>
    ${centeredFit(mono, "250 G · WHOLE BEAN · COLLABORATION RELEASE", 1200, 2840, 2050, 58, 9, GREEN)}
  `, IVORY),
});

artworks.push({
  id: "hospitality-fifth-set-drink-label",
  label: "Fifth Set drink / concept label",
  width: 1800,
  height: 2400,
  previewBackground: GREEN,
  artwork: svg(1800, 2400, "Racquet Habit Fifth Set seasonal drink concept label", `
    <rect x="48" y="48" width="1704" height="2304" fill="none" stroke="${IVORY}" stroke-width="15"/>
    ${place(monogramIvory, 650, 190, 500)}
    ${centeredFit(mono, "CLUBHOUSE SPECIAL / SEASON 01", 900, 910, 1450, 68, 11, IVORY)}
    ${centeredPath(serif, "FIFTH", 900, 1390, 420, 1, IVORY)}
    ${centeredPath(italic, "Set", 900, 1740, 470, -4, IVORY)}
    ${place(arcIvory, 260, 1830, 1280)}
    ${place(bounceIvory, 840, 2150, 120)}
    <circle cx="1530" cy="2150" r="20" fill="${YELLOW}"/>
  `, GREEN),
});

const previews = [];
for (const item of artworks) {
  const vectorPath = path.join(vectorDir, `${item.id}.svg`);
  const pngPath = path.join(outDir, `${item.id}.png`);
  await fs.writeFile(vectorPath, item.artwork);
  await sharp(Buffer.from(item.artwork), { density: 72, limitInputPixels: false })
    .png({ compressionLevel: 9 })
    .withMetadata({ density: 300 })
    .toFile(pngPath);
  previews.push({
    ...item,
    preview: await sharp(Buffer.from(item.artwork), { density: 72, limitInputPixels: false })
      .resize({ width: 500, height: 700, fit: "contain", background: item.previewBackground })
      .flatten({ background: item.previewBackground })
      .png()
      .toBuffer(),
  });
}

const cards = [];
for (let index = 0; index < previews.length; index += 1) {
  const column = index % 4;
  const row = Math.floor(index / 4);
  const left = 55 + column * 580;
  const top = 190 + row * 920;
  const item = previews[index];
  cards.push(
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="540" height="850">
        <rect x="1" y="1" width="538" height="848" fill="${IVORY}" stroke="${GREEN}" stroke-width="2"/>
        <text x="24" y="38" font-family="Arial, sans-serif" font-size="14" letter-spacing="3" fill="${PURPLE}">${String(index + 1).padStart(2, "0")}</text>
        <text x="24" y="78" font-family="Georgia, serif" font-size="25" fill="${GREEN}">${item.label}</text>
        <text x="24" y="818" font-family="Arial, sans-serif" font-size="12" letter-spacing="2" fill="${GREEN}">${item.width} × ${item.height} PX · 300 PPI</text>
      </svg>`),
      left,
      top,
    },
    { input: item.preview, left: left + 20, top: top + 100 },
  );
}

const board = await sharp({
  create: { width: 2400, height: 2070, channels: 4, background: IVORY },
})
  .composite([
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="150">
        <rect width="2400" height="150" fill="${GREEN}"/>
        <text x="60" y="62" font-family="Georgia, serif" font-size="43" fill="${IVORY}">Collection 01 / Production Artwork System</text>
        <text x="62" y="108" font-family="Arial, sans-serif" font-size="15" letter-spacing="4" fill="${IVORY}">APPAREL · COURT · CARRY · DRINKWARE · HOSPITALITY · ALL LETTERING OUTLINED</text>
      </svg>`),
      left: 0,
      top: 0,
    },
    ...cards,
  ])
  .png()
  .toBuffer();

await fs.writeFile(path.join(proofDir, "collection-01-production-artwork-proof.png"), board);
console.log(`Generated ${artworks.length} Racquet Habit merchandise artwork masters.`);
