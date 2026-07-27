import { env } from "cloudflare:workers";
import {
  productPresentation,
  type CatalogProduct,
  type ProductInformation,
  type ProductPresentation,
  type ProductVariant,
} from "../data/catalog";

type FourthwallMoney = { value: number; currency: string };
type FourthwallImage = { url?: string; transformedUrl?: string };
type FourthwallInformation = { type?: string; title?: string; bodyHtml?: string };
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
  additionalInformation?: FourthwallInformation[];
  state?: { type?: string };
};

const unknownPresentation: ProductPresentation = {
  category: "Accessories",
  productType: "Organic tote",
  capsule: "The Daily Lineup",
  sortRank: 999,
  story: "A considered piece for play, lunch and every hour after the match.",
};

function plainText(value?: string) {
  return (value ?? "")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<\/li>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&times;/gi, "×")
    .replace(/\s+([.,])/g, "$1")
    .replace(/\.\s*\./g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

function informationFrom(items?: FourthwallInformation[]): ProductInformation[] {
  return (items ?? [])
    .map((item) => {
      const body = plainText(item.bodyHtml);
      const linkMatch = item.bodyHtml?.match(/href="([^"]+)"/i);
      return {
        title: item.title || "Product information",
        body,
        link: linkMatch?.[1]?.replace(/&amp;/g, "&"),
        linkLabel: item.type === "SIZE_AND_FIT" ? "View size chart" : undefined,
      };
    })
    .filter((item) => Boolean(item.body || item.link));
}

function variantInStock(variant: FourthwallVariant) {
  if (!variant.stock) return true;
  if (typeof variant.stock.inStock === "boolean") return variant.stock.inStock;
  if (typeof variant.stock.inStock === "number") return variant.stock.inStock > 0;
  return variant.stock.type !== "OUT_OF_STOCK";
}

function mapProduct(product: FourthwallProduct): CatalogProduct {
  const presentation = productPresentation[product.id] ?? unknownPresentation;
  if (!productPresentation[product.id]) {
    console.warn(`[catalog] Missing presentation mapping for Fourthwall product ${product.id} (${product.name})`);
  }
  const variants: ProductVariant[] = (product.variants ?? []).map((variant) => ({
    id: variant.id,
    name: plainText(variant.attributes?.description || variant.name),
    price: Number(variant.unitPrice?.value ?? 0),
    color: variant.attributes?.color?.name,
    colorHex: variant.attributes?.color?.swatch,
    size: variant.attributes?.size?.name,
    inStock: variantInStock(variant),
    images: [],
  }));
  variants.sort((a, b) => {
    const preference = (variant: ProductVariant) =>
      Number(Boolean(presentation.featuredColor) && variant.color === presentation.featuredColor) * 2 +
      Number(Boolean(presentation.featuredSize) && variant.size === presentation.featuredSize);
    return preference(b) - preference(a);
  });
  const catalogImages = presentation.catalogImages?.length
    ? presentation.catalogImages
    : ["/brand-white-court/monogram-thin.webp"];
  const editorialImages = presentation.editorialImages ?? (presentation.editorialImage ? [presentation.editorialImage] : []);
  const galleryImages = [...new Set([...catalogImages, ...editorialImages])];
  variants.forEach((variant) => {
    variant.images = catalogImages;
  });
  const availablePrices = variants.filter((variant) => variant.inStock).map((variant) => variant.price);
  const price = Math.min(...(availablePrices.length ? availablePrices : variants.map((variant) => variant.price)));
  const maxPrice = Math.max(...(availablePrices.length ? availablePrices : variants.map((variant) => variant.price)));

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: presentation.category,
    productType: presentation.productType,
    capsule: presentation.capsule,
    sortRank: presentation.sortRank,
    description: plainText(product.description),
    story: presentation.story,
    price: Number.isFinite(price) ? price : 0,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : 0,
    image: catalogImages[0] || "/brand-white-court/monogram-thin.webp",
    images: galleryImages,
    catalogImages,
    editorialImages,
    editorialImage: editorialImages[0],
    featuredColor: presentation.featuredColor,
    featuredSize: presentation.featuredSize,
    variants,
    information: informationFrom(product.additionalInformation),
    source: "fourthwall",
  };
}

function storefrontToken() {
  return env.FOURTHWALL_STOREFRONT_TOKEN;
}

async function storefrontFetch<T>(path: string): Promise<T | null> {
  const token = storefrontToken();
  if (!token) {
    console.error("[catalog] FOURTHWALL_STOREFRONT_TOKEN is unavailable; live products cannot be rendered.");
    return null;
  }
  try {
    const separator = path.includes("?") ? "&" : "?";
    const response = await fetch(
      `https://storefront-api.fourthwall.com/v1${path}${separator}storefront_token=${encodeURIComponent(token)}`,
      {
        headers: { Accept: "application/json" },
        cf: { cacheTtl: 300, cacheEverything: true },
      } as RequestInit,
    );
    if (!response.ok) {
      console.error(`[catalog] Fourthwall request failed (${response.status}) for ${path}`);
      return null;
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`[catalog] Fourthwall request failed for ${path}`, error);
    return null;
  }
}

export async function getCatalog(): Promise<CatalogProduct[]> {
  const payload = await storefrontFetch<{ results?: FourthwallProduct[] }>("/collections/all/products?size=50&page=0");
  return (payload?.results ?? [])
    .filter((product) => product.state?.type === "AVAILABLE")
    .map(mapProduct)
    .sort((a, b) => a.sortRank - b.sortRank);
}

export async function getProduct(slug: string): Promise<CatalogProduct | undefined> {
  const payload = await storefrontFetch<FourthwallProduct>(`/products/${encodeURIComponent(slug)}`);
  if (payload?.id) return mapProduct(payload);
  return (await getCatalog()).find((product) => product.slug === slug);
}
