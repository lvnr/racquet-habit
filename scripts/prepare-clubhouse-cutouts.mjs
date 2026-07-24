// Cuts caps/drinkware out of their cream studio backgrounds via edge flood-fill,
// so they can float on colored panels. Outputs public/images/clubhouse/products/*-cut.{webp,png}
import sharp from "sharp";
import { join } from "node:path";

const SRC = "design/brand-fixed/products/playful-capsule-completion";
const OUT = "public/images/clubhouse/products";

const items = [
  ["one-more-racquet-cap", "08-one-more-racquet-cap.png"],
  ["on-court-cap", "09-out-of-office-cap.png"],
  ["tennis-lunch-tennis-cap", "10-tennis-lunch-tennis-cap.png"],
  ["serve-chilled-bottle", "11-serve-chilled-bottle-v2.png", { shadowPass: false }],
  ["hydration-bottle", "12-court-side-hydration-bottle.png"],
  ["out-of-office-tumbler", "13-out-of-office-tumbler.png"],
  ["tennis-water-bottle", "14-tennis-water-tennis-bottle.png"],
];

const TOL = 28;

for (const [slug, file, opts = {}] of items) {
  const tol = opts.tol ?? TOL;
  const shadowPass = opts.shadowPass ?? true;
  const { data, info } = await sharp(join(SRC, file)).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;

  // Estimate background color from the four corners.
  const corner = (x, y) => [data[(y * w + x) * c], data[(y * w + x) * c + 1], data[(y * w + x) * c + 2]];
  const corners = [corner(4, 4), corner(w - 5, 4), corner(4, h - 5), corner(w - 5, h - 5)];
  const bg = [0, 1, 2].map((i) => corners.reduce((s, p) => s + p[i], 0) / 4);

  const isBg = (idx) => {
    const dr = data[idx] - bg[0], dg = data[idx + 1] - bg[1], db = data[idx + 2] - bg[2];
    return Math.sqrt(dr * dr + dg * dg + db * db) < tol;
  };

  // BFS flood fill from all border pixels.
  const visited = new Uint8Array(w * h);
  const queue = [];
  for (let x = 0; x < w; x++) { queue.push(x, x + (h - 1) * w); }
  for (let y = 0; y < h; y++) { queue.push(y * w, y * w + w - 1); }
  while (queue.length) {
    const p = queue.pop();
    if (visited[p]) continue;
    if (!isBg(p * c)) continue;
    visited[p] = 1;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) queue.push(p - 1);
    if (x < w - 1) queue.push(p + 1);
    if (y > 0) queue.push(p - w);
    if (y < h - 1) queue.push(p + w);
  }

  // Second pass: eat soft drop-shadows — pixels adjacent to background that are a
  // darker, hue-similar version of the background color.
  const bgL = (bg[0] + bg[1] + bg[2]) / 3;
  const isShadow = (idx) => {
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const l = (r + g + b) / 3;
    return l < bgL - 4 && l > bgL - 95 &&
      Math.abs((r - g) - (bg[0] - bg[1])) < 20 &&
      Math.abs((g - b) - (bg[1] - bg[2])) < 22;
  };
  for (let p = 0; shadowPass && p < w * h; p++) {
    if (!visited[p]) continue;
    const x = p % w, y = (p / w) | 0;
    if (x > 0 && !visited[p - 1]) queue.push(p - 1);
    if (x < w - 1 && !visited[p + 1]) queue.push(p + 1);
    if (y > 0 && !visited[p - w]) queue.push(p - w);
    if (y < h - 1 && !visited[p + w]) queue.push(p + w);
  }
  while (queue.length) {
    const p = queue.pop();
    if (visited[p]) continue;
    if (!isShadow(p * c) && !isBg(p * c)) continue;
    visited[p] = 1;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) queue.push(p - 1);
    if (x < w - 1) queue.push(p + 1);
    if (y > 0) queue.push(p - w);
    if (y < h - 1) queue.push(p + w);
  }

  // Smooth the mask: two 3x3 majority-vote passes remove fringe and pinholes.
  for (let pass = 0; pass < 2; pass++) {
    const prev = Uint8Array.from(visited);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const p = y * w + x;
        let bgVotes = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) bgVotes += prev[p + dy * w + dx];
        visited[p] = bgVotes >= 5 ? 1 : 0;
      }
    }
  }

  // Keep only large connected foreground components (drops tiny detail views).
  const comp = new Int32Array(w * h).fill(-1);
  const areas = [];
  for (let p = 0; p < w * h; p++) {
    if (visited[p] || comp[p] >= 0) continue;
    const id = areas.length;
    let area = 0;
    const stack = [p];
    comp[p] = id;
    while (stack.length) {
      const q = stack.pop();
      area++;
      const x = q % w, y = (q / w) | 0;
      for (const n of [x > 0 ? q - 1 : -1, x < w - 1 ? q + 1 : -1, y > 0 ? q - w : -1, y < h - 1 ? q + w : -1]) {
        if (n >= 0 && !visited[n] && comp[n] < 0) { comp[n] = id; stack.push(n); }
      }
    }
    areas.push(area);
  }
  const largest = Math.max(...areas, 1);
  const keep = areas.map((a) => a >= largest * 0.4);

  // Build RGBA with background transparent.
  const rgba = Buffer.alloc(w * h * 4);
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let p = 0; p < w * h; p++) {
    const fg = !visited[p] && keep[comp[p]];
    rgba[p * 4] = data[p * c];
    rgba[p * 4 + 1] = data[p * c + 1];
    rgba[p * 4 + 2] = data[p * c + 2];
    rgba[p * 4 + 3] = fg ? 255 : 0;
    if (fg) {
      const x = p % w, y = (p / w) | 0;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }

  const pad = 14;
  const crop = {
    left: Math.max(0, minX - pad),
    top: Math.max(0, minY - pad),
    width: Math.min(w, maxX + pad) - Math.max(0, minX - pad),
    height: Math.min(h, maxY + pad) - Math.max(0, minY - pad),
  };

  const base = sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .extract(crop)
    .resize({ width: 900, withoutEnlargement: true });
  const buffer = await base.png().toBuffer();
  await sharp(buffer).webp({ quality: 88, alphaQuality: 90 }).toFile(join(OUT, `${slug}-cut.webp`));
  await sharp(buffer).png({ compressionLevel: 9 }).toFile(join(OUT, `${slug}-cut.png`));
  console.log(slug, `${crop.width}x${crop.height}`);
}
console.log("cutouts done");
