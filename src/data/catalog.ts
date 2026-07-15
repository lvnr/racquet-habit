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
    name: "Society Tee — Issue 001",
    category: "Wear",
    edition: "Founding issue",
    description: "Heavyweight chalk cotton. The formal uniform of an informal compulsion.",
    story: "A restrained front mark meets the Society seal on the back. Built to live beyond the court, with one acid registration detail for those paying attention.",
    material: "Premium heavyweight cotton · relaxed unisex fit",
    price: 38,
    image: "/images/product-apparel.svg",
    images: ["/images/product-apparel.svg"],
    variants: [previewVariant("society-tee", 38)],
    source: "preview",
  },
  {
    id: "preview-member-cap",
    slug: "member-cap",
    name: "Member Cap",
    category: "Wear",
    edition: "Court issue",
    description: "Low profile, softly structured, and marked only with the unresolved RH loop.",
    story: "A deliberately quiet six-panel cap with an oxblood interruption in the embroidery and a message under the brim: no intention of quitting.",
    material: "Cotton twill · adjustable closure",
    price: 34,
    image: "/images/product-cap.svg",
    images: ["/images/product-cap.svg"],
    variants: [previewVariant("member-cap", 34)],
    source: "preview",
  },
  {
    id: "preview-mug",
    slug: "one-more-set-mug",
    name: "One More Set Mug",
    category: "Drink",
    edition: "Clubhouse issue",
    description: "A deadpan reminder for the hours between court bookings.",
    story: "Chalk ceramic, oxblood interior, and the phrase responsible for most late dinners.",
    material: "Gloss ceramic · color interior",
    price: 24,
    image: "/images/product-mug.svg",
    images: ["/images/product-mug.svg"],
    variants: [previewVariant("mug", 24)],
    source: "preview",
  },
  {
    id: "preview-cup",
    slug: "courtside-reuse-cup",
    name: "Courtside Reuse Cup",
    category: "Drink",
    edition: "Daily-use issue",
    description: "For the coffee before the first set and the coffee after the third.",
    story: "A reusable clubhouse cup developed around the Habit Loop pattern. Pack it with a change of grips and pretend that counts as preparation.",
    material: "Reusable insulated body · splash lid",
    price: 28,
    image: "/images/product-vessel.svg",
    images: ["/images/product-vessel.svg"],
    variants: [previewVariant("cup", 28)],
    comingSoon: true,
    source: "preview",
  },
  {
    id: "preview-tumbler",
    slug: "night-court-tumbler",
    name: "Night Court Tumbler",
    category: "Drink",
    edition: "Night court",
    description: "Court Ink steel with a small acid orbit and nothing superfluous.",
    story: "A double-wall tumbler for long matches, early starts and those supposedly final sets.",
    material: "Stainless steel · double-wall insulated",
    price: 36,
    image: "/images/product-vessel.svg",
    images: ["/images/product-vessel.svg"],
    variants: [previewVariant("tumbler", 36)],
    source: "preview",
  },
  {
    id: "preview-bottle",
    slug: "habit-flask",
    name: "Habit Flask",
    category: "Drink",
    edition: "Daily-use issue",
    description: "The all-day court bottle, reduced to one mark and one message.",
    story: "Cold for the match, discreet enough for everywhere after it. The unresolved line wraps the vessel like a ball path that never quite ends.",
    material: "Stainless steel · insulated screw top",
    price: 39,
    image: "/images/product-vessel.svg",
    images: ["/images/product-vessel.svg"],
    variants: [previewVariant("bottle", 39)],
    source: "preview",
  },
  {
    id: "preview-tote",
    slug: "society-carryall",
    name: "Society Carryall",
    category: "Carry",
    edition: "Founding issue",
    description: "For the spare racquet you absolutely did not need to bring.",
    story: "A canvas carryall with the monogram enlarged into an ornamental field and institutional copy held to a whisper.",
    material: "Heavy organic cotton canvas · long handles",
    price: 32,
    image: "/images/product-tote.svg",
    images: ["/images/product-tote.svg"],
    variants: [previewVariant("tote", 32)],
    source: "preview",
  },
  {
    id: "preview-towel",
    slug: "string-lattice-towel",
    name: "String Lattice Towel",
    category: "Court",
    edition: "Court issue",
    description: "The loudest member of the first issue, built from racquet string geometry.",
    story: "An acid and Court Ink jacquard-style field with the society line held inside a clean central block.",
    material: "Performance terry · edge-to-edge graphic",
    price: 42,
    image: "/images/product-towel.svg",
    images: ["/images/product-towel.svg"],
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
    image: "/images/product-coffee.svg",
    images: ["/images/product-coffee.svg"],
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
    image: "/images/product-coffee.svg",
    images: ["/images/product-coffee.svg"],
    variants: [previewVariant("sports-drink", 8)],
    comingSoon: true,
    source: "preview",
  },
];
