import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const concepts = path.join(root, "design", "brand-v3", "concepts");
const publicImages = path.join(root, "public", "images", "v3");
const finalDir = path.join(publicImages, "final");
const productDir = path.join(publicImages, "products");
const reviewDir = path.join(root, "design", "brand-v3", "review");
const merchDir = path.join(root, "public", "merch-v3");
const brandDir = path.join(root, "public", "brand-v3");
const GREEN = "#103C2C";
const IVORY = "#F3EBD8";
const PURPLE = "#4E3265";

await Promise.all([finalDir, productDir, reviewDir].map((directory) => fs.mkdir(directory, { recursive: true })));

const sources = {
  heroA: path.join(concepts, "campaign-hero", "hero-a-sunlit-sideline.png"),
  heroB: path.join(concepts, "campaign-hero", "hero-b-between-sets.png"),
  heroC: path.join(concepts, "campaign-hero", "hero-c-clubhouse-threshold.png"),
  stillA: path.join(concepts, "court-still-life", "still-life-a-service-box-grid.png"),
  stillB: path.join(concepts, "court-still-life", "still-life-b-bench-after-play.png"),
  stillC: path.join(concepts, "court-still-life", "still-life-c-club-table.png"),
  posterA: path.join(concepts, "tournament-poster", "poster-a-impact.png"),
  posterB: path.join(concepts, "tournament-poster", "poster-b-rally-sequence.png"),
  posterC: path.join(concepts, "tournament-poster", "poster-c-string-tension.png"),
  packagingA: path.join(concepts, "packaging", "packaging-a-tournament-desk.png"),
  packagingB: path.join(concepts, "packaging", "packaging-b-club-equipment-room.png"),
  packagingC: path.join(concepts, "packaging", "packaging-c-post-match-hospitality.png"),
};

async function exportRaster(source, name, { width, height, fit = "cover", position = "centre" } = {}) {
  const base = sharp(source).rotate();
  const resized = width || height ? base.resize({ width, height, fit, position, withoutEnlargement: true }) : base;
  await Promise.all([
    resized.clone().webp({ quality: 88, effort: 6 }).toFile(path.join(finalDir, `${name}.webp`)),
    resized.clone().avif({ quality: 65, effort: 7 }).toFile(path.join(finalDir, `${name}.avif`)),
    resized.clone().jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(finalDir, `${name}.jpg`)),
  ]);
}

await exportRaster(sources.heroC, "campaign-hero", { width: 1536, height: 1024 });
await exportRaster(sources.heroA, "campaign-hero-mobile", { width: 819, height: 1024, position: "right" });
await exportRaster(sources.heroB, "campaign-between-sets", { width: 1536, height: 1024 });
await exportRaster(sources.stillA, "court-still-life", { width: 1254, height: 1254 });
await exportRaster(sources.stillB, "court-still-life-editorial", { width: 1254, height: 1254 });
await exportRaster(sources.posterA, "tournament-poster", { width: 1024, height: 1536 });
await exportRaster(sources.posterC, "tournament-poster-string-tension", { width: 1024, height: 1536 });
await exportRaster(sources.packagingA, "packaging-tournament-desk", { width: 1536, height: 1024 });

const wordmark = await sharp(path.join(brandDir, "logo-primary-editorial-ivory.svg"), { density: 360 })
  .resize({ width: 520, height: 300, fit: "contain" })
  .png()
  .toBuffer();
const ogOverlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="url(#shade)"/>
  <defs><linearGradient id="shade" x1="0" x2="1"><stop stop-color="${GREEN}" stop-opacity=".9"/><stop offset=".58" stop-color="${GREEN}" stop-opacity=".15"/><stop offset="1" stop-color="${GREEN}" stop-opacity="0"/></linearGradient></defs>
  <text x="72" y="546" fill="${IVORY}" font-family="Arial, sans-serif" font-size="17" letter-spacing="5">TENNIS ADDICTS SOCIETY · YEREVAN · EST. 2026</text>
