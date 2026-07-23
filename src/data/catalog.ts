export type ProductCategory = "Tees" | "Accessories";

export type ProductType =
  | "Heavyweight tee"
  | "Crop tee"
  | "Oversized tee"
  | "Court cap"
  | "Organic tote"
  | "Beach towel"
  | "MagSafe case";

export type ProductCapsule =
  | "The Daily Lineup"
  | "Love Cherries"
  | "Court-Side Pleasures"
  | "Repeat Players"
  | "Signed Rally — Founding Issue";

export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  color?: string;
  colorHex?: string;
  size?: string;
  inStock: boolean;
  images: string[];
};

export type ProductInformation = {
  title: string;
  body: string;
  link?: string;
  linkLabel?: string;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  productType: ProductType;
  capsule: ProductCapsule;
  sortRank: number;
  description: string;
  story: string;
  price: number;
  maxPrice: number;
  image: string;
  images: string[];
  editorialImage?: string;
  variants: ProductVariant[];
  information: ProductInformation[];
  source: "fourthwall";
};

export type ProductPresentation = Pick<
  CatalogProduct,
  "category" | "productType" | "capsule" | "sortRank" | "story"
> & {
  legacySlugs?: string[];
  editorialImage?: string;
};

export const productPresentation: Record<string, ProductPresentation> = {
  "b13b023b-29b9-4c23-a9e9-2bbe271e623b": {
    category: "Tees",
    productType: "Heavyweight tee",
    capsule: "The Daily Lineup",
    sortRank: 10,
    editorialImage: "/images/products/editorial/tennis-lunch-tennis-tee-v2.webp",
    story: "The day’s order, printed plainly: tennis, lunch, tennis. A heavyweight court tee for red clay, long tables and the match that somehow begins at sunset.",
  },
  "c805433b-9cfc-43bf-babe-4482f1be9e35": {
    category: "Tees",
    productType: "Crop tee",
    capsule: "The Daily Lineup",
    sortRank: 20,
    editorialImage: "/images/products/editorial/tennis-lunch-tennis-crop-tee-v2.webp",
    story: "The cropped edition of our preferred itinerary. Close to the body, easy through the afternoon and unlikely to improve your willingness to leave the court.",
  },
  "044a54cc-c0b9-4a80-bc08-6eb95b85f205": {
    category: "Accessories",
    productType: "Court cap",
    capsule: "The Daily Lineup",
    sortRank: 30,
    editorialImage: "/images/products/editorial/out-of-office-court-cap-v2.webp",
    story: "A low-profile court cap with a complete absence notice: ON COURT up front, OUT OF OFFICE at the side, return time still unconfirmed.",
  },
  "5f2234ee-c019-43ae-b6c4-e86b67bbe57b": {
    category: "Accessories",
    productType: "Organic tote",
    capsule: "Court-Side Pleasures",
    sortRank: 40,
    editorialImage: "/images/products/editorial/something-cold-organic-court-tote-v2.webp",
    story: "Room for the spare shirt, the towel and one cold thing after play. The organic-cotton twill is substantial enough for daily court duty.",
  },
  "5e4a6f7c-440a-4183-82a8-9fd4df6f6235": {
    category: "Accessories",
    productType: "Beach towel",
    capsule: "Court-Side Pleasures",
    sortRank: 50,
    editorialImage: "/images/products/editorial/racquets-sunshine-towel-v2.webp",
    story: "An edge-to-edge still life for the bench, pool or beach, with a soft printed face and an absorbent terry reverse.",
  },
  "a29cbcd4-c4e8-433b-acc3-2af51ae8d7be": {
    category: "Tees",
    productType: "Crop tee",
    capsule: "Love Cherries",
    sortRank: 60,
    editorialImage: "/images/products/editorial/love-cherries-crop-tee-v2.webp",
    story: "Two tennis balls, one fine serve and a slightly romantic reading of the score. A relaxed crop for the softer side of competitive behavior.",
  },
  "4dc8e8fd-eafa-43ff-969a-3d5c617901fc": {
    category: "Tees",
    productType: "Oversized tee",
    capsule: "Love Cherries",
    sortRank: 70,
    editorialImage: "/images/products/editorial/love-cherries-oversized-tee-v2.webp",
    story: "The Love Cherries mark on a roomy midweight tee, cut for dropped shoulders and the very long walk from court to lunch.",
  },
  "d16cddbe-56e5-4258-9237-ec8b4af2d22d": {
    category: "Accessories",
    productType: "MagSafe case",
    capsule: "Love Cherries",
    sortRank: 80,
    editorialImage: "/images/products/editorial/love-cherries-magsafe-case-v2.webp",
    story: "The tennis-ball cherry mark composed around the camera on a warm ivory field. A glossy protective case for supported iPhone models.",
  },
  "016f8881-3755-42e9-a551-db711defea07": {
    category: "Tees",
    productType: "Heavyweight tee",
    capsule: "Repeat Players",
    sortRank: 90,
    editorialImage: "/images/products/editorial/tennis-is-my-rest-day-tee-v2.webp",
    story: "Recovery, according to repeat players: back on court with the racquet in reach. Heavyweight cotton and a straight-faced illustrated alibi.",
  },
  "fa963175-0030-4e47-b20d-f7d680768433": {
    category: "Tees",
    productType: "Oversized tee",
    capsule: "Repeat Players",
    sortRank: 100,
    editorialImage: "/images/products/editorial/emotional-support-racquet-tee-v2.webp",
    story: "For the racquet that comes to dinner, the beach and at least one wedding. The full resort illustration sits across the back.",
  },
  "d20d2671-af7b-47d4-ab2b-e170efce279d": {
    category: "Tees",
    productType: "Crop tee",
    capsule: "Signed Rally — Founding Issue",
    sortRank: 110,
    editorialImage: "/images/products/editorial/signed-rally-crop-tee-v2.webp",
    story: "The Society’s first uniform: a quiet chest mark, an oversized Signed Rally composition and a cropped silhouette made for one more set.",
  },
  "7345291f-a3a9-47f7-8e15-dea8fd04f7ad": {
    category: "Tees",
    productType: "Oversized tee",
    capsule: "Signed Rally — Founding Issue",
    sortRank: 120,
    editorialImage: "/images/products/editorial/signed-rally-oversized-tee-v2.webp",
    story: "The Founding Issue in its roomier form: central chest mark, oversized back composition and a faded-bone court uniform with no closing time.",
  },
};
