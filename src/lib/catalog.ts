import { env } from "cloudflare:workers";
import { previewCatalog, type CatalogProduct, type ProductCategory, type ProductVariant } from "../data/catalog";

type FourthwallMoney = { value: number; currency: string };
type FourthwallImage = { url?: string; transformedUrl?: string };
type FourthwallVariant = {
  id: string;
  name: string;
  unitPrice: FourthwallMoney;
  attributes?: {
    description?: string;
    color?: { name?: string; swatch?: string };
    size?: { name?: string };
  };
  stock?: { type?: string; inStock?: number | boolean };
  images?: FourthwallImage[];
};
type FourthwallProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images?: FourthwallImage[];
  variants?: FourthwallVariant[];
};

function categoryFor(name: string): ProductCategory {
  const value = name.toLowerCase();
  if (value.includes("tee") || value.includes("shirt") || value.includes("cap")) return "Wear";
  if (value.includes("tote") || value.includes("bag")) return "Carry";
  if (value.includes("towel")) return "Court";
  if (value.includes("coffee") || value.includes("roast")) return "Coffee";
  return "Drink";
}

function defaultArtwork(category: ProductCategory, name: string) {
  if (category === "Wear" && name.toLowerCase().includes("cap")) return "/images/product-cap.svg";
  if (category === "Wear") return "/images/product-apparel.svg";
  if (category === "Carry") return "/images/product-tote.svg";
  if (category === "Court") return "/images/product-towel.svg";
  if (category === "Coffee") return "/images/product-coffee.svg";
  if (name.toLowerCase().includes("mug")) return "/images/product-mug.svg";
  return "/images/product-vessel.svg";
}

function variantInStock(variant: FourthwallVariant) {
  if (!variant.stock) return true;
  if (typeof variant.stock.inStock === "boolean") return variant.stock.inStock;
  if (typeof variant.stock.inStock === "number") return variant.stock.inStock > 0;
  return variant.stock.type !== "OUT_OF_STOCK";
}

function mapProduct(product: FourthwallProduct): CatalogProduct {
  const category = categoryFor(product.name);
  const variants: ProductVariant[] = (product.variants ?? []).map((variant) => ({
    id: variant.id,
    name: variant.attributes?.description || variant.name,
    price: Number(variant.unitPrice?.value ?? 0),
    color: variant.attributes?.color?.name,
    colorHex: variant.attributes?.color?.swatch,
    size: variant.attributes?.size?.name,
    inStock: variantInStock(variant),
  }));
  const images = (product.images ?? [])
    .map((image) => image.transformedUrl || image.url)
    .filter((image): image is string => Boolean(image))
    .slice(0, 6);
  const fallback = previewCatalog.find((item) => item.name.toLowerCase().split("—")[0].trim() === product.name.toLowerCase().split("—")[0].trim());

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category,
    edition: fallback?.edition ?? "Issue 001",
    description: product.description || fallback?.description || "Habit-forming equipment for repeat players.",
    story: fallback?.story || product.description || "Designed for the hours on court and the conversations that follow.",
    material: fallback?.material || "Fourthwall made-to-order product",
    price: variants.find((variant) => variant.inStock)?.price ?? variants[0]?.price ?? fallback?.price ?? 0,
    image: images[0] || defaultArtwork(category, product.name),
    images: images.length ? images : [defaultArtwork(category, product.name)],
    variants,
    source: "fourthwall",
  };
}

function mergePreviews(live: CatalogProduct[]) {
  const issueOrder = ["Society Tee — Issue 001", "Member Cap", "One More Set Mug", "Night Court Tumbler", "Habit Flask", "Society Carryall"];
  live.sort((a, b) => {
    const aIndex = issueOrder.indexOf(a.name);
    const bIndex = issueOrder.indexOf(b.name);
    return (aIndex < 0 ? 999 : aIndex) - (bIndex < 0 ? 999 : bIndex);
  });
  const covered = new Set(live.map((product) => {
    const name = product.name.toLowerCase();
    if (name.includes("tee") || name.includes("shirt")) return "tee";
    if (name.includes("cap")) return "cap";
    if (name.includes("mug")) return "mug";
    if (name.includes("tumbler")) return "tumbler";
    if (name.includes("bottle")) return "bottle";
    if (name.includes("tote")) return "tote";
    if (name.includes("towel")) return "towel";
    return product.slug;
  }));
  const previewKey = (product: CatalogProduct) => {
    const name = product.name.toLowerCase();
    if (name.includes("tee")) return "tee";
    if (name.includes("cap")) return "cap";
    if (name.includes("mug")) return "mug";
    if (name.includes("tumbler")) return "tumbler";
    if (name.includes("flask") || name.includes("bottle")) return "bottle";
    if (name.includes("carryall") || name.includes("tote")) return "tote";
    if (name.includes("towel")) return "towel";
    return product.slug;
  };
  return [...live, ...previewCatalog.filter((product) => !covered.has(previewKey(product)))];
}

export async function getCatalog(): Promise<CatalogProduct[]> {
  const token = env.FOURTHWALL_STOREFRONT_TOKEN;
  if (!token) return previewCatalog;

  try {
    const response = await fetch(
      `https://storefront-api.fourthwall.com/v1/collections/all/products?storefront_token=${encodeURIComponent(token)}&size=50`,
      {
        headers: { Accept: "application/json" },
        cf: { cacheTtl: 300, cacheEverything: true },
      } as RequestInit,
    );
    if (!response.ok) return previewCatalog;
    const payload = await response.json() as { results?: FourthwallProduct[] };
    const live = (payload.results ?? []).map(mapProduct);
    return live.length ? mergePreviews(live) : previewCatalog;
  } catch {
    return previewCatalog;
  }
}

export async function getProduct(slug: string) {
  return (await getCatalog()).find((product) => product.slug === slug);
}
