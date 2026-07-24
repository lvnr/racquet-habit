// Traces the handmade-club identity artwork into production SVGs.
// Outputs: public/brand-clubhouse/{logo-stacked,logo-racquet,logo-habit,monogram}.svg
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";

const OUT = "public/brand-clubhouse";
mkdirSync(OUT, { recursive: true });
const IDENTITY = "design/brand-fixed/identity/identity-main-handmade-club.png";

async function maskToPbm(region, classify, excludes = []) {
  const { data, info } = await sharp(IDENTITY).extract(region).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const rowBytes = Math.ceil(width / 8);
  const bits = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (excludes.some((e) => x >= e[0] && x < e[1] && y >= e[2] && y < e[3])) continue;
      const i = (y * width + x) * info.channels;
      if (classify(data[i], data[i + 1], data[i + 2])) {
        bits[y * rowBytes + (x >> 3)] |= 0x80 >> (x & 7);
      }
    }
  }
  return { header: Buffer.from(`P4\n${width} ${height}\n`), bits, width, height };
}

function trace(name, pbm, color) {
  const pbmPath = `tmp/${name}.pbm`;
  writeFileSync(pbmPath, Buffer.concat([pbm.header, pbm.bits]));
  const svgPath = `tmp/${name}.svg`;
  execFileSync("potrace", [pbmPath, "-s", "-t", "6", "-O", "0.4", "--flat", "-o", svgPath]);
  const svg = readFileSync(svgPath, "utf8");
  const match = svg.match(/<g transform="([^"]+)"[^>]*>([\s\S]*?)<\/g>/);
  if (!match) throw new Error(`no group in ${name}`);
  return `<g transform="${match[1]}" fill="${color}" stroke="none">${match[2]}</g>`;
}

const isRed = (r, g) => r - g > 60 && r > 120;
const isGreen = (r, g, b) => g - r > 8 && g < 150 && b < 150;

// Region: the large stacked lockup. Within it (1040x600 @ offset 40,100):
// serif subline + underline live at x>340, y>470 — excluded per mask.
const region = { left: 40, top: 100, width: 1040, height: 600 };
const sublineExclude = [[330, 1040, 465, 600]];

const greenPbm = await maskToPbm(region, isGreen, sublineExclude);
const redPbm = await maskToPbm(region, isRed, sublineExclude);
const racquetGroup = trace("racquet-green", greenPbm, "var(--logo-green, #17402E)");
const habitGroup = trace("habit-red", redPbm, "var(--logo-red, #D2402A)");

const W = region.width, H = region.height;
writeFileSync(`${OUT}/logo-stacked.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${racquetGroup}${habitGroup}</svg>\n`);
writeFileSync(`${OUT}/logo-racquet.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${racquetGroup}</svg>\n`);
writeFileSync(`${OUT}/logo-habit.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${habitGroup}</svg>\n`);

// Monogram (RH oval racquet), right side of the identity sheet.
const monoRegion = { left: 1080, top: 120, width: 420, height: 560 };
const monoPbm = await maskToPbm(monoRegion, isGreen);
const monoGroup = trace("monogram-green", monoPbm, "var(--logo-green, #17402E)");
writeFileSync(`${OUT}/monogram.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 560">${monoGroup}</svg>\n`);

console.log("traced: logo-stacked, logo-racquet, logo-habit, monogram");

const inner = (file) => readFileSync(`${OUT}/${file}`, "utf8").match(/<g [\s\S]*<\/g>/)[0];

// ---- Horizontal lockup, traced natively from the small clean lockup ----
// Region holds "RACQUET Habit" side by side; the serif subline below is excluded
// from the green mask (it is re-set as live text on the site).
const smallRegion = { left: 90, top: 680, width: 745, height: 250 };
const smallSublineExclude = [[0, 745, 185, 250]];
const racquetSmallPbm = await maskToPbm(smallRegion, isGreen, smallSublineExclude);
const habitSmallPbm = await maskToPbm(smallRegion, isRed);
const racquetSmall = trace("racquet-small", racquetSmallPbm, "RFILL");
const habitSmall = trace("habit-small", habitSmallPbm, "HFILL");

const horizontal = (racquetFill, habitFill) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="30 47 660 155">` +
  racquetSmall.replace("RFILL", racquetFill) +
  habitSmall.replace("HFILL", habitFill) +
  `</svg>\n`;
writeFileSync(`${OUT}/logo-horizontal.svg`, horizontal("var(--logo-green, #17402E)", "var(--logo-red, #D2402A)"));
writeFileSync(`${OUT}/logo-horizontal-cream.svg`, horizontal("#F5EFE1", "#E04A32"));

// Favicon: monogram centered on a cream disc.
const faviconSvg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-67 8 546 546">` +
  `<circle cx="206" cy="281" r="272" fill="#F5EFE1"/>` +
  `<g transform="translate(0,0)">${inner("monogram.svg").replace(/fill="[^"]*"/, 'fill="#17402E"')}</g>` +
  `</svg>\n`;
writeFileSync("public/favicon.svg", faviconSvg);
console.log("composed: logo-horizontal(-cream), favicon");

// Cream monogram for dark surfaces.
writeFileSync(`${OUT}/monogram-cream.svg`,
  readFileSync(`${OUT}/monogram.svg`, "utf8").replace(/var\(--logo-green, #17402E\)/g, "#F0E9D8"));
console.log("monogram-cream");
