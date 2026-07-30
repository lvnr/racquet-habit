import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "marketing/assets/launch");
const PRODUCTION = path.join(ROOT, "design/brand-fixed/production");
const IDENTITY = path.join(ROOT, "design/brand-fixed/identity");

const COLORS = {
  forest: "#24493A",
  ivory: "#FFF7EE",
  red: "#E93622",
  ink: "#17352B",
  blush: "#F1D3C8",
  clay: "#B65E46",
  yellow: "#E9C75C",
  sky: "#AFC9CD",
  paper: "#F4ECE2",
  line: "#D8CFC4",
};

const fontData = {
  geist: await fs.readFile(
    path.join(ROOT, "node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2"),
  ),
  condensed: await fs.readFile(
    path.join(
      ROOT,
      "node_modules/@fontsource-variable/roboto-condensed/files/roboto-condensed-latin-wght-normal.woff2",
    ),
  ),
};

const fontFace = `
  @font-face{font-family:Geist;src:url(data:font/woff2;base64,${fontData.geist.toString("base64")})}
  @font-face{font-family:Condensed;src:url(data:font/woff2;base64,${fontData.condensed.toString("base64")})}
`;

const instrumentFontPath = path.join(IDENTITY, "fonts/InstrumentSerif-Regular.ttf");

const products = [
  {
    slug: "racquet-habit-night-court-rh-monogram-tee",
    name: "Night Court RH Monogram Tee",
    capsule: "Signed Rally — Founding Issue",
    hero: "catalog-back.png",
  },
  {
    slug: "racquet-habit-minimal-black-crop-top",
    name: "Minimal Black Crop Top",
    capsule: "Signed Rally — Founding Issue",
    hero: "catalog-back.png",
  },
  {
    slug: "minimal-green-monogram-crop-top",
    name: "Minimal Green Monogram Crop Top",
    capsule: "Signed Rally — Founding Issue",
    hero: "catalog-back.png",
  },
  {
    slug: "baseline-plaque-tee",
    name: "Baseline Plaque Tee",
    capsule: "Signed Rally — Founding Issue",
    hero: "catalog-back.png",
  },
  {
    slug: "society-monogram-founding-issue-hat",
    name: "Society Monogram Founding Issue Hat",
    capsule: "Signed Rally — Founding Issue",
    hero: "catalog-front.png",
  },
  {
    slug: "society-monogram-founding-issue-crop-tee",
    name: "Society Monogram Founding Issue Crop Tee",
    capsule: "Signed Rally — Founding Issue",
    hero: "catalog-front.png",
  },
  {
    slug: "signed-rally-founding-issue-crop-tee",
    name: "Signed Rally Founding Issue Crop Tee",
    capsule: "Signed Rally — Founding Issue",
    hero: "catalog-back.png",
  },
  {
    slug: "signed-rally-founding-issue-oversized-tee",
    name: "Signed Rally Founding Issue Oversized Tee",
    capsule: "Signed Rally — Founding Issue",
    hero: "catalog-back.png",
  },
  {
    slug: "tennis-lunch-tennis-tee",
    name: "Tennis Lunch Tennis Tee",
    capsule: "The Daily Lineup",
    hero: "catalog-front.png",
  },
  {
    slug: "tennis-lunch-tennis-crop-tee",
    name: "Tennis Lunch Tennis Crop Tee",
    capsule: "The Daily Lineup",
    hero: "catalog-front.png",
  },
  {
    slug: "out-of-office-court-cap",
    name: "Out of Office Court Cap",
    capsule: "The Daily Lineup",
    hero: "catalog-front.png",
  },
  {
    slug: "something-cold-organic-court-tote",
    name: "Something Cold Organic Court Tote",
    capsule: "Court-Side Pleasures",
    hero: "catalog-front.png",
  },
  {
    slug: "racquets-sunshine-something-cold-beach-towel",
    name: "Racquets, Sunshine & Something Cold Beach Towel",
    capsule: "Court-Side Pleasures",
    hero: "catalog-front.png",
  },
  {
    slug: "court-side-hydration-travel-mug-with-a-handle",
    name: "Court-Side Hydration Travel Mug",
    capsule: "Court-Side Pleasures",
    hero: "catalog-front.png",
  },
  {
    slug: "serve-chilled-tumbler",
    name: "Serve Chilled Tumbler",
    capsule: "Court-Side Pleasures",
    hero: "catalog-front.png",
  },
  {
    slug: "racquets-sunshine-something-bubbly-crop-tee",
    name: "Racquets, Sunshine & Something Bubbly Crop Tee",
    capsule: "Court-Side Pleasures",
    hero: "catalog-back.png",
  },
  {
    slug: "racquets-sunshine-something-bubbly-oversized-tee",
    name: "Racquets, Sunshine & Something Bubbly Oversized Tee",
    capsule: "Court-Side Pleasures",
    hero: "catalog-back.png",
  },
  {
    slug: "racquets-sunshine-something-bubbly-oversized-night-tee",
    name: "Racquets, Sunshine & Something Bubbly Night Tee",
    capsule: "Court-Side Pleasures",
    hero: "catalog-back.png",
  },
  {
    slug: "love-cherries-crop-tee",
    name: "Love Cherries Crop Tee",
    capsule: "Love Cherries",
    hero: "catalog-back.png",
  },
  {
    slug: "love-cherries-oversized-tee",
    name: "Love Cherries Oversized Tee — Ecru",
    capsule: "Love Cherries",
    hero: "catalog-back.png",
  },
  {
    slug: "love-cherries-oversized-tee-2",
    name: "Love Cherries Oversized Tee — White",
    capsule: "Love Cherries",
    hero: "catalog-back.png",
  },
  {
    slug: "love-cherries-magsafe-case",
    name: "Love Cherries MagSafe Case",
    capsule: "Love Cherries",
    hero: "catalog-front.png",
  },
  {
    slug: "tennis-is-my-rest-day-tee-dtfx",
    name: "Tennis Is My Rest Day Tee",
    capsule: "Repeat Players",
    hero: "catalog-front.png",
  },
  {
    slug: "emotional-support-racquet-oversized-tee",
    name: "Emotional Support Racquet Oversized Tee",
    capsule: "Repeat Players",
    hero: "catalog-back.png",
  },
];

