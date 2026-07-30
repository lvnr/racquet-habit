import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";

const ROOT = process.cwd();
const LAUNCH = path.join(ROOT, "marketing/assets/launch");
const IDENTITY = path.join(ROOT, "design/brand-fixed/identity");
const INSTRUMENT = path.join(IDENTITY, "fonts/InstrumentSerif-Regular.ttf");
const WORDMARK_INVERSE = path.join(IDENTITY, "Wordmark Horizontal Inverse 1.png");

const COLORS = {
  forest: "#24493A",
  ivory: "#FFF7EE",
  red: "#E93622",
  ink: "#17352B",
};

const fontData = {
  geist: await fs.readFile(
    path.join(ROOT, "node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2"),
  ),
};

const fontFace = `
  @font-face{font-family:Geist;src:url(data:font/woff2;base64,${fontData.geist.toString("base64")})}
`;

function svg(width, height, body) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <style>${fontFace}</style>
      ${body}
    </svg>
  `);
}

async function instrumentCaption({ text, width, height, size, fill, gravity = "west" }) {
  const args = [
    "-size",
    `${width}x${height}`,
    "-background",
    "none",
    "-fill",
    fill,
    "-font",
    INSTRUMENT,
    "-pointsize",
    String(size),
    "-gravity",
    gravity,
    "-interline-spacing",
    String(Math.round(size * -0.12)),
    `caption:${text}`,
    "png:-",
  ];

  return new Promise((resolve, reject) => {
    const child = spawn("magick", args, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
    const output = [];
    const errors = [];
    child.stdout.on("data", (chunk) => output.push(chunk));
    child.stderr.on("data", (chunk) => errors.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(Buffer.concat(output));
      else reject(new Error(Buffer.concat(errors).toString() || `magick exited ${code}`));
    });
  });
}

async function makeReelCover({ source, output, eyebrow, title, position = "centre" }) {
  const width = 1080;
  const height = 1920;
  const titleImage = await instrumentCaption({
    text: title,
    width: 880,
    height: 340,
    size: 132,
    fill: COLORS.ivory,
  });
  const eyebrowImage = svg(
    880,
    50,
    `<text x="0" y="31" font-family="Geist" font-size="25" font-weight="650" letter-spacing="5" fill="${COLORS.ivory}">${eyebrow}</text>`,
  );
  const wordmark = await sharp(WORDMARK_INVERSE).resize({ width: 290 }).png().toBuffer();
  const gradient = svg(
    width,
    900,
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COLORS.forest}" stop-opacity="0"/><stop offset=".42" stop-color="${COLORS.forest}" stop-opacity=".30"/><stop offset="1" stop-color="${COLORS.forest}" stop-opacity=".92"/></linearGradient></defs><rect width="${width}" height="900" fill="url(#g)"/>`,
  );

  await sharp(source)
    .resize(width, height, { fit: "cover", position })
    .composite([
      { input: gradient, left: 0, top: 1020 },
      { input: eyebrowImage, left: 100, top: 1260 },
      { input: titleImage, left: 100, top: 1320 },
      { input: wordmark, left: 100, top: 1770 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(output);
}

async function makeEditorialPin({
  source,
  output,
  title,
  kicker,
  position = "centre",
  imageHeight = 1240,
  extract,
}) {
  const width = 1000;
  const height = 1500;
  const titleImage = await instrumentCaption({
    text: title,
    width: 760,
    height: 155,
    size: 72,
    fill: COLORS.ink,
  });
  const lower = svg(
    width,
    height - imageHeight,
    `
      <rect width="${width}" height="${height - imageHeight}" fill="${COLORS.ivory}"/>
      <rect x="0" y="0" width="12" height="${height - imageHeight}" fill="${COLORS.red}"/>
      <text x="72" y="58" font-family="Geist" font-size="19" font-weight="650" letter-spacing="3.5" fill="${COLORS.forest}">${kicker}</text>
      <text x="72" y="${height - imageHeight - 32}" font-family="Geist" font-size="17" font-weight="550" letter-spacing="2.8" fill="${COLORS.forest}">RACQUET HABIT · EST. 2026</text>
    `,
  );

  let imagePipeline = sharp(source);
  if (extract) imagePipeline = imagePipeline.extract(extract);
  const image = await imagePipeline
    .resize(width, imageHeight, { fit: "cover", position })
    .png()
    .toBuffer();

  await sharp({
    create: { width, height, channels: 4, background: COLORS.ivory },
  })
    .composite([
      { input: image, left: 0, top: 0 },
      { input: lower, left: 0, top: imageHeight },
      { input: titleImage, left: 72, top: imageHeight + 66 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(output);
}

async function ensureDirs() {
  const dirs = [
    "instagram/IG06-one-more-set",
    "instagram/IG11-pov-one-more-set",
    "pinterest/editorial",
    "facebook/FB01-manifesto",
    "facebook/FB02-long-lunch",
    "facebook/FB03-one-more-set",
    "facebook/FB04-collection",
    "00-review",
  ];
  await Promise.all(dirs.map((dir) => fs.mkdir(path.join(LAUNCH, dir), { recursive: true })));
}

async function copySet(sourceDir, outputDir, names) {
  await Promise.all(
    names.map((name) =>
      fs.copyFile(path.join(LAUNCH, sourceDir, name), path.join(LAUNCH, outputDir, name)),
    ),
  );
}

await ensureDirs();

await makeReelCover({
  source: path.join(LAUNCH, "video-keyframes/V01-one-more-set/V01-05-night-close.png"),
  output: path.join(LAUNCH, "instagram/IG06-one-more-set/IG06-cover.png"),
  eyebrow: "A RACQUET HABIT FILM",
  title: "One More Set",
});

await makeReelCover({
  source: path.join(LAUNCH, "video-keyframes/V04-after-last-set/V04-01-empty-court.png"),
  output: path.join(LAUNCH, "instagram/IG11-pov-one-more-set/IG11-cover.png"),
  eyebrow: "POV",
  title: "One More Set",
  position: "centre",
});

const editorialPins = [
  {
    source: "P1-hero-source-v1.png",
    output: "PIN-editorial-01-long-lunch.png",
    title: "The Long Lunch",
    kicker: "COURT-SIDE PLEASURES",
  },
  {
    source: "P1-hero-source-v1.png",
    output: "PIN-editorial-02-long-lunch-detail.png",
    title: "Long Lunch. Late Match.",
    kicker: "SIGNED RALLY · SERVE CHILLED",
    extract: { left: 260, top: 380, width: 743, height: 1050 },
  },
  {
    source: "instagram/IG05-out-of-office/IG05-out-of-office-01-professional.png",
    output: "PIN-editorial-03-out-of-office.png",
    title: "Out of Office",
    kicker: "THE DAILY LINEUP",
  },
  {
    source: "instagram/IG08-serve-chilled/IG08-serve-chilled-01-still-life.png",
    output: "PIN-editorial-04-serve-chilled.png",
    title: "Serve Chilled",
    kicker: "COURT-SIDE PLEASURES",
  },
  {
    source: "instagram/IG10-tennis-lunch-tennis/IG10-01-authentic.png",
    output: "PIN-editorial-05-tennis-lunch-tennis.png",
    title: "Tennis. Lunch. Tennis.",
    kicker: "THE DAILY LINEUP",
  },
  {
    source: "video-keyframes/V01-one-more-set/V01-05-night-close.png",
    output: "PIN-editorial-06-one-more-set.png",
    title: "One More Set",
    kicker: "RACQUET HABIT FILM",
  },
];

for (const pin of editorialPins) {
  await makeEditorialPin({
    ...pin,
    source: path.join(LAUNCH, pin.source),
    output: path.join(LAUNCH, "pinterest/editorial", pin.output),
  });
}

await copySet(
  "instagram/IG01-manifesto",
  "facebook/FB01-manifesto",
  Array.from({ length: 5 }, (_, index) => `IG01-manifesto-0${index + 1}.png`),
);
await fs.copyFile(
  path.join(LAUNCH, "P1-hero-4x5-v1.png"),
  path.join(LAUNCH, "facebook/FB02-long-lunch/FB02-long-lunch.png"),
);
await fs.copyFile(
  path.join(LAUNCH, "instagram/IG06-one-more-set/IG06-cover.png"),
  path.join(LAUNCH, "facebook/FB03-one-more-set/FB03-cover.png"),
);
await copySet(
  "instagram/IG12-collection",
  "facebook/FB04-collection",
  Array.from({ length: 6 }, (_, index) => {
    if (index === 0) return "IG12-collection-01-cover.png";
    return `IG12-collection-0${index + 1}-${index}.png`;
  }),
);

console.log("Generated Reel covers, six editorial Pins, and Facebook still adaptations.");
