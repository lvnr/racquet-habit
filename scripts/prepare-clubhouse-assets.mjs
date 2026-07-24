// Prepares web-ready images for the Playful Clubhouse redesign.
// Sources live in design/brand-fixed/; outputs go to public/images/clubhouse/.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const SRC = "design/brand-fixed";
const OUT = "public/images/clubhouse";
mkdirSync(OUT, { recursive: true });
mkdirSync(join(OUT, "products"), { recursive: true });

/** @type {Array<{name:string,src:string,width?:number,crop?:{left:number,top:number,width:number,height:number},dir?:string,jpgOnly?:boolean}>} */
const jobs = [
  // Hero + CTA crops from the approved concept renders
  { name: "hero-cabinet", src: "website-concepts/04-playful-clubhouse-hero.png", crop: { left: 860, top: 95, width: 812, height: 846 } },
  { name: "window-serve", src: "website-concepts/04-playful-clubhouse-cta.png", crop: { left: 915, top: 12, width: 728, height: 929 } },
  // Photography
  { name: "lunch-table", src: "assets/06-tennis-lunch-table.png", width: 1100 },
  { name: "courtside", src: "assets/08-courtside-hospitality.png", width: 1400 },
  { name: "after-rally", src: "assets/hero-03-after-the-rally.png", width: 1600 },
  { name: "shadow-rally", src: "assets/07-shadow-rally.png", width: 1400 },
  { name: "laundry-day", src: "assets/02-laundry-day-on-court.png", width: 1400 },
  { name: "newspaper", src: "assets/13-out-of-office-newspaper.png", width: 1200 },
  { name: "two-ball-collage", src: "assets/18-two-ball-collage.png", width: 1000 },
  { name: "cold-storage", src: "assets/14-courtside-cold-storage.png", width: 1000 },
  { name: "clubhouse-signage", src: "assets/04-clubhouse-signage.png", width: 1600 },
  { name: "field-study", src: "assets/12-habit-field-study.png", width: 1000 },
  { name: "flat-lay", src: "assets/16-accessories-court-flat-lay.png", width: 1200 },
  { name: "sunshine-still", src: "assets/11-sunshine-tee-still-life.png", width: 1200 },
  { name: "handmade-club", src: "assets/hero-01-handmade-club.png", width: 1600 },
  { name: "equipment-room", src: "assets/05-the-equipment-room.png", width: 900 },
];

const products = [
  ["serve-chilled-tee", "01-serve-chilled-tee-design.png", "01-serve-chilled-tee-editorial.png"],
  ["emotional-support-tee", "02-emotional-support-racquet-tee-design.png", "02-emotional-support-racquet-tee-editorial.png"],
  ["one-more-racquet-tee", "03-one-more-racquet-tee-design.png", "03-one-more-racquet-tee-editorial.png"],
  ["rest-day-tee", "04-rest-day-tee-design.png", "04-rest-day-tee-editorial.png"],
  ["tennis-lunch-tennis-tee", "05-tennis-lunch-tennis-tee-design.png", "05-tennis-lunch-tennis-tee-editorial.png"],
  ["ball-has-plans-tee", "06-ball-has-plans-tee-design-v2.png", "06-ball-has-plans-tee-editorial-v2.png"],
  ["emotional-support-cap", "07-emotional-support-cap.png"],
  ["one-more-racquet-cap", "08-one-more-racquet-cap.png"],
  ["on-court-cap", "09-out-of-office-cap.png"],
  ["tennis-lunch-tennis-cap", "10-tennis-lunch-tennis-cap.png"],
  ["serve-chilled-bottle", "11-serve-chilled-bottle-v2.png"],
  ["hydration-bottle", "12-court-side-hydration-bottle.png"],
  ["out-of-office-tumbler", "13-out-of-office-tumbler.png"],
  ["tennis-water-bottle", "14-tennis-water-tennis-bottle.png"],
];

for (const [slug, design, editorial] of products) {
  jobs.push({ name: `${slug}-a`, src: `products/playful-capsule-completion/${design}`, width: 1200, dir: "products" });
  if (editorial) jobs.push({ name: `${slug}-b`, src: `products/playful-capsule-completion/${editorial}`, width: 1200, dir: "products" });
}

// Social image
jobs.push({ name: "og-clubhouse", src: "website-concepts/04-playful-clubhouse-hero.png", crop: { left: 0, top: 32, width: 1672, height: 878 }, width: 1200, jpgOnly: true });

for (const job of jobs) {
  let base = sharp(join(SRC, job.src));
  if (job.crop) base = base.extract(job.crop);
  if (job.width) base = base.resize({ width: job.width, withoutEnlargement: true });
  const buffer = await base.toBuffer();
  const out = join(OUT, job.dir ?? "", job.name);
  await sharp(buffer).jpeg({ quality: 84, mozjpeg: true }).toFile(`${out}.jpg`);
  if (!job.jpgOnly) {
    await sharp(buffer).webp({ quality: 82 }).toFile(`${out}.webp`);
    await sharp(buffer).avif({ quality: 55 }).toFile(`${out}.avif`);
  }
  console.log(job.name);
}
console.log(`done: ${jobs.length} assets`);
