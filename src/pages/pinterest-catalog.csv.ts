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

function pinterestImage(productSlug: string, sourceImage?: string) {
  const color = sourceImage?.match(/\/colors\/([^/]+)\/catalog-front\.webp$/)?.[1] || "default";
  return `${origin}/images/pinterest-catalog/${productSlug}/${color}.jpg`;
}

export const GET: APIRoute = async () => {
  const catalog = await getCatalog();
  const headers = [
    "id",
    "item_group_id",
    "title",
    "description",
    "link",
    "image_link",
    "price",
    "availability",
    "brand",
    "condition",
    "product_type",
    "google_product_category",
    "color",
    "size",
    "age_group",
    "adult",
    "variant_names",
    "variant_values",
    "alt_text",
    "custom_label_0",
    "custom_label_1",
    "free_shipping_limit",
  ];
  const rows = catalog.flatMap((product) =>
    product.variants
      .filter((variant) => variant.inStock && variant.price > 0)
      .map((variant) => {
        const variantParts = [variant.color, variant.size].filter(Boolean);
        const variantNames = [
          ...(variant.color ? ["Color"] : []),
          ...(variant.size ? [product.productType === "MagSafe case" ? "Device" : "Size"] : []),
        ];
        const url = new URL(`${origin}/products/${product.slug}`);
        url.searchParams.set("variant", variant.id);
        url.searchParams.set("utm_source", "pinterest");
        url.searchParams.set("utm_medium", "organic_social");
        url.searchParams.set("utm_campaign", "product_catalog");
        const values = [
          variant.id,
          product.id,
          `${product.name} — ${variant.name}`,
          product.story,
          url.toString(),
          pinterestImage(product.slug, variant.images[0]),
          `${variant.price.toFixed(2)} USD`,
          "in stock",
          "Racquet Habit",
          "new",
          `${product.category} > ${product.productType}`,
          productCategory(product.productType),
          variant.color,
          variant.size,
          "adult",
          "false",
          variantNames.join(","),
          variantParts.join(","),
          `${product.name}${variant.color ? ` in ${variant.color}` : ""} by Racquet Habit`,
          product.capsule,
          product.category,
          "150 USD",
        ];
        return values.map(csv).join(",");
      }),
  );
  const body = `${headers.map(csv).join(",")}\n${rows.join("\n")}\n`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="racquet-habit-pinterest-catalog.csv"',
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Robots-Tag": "noindex, follow",
    },
  });
};
