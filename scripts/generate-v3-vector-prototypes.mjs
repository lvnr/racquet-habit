import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "brand-v3");
const exportDir = path.join(outDir, "exports");
const designDir = path.join(root, "design", "brand-v3");
const prototypeDir = path.join(designDir, "prototypes");
const prototypeExportDir = path.join(prototypeDir, "exports");
const instrumentPath = path.join(
  root,
  "node_modules",
  "@fontsource",
  "instrument-serif",
  "files",
  "instrument-serif-latin-400-normal.woff",
);
const signPainterPath = "/tmp/SignPainter-Semibold.ttf";
const monogramSourcePath = path.join(
  designDir,
  "references",
  "rh-monogram-source-trace.svg",
);
const monogramEmbroiderySourcePath = path.join(
  designDir,
  "references",
  "rh-monogram-embroidery-source-trace.svg",
);

await fs.mkdir(exportDir, { recursive: true });
await fs.mkdir(prototypeExportDir, { recursive: true });

async function loadFont(fontPath) {
  const bytes = await fs.readFile(fontPath);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return opentype.parse(buffer);
}

const instrument = await loadFont(instrumentPath);
let script;
try {
  script = await loadFont(signPainterPath);
} catch {
  script = await loadFont(
    path.join(
      root,
      "node_modules",
      "@fontsource",
      "yellowtail",
      "files",
      "yellowtail-latin-400-normal.woff",
    ),
  );
}

const GREEN = "#103C2C";
const IVORY = "#F3EBD8";
const PURPLE = "#4E3265";

function trackedPath(font, text, x, baseline, fontSize, tracking = 0) {
  let cursor = x;
  const parts = [];
  for (const character of text) {
    const glyph = font.charToGlyph(character);
    parts.push(glyph.getPath(cursor, baseline, fontSize).toPathData(3));
    cursor += (glyph.advanceWidth / font.unitsPerEm) * fontSize + tracking;
  }
  return { d: parts.join(" "), width: cursor - x - tracking };
}

function solidPath(d, fill = GREEN, extra = "") {
  return `<path d="${d}" fill="${fill}" ${extra}/>`;
}

