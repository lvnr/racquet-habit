import type { APIRoute } from "astro";
import { getCatalog } from "../lib/catalog";

const origin = "https://racquethabit.com";

function csv(value: string | number | undefined) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function productCategory(productType: string) {
  const categories: Record<string, string> = {
    "Heavyweight tee": "Apparel & Accessories > Clothing > Shirts & Tops",
    "Crop tee": "Apparel & Accessories > Clothing > Shirts & Tops",
    "Oversized tee": "Apparel & Accessories > Clothing > Shirts & Tops",
    "Court cap": "Apparel & Accessories > Clothing Accessories > Hats",
    "Organic tote": "Luggage & Bags > Tote Bags",
    "Beach towel": "Home & Garden > Linens & Bedding > Towels",
    "MagSafe case": "Electronics > Electronics Accessories > Mobile Phone Accessories > Mobile Phone Cases",
    "Travel mug": "Home & Garden > Kitchen & Dining > Tableware > Drinkware",
    "Tumbler": "Home & Garden > Kitchen & Dining > Tableware > Drinkware",
  };
  return categories[productType] || "Apparel & Accessories";
}

function catalogImage(productSlug: string, sourceImage?: string) {
  const color = sourceImage?.match(/\/colors\/([^/]+)\/catalog-front\.webp$/)?.[1] || "default";
  return `${origin}/images/pinterest-catalog/${productSlug}/${color}.jpg`;
}

export const GET: APIRoute = async () => {
  const catalog = await getCatalog();
  const headers = [
    "sku_id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "link",
    "image_link",
    "brand",
    "item_group_id",
    "product_type",
    "google_product_category",
    "color",
    "size",
    "age_group",
  ];
  const rows = catalog.flatMap((product) =>
    product.variants
      .filter((variant) => variant.price > 0)
      .map((variant) => {
        const url = new URL(`${origin}/products/${product.slug}`);
        url.searchParams.set("variant", variant.id);
        url.searchParams.set("utm_source", "tiktok");
        url.searchParams.set("utm_medium", "paid_social");
        url.searchParams.set("utm_campaign", "product_catalog");
        const values = [
          variant.id,
          `${product.name} — ${variant.name}`,
          product.story,
          variant.inStock ? "in stock" : "out of stock",
          "new",
          `${variant.price.toFixed(2)} USD`,
          url.toString(),
          catalogImage(product.slug, variant.images[0]),
          "Racquet Habit",
          product.id,
          `${product.category} > ${product.productType}`,
          productCategory(product.productType),
          variant.color,
          variant.size,
          "adult",
        ];
        return values.map(csv).join(",");
      }),
  );
  const body = `${headers.map(csv).join(",")}\n${rows.join("\n")}\n`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="racquet-habit-tiktok-catalog.csv"',
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Robots-Tag": "noindex, follow",
    },
  });
};