const bySlug = new Map(products.map((item) => [item.slug, item]));
const wordmarkPath = path.join(IDENTITY, "Wordmark Horizontal 1.png");
const racquetMarkPath = path.join(IDENTITY, "Racquet Mark.png");

const productPath = (slug, filename) => path.join(PRODUCTION, slug, "catalog", filename);
const heroPath = (product) => productPath(product.slug, product.hero);

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrap(value, maxChars) {
  const words = String(value).split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    if (!current || `${current} ${word}`.length <= maxChars) current = current ? `${current} ${word}` : word;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function tspans(lines, x, lineHeight, startY) {
  return lines
    .map((line, index) => `<tspan x="${x}" y="${startY + index * lineHeight}">${esc(line)}</tspan>`)
    .join("");
}

async function instrumentCaption({ lines, width, height, size, fill, gravity = "west" }) {
  const args = [
    "-size",
    `${width}x${height}`,
    "-background",
    "none",
    "-fill",
    fill,
    "-font",
    instrumentFontPath,
    "-pointsize",
    String(size),
    "-gravity",
    gravity,
    "-interline-spacing",
    String(Math.round(size * -0.1)),
    `caption:${lines.join("\n")}`,
    "png:-",
  ];
  return new Promise((resolve, reject) => {
    const process = spawn("magick", args, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
    const chunks = [];
    const errors = [];
    process.stdout.on("data", (chunk) => chunks.push(chunk));
    process.stderr.on("data", (chunk) => errors.push(chunk));
    process.on("error", reject);
    process.on("close", (code) => {
      if (code === 0) resolve(Buffer.concat(chunks));
      else reject(new Error(Buffer.concat(errors).toString() || `magick exited ${code}`));
    });
  });
}

function svg(width, height, body) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <style>${fontFace}</style>
      ${body}
    </svg>
  `);
}

function courtGeometry(width, height, color, opacity = 1) {
  const inset = Math.round(width * 0.075);
  const top = Math.round(height * 0.065);
  const bottom = height - top;
  const middle = Math.round(height * 0.5);
  return `
    <g fill="none" stroke="${color}" stroke-width="${Math.max(2, Math.round(width * 0.002))}" opacity="${opacity}">
      <rect x="${inset}" y="${top}" width="${width - inset * 2}" height="${bottom - top}"/>
      <line x1="${inset}" y1="${middle}" x2="${width - inset}" y2="${middle}"/>
      <line x1="${Math.round(width * 0.5)}" y1="${top}" x2="${Math.round(width * 0.5)}" y2="${bottom}"/>
      <line x1="${Math.round(width * 0.27)}" y1="${Math.round(height * 0.28)}" x2="${Math.round(width * 0.73)}" y2="${Math.round(height * 0.28)}"/>
      <line x1="${Math.round(width * 0.27)}" y1="${Math.round(height * 0.72)}" x2="${Math.round(width * 0.73)}" y2="${Math.round(height * 0.72)}"/>
    </g>
  `;
}

async function ensureDirs() {
  const dirs = [
    "00-review",
    "instagram/IG01-manifesto",
    "instagram/IG03-signed-rally",
    "instagram/IG04-emotional-support",
    "instagram/IG07-love-cherries",
    "instagram/IG09-small-print",
    "instagram/IG12-collection",
    "pinterest/product",
    "pinterest/graphic",
    "stories",
    "highlights",
    "metadata",
  ];
  await Promise.all(dirs.map((dir) => fs.mkdir(path.join(OUT, dir), { recursive: true })));
}

async function resizedInput(file, width, height, fit = "contain", position = "centre") {
  return sharp(file)
    .rotate()
    .resize(width, height, { fit, position, background: COLORS.paper })
    .png()
    .toBuffer();
}

async function brandWordmark(width) {
  return sharp(wordmarkPath).resize({ width }).png().toBuffer();
}

async function brandMark(size) {
  return sharp(racquetMarkPath).resize(size, size, { fit: "contain" }).png().toBuffer();
}

async function renderTypeCard({
  file,
  width = 1080,
  height = 1350,
  headline,
  eyebrow = "RACQUET HABIT · EST. 2026",
  footer = "THE UNOFFICIAL SOCIETY",
  palette = "ivory",
  index = 1,
}) {
  const dark = palette === "forest";
  const bg = dark ? COLORS.forest : COLORS.ivory;
  const fg = dark ? COLORS.ivory : COLORS.forest;
  const accent = COLORS.red;
  const maxChars = headline.length > 45 ? 21 : 18;
  const lines = wrap(headline, maxChars);
  const fontSize = lines.length >= 4 ? 96 : lines.length === 3 ? 112 : 130;
  const lineHeight = Math.round(fontSize * 0.91);
  const total = (lines.length - 1) * lineHeight;
  const startY = Math.round(height * 0.5 - total / 2 + fontSize * 0.24);
  const headlineHeight = Math.max(fontSize + 40, lines.length * lineHeight + 54);
  const headlineOverlay = await instrumentCaption({
    lines,
    width: width - 160,
    height: headlineHeight,
    size: fontSize,
    fill: fg,
    gravity: "center",
  });
  const content = svg(
    width,
    height,
    `
      <rect width="${width}" height="${height}" fill="${bg}"/>
      ${courtGeometry(width, height, fg, 0.12)}
      <rect x="${Math.round(width * 0.075)}" y="${Math.round(height * 0.065)}" width="${Math.round(width * 0.012)}" height="${Math.round(height * 0.16)}" fill="${accent}"/>
      <text x="${Math.round(width * 0.105)}" y="${Math.round(height * 0.095)}" fill="${fg}" font-family="Condensed" font-size="22" letter-spacing="3">${esc(eyebrow)}</text>
      <circle cx="${Math.round(width * 0.5)}" cy="${Math.round(height * 0.82)}" r="7" fill="${accent}"/>
      <text x="${Math.round(width * 0.5)}" y="${Math.round(height * 0.88)}" text-anchor="middle" fill="${fg}" font-family="Geist" font-size="22" font-weight="650" letter-spacing="4">${esc(footer)}</text>
      <text x="${Math.round(width * 0.92)}" y="${Math.round(height * 0.94)}" text-anchor="end" fill="${fg}" font-family="Condensed" font-size="19" letter-spacing="2">0${index}</text>
    `,
  );
  await sharp(content)
    .composite([
      {
        input: headlineOverlay,
        left: 80,
        top: Math.max(0, Math.round(height * 0.5 - headlineHeight / 2)),
      },
    ])
    .png()
    .toFile(file);
}

async function renderProductCard({
  file,
  product,
  source = product.hero,
  width = 1080,
  height = 1350,
  label,
  number = "01",
  crop = false,
  accent = COLORS.red,
}) {
  const photoX = 68;
  const photoY = 162;
  const photoW = width - photoX * 2;
  const photoH = 930;
  const image = await resizedInput(
    productPath(product.slug, source),
    photoW,
    photoH,
    crop ? "cover" : "contain",
  );
  const titleLines = wrap(label || product.name, 31);
  const title = await instrumentCaption({
    lines: titleLines,
    width: 830,
    height: Math.max(78, titleLines.length * 58),
    size: 52,
    fill: COLORS.forest,
    gravity: "west",
  });
  const logo = await brandWordmark(245);
  const base = svg(
    width,
    height,
    `
      <rect width="${width}" height="${height}" fill="${COLORS.ivory}"/>
      <rect x="0" y="0" width="${width}" height="18" fill="${COLORS.forest}"/>
      <text x="68" y="78" fill="${COLORS.forest}" font-family="Condensed" font-size="21" letter-spacing="3">${esc(product.capsule.toUpperCase())}</text>
      <text x="${width - 68}" y="78" text-anchor="end" fill="${COLORS.red}" font-family="Condensed" font-size="21" letter-spacing="3">${esc(number)}</text>
      <rect x="${photoX - 1}" y="${photoY - 1}" width="${photoW + 2}" height="${photoH + 2}" fill="none" stroke="${COLORS.line}" stroke-width="2"/>
      <rect x="68" y="1140" width="8" height="112" fill="${accent}"/>
      <text x="${width - 68}" y="1260" text-anchor="end" fill="${COLORS.forest}" font-family="Geist" font-size="18" font-weight="650" letter-spacing="2">CURRENT CATALOG · 2026</text>
    `,
  );
  await sharp(base)
    .composite([
      { input: image, left: photoX, top: photoY },
      { input: title, left: 102, top: 1142 },
      { input: logo, left: 68, top: height - 62 },
    ])
    .png()
    .toFile(file);
}

async function renderPairCard({ file, product, leftSource, rightSource, label, number = "01" }) {
  const width = 1080;
  const height = 1350;
  const margin = 68;
  const gap = 22;
  const panelW = Math.floor((width - margin * 2 - gap) / 2);
  const panelH = 890;
  const y = 170;
  const [left, right, logo] = await Promise.all([
    resizedInput(productPath(product.slug, leftSource), panelW, panelH, "cover"),
    resizedInput(productPath(product.slug, rightSource), panelW, panelH, "cover"),
    brandWordmark(245),
  ]);
  const title = await instrumentCaption({
    lines: [label],
    width: 850,
    height: 86,
    size: 60,
    fill: COLORS.forest,
    gravity: "west",
  });
  const base = svg(
    width,
    height,
    `
      <rect width="${width}" height="${height}" fill="${COLORS.ivory}"/>
      <rect width="${width}" height="18" fill="${COLORS.forest}"/>
      <text x="${margin}" y="82" fill="${COLORS.forest}" font-family="Condensed" font-size="21" letter-spacing="3">${esc(product.capsule.toUpperCase())}</text>
      <text x="${width - margin}" y="82" text-anchor="end" fill="${COLORS.red}" font-family="Condensed" font-size="21" letter-spacing="3">${esc(number)}</text>
      <rect x="${margin}" y="${y}" width="${panelW}" height="${panelH}" fill="none" stroke="${COLORS.line}" stroke-width="2"/>
      <rect x="${margin + panelW + gap}" y="${y}" width="${panelW}" height="${panelH}" fill="none" stroke="${COLORS.line}" stroke-width="2"/>
      <text x="${margin}" y="1198" fill="${COLORS.forest}" font-family="Geist" font-size="18" font-weight="650" letter-spacing="2">FRONT / BACK · CURRENT CATALOG</text>
    `,
  );
  await sharp(base)
    .composite([
      { input: left, left: margin, top: y },
      { input: right, left: margin + panelW + gap, top: y },
      { input: title, left: margin, top: 1070 },
      { input: logo, left: margin, top: height - 62 },
    ])
    .png()
    .toFile(file);
}

async function renderCollageSlide({ file, title, subtitle, productSlugs, number }) {
  const width = 1080;
  const height = 1350;
  const cols = productSlugs.length > 4 ? 3 : 2;
  const rows = Math.ceil(productSlugs.length / cols);
  const margin = 68;
  const gap = 14;
  const areaY = 290;
  const areaH = 870;
  const cellW = Math.floor((width - margin * 2 - gap * (cols - 1)) / cols);
  const cellH = Math.floor((areaH - gap * (rows - 1)) / rows);
  const comps = [];
  for (let index = 0; index < productSlugs.length; index += 1) {
    const product = bySlug.get(productSlugs[index]);
    const row = Math.floor(index / cols);
    const col = index % cols;
    const image = await resizedInput(heroPath(product), cellW, cellH, "cover");
    comps.push({
      input: image,
      left: margin + col * (cellW + gap),
      top: areaY + row * (cellH + gap),
    });
  }
  const logo = await brandWordmark(245);
  const titleLines = wrap(title, 22);
  const titleOverlay = await instrumentCaption({
    lines: titleLines,
    width: 800,
    height: Math.max(92, titleLines.length * 70),
    size: 70,
    fill: COLORS.forest,
    gravity: "west",
  });
  const base = svg(
    width,
    height,
    `
      <rect width="${width}" height="${height}" fill="${COLORS.ivory}"/>
      <rect width="${width}" height="18" fill="${COLORS.forest}"/>
      <text x="${margin}" y="78" fill="${COLORS.red}" font-family="Condensed" font-size="21" letter-spacing="3">FIVE CAPSULES · 2026</text>
      <text x="${width - margin}" y="78" text-anchor="end" fill="${COLORS.forest}" font-family="Condensed" font-size="21" letter-spacing="3">${esc(number)}</text>
      <text x="${margin}" y="255" fill="${COLORS.forest}" font-family="Geist" font-size="18" font-weight="650" letter-spacing="2">${esc(subtitle.toUpperCase())}</text>
      <rect x="${margin}" y="${areaY}" width="${width - margin * 2}" height="${areaH}" fill="none" stroke="${COLORS.line}" stroke-width="2"/>
      <text x="${width - margin}" y="1262" text-anchor="end" fill="${COLORS.forest}" font-family="Condensed" font-size="19" letter-spacing="2">${productSlugs.length} PIECES SHOWN</text>
    `,
  );
  await sharp(base)
    .composite([
      ...comps,
      { input: titleOverlay, left: margin, top: 95 },
      { input: logo, left: margin, top: height - 62 },
    ])
    .png()
    .toFile(file);
}

async function renderPinterestProduct(product, index) {
  const width = 1000;
  const height = 1500;
  const margin = 70;
  const photoY = 215;
  const photoH = 970;
  const image = await resizedInput(heroPath(product), width - margin * 2, photoH, "contain");
  const logo = await brandWordmark(220);
  const titleLines = wrap(product.name, 29);
  const title = await instrumentCaption({
    lines: titleLines,
    width: 760,
    height: Math.max(80, titleLines.length * 58),
    size: 54,
    fill: COLORS.forest,
    gravity: "west",
  });
  const accentPalette = [COLORS.red, COLORS.yellow, COLORS.blush, COLORS.sky];
  const accent = accentPalette[index % accentPalette.length];
  const base = svg(
    width,
    height,
    `
      <rect width="${width}" height="${height}" fill="${COLORS.ivory}"/>
      <rect x="0" y="0" width="24" height="${height}" fill="${COLORS.forest}"/>
      <rect x="24" y="0" width="10" height="${height}" fill="${accent}"/>
      <text x="${margin}" y="82" fill="${COLORS.forest}" font-family="Condensed" font-size="20" letter-spacing="3">${esc(product.capsule.toUpperCase())}</text>
      <text x="${width - margin}" y="82" text-anchor="end" fill="${COLORS.red}" font-family="Condensed" font-size="20" letter-spacing="3">${String(index + 1).padStart(2, "0")} / 24</text>
      <rect x="${margin}" y="${photoY}" width="${width - margin * 2}" height="${photoH}" fill="${COLORS.paper}" stroke="${COLORS.line}" stroke-width="2"/>
      <rect x="${margin}" y="1240" width="9" height="150" fill="${accent}"/>
      <text x="${width - margin}" y="1412" text-anchor="end" fill="${COLORS.forest}" font-family="Geist" font-size="17" font-weight="650" letter-spacing="2">RACQUET HABIT · EST. 2026</text>
    `,
  );
  await sharp(base)
    .composite([
      { input: image, left: margin, top: photoY },
      { input: logo, left: margin, top: 115 },
      { input: title, left: margin + 32, top: 1230 },
    ])
    .png()
    .toFile(path.join(OUT, "pinterest/product", `PIN-product-${product.slug}-1000x1500.png`));
}

async function renderPinterestGraphic({ file, headline, index, palette }) {
  await renderTypeCard({
    file,
    width: 1000,
    height: 1500,
    headline,
    palette,
    index,
    eyebrow: "RACQUET HABIT · SOCIETY NOTICE",
    footer: "SAVE FOR THE NEXT MATCH",
  });
}

async function renderStory({
  file,
  headline,
  subhead,
  imagePath,
  index,
  palette = "ivory",
  productFit = "cover",
}) {
  const width = 1080;
  const height = 1920;
  const dark = palette === "forest";
  const bg = dark ? COLORS.forest : COLORS.ivory;
  const fg = dark ? COLORS.ivory : COLORS.forest;
  const logo = await brandWordmark(250);
  const comps = [{ input: logo, left: 70, top: 76 }];
  let photoY = 350;
  let photoH = 950;
  if (imagePath) {
    const image = await resizedInput(imagePath, width - 140, photoH, productFit);
    comps.push({ input: image, left: 70, top: photoY });
  }
  const headlineLines = wrap(headline, 20);
  const headlineOverlay = await instrumentCaption({
    lines: headlineLines,
    width: width - 140,
    height: Math.max(130, headlineLines.length * 112),
    size: headlineLines.length > 2 ? 96 : 112,
    fill: fg,
    gravity: "west",
  });
  const base = svg(
    width,
    height,
    `
      <rect width="${width}" height="${height}" fill="${bg}"/>
      ${imagePath ? `<rect x="70" y="${photoY}" width="${width - 140}" height="${photoH}" fill="${COLORS.paper}" stroke="${dark ? COLORS.ivory : COLORS.line}" stroke-width="2"/>` : courtGeometry(width, height, fg, 0.12)}
      <text x="72" y="${imagePath ? 1740 : 1160}" fill="${fg}" font-family="Geist" font-size="24" font-weight="650" letter-spacing="2">${esc(subhead.toUpperCase())}</text>
      <rect x="70" y="1810" width="220" height="7" fill="${COLORS.red}"/>
      <text x="1010" y="1820" text-anchor="end" fill="${fg}" font-family="Condensed" font-size="20" letter-spacing="2">0${index}</text>
    `,
  );
  comps.push({
    input: headlineOverlay,
    left: 70,
    top: imagePath ? 1360 : 650,
  });
  await sharp(base).composite(comps).png().toFile(file);
}

async function renderHighlight({ file, label, index }) {
  const width = 1080;
  const height = 1920;
  const dark = index % 2 === 0;
  const bg = dark ? COLORS.forest : COLORS.ivory;
  const fg = dark ? COLORS.ivory : COLORS.forest;
  const mark = await brandMark(260);
  const base = svg(
    width,
    height,
    `
      <rect width="${width}" height="${height}" fill="${bg}"/>
      ${courtGeometry(width, height, fg, 0.12)}
      <circle cx="540" cy="960" r="270" fill="none" stroke="${fg}" stroke-width="3"/>
      <circle cx="540" cy="960" r="234" fill="${dark ? COLORS.ink : COLORS.paper}"/>
      <text x="540" y="1300" text-anchor="middle" fill="${fg}" font-family="Condensed" font-size="27" font-weight="650" letter-spacing="4">${esc(label.toUpperCase())}</text>
      <rect x="470" y="1350" width="140" height="7" fill="${COLORS.red}"/>
    `,
  );
  await sharp(base).composite([{ input: mark, left: 410, top: 830 }]).png().toFile(file);
}

async function generateInstagram() {
  const manifesto = [
    "The unofficial society for people who said one more set.",
    "Court. Lunch. Court.",
    "Long lunch. Late match.",
    "A difficult habit to break.",
    "Racquet Habit — Est. 2026",
  ];
  for (let index = 0; index < manifesto.length; index += 1) {
    await renderTypeCard({
      file: path.join(
        OUT,
        "instagram/IG01-manifesto",
        `IG01-manifesto-${String(index + 1).padStart(2, "0")}.png`,
      ),
      headline: manifesto[index],
      palette: index === 1 || index === 4 ? "forest" : "ivory",
      index: index + 1,
    });
  }

  const signedCrop = bySlug.get("signed-rally-founding-issue-crop-tee");
  const signedOversized = bySlug.get("signed-rally-founding-issue-oversized-tee");
  await renderTypeCard({
    file: path.join(OUT, "instagram/IG03-signed-rally", "IG03-signed-rally-01-cover.png"),
    headline: "Signed Rally — Founding Issue",
    footer: "THE FIRST EIGHT",
    index: 1,
  });
  await renderProductCard({
    file: path.join(OUT, "instagram/IG03-signed-rally", "IG03-signed-rally-02-oversized-front.png"),
    product: signedOversized,
    source: "catalog-front.png",
    number: "02",
  });
  await renderProductCard({
    file: path.join(OUT, "instagram/IG03-signed-rally", "IG03-signed-rally-03-oversized-back.png"),
    product: signedOversized,
    source: "catalog-back.png",
    number: "03",
  });
  await renderPairCard({
    file: path.join(OUT, "instagram/IG03-signed-rally", "IG03-signed-rally-04-crop-front-back.png"),
    product: signedCrop,
    leftSource: "catalog-front.png",
    rightSource: "catalog-back.png",
    label: "Signed Rally Crop Tee",
    number: "04",
  });
  await renderProductCard({
    file: path.join(OUT, "instagram/IG03-signed-rally", "IG03-signed-rally-05-detail.png"),
    product: signedOversized,
    source: "catalog-back.png",
    label: "The founding signature",
    number: "05",
    crop: true,
    accent: COLORS.yellow,
  });

  const emotional = bySlug.get("emotional-support-racquet-oversized-tee");
  await renderProductCard({
    file: path.join(
      OUT,
      "instagram/IG04-emotional-support",
      "IG04-emotional-support-racquet.png",
    ),
    product: emotional,
    source: "catalog-back.png",
    label: "Emotional Support Racquet",
    number: "04",
    crop: true,
  });

  const loveItems = [
    bySlug.get("love-cherries-crop-tee"),
    bySlug.get("love-cherries-oversized-tee"),
    bySlug.get("love-cherries-oversized-tee-2"),
    bySlug.get("love-cherries-magsafe-case"),
  ];
  await renderTypeCard({
    file: path.join(OUT, "instagram/IG07-love-cherries", "IG07-love-cherries-01-cover.png"),
    headline: "Every scoreline starts at love.",
    footer: "LOVE CHERRIES",
    palette: "forest",
    index: 1,
  });
  for (let index = 0; index < loveItems.length; index += 1) {
    await renderProductCard({
      file: path.join(
        OUT,
        "instagram/IG07-love-cherries",
        `IG07-love-cherries-${String(index + 2).padStart(2, "0")}-${loveItems[index].slug}.png`,
      ),
      product: loveItems[index],
      number: String(index + 2).padStart(2, "0"),
      accent: COLORS.blush,
    });
  }

  const macroItems = [
    {
      product: bySlug.get("emotional-support-racquet-oversized-tee"),
      source: "catalog-back.png",
      label: "Illustration / print",
    },
    {
      product: bySlug.get("signed-rally-founding-issue-oversized-tee"),
      source: "catalog-back.png",
      label: "Founding signature",
    },
    {
      product: bySlug.get("out-of-office-court-cap"),
      source: "catalog-front.png",
      label: "Cap embroidery",
    },
    {
      product: bySlug.get("serve-chilled-tumbler"),
      source: "catalog-front.png",
      label: "Vessel artwork",
    },
    {
      product: bySlug.get("love-cherries-magsafe-case"),
      source: "catalog-front.png",
      label: "Case artwork",
    },
  ];
  for (let index = 0; index < macroItems.length; index += 1) {
    await renderProductCard({
      file: path.join(
        OUT,
        "instagram/IG09-small-print",
        `IG09-small-print-${String(index + 1).padStart(2, "0")}.png`,
      ),
      product: macroItems[index].product,
      source: macroItems[index].source,
      label: macroItems[index].label,
      number: String(index + 1).padStart(2, "0"),
      crop: true,
      accent: index % 2 ? COLORS.yellow : COLORS.red,
    });
  }

  await renderTypeCard({
    file: path.join(OUT, "instagram/IG12-collection", "IG12-collection-01-cover.png"),
    headline: "The collection is open.",
    footer: "24 PIECES · FIVE CAPSULES",
    palette: "forest",
    index: 1,
  });
  const capsules = [
    {
      title: "Signed Rally — Founding Issue",
      subtitle: "The first eight",
      slugs: products.filter((item) => item.capsule.startsWith("Signed Rally")).map((item) => item.slug),
    },
    {
      title: "The Daily Lineup",
      subtitle: "Court-to-lunch essentials",
      slugs: products.filter((item) => item.capsule === "The Daily Lineup").map((item) => item.slug),
    },
    {
      title: "Court-Side Pleasures",
      subtitle: "A properly supplied sideline",
      slugs: products.filter((item) => item.capsule === "Court-Side Pleasures").map((item) => item.slug),
    },
    {
      title: "Love Cherries",
      subtitle: "It started at love",
      slugs: products.filter((item) => item.capsule === "Love Cherries").map((item) => item.slug),
    },
    {
      title: "Repeat Players",
      subtitle: "A difficult habit to break",
      slugs: products.filter((item) => item.capsule === "Repeat Players").map((item) => item.slug),
    },
  ];
  for (let index = 0; index < capsules.length; index += 1) {
    await renderCollageSlide({
      file: path.join(
        OUT,
        "instagram/IG12-collection",
        `IG12-collection-${String(index + 2).padStart(2, "0")}-${index + 1}.png`,
      ),
      title: capsules[index].title,
      subtitle: capsules[index].subtitle,
      productSlugs: capsules[index].slugs,
      number: String(index + 2).padStart(2, "0"),
    });
  }
}

async function generatePinterest() {
  for (let index = 0; index < products.length; index += 1) {
    await renderPinterestProduct(products[index], index);
  }
  const cards = [
    "The unofficial society.",
    "Court. Lunch. Court.",
    "Long lunch. Late match.",
    "One more set.",
    "A difficult habit to break.",
    "24 pieces. Five capsules.",
  ];
  for (let index = 0; index < cards.length; index += 1) {
    await renderPinterestGraphic({
      file: path.join(
        OUT,
        "pinterest/graphic",
        `PIN-graphic-${String(index + 1).padStart(2, "0")}.png`,
      ),
      headline: cards[index],
      index: index + 1,
      palette: index === 1 || index === 3 || index === 5 ? "forest" : "ivory",
    });
  }
}

async function generateStoriesAndHighlights() {
  const storySpecs = [
    {
      headline: "The unofficial society.",
      subhead: "For people who said one more set",
      palette: "forest",
    },
    {
      headline: "The Long Lunch.",
      subhead: "Court. Lunch. Court.",
      imagePath: path.join(OUT, "P1-hero-4x5-v1.png"),
    },
    {
      headline: "Five capsules.",
      subhead: "Twenty-four current pieces",
      palette: "ivory",
    },
    {
      headline: "Signed Rally.",
      subhead: "The founding issue",
      imagePath: heroPath(bySlug.get("signed-rally-founding-issue-oversized-tee")),
      productFit: "contain",
    },
    {
      headline: "Love Cherries.",
      subhead: "Every scoreline starts at love",
      imagePath: heroPath(bySlug.get("love-cherries-crop-tee")),
      productFit: "contain",
    },
    {
      headline: "Court-Side Pleasures.",
      subhead: "Something cold, properly supplied",
      imagePath: heroPath(bySlug.get("serve-chilled-tumbler")),
      productFit: "contain",
    },
    {
      headline: "One more set?",
      subhead: "Add the native poll sticker here",
      palette: "forest",
    },
    {
      headline: "The collection is open.",
      subhead: "Add the native shop link here",
      palette: "ivory",
    },
  ];
  for (let index = 0; index < storySpecs.length; index += 1) {
    await renderStory({
      file: path.join(OUT, "stories", `STORY-launch-${String(index + 1).padStart(2, "0")}.png`),
      ...storySpecs[index],
      index: index + 1,
    });
  }
  const highlights = ["About", "Shop", "The Lineup", "Club Rules", "Small Print", "On Court"];
  for (let index = 0; index < highlights.length; index += 1) {
    await renderHighlight({
      file: path.join(
        OUT,
        "highlights",
        `HIGHLIGHT-${String(index + 1).padStart(2, "0")}-${highlights[index].toLowerCase().replaceAll(" ", "-")}.png`,
      ),
      label: highlights[index],
      index,
    });
  }
}

async function writeManifest() {
  const rows = [
    ["channel", "asset_group", "status", "source_truth"],
    ["instagram", "IG01 manifesto", "generated", "identity assets"],
    ["instagram", "IG02 long lunch", "existing v1", "generated source + catalog references"],
    ["instagram", "IG03 signed rally", "generated", "current catalog"],
    ["instagram", "IG04 emotional support", "generated", "current catalog"],
    ["instagram", "IG05 out of office", "awaiting generated editorial", "Higgsfield Element + references"],
    ["instagram", "IG06 brand film", "awaiting still approval", "approved keyframes"],
    ["instagram", "IG07 love cherries", "generated", "current catalog"],
    ["instagram", "IG08 serve chilled", "awaiting generated editorial", "Higgsfield Element + references"],
    ["instagram", "IG09 small print", "generated", "current catalog"],
    ["instagram", "IG10 tennis lunch tennis", "awaiting generated editorial", "Higgsfield Elements + references"],
    ["instagram", "IG11 POV reel", "awaiting still approval", "approved keyframe"],
    ["instagram", "IG12 collection", "generated", "current catalog"],
    ["pinterest", "24 product pins", "generated", "current catalog"],
    ["pinterest", "6 graphic pins", "generated", "identity assets"],
    ["pinterest", "6 editorial pins", "awaiting generated editorial", "approved stills"],
    ["stories", "8 launch stories", "generated", "identity/catalog/P1"],
    ["highlights", "6 covers", "generated", "identity assets"],
  ];
  await fs.writeFile(
    path.join(OUT, "metadata", "still-generation-status.csv"),
    rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n"),
  );
}

await ensureDirs();
await generateInstagram();
await generatePinterest();
await generateStoriesAndHighlights();
await writeManifest();

console.log(`Generated deterministic launch statics under ${OUT}`);
