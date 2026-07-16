import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const rootPath = fileURLToPath(root);
const secretsText = await readFile(new URL(".dev.vars", root), "utf8");
const secrets = Object.fromEntries(secretsText.split(/\r?\n/).filter(Boolean).map((line) => {
  const index = line.indexOf("=");
  const key = line.slice(0, index);
  const raw = line.slice(index + 1);
  try { return [key, JSON.parse(raw)]; } catch { return [key, raw]; }
}));

const username = secrets.FOURTHWALL_API_USERNAME;
const password = secrets.FOURTHWALL_API_PASSWORD;
if (!username || !password) throw new Error("Fourthwall Platform credentials are missing from .dev.vars");

const base = "https://api.fourthwall.com/open-api/v1.0";
const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const productionDir = path.join(rootPath, "public", "merch-v3", "fourthwall");

async function api(pathname, options = {}) {
  const response = await fetch(`${base}${pathname}`, {
    ...options,
    headers: {
      Authorization: authorization,
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`${options.method || "GET"} ${pathname} failed (${response.status}): ${await response.text()}`);
  if (response.status === 204) return null;
  return response.json();
}

async function prepareArtwork({ source, filename, width, height, padding = 0 }) {
  await mkdir(productionDir, { recursive: true });
  const availableWidth = Math.round(width * (1 - padding * 2));
  const availableHeight = Math.round(height * (1 - padding * 2));
  const art = await sharp(path.join(rootPath, source))
    .resize({ width: availableWidth, height: availableHeight, fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
  const metadata = await sharp(art).metadata();
  const left = Math.round((width - metadata.width) / 2);
  const top = Math.round((height - metadata.height) / 2);
  const output = path.join(productionDir, filename);
  await sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: art, left, top }])
    .png({ compressionLevel: 9 })
    .toFile(output);
  return output;
}

async function uploadArtwork(filePath) {
  const bytes = await readFile(filePath);
  const size = (await stat(filePath)).size;
  const metadata = await sharp(filePath).metadata();
  const upload = await api("/media/upload-url", {
    method: "POST",
    body: JSON.stringify({ fileName: path.basename(filePath), contentType: "image/png", size }),
  });
  const storageResponse = await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "image/png",
      "x-goog-content-length-range": `0,${size}`,
    },
    body: bytes,
  });
  if (!storageResponse.ok) throw new Error(`Artwork upload failed (${storageResponse.status}): ${await storageResponse.text()}`);
  const image = await api("/media/images", {
    method: "POST",
    body: JSON.stringify({ fileUrl: upload.fileUrl, width: metadata.width, height: metadata.height }),
  });
  return image.id;
}

let state = {};
try { state = JSON.parse(await readFile(new URL(".fourthwall-state.json", root), "utf8")); } catch {}
state.v3 ||= {};

if (!state.v3.artwork) {
  console.log("Preparing and registering the New Court Classic artwork set…");
  const files = {
    teeFront: await prepareArtwork({
      source: "public/merch-v3/rh-monogram-screenprint-green-3600.png",
      filename: "tee-front-monogram.png",
      width: 2250,
      height: 2700,
      padding: 0.34,
    }),
    teeBack: await prepareArtwork({
      source: "public/merch-v3/apparel-society-tee-back.png",
      filename: "tee-back-society.png",
      width: 2250,
      height: 2700,
      padding: 0.04,
    }),
    cap: await prepareArtwork({
      source: "public/brand-v3/exports/logo-society-patch@4x.png",
      filename: "cap-society-patch.png",
      width: 1500,
      height: 600,
      padding: 0.08,
    }),
    mug: await prepareArtwork({
      source: "public/merch-v3/drinkware-one-more-set-mug-wrap.png",
      filename: "mug-one-more-set-wrap.png",
      width: 2700,
      height: 1050,
      padding: 0.03,
    }),
    tumbler: await prepareArtwork({
      source: "public/merch-v3/drinkware-court-vessel-wrap.png",
      filename: "tumbler-court-vessel.png",
      width: 2775,
      height: 2373,
      padding: 0.08,
    }),
    bottle: await prepareArtwork({
      source: "public/merch-v3/drinkware-court-vessel-wrap.png",
      filename: "bottle-court-vessel.png",
      width: 2556,
      height: 1581,
      padding: 0.08,
    }),
    tote: await prepareArtwork({
      source: "public/merch-v3/accessory-society-tote.png",
      filename: "tote-society.png",
      width: 1500,
      height: 1500,
      padding: 0.08,
    }),
  };
  state.v3.artwork = {};
  for (const [key, filePath] of Object.entries(files)) {
    console.log(`Uploading ${path.basename(filePath)}…`);
    state.v3.artwork[key] = await uploadArtwork(filePath);
    await writeFile(new URL(".fourthwall-state.json", root), JSON.stringify(state, null, 2));
  }
}

