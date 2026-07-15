import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const publicDir = new URL("../public/", import.meta.url);
const imageDir = new URL("images/v2/", publicDir);
const brandDir = new URL("brand-v2/", publicDir);
const exportDir = new URL("exports/", brandDir);
const path = (url) => fileURLToPath(url);

await mkdir(path(exportDir), { recursive: true });

for (const name of ["campaign-hero", "campaign-hero-close", "court-still-life", "tournament-poster"]) {
  const source = new URL(`${name}.png`, imageDir);
  await sharp(path(source)).webp({ quality: 84, effort: 6 }).toFile(path(new URL(`${name}.webp`, imageDir)));
}

const hero = new URL("campaign-hero.png", imageDir);
const overlay = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#103C2C" opacity=".24"/>
  <text x="58" y="230" fill="#F3EBD8" font-family="Georgia,serif" font-size="128" letter-spacing="3">RACQUET</text>
  <text x="285" y="360" fill="#F3EBD8" font-family="cursive" font-style="italic" font-size="128">Habit</text>
  <line x1="282" y1="380" x2="715" y2="360" stroke="#F3EBD8" stroke-width="4"/>
  <text x="64" y="530" fill="#F3EBD8" font-family="Arial,sans-serif" font-size="18" letter-spacing="6">TENNIS ADDICTS SOCIETY · EST. 2026</text>
</svg>`);

await sharp(path(hero))
  .resize(1200, 630, { fit: "cover", position: "center" })
  .composite([{ input: overlay }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(path(new URL("og-racquet-habit.jpg", imageDir)));

const favicon = await readFile(path(new URL("favicon.svg", publicDir)));
await Promise.all([
  sharp(favicon, { density: 240 }).resize(180, 180).png().toFile(path(new URL("apple-touch-icon.png", publicDir))),
  sharp(favicon, { density: 240 }).resize(32, 32).png().toFile(path(new URL("favicon-32.png", publicDir))),
]);

for (const name of ["logo-primary-editorial", "logo-primary-horizontal", "logo-rh-monogram", "logo-rh-monogram-embroidery", "logo-society-signature", "logo-oval-seal", "logo-racquet-flourish", "mark-bounce"]) {
  const svg = await readFile(path(new URL(`${name}.svg`, brandDir)));
  for (const scale of [1, 2, 4]) {
    await sharp(svg, { density: 144 * scale }).png().toFile(path(new URL(`${name}@${scale}x.png`, exportDir)));
  }
}
