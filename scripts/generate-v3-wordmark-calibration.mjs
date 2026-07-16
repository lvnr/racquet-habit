import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "design", "brand-v3", "wordmark-calibration");
const fontDir = path.join(process.env.HOME, "Library", "Fonts");
const GREEN = "#103C2C";
const IVORY = "#F3EBD8";
const PURPLE = "#4E3265";
const RED = "#B83D34";

await fs.mkdir(outDir, { recursive: true });

async function loadFont(name) {
  const bytes = await fs.readFile(path.join(fontDir, name));
  return opentype.parse(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  );
}

const families = [
  {
    id: "A",
    title: "Parnaso — sculptural / closest to monogram",
    roman: await loadFont("ParnasoStandardTrial-Medium.otf"),
    italic: await loadFont("ParnasoStandardTrial-MediumItalic-BF66bd73b3697f7.otf"),
  },
  {
    id: "B",
    title: "Domaine — tournament editorial",
    roman: await loadFont("TestDomaineDisplay-Medium.otf"),
    italic: await loadFont("TestDomaineDisplay-SemiboldItalic.otf"),
  },
  {
    id: "C",
    title: "Tiempos — calm / most versatile",
    roman: await loadFont("TestTiemposHeadline-Medium.otf"),
    italic: await loadFont("TestTiemposHeadline-MediumItalic.otf"),
  },
];

function trackedPath(font, text, x, baseline, size, tracking = 0) {
  const paths = [];
  let cursor = x;
  for (const char of text) {
    const glyph = font.charToGlyph(char);
    paths.push(glyph.getPath(cursor, baseline, size).toPathData(2));
    cursor += (glyph.advanceWidth / font.unitsPerEm) * size + tracking;
  }
  return { d: paths.join(" "), width: cursor - x - tracking };
}

function fitTracked(font, text, maxWidth, preferredSize, tracking = 0) {
  const first = trackedPath(font, text, 0, 0, preferredSize, tracking);
  if (first.width <= maxWidth) return { size: preferredSize, tracking };
  const scale = maxWidth / first.width;
  return { size: preferredSize * scale, tracking: tracking * scale };
}

function candidateSvg(family) {
  const fit = fitTracked(family.roman, "RACQUET", 1520, 260, 8);
  const roman = trackedPath(family.roman, "RACQUET", 220, 285, fit.size, fit.tracking);
  const habit = family.italic.getPath("Habit", 700, 505, 245).toPathData(2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 610" role="img" aria-label="Racquet Habit wordmark calibration ${family.id}">
    <rect width="1920" height="610" fill="${IVORY}"/>
    <text x="78" y="78" fill="${PURPLE}" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="4">${family.id} / ${family.title.toUpperCase()}</text>
    <path d="${roman.d}" fill="${GREEN}"/>
    <path d="${habit}" fill="${GREEN}"/>
    <path d="M690 542 H1365" stroke="${GREEN}" stroke-width="2" opacity=".5"/>
    <circle cx="1390" cy="542" r="5" fill="${RED}"/>
    <text x="78" y="566" fill="${GREEN}" font-family="Arial, sans-serif" font-size="18" letter-spacing="3">SHAPE CALIBRATION ONLY · FINAL LETTERING REQUIRES REDRAW + LICENSING</text>
  </svg>`;
}

for (const family of families) {
  const svg = candidateSvg(family);
  const base = `calibration-${family.id.toLowerCase()}`;
  await fs.writeFile(path.join(outDir, `${base}.svg`), `${svg}\n`);
  await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, `${base}.png`));
}

const monogram = await fs.readFile(
  path.join(root, "public", "brand-v3", "logo-rh-monogram.svg"),
);
const monogramPreview = await sharp(monogram)
  .resize({
    width: 190,
    height: 190,
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();
const candidateBuffers = await Promise.all(
  families.map((family) => sharp(Buffer.from(candidateSvg(family))).png().toBuffer()),
);
const board = await sharp({
  create: { width: 1920, height: 2150, channels: 4, background: IVORY },
})
  .composite([
    { input: monogramPreview, left: 78, top: 58 },
    ...candidateBuffers.map((input, index) => ({
      input,
      left: 0,
      top: 320 + index * 610,
    })),
  ])
  .png()
  .toBuffer();

await fs.writeFile(path.join(outDir, "wordmark-calibration-board.png"), board);
console.log("Generated Racquet Habit wordmark calibration board.");
