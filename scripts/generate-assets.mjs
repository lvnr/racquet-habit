import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const publicDir = new URL("../public/", import.meta.url);
const imageDir = new URL("images/", publicDir);
const brandDir = new URL("brand/", publicDir);
const path = (url) => fileURLToPath(url);

const hero = new URL("hero-night-court.png", imageDir);
await Promise.all([
  sharp(path(hero)).resize({ width: 2200, withoutEnlargement: true }).avif({ quality: 68, effort: 6 }).toFile(path(new URL("hero-night-court.avif", imageDir))),
  sharp(path(hero)).resize({ width: 2200, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(path(new URL("hero-night-court.webp", imageDir))),
  sharp(path(new URL("../favicon.svg", brandDir))).resize(180, 180).png().toFile(path(new URL("apple-touch-icon.png", publicDir))),
  sharp(path(new URL("../favicon.svg", brandDir))).resize(32, 32).png().toFile(path(new URL("favicon-32.png", publicDir))),
]);

const overlay = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="fade" x1="0" x2="1"><stop stop-color="#101A16" stop-opacity=".93"/><stop offset=".62" stop-color="#101A16" stop-opacity=".15"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#fade)"/>
  <text x="68" y="235" fill="#F2EEE4" font-family="Georgia,serif" font-size="96" letter-spacing="4">RACQUET</text>
  <text x="68" y="325" fill="#D9F23B" font-family="Georgia,serif" font-style="italic" font-size="104">HABIT</text>
  <text x="73" y="385" fill="#F2EEE4" font-family="Arial,sans-serif" font-size="18" letter-spacing="7">TENNIS ADDICTS SOCIETY / ESTABLISHED 2026</text>
  <line x1="73" y1="427" x2="474" y2="427" stroke="#F2EEE4" stroke-opacity=".55"/>
  <text x="73" y="470" fill="#F2EEE4" font-family="Arial,sans-serif" font-size="15" letter-spacing="4">A DIFFICULT HABIT TO BREAK</text>
</svg>`);

await sharp(path(hero))
  .resize(1200, 630, { fit: "cover", position: "center" })
  .composite([{ input: overlay }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(path(new URL("og-racquet-habit.jpg", imageDir)));

for (const name of ["print-society-seal", "print-habit-loop", "print-lattice"]) {
  const svg = await readFile(path(new URL(`${name}.svg`, brandDir)));
  await sharp(svg, { density: 240 }).resize(2400, 2400).png().toFile(path(new URL(`${name}.png`, brandDir)));
}
