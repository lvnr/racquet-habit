import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "brand-v3", "patterns");
const proofDir = path.join(root, "design", "brand-v3", "proofs");

const GREEN = "#103C2C";
const IVORY = "#F3EBD8";
const PURPLE = "#4E3265";

await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(proofDir, { recursive: true });

function documentSvg({ viewBox, title, content }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${title}">
  ${content}
</svg>\n`;
}

const stripe = documentSvg({
  viewBox: "0 0 240 240",
  title: "Racquet Habit championship stripe repeat",
  content: `<rect width="240" height="240" fill="${IVORY}"/>
  <rect width="240" height="84" fill="${GREEN}"/>
  <rect y="156" width="240" height="84" fill="${GREEN}"/>
  <rect y="104" width="240" height="5" fill="${PURPLE}"/>
  <rect y="131" width="240" height="5" fill="${PURPLE}"/>`,
});

const stringGrid = documentSvg({
  viewBox: "0 0 120 120",
  title: "Racquet Habit diagonal string grid repeat",
  content: `<rect width="120" height="120" fill="${IVORY}"/>
  <g fill="none" stroke="${GREEN}" stroke-width="2">
    <path d="M-90 0 L30 120 M-60 0 L60 120 M-30 0 L90 120 M0 0 L120 120 M30 0 L150 120 M60 0 L180 120 M90 0 L210 120"/>
    <path d="M30 0 L-90 120 M60 0 L-60 120 M90 0 L-30 120 M120 0 L0 120 M150 0 L30 120 M180 0 L60 120 M210 0 L90 120"/>
  </g>`,
});

const courtFrame = documentSvg({
  viewBox: "0 0 400 400",
  title: "Racquet Habit unresolved court frame",
  content: `<rect width="400" height="400" fill="${GREEN}"/>
  <g fill="none" stroke="${IVORY}" stroke-width="11">
    <path d="M-20 42 L296 358 H421"/>
    <path d="M-20 358 H238"/>
    <path d="M278 358 H421"/>
    <path d="M316 -20 V358"/>
  </g>
  <circle cx="258" cy="358" r="6" fill="${PURPLE}"/>`,
});

const ballSeam = documentSvg({
  viewBox: "0 0 160 120",
  title: "Racquet Habit tennis seam repeat",
  content: `<rect width="160" height="120" fill="${IVORY}"/>
  <g fill="none" stroke="${GREEN}" stroke-width="3" stroke-linecap="round">
    <path d="M-34 34 C-8 4 17 4 43 34 S94 64 120 34 S171 4 197 34"/>
    <path d="M-37 86 C-11 56 14 56 40 86 S91 116 117 86 S168 56 194 86"/>
  </g>
  <circle cx="80" cy="60" r="4" fill="${PURPLE}"/>`,
});

const dashField = documentSvg({
  viewBox: "0 0 96 96",
  title: "Racquet Habit court dash field repeat",
  content: `<rect width="96" height="96" fill="${IVORY}"/>
  <g stroke="${GREEN}" stroke-width="3" stroke-linecap="round">
    <path d="M12 10 V24 M36 10 V24 M60 10 V24 M84 10 V24"/>
    <path d="M24 42 V56 M48 42 V56 M72 42 V56"/>
    <path d="M12 74 V88 M36 74 V88 M84 74 V88"/>
  </g>
  <circle cx="60" cy="81" r="3" fill="${PURPLE}"/>`,
});

const assets = [
  ["pattern-championship-stripe.svg", stripe],
  ["pattern-string-grid.svg", stringGrid],
  ["pattern-court-frame.svg", courtFrame],
  ["pattern-ball-seam.svg", ballSeam],
  ["pattern-dash-field.svg", dashField],
];

for (const [name, artwork] of assets) {
  await fs.writeFile(path.join(outDir, name), artwork);
}

const proofTiles = await Promise.all(
  assets.map(async ([, artwork]) =>
    sharp(Buffer.from(artwork))
      .resize(460, 460, { fit: "cover" })
      .extend({
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
        background: IVORY,
      })
      .png()
      .toBuffer(),
  ),
);

const proof = sharp({
  create: {
    width: 2600,
    height: 540,
    channels: 3,
    background: "#E9DDC7",
  },
}).composite(
  proofTiles.map((input, index) => ({ input, left: 20 + index * 520, top: 20 })),
);

await proof.png().toFile(path.join(proofDir, "pattern-system-production-proof.png"));
console.log("Generated Racquet Habit v3 pattern masters.");
