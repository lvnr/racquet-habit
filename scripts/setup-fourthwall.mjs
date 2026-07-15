import { readFile, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
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

async function uploadArtwork(filename) {
  const fileUrl = new URL(`public/brand/${filename}`, root);
  const path = fileURLToPath(fileUrl);
  const bytes = await readFile(path);
  const size = (await stat(path)).size;
  const upload = await api("/media/upload-url", {
    method: "POST",
    body: JSON.stringify({ fileName: filename, contentType: "image/png", size }),
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
    body: JSON.stringify({ fileUrl: upload.fileUrl, width: 2400, height: 2400 }),
  });
  return image.id;
}

let state = {};
try { state = JSON.parse(await readFile(new URL(".fourthwall-state.json", root), "utf8")); } catch {}

if (!state.artwork) {
  console.log("Registering three Racquet Habit artwork masters…");
  state.artwork = {
    seal: await uploadArtwork("print-society-seal.png"),
    loop: await uploadArtwork("print-habit-loop.png"),
    lattice: await uploadArtwork("print-lattice.png"),
  };
  await writeFile(new URL(".fourthwall-state.json", root), JSON.stringify(state, null, 2));
}

const products = [
  {
    productTemplateId: "pro_3WAxijeHRa60iWOTsmDCeA",
    name: "Society Tee — Issue 001",
    description: "Heavyweight premium cotton with the unresolved RH loop at center chest and the formal Tennis Addicts Society seal across the back. A difficult habit to break.",
    regions: [
      { region: "front_large_dtf", imageId: state.artwork.loop, placementStrategy: "PLACEMENT_ID", placementId: "centerChest" },
      { region: "back_large_dtf", imageId: state.artwork.seal, placementStrategy: "FULL_REGION" },
    ],
    colors: ["Black", "Army", "Navy"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    profitMargin: 21.68,
  },
  {
    productTemplateId: "pro_UMfTCe9RRHiTf5hoWdlqZQ",
    name: "Member Cap",
    description: "A low-profile court cap marked with the unresolved RH habit loop. No intention of quitting.",
    regions: [{ region: "front_dtf_hat", imageId: state.artwork.loop, placementStrategy: "AUTO" }],
    colors: ["Black", "Dark Navy", "Dark Green"],
    sizes: ["One size"],
    profitMargin: 19.35,
  },
  {
    productTemplateId: "pro_7eff6f9b20aa4edb83",
    name: "One More Set Mug",
    description: "Ceramic clubhouse issue with an edge-to-edge string lattice and the reminder responsible for most late dinners.",
    regions: [{ region: "default", imageId: state.artwork.lattice, placementStrategy: "FULL_REGION" }],
    colors: ["Dark Green", "Red", "Black"],
    sizes: ["11oz", "15oz"],
    profitMargin: 15.05,
  },
  {
    productTemplateId: "pro_sBlASJ6lTXObwpVZiJDHrQ",
    name: "Night Court Tumbler",
    description: "Double-wall stainless steel wrapped in the Racquet Habit string lattice. Built for late bookings and long sets.",
    regions: [{ region: "default", imageId: state.artwork.lattice, placementStrategy: "FULL_REGION" }],
    colors: ["Black", "White"],
    sizes: ["20oz"],
    profitMargin: 15.05,
  },
  {
    productTemplateId: "pro_382",
    name: "Habit Flask",
    description: "Insulated stainless steel for court time that becomes overtime. Play responsibly.",
    regions: [{ region: "default", imageId: state.artwork.lattice, placementStrategy: "FULL_REGION" }],
    colors: ["Black", "White"],
    sizes: ["17oz"],
    profitMargin: 18.65,
  },
  {
    productTemplateId: "pro_367",
    name: "Society Carryall",
    description: "Organic cotton canvas for the spare racquet you absolutely did not need to bring. Membership is involuntary.",
    regions: [{ region: "front", imageId: state.artwork.seal, placementStrategy: "AUTO" }],
    colors: ["Black"],
    sizes: ["One size"],
    profitMargin: 16.44,
  },
];

const current = await api("/products?limit=100");
const existingNames = new Set((current.results || current.items || current || []).map((product) => product.name));
const pending = products.filter((product) => !existingNames.has(product.name));

if (!pending.length) {
  console.log("All Racquet Habit demo products already exist.");
  process.exit(0);
}

for (const [index, product] of pending.entries()) {
  console.log(`Creating ${product.name} (${index + 1}/${pending.length})…`);
  const result = await api("/products", {
    method: "POST",
    body: JSON.stringify({ type: "design", publishOnCreate: true, ...product }),
  });
  state.products ||= {};
  state.products[product.name] = result.productId;
  await writeFile(new URL(".fourthwall-state.json", root), JSON.stringify(state, null, 2));
  if (index < pending.length - 1) await sleep(13_000);
}

console.log(`Created ${pending.length} published demo products.`);
