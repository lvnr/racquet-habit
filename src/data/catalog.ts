export type ProductCategory = "Wear" | "Carry" | "Court" | "Drink" | "Coffee";

export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  color?: string;
  colorHex?: string;
  size?: string;
  inStock: boolean;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  edition: string;
  description: string;
  story: string;
  material: string;
  price: number;
  image: string;
  images: string[];
  variants: ProductVariant[];
  comingSoon?: boolean;
  source: "fourthwall" | "preview";
};

const previewVariant = (slug: string, price: number): ProductVariant => ({
  id: `preview-${slug}`,
  name: "Standard",
  price,
  inStock: false,
});

export const previewCatalog: CatalogProduct[] = [
  {
    id: "preview-society-tee",
    slug: "society-tee-issue-001",
    name: "Society Tee — Collection 01",
    category: "Wear",
    edition: "The Last Set",
    description: "Heavyweight championship-ivory cotton with the Racquet Habit Society seal.",
    story: "A restrained editorial wordmark at the front meets the two-colour Society seal on the back. Built for court, clubhouse and every hour after.",
    material: "Premium heavyweight cotton · relaxed unisex fit",
    price: 38,
    image: "/images/v3/products/society-tee.webp",
    images: ["/images/v3/products/society-tee.webp", "/images/v3/products/last-set-tee.webp"],
    variants: [previewVariant("society-tee", 38)],
    source: "preview",
  },
  {
    id: "preview-member-cap",
    slug: "member-cap",
    name: "Member Cap",
    category: "Wear",
    edition: "The Last Set",
    description: "Low-profile ivory cotton twill with a woven green Society patch.",
    story: "A quiet six-panel cap with Royal Trim at the patch edge and ONE MORE SET over the rear opening.",
    material: "Cotton twill · adjustable closure",
    price: 34,
    image: "/images/v3/products/member-cap.webp",
    images: ["/images/v3/products/member-cap.webp"],
    variants: [previewVariant("member-cap", 34)],
    source: "preview",
  },
  {
    id: "preview-mug",
    slug: "one-more-set-mug",
    name: "One More Set Mug",
    category: "Drink",
    edition: "The Last Set",
    description: "A deadpan reminder for the hours between court bookings.",
    story: "Championship-ivory ceramic, Centre Court Green type, and the phrase responsible for most late dinners.",
    material: "Gloss ceramic · color interior",
    price: 24,
    image: "/images/v3/products/one-more-set-mug.webp",
    images: ["/images/v3/products/one-more-set-mug.webp"],
    variants: [previewVariant("mug", 24)],
    source: "preview",
  },
  {
    id: "preview-cup",
    slug: "courtside-reuse-cup",
    name: "Courtside Reuse Cup",
    category: "Drink",
    edition: "The Last Set",
    description: "For the coffee before the first set and the coffee after the third.",
    story: "A reusable clubhouse cup developed around the Habit Loop pattern. Pack it with a change of grips and pretend that counts as preparation.",
    material: "Reusable insulated body · splash lid",
    price: 28,
    image: "/images/v3/products/court-vessel.webp",
    images: ["/images/v3/products/court-vessel.webp"],
    variants: [previewVariant("cup", 28)],
    comingSoon: true,
    source: "preview",
  },
  {
    id: "preview-tumbler",
    slug: "court-tumbler",
    name: "Court Tumbler",
    category: "Drink",
    edition: "The Last Set",
    description: "Stainless steel with the green and ivory New Court Classic Society seal.",
    story: "A double-wall tumbler for long matches, early starts and every set after the supposedly final one.",
    material: "Stainless steel · double-wall insulated",
    price: 36,
    image: "/images/v3/products/court-vessel.webp",
    images: ["/images/v3/products/court-vessel.webp"],
    variants: [previewVariant("tumbler", 36)],
    source: "preview",
  },
  {
    id: "preview-bottle",
    slug: "habit-flask",
    name: "Habit Flask",
    category: "Drink",
    edition: "The Last Set",
    description: "The all-day court bottle, reduced to one mark and one message.",
    story: "Cold for the match, discreet enough for everywhere after it. A single ball-seam line wraps the vessel.",
    material: "Stainless steel · insulated screw top",
    price: 39,
    image: "/images/v3/products/court-vessel.webp",
    images: ["/images/v3/products/court-vessel.webp"],
    variants: [previewVariant("bottle", 39)],
    source: "preview",
  },
  {
    id: "preview-tote",
    slug: "society-carryall",
    name: "Society Carryall",
    category: "Carry",
    edition: "The Last Set",
    description: "For the spare racquet you absolutely did not need to bring.",
    story: "A durable everyday court bag carrying the two-colour Society seal at considered scale.",
    material: "Eco-conscious canvas · long handles",
    price: 32,
    image: "/images/v3/products/society-tote.webp",
    images: ["/images/v3/products/society-tote.webp"],
    variants: [previewVariant("tote", 32)],
    source: "preview",
  },
  {
    id: "preview-towel",
    slug: "string-lattice-towel",
    name: "String Lattice Towel",
    category: "Court",
    edition: "The Last Set",
    description: "A championship stripe court towel in deep green, ivory and Royal Trim.",
    story: "The graphic member of the first collection: bold enough for court, disciplined enough for the club bag.",
    material: "Performance terry · edge-to-edge graphic",
    price: 42,
    image: "/images/v3/products/championship-towel.webp",
    images: ["/images/v3/products/championship-towel.webp"],
    variants: [previewVariant("towel", 42)],
    comingSoon: true,
    source: "preview",
  },
  {
    id: "preview-roast",
    slug: "after-set-limited-roast",
    name: "After Set — Limited Roast",
    category: "Coffee",
    edition: "Guest roaster 001",
    description: "A rotating coffee collaboration for matches that start before good judgment.",
    story: "The first guest roast is being developed with an Armenian specialty roaster. Small lots, numbered bags, one court-side brew guide.",
    material: "Whole bean · 250 g · collaboration release",
    price: 24,
    image: "/images/v3/products/after-set-coffee.webp",
    images: ["/images/v3/products/after-set-coffee.webp"],
    variants: [previewVariant("roast", 24)],
    comingSoon: true,
    source: "preview",
  },
  {
    id: "preview-sports-drink",
    slug: "fifth-set-seasonal-drink",
    name: "Fifth Set — Seasonal Drink",
    category: "Coffee",
    edition: "Clubhouse special",
    description: "A seasonal recovery drink developed with a local café partner.",
    story: "Citrus, salt and restrained sweetness, served cold after matches and occasionally before them. Local release first.",
    material: "Seasonal café collaboration · local availability",
    price: 8,
    image: "/images/v3/products/fifth-set-drink.webp",
    images: ["/images/v3/products/fifth-set-drink.webp"],
    variants: [previewVariant("sports-drink", 8)],
    comingSoon: true,
    source: "preview",
  },
];
