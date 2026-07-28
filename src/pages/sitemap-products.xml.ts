import type { APIRoute } from "astro";
import { getCatalog } from "../lib/catalog";

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character] || character);
}

export const GET: APIRoute = async () => {
  const products = await getCatalog();
  const urls = products
    .map((product) => {
      const location = `https://racquethabit.com/products/${product.slug}`;
      const images = [...new Set(product.images)]
        .slice(0, 6)
        .map((image) => (
          `<image:image><image:loc>${escapeXml(new URL(image, location).toString())}</image:loc>` +
          `<image:title>${escapeXml(product.name)}</image:title></image:image>`
        ))
        .join("");
      return `<url><loc>${escapeXml(location)}</loc>${images}</url>`;
    })
    .join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}</urlset>`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
};