</svg>`);
await sharp(sources.heroC)
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .composite([
    { input: ogOverlay, left: 0, top: 0 },
    { input: wordmark, left: 70, top: 105 },
  ])
  .jpeg({ quality: 91, mozjpeg: true })
  .toFile(path.join(finalDir, "og-racquet-habit.jpg"));

const productSpecs = [
  ["society-tee", "apparel-society-tee-back.png", IVORY],
  ["last-set-tee", "apparel-last-set-back.png", GREEN],
  ["championship-towel", "accessory-championship-towel.png", IVORY],
  ["society-tote", "accessory-society-tote.png", IVORY],
  ["one-more-set-mug", "drinkware-one-more-set-mug-wrap.png", IVORY],
  ["court-vessel", "drinkware-court-vessel-wrap.png", IVORY],
  ["after-set-coffee", "hospitality-after-set-coffee-label.png", IVORY],
  ["fifth-set-drink", "hospitality-fifth-set-drink-label.png", GREEN],
];

for (const [name, sourceName, background] of productSpecs) {
  await sharp({
    create: { width: 1200, height: 1500, channels: 3, background },
  })
    .composite([
      {
        input: await sharp(path.join(merchDir, sourceName))
          .resize({ width: 980, height: 1180, fit: "inside", withoutEnlargement: true })
          .png()
          .toBuffer(),
        gravity: "centre",
      },
    ])
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(productDir, `${name}.webp`));
}

const patch = await sharp(path.join(brandDir, "logo-society-patch.svg"), { density: 360 })
  .resize({ width: 760, height: 360, fit: "contain" })
  .png()
  .toBuffer();
await sharp({ create: { width: 1200, height: 1500, channels: 3, background: IVORY } })
  .composite([
    { input: patch, left: 220, top: 470 },
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500">
        <path d="M160 1160 H1040" stroke="${PURPLE}" stroke-width="8"/>
      </svg>`),
      left: 0,
      top: 0,
    },
  ])
  .webp({ quality: 90, effort: 6 })
  .toFile(path.join(productDir, "member-cap.webp"));

const families = [
  ["Campaign heroes", [sources.heroA, sources.heroB, sources.heroC], ["A · Sunlit Sideline", "B · Between Sets", "C · Clubhouse Threshold"], 2],
  ["Court still lifes", [sources.stillA, sources.stillB, sources.stillC], ["A · Service Box Grid", "B · Bench After Play", "C · Club Table"], 0],
  ["Tournament posters", [sources.posterA, sources.posterB, sources.posterC], ["A · Impact", "B · Rally Sequence", "C · String Tension"], 0],
  ["Packaging", [sources.packagingA, sources.packagingB, sources.packagingC], ["A · Tournament Desk", "B · Equipment Room", "C · Hospitality"], 0],
];

const boardWidth = 2400;
const rowHeight = 850;
const boardHeight = 260 + families.length * rowHeight + 120;
const composites = [{
  input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${boardWidth}" height="260">
    <rect width="${boardWidth}" height="260" fill="${GREEN}"/>
    <text x="84" y="105" fill="${IVORY}" font-family="Georgia, serif" font-size="62">Raster Asset Selection / 01</text>
    <text x="88" y="166" fill="${IVORY}" font-family="Arial, sans-serif" font-size="18" letter-spacing="5">TWELVE SERIAL STUDIES · FOUR SELECTED WEBSITE MASTERS</text>
  </svg>`),
  left: 0,
  top: 0,
}];

for (let row = 0; row < families.length; row += 1) {
  const [title, images, labels, selectedIndex] = families[row];
  const top = 260 + row * rowHeight;
  composites.push({
    input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${boardWidth}" height="${rowHeight}">
      <rect width="${boardWidth}" height="${rowHeight}" fill="${IVORY}"/>
      <text x="84" y="66" fill="${GREEN}" font-family="Georgia, serif" font-size="36">${title}</text>
      <path d="M84 92 H2316" stroke="${GREEN}" stroke-opacity=".35"/>
    </svg>`),
    left: 0,
    top,
  });
  for (let col = 0; col < 3; col += 1) {
    const left = 84 + col * 755;
    const preview = await sharp(images[col])
      .resize({ width: 680, height: 650, fit: "cover", position: "centre" })
      .png()
      .toBuffer();
    composites.push({ input: preview, left, top: top + 125 });
    composites.push({
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="680" height="55">
        <rect width="680" height="55" fill="${col === selectedIndex ? GREEN : IVORY}"/>
        <text x="18" y="35" fill="${col === selectedIndex ? IVORY : GREEN}" font-family="Arial, sans-serif" font-size="17" letter-spacing="2">${labels[col]}${col === selectedIndex ? " · SELECTED" : ""}</text>
      </svg>`),
      left,
      top: top + 775,
    });
  }
}

await sharp({ create: { width: boardWidth, height: boardHeight, channels: 3, background: IVORY } })
  .composite(composites)
  .png({ compressionLevel: 9 })
  .toFile(path.join(reviewDir, "raster-asset-selection-01.png"));

console.log("Prepared Racquet Habit v3 web images, product previews, OG art, and selection board.");