function documentSvg({ viewBox, title, content }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-labelledby="title">
  <title id="title">${title}</title>
  ${content.trim()}
</svg>\n`;
}

async function readPotraceData(filePath) {
  const svg = await fs.readFile(filePath, "utf8");
  const pathMatch = svg.match(/<path d="([\s\S]*?)"\/>/);
  const viewBoxMatch = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!pathMatch || !viewBoxMatch) {
    throw new Error(`No traced path or viewBox found in ${filePath}`);
  }
  return {
    d: pathMatch[1],
    width: Number(viewBoxMatch[1]),
    height: Number(viewBoxMatch[2]),
  };
}

async function writeSvg(
  name,
  svg,
  width,
  { destination = outDir, exportDestination = exportDir } = {},
) {
  const target = path.join(destination, name);
  await fs.writeFile(target, svg);
  const baseName = name.replace(/\.svg$/, "");
  await Promise.all(
    [
      ["@1x.png", Math.round(width / 2)],
      ["@2x.png", width],
      ["@4x.png", width * 2],
    ].map(([suffix, exportWidth]) =>
      sharp(Buffer.from(svg))
        .resize({ width: exportWidth })
        .png()
        .toFile(path.join(exportDestination, `${baseName}${suffix}`)),
    ),
  );
}

const racquet = trackedPath(instrument, "RACQUET", 72, 228, 246, 2.5);
const habit = script.getPath("Habit", 304, 386, 205).toPathData(3);
const editorial = documentSvg({
  viewBox: "0 0 1200 460",
  title: "Racquet Habit editorial wordmark",
  content: `
  ${solidPath(racquet.d)}
  <g transform="rotate(-4 304 386)">
    ${solidPath(habit)}
    <path d="M714 365 C800 371 889 358 1004 330" fill="none" stroke="${GREEN}" stroke-width="12" stroke-linecap="round"/>
  </g>`,
});

const horizontalText = trackedPath(instrument, "RACQUET HABIT", 28, 132, 126, 2.4);
const horizontal = documentSvg({
  viewBox: "0 0 1120 175",
  title: "Racquet Habit horizontal wordmark",
  content: solidPath(horizontalText.d),
});

const monogramTrace = await readPotraceData(monogramSourcePath);
const monogramEmbroideryTrace = await readPotraceData(monogramEmbroiderySourcePath);
function buildMonogramSvg(trace, color, title) {
  return documentSvg({
    viewBox: `-24 -24 ${trace.width + 48} ${trace.height + 48}`,
    title,
    content: `
  <g transform="translate(0 ${trace.height}) scale(.1 -.1)" fill="${color}">
    <path d="${trace.d}"/>
  </g>`,
  });
}

const monogram = buildMonogramSvg(
  monogramTrace,
  GREEN,
  "Racquet Habit RH monogram",
);
const monogramIvory = buildMonogramSvg(
  monogramTrace,
  IVORY,
  "Racquet Habit RH monogram — ivory",
);
const monogramBlack = buildMonogramSvg(
  monogramTrace,
  "#000000",
  "Racquet Habit RH monogram — black production",
);
const rhIcon = documentSvg({
  viewBox: "0 0 64 64",
  title: "Racquet Habit RH icon",
  content: `
  <rect width="64" height="64" fill="${GREEN}"/>
  <g transform="translate(5 9) scale(.07)">
    <g transform="translate(0 ${monogramTrace.height}) scale(.1 -.1)" fill="${IVORY}">
      <path d="${monogramTrace.d}"/>
    </g>
  </g>`,
});

const monogramEmbroidery = buildMonogramSvg(
  monogramEmbroideryTrace,
  GREEN,
  "Racquet Habit embroidery-safe RH monogram",
);
const monogramEmbroideryIvory = buildMonogramSvg(
  monogramEmbroideryTrace,
  IVORY,
  "Racquet Habit embroidery-safe RH monogram — ivory",
);
const monogramEmbroideryBlack = buildMonogramSvg(
  monogramEmbroideryTrace,
  "#000000",
  "Racquet Habit embroidery-safe RH monogram — black production",
);

const patchTitle = trackedPath(instrument, "RACQUET HABIT", 250, 120, 76, 1.7);
const patchSociety = trackedPath(instrument, "TENNIS ADDICTS SOCIETY", 252, 180, 24, 2.2);
const patchEst = trackedPath(instrument, "EST. 2026", 821, 247, 24, 1.5);
const patch = documentSvg({
  viewBox: "0 0 1000 300",
  title: "Racquet Habit Society woven patch",
  content: `
  <rect x="8" y="8" width="984" height="284" rx="46" fill="${GREEN}"/>
  <rect x="25" y="25" width="950" height="250" rx="32" fill="none" stroke="${IVORY}" stroke-width="8"/>
  <path d="M216 27 V273 M770 27 V273" stroke="${IVORY}" stroke-width="6"/>
  <g fill="none" stroke="${IVORY}" stroke-width="4" opacity=".94">
    <path d="M55 68 H185 M55 102 H185 M55 136 H185 M55 170 H185 M55 204 H185 M55 238 H185"/>
    <path d="M74 50 V250 M104 50 V250 M134 50 V250 M164 50 V250"/>
  </g>
  <path d="M56 148 C88 131 111 164 139 145 C158 132 170 137 186 147" fill="none" stroke="${PURPLE}" stroke-width="10" stroke-linecap="round"/>
  ${solidPath(patchTitle.d, IVORY)}
  <path d="M251 143 H718" stroke="${IVORY}" stroke-width="5"/>
  ${solidPath(patchSociety.d, IVORY)}
  ${solidPath(patchEst.d, IVORY)}
  <g transform="translate(790 65) scale(.23)">
    <g transform="translate(0 ${monogramTrace.height}) scale(.1 -.1)" fill="${IVORY}">
      <path d="${monogramTrace.d}"/>
    </g>
  </g>`,
});

const flourish = documentSvg({
  viewBox: "0 0 1000 260",
  title: "Racquet Habit service arc flourish",
  content: `
  <path d="M72 58 C208 44 342 104 456 204 C474 220 492 224 510 215" fill="none" stroke="${GREEN}" stroke-width="13" stroke-linecap="round"/>
  <path d="M528 208 C650 82 777 47 932 68" fill="none" stroke="${GREEN}" stroke-width="13" stroke-linecap="round"/>
  <circle cx="504" cy="220" r="10" fill="${GREEN}"/>
  <g fill="none" stroke="${GREEN}" stroke-width="8" stroke-linecap="round">
    <path d="M504 188 V172 M480 197 L468 185 M528 197 L540 185"/>
  </g>`,
});

const bounce = documentSvg({
  viewBox: "0 0 64 64",
  title: "Racquet Habit bounce mark",
  content: `
  <circle cx="32" cy="32" r="6" fill="${GREEN}"/>
  <g stroke="${GREEN}" stroke-width="4" stroke-linecap="round">
    <path d="M32 5 V17 M32 47 V59 M5 32 H17 M47 32 H59"/>
    <path d="M13 13 L20 20 M44 44 L51 51 M51 13 L44 20 M20 44 L13 51"/>
  </g>`,
});

await Promise.all([
  writeSvg("logo-primary-editorial.svg", editorial, 2400, {
    destination: prototypeDir,
    exportDestination: prototypeExportDir,
  }),
  writeSvg("logo-primary-horizontal.svg", horizontal, 2000, {
    destination: prototypeDir,
    exportDestination: prototypeExportDir,
  }),
  writeSvg("logo-rh-monogram.svg", monogram, 1080),
  writeSvg("logo-rh-monogram-ivory.svg", monogramIvory, 1080),
  writeSvg("logo-rh-monogram-black.svg", monogramBlack, 1080),
  writeSvg("logo-rh-monogram-embroidery.svg", monogramEmbroidery, 880),
  writeSvg("logo-rh-monogram-embroidery-ivory.svg", monogramEmbroideryIvory, 880),
  writeSvg("logo-rh-monogram-embroidery-black.svg", monogramEmbroideryBlack, 880),
  writeSvg("mark-rh-icon.svg", rhIcon, 512),
  writeSvg("logo-society-patch.svg", patch, 2400, {
    destination: prototypeDir,
    exportDestination: prototypeExportDir,
  }),
  writeSvg("logo-racquet-flourish.svg", flourish, 2400, {
    destination: prototypeDir,
    exportDestination: prototypeExportDir,
  }),
  writeSvg("mark-bounce.svg", bounce, 512, {
    destination: prototypeDir,
    exportDestination: prototypeExportDir,
  }),
]);

console.log("Generated Racquet Habit v3 vector prototypes.");
