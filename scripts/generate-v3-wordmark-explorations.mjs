import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "design", "brand-v3", "wordmark-studies");
const green = "#103C2C";
const ivory = "#F3EBD8";

await fs.mkdir(outDir, { recursive: true });

async function loadFont(filePath) {
  const bytes = await fs.readFile(filePath);
  return opentype.parse(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  );
}

const normal = await loadFont(
  path.join(
    root,
    "node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff",
  ),
);
const italic = await loadFont(
  path.join(
    root,
    "node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff",
  ),
);

let signature;
try {
  signature = await loadFont("/tmp/SignPainter-Semibold.ttf");
} catch {
  signature = italic;
}

function trackedPath(font, text, x, baseline, size, tracking = 0) {
  const paths = [];
  let cursor = x;
  for (const char of text) {
    const glyph = font.charToGlyph(char);
    paths.push(glyph.getPath(cursor, baseline, size).toPathData(3));
    cursor += (glyph.advanceWidth / font.unitsPerEm) * size + tracking;
  }
  return paths.join(" ");
}

function pathEl(d, opacity = 1) {
  return `<path d="${d}" fill="${green}" opacity="${opacity}"/>`;
}

function svg(title, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 560" role="img" aria-label="${title}">
  <rect width="1400" height="560" fill="${ivory}"/>
  ${content}
</svg>\n`;
}

const a = svg(
  "Wordmark study A — editorial italic",
  `${pathEl(trackedPath(normal, "RACQUET", 95, 255, 260, 2.4))}
  ${pathEl(trackedPath(italic, "Habit", 430, 448, 250, -2))}`,
);

const b = svg(
  "Wordmark study B — unified serif signature",
  `${pathEl(trackedPath(normal, "RACQUET", 72, 248, 225, 2.2))}
  ${pathEl(trackedPath(italic, "HABIT", 820, 248, 198, 1.4))}
  <path d="M820 282 H1260" fill="none" stroke="${green}" stroke-width="5"/>`,
);

const c = svg(
  "Wordmark study C — contained sporting signature",
  `${pathEl(trackedPath(normal, "RACQUET", 120, 245, 245, 2.4))}
  <g transform="rotate(-4 460 420)">
    ${pathEl(signature.getPath("Habit", 455, 432, 220).toPathData(3))}
  </g>`,
);

for (const [name, artwork] of [
  ["study-a-editorial-italic.svg", a],
  ["study-b-unified-serif.svg", b],
  ["study-c-sporting-signature.svg", c],
]) {
  await fs.writeFile(path.join(outDir, name), artwork);
  await sharp(Buffer.from(artwork))
    .resize({ width: 1400 })
    .png()
    .toFile(path.join(outDir, name.replace(".svg", ".png")));
}

const contact = await sharp({
  create: { width: 1400, height: 1680, channels: 3, background: ivory },
})
  .composite(
    await Promise.all(
      [a, b, c].map(async (artwork, index) => ({
        input: await sharp(Buffer.from(artwork)).png().toBuffer(),
        top: index * 560,
        left: 0,
      })),
    ),
  )
  .png()
  .toBuffer();

await fs.writeFile(path.join(outDir, "wordmark-studies-contact.png"), contact);
console.log("Generated Racquet Habit v3 wordmark studies.");