const products = [
  {
    productTemplateId: "pro_3WAxijeHRa60iWOTsmDCeA",
    name: "Society Tee — Collection 01",
    description: "Premium combed-cotton court tee with the approved serif RH monogram at left chest and the Racquet Habit Society composition across the back. Collection 01 — The Last Set.",
    regions: [
      { region: "front_large_dtf", imageId: state.v3.artwork.teeFront, placementStrategy: "PLACEMENT_ID", placementId: "leftChest" },
      { region: "back_large_dtf", imageId: state.v3.artwork.teeBack, placementStrategy: "FULL_REGION" },
    ],
    colors: ["Natural", "Ecru", "White"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    profitMargin: 21.68,
  },
  {
    productTemplateId: "pro_UMfTCe9RRHiTf5hoWdlqZQ",
    name: "Member Cap — Collection 01",
    description: "A low-profile cotton court cap carrying the New Court Classic Society patch. One more set.",
    regions: [{ region: "front_dtf_hat", imageId: state.v3.artwork.cap, placementStrategy: "FULL_REGION" }],
    colors: ["Khaki", "White", "Dark Green"],
    sizes: ["One size"],
    profitMargin: 19.35,
  },
  {
    productTemplateId: "pro_7eff6f9b20aa4edb83",
    name: "One More Set Mug — Collection 01",
    description: "A clubhouse ceramic mug with the full Collection 01 wrap and a deep-green interior.",
    regions: [{ region: "default", imageId: state.v3.artwork.mug, placementStrategy: "FULL_REGION" }],
    colors: ["Dark Green"],
    sizes: ["11oz", "15oz"],
    profitMargin: 15.05,
  },
  {
    productTemplateId: "pro_sBlASJ6lTXObwpVZiJDHrQ",
    name: "Court Tumbler — Collection 01",
    description: "A white stainless-steel court tumbler finished with the service-arc and RH vessel artwork.",
    regions: [{ region: "default", imageId: state.v3.artwork.tumbler, placementStrategy: "FULL_REGION" }],
    colors: ["White"],
    sizes: ["20oz"],
    profitMargin: 15.05,
  },
  {
    productTemplateId: "pro_382",
    name: "Habit Flask — Collection 01",
    description: "An insulated white steel bottle carrying the Collection 01 court-vessel artwork.",
    regions: [{ region: "default", imageId: state.v3.artwork.bottle, placementStrategy: "FULL_REGION" }],
    colors: ["White"],
    sizes: ["17oz"],
    profitMargin: 18.65,
  },
  {
    productTemplateId: "pro_367",
    name: "Society Carryall — Collection 01",
    description: "An oyster organic-cotton court tote carrying the approved RH and court-bag composition.",
    regions: [{ region: "front", imageId: state.v3.artwork.tote, placementStrategy: "FULL_REGION" }],
    colors: ["Oyster"],
    sizes: ["One size"],
    profitMargin: 16.44,
  },
];

const currentPayload = await api("/products?limit=100");
const current = currentPayload.results || currentPayload.items || currentPayload || [];
const existingNames = new Set(current.map((product) => product.name));
const pending = products.filter((product) => !existingNames.has(product.name));

for (const [index, product] of pending.entries()) {
  console.log(`Creating ${product.name} (${index + 1}/${pending.length})…`);
  const result = await api("/products", {
    method: "POST",
    body: JSON.stringify({ type: "design", publishOnCreate: true, ...product }),
  });
  state.v3.products ||= {};
  state.v3.products[product.name] = result.productId;
  await writeFile(new URL(".fourthwall-state.json", root), JSON.stringify(state, null, 2));
  if (index < pending.length - 1) await sleep(13_000);
}

const verifiedPayload = await api("/products?limit=100");
const verified = verifiedPayload.results || verifiedPayload.items || verifiedPayload || [];
const allV3Public = products.every((product) => verified.some((item) => item.name === product.name && item.access?.type === "PUBLIC"));
if (!allV3Public) throw new Error("The v3 products were not all visible after creation; legacy products were left untouched.");

const legacyNames = new Set([
  "Society Tee — The Last Set",
  "Member Cap",
  "One More Set Mug",
  "Court Tumbler",
  "Habit Flask",
  "Society Carryall",
]);
const legacy = verified.filter((product) => legacyNames.has(product.name) && product.access?.type !== "ARCHIVED");
for (const product of legacy) {
  console.log(`Archiving superseded product: ${product.name}…`);
  await api(`/products/${product.id}`, { method: "DELETE" });
}

state.v3.completedAt = new Date().toISOString();
await writeFile(new URL(".fourthwall-state.json", root), JSON.stringify(state, null, 2));
console.log(`Fourthwall v3 ready: ${products.length} public products, ${legacy.length} legacy products archived.`);
