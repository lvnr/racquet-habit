export type ProductCategory = "Tees" | "Accessories";

export type ProductType =
  | "Heavyweight tee"
  | "Crop tee"
  | "Oversized tee"
  | "Court cap"
  | "Organic tote"
  | "Beach towel"
  | "MagSafe case"
  | "Travel mug"
  | "Tumbler";

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
  catalogImages: string[];
  editorialImages: string[];
  editorialImage?: string;
  featuredColor?: string;
  featuredSize?: string;
  variants: ProductVariant[];
  information: ProductInformation[];
  source: "fourthwall";
};

export type ProductPresentation = Pick<
  CatalogProduct,
  "category" | "productType" | "capsule" | "sortRank" | "story"
> & {
  hasColorCatalog?: boolean;
  legacySlugs?: string[];
  editorialImage?: string;
  editorialImages?: string[];
  catalogImages?: string[];
  featuredColor?: string;
  featuredSize?: string;
};

const colorCatalogSlugs = new Set([
  "baseline-plaque-tee",
  "love-cherries-crop-tee",
  "love-cherries-oversized-tee",
  "love-cherries-oversized-tee-2",
  "minimal-green-monogram-crop-top",
  "out-of-office-court-cap",
  "racquet-habit-minimal-black-crop-top",
  "racquet-habit-night-court-rh-monogram-tee",
  "racquets-sunshine-something-bubbly-crop-tee",
  "racquets-sunshine-something-bubbly-oversized-night-tee",
  "racquets-sunshine-something-bubbly-oversized-tee",
  "signed-rally-founding-issue-crop-tee",
  "signed-rally-founding-issue-oversized-tee",
  "society-monogram-founding-issue-crop-tee",
  "society-monogram-founding-issue-hat",
  "tennis-is-my-rest-day-tee-dtfx",
  "tennis-lunch-tennis-tee",
]);

function curatedImages(slug: string) {
  const base = `/images/products/white-court/${slug}`;
  return {
    hasColorCatalog: colorCatalogSlugs.has(slug),
    catalogImages: [
      `${base}/catalog-front.webp`,
      `${base}/catalog-back-or-secondary.webp`,
    ],
    editorialImages: [
      `${base}/editorial-01.webp`,
      `${base}/editorial-02.webp`,
      `${base}/editorial-03.webp`,
    ],
    editorialImage: `${base}/editorial-01.webp`,
  };
}

export const productPresentation: Record<string, ProductPresentation> = {
  "12e71b38-e2ed-4fa8-b8e1-3ddd8a97f1e7": {
    ...curatedImages("racquet-habit-night-court-rh-monogram-tee"),
    category: "Tees",
    productType: "Heavyweight tee",
    capsule: "Signed Rally — Founding Issue",
    sortRank: 10,
    featuredColor: "Navy",
    featuredSize: "M",
    story: "The RH monogram after dark: a navy heavyweight tee for floodlit bookings, cool walkovers and the final court still in play.",
  },
  "15de57e0-f0ec-45d5-9d64-4153beec8a21": {
    ...curatedImages("racquet-habit-minimal-black-crop-top"),
    category: "Tees",
    productType: "Crop tee",
    capsule: "Signed Rally — Founding Issue",
    sortRank: 20,
    featuredColor: "Natural",
    featuredSize: "M",
    story: "A clean natural crop with the black Racquet Habit mark held small and precise. The quietest route into the founding uniform.",
  },
  "e3cd6c4e-1206-48fb-aa0b-cf39d2389a17": {
    ...curatedImages("minimal-green-monogram-crop-top"),
    category: "Tees",
    productType: "Crop tee",
    capsule: "Signed Rally — Founding Issue",
    sortRank: 30,
    featuredColor: "Natural",
    featuredSize: "M",
    story: "The RH monogram in centre-court green on a natural crop: restrained enough for the warm-up, distinct enough for everything after.",
  },
  "e1c1e3b1-07b9-48fc-9a4d-219a7ee66df6": {
    ...curatedImages("baseline-plaque-tee"),
    category: "Tees",
    productType: "Heavyweight tee",
    capsule: "Signed Rally — Founding Issue",
    sortRank: 40,
    featuredColor: "Ivory",
    featuredSize: "M",
    story: "A heavyweight ivory tee carrying the Society plaque like a court-side maker’s mark: formal, useful and ready for a long draw.",
  },
  "d60de886-123b-4c7c-a2a4-9f035e23f1b7": {
    ...curatedImages("society-monogram-founding-issue-hat"),
    category: "Accessories",
    productType: "Court cap",
    capsule: "Signed Rally — Founding Issue",
    sortRank: 50,
    featuredColor: "Maroon",
    featuredSize: "One size",
    story: "The founding monogram embroidered on a maroon court cap. A compact piece of Society kit for bright serves and late afternoons.",
  },
  "f6d6c917-9a7a-4b0e-9dc0-d7ec04f286cb": {
    ...curatedImages("society-monogram-founding-issue-crop-tee"),
    category: "Tees",
    productType: "Crop tee",
    capsule: "Signed Rally — Founding Issue",
    sortRank: 60,
    featuredColor: "Natural",
    featuredSize: "M",
    story: "The Founding Issue monogram on a natural crop, composed as a small uniform rather than a loud souvenir.",
  },
  "d20d2671-af7b-47d4-ab2b-e170efce279d": {
    ...curatedImages("signed-rally-founding-issue-crop-tee"),
    category: "Tees",
    productType: "Crop tee",
    capsule: "Signed Rally — Founding Issue",
    sortRank: 70,
    featuredColor: "Ecru",
    featuredSize: "M",
    story: "The Society’s first uniform: a quiet chest mark, an oversized Signed Rally composition and a cropped silhouette made for one more set.",
  },
  "7345291f-a3a9-47f7-8e15-dea8fd04f7ad": {
    ...curatedImages("signed-rally-founding-issue-oversized-tee"),
    category: "Tees",
    productType: "Oversized tee",
    capsule: "Signed Rally — Founding Issue",
    sortRank: 80,
    featuredColor: "Ecru",
    featuredSize: "M",
    story: "The Founding Issue in its roomier form: central chest mark, oversized back composition and a faded-bone court uniform with no closing time.",
  },
  "b13b023b-29b9-4c23-a9e9-2bbe271e623b": {
    ...curatedImages("tennis-lunch-tennis-tee"),
    category: "Tees",
    productType: "Heavyweight tee",
    capsule: "The Daily Lineup",
    sortRank: 90,
    featuredColor: "Midnight",
    featuredSize: "M",
    story: "The day’s order, printed plainly: tennis, lunch, tennis. A heavyweight court tee for red clay, long tables and the match that somehow begins at sunset.",
  },
  "c805433b-9cfc-43bf-babe-4482f1be9e35": {
    ...curatedImages("tennis-lunch-tennis-crop-tee"),
    category: "Tees",
    productType: "Crop tee",
    capsule: "The Daily Lineup",
    sortRank: 100,
    featuredColor: "Brown",
    featuredSize: "M",
    story: "The cropped edition of our preferred itinerary. Close to the body, easy through the afternoon and unlikely to improve your willingness to leave the court.",
  },
  "044a54cc-c0b9-4a80-bc08-6eb95b85f205": {
    ...curatedImages("out-of-office-court-cap"),
    category: "Accessories",
    productType: "Court cap",
    capsule: "The Daily Lineup",
    sortRank: 110,
    featuredColor: "Maroon",
    featuredSize: "One size",
    story: "A low-profile court cap with a complete absence notice: ON COURT up front, OUT OF OFFICE at the side, return time still unconfirmed.",
  },
  "5f2234ee-c019-43ae-b6c4-e86b67bbe57b": {
    ...curatedImages("something-cold-organic-court-tote"),
    category: "Accessories",
    productType: "Organic tote",
    capsule: "Court-Side Pleasures",
    sortRank: 120,
    featuredColor: "Oyster",
    featuredSize: "One size",
    story: "Room for the spare shirt, the towel and one cold thing after play. The organic-cotton twill is substantial enough for daily court duty.",
  },
  "5e4a6f7c-440a-4183-82a8-9fd4df6f6235": {
    ...curatedImages("racquets-sunshine-something-cold-beach-towel"),
    category: "Accessories",
    productType: "Beach towel",
    capsule: "Court-Side Pleasures",
    sortRank: 130,
    featuredColor: "White",
    featuredSize: "36″×72″",
    story: "An edge-to-edge still life for the bench, pool or beach, with a soft printed face and an absorbent terry reverse.",
  },
  "5962ff6b-61fc-4354-a36f-e0ef72ca9ea0": {
    ...curatedImages("court-side-hydration-travel-mug-with-a-handle"),
    category: "Accessories",
    productType: "Travel mug",
    capsule: "Court-Side Pleasures",
    sortRank: 140,
    featuredColor: "White",
    featuredSize: "40 oz",
    story: "A handled travel mug sized for the full booking, the changeover and the drive home. Court-side hydration without the quick exit.",
  },
  "366de4b7-0100-4dde-9dc0-76e561f6612a": {
    ...curatedImages("serve-chilled-tumbler"),
    category: "Accessories",
    productType: "Tumbler",
    capsule: "Court-Side Pleasures",
    sortRank: 150,
    featuredColor: "White",
    featuredSize: "20oz",
    story: "Serve Chilled on a clean white tumbler: twenty ounces for cold drinks, warm sidelines and matches with generous overrun.",
  },
  "e629a1b3-4103-47db-973c-55627a20f4db": {
    ...curatedImages("racquets-sunshine-something-bubbly-crop-tee"),
    category: "Tees",
    productType: "Crop tee",
    capsule: "Court-Side Pleasures",
    sortRank: 160,
    featuredColor: "White",
    featuredSize: "M",
    story: "Racquets, sunshine and something bubbly in a relaxed crop: the correct order of events for a bright court and a long table.",
  },
  "797376e9-8360-4bab-9038-047e45f9e6de": {
    ...curatedImages("racquets-sunshine-something-bubbly-oversized-tee"),
    category: "Tees",
    productType: "Oversized tee",
    capsule: "Court-Side Pleasures",
    sortRank: 170,
    featuredColor: "White",
    featuredSize: "M",
    story: "The roomier white edition of our preferred summer programme: racquets first, sunshine throughout, something bubbly after.",
  },
  "940700ae-3b70-458d-8a9c-cf56112268a6": {
    ...curatedImages("racquets-sunshine-something-bubbly-oversized-night-tee"),
    category: "Tees",
    productType: "Oversized tee",
    capsule: "Court-Side Pleasures",
    sortRank: 180,
    featuredColor: "Black",
    featuredSize: "M",
    story: "The night-session edition in black: an oversized tee for late bookings, cooler air and the bottle waiting beyond the baseline.",
  },
  "a29cbcd4-c4e8-433b-acc3-2af51ae8d7be": {
    ...curatedImages("love-cherries-crop-tee"),
    category: "Tees",
    productType: "Crop tee",
    capsule: "Love Cherries",
    sortRank: 190,
    featuredColor: "Pale Pink",
    featuredSize: "M",
    story: "Two tennis balls, one fine serve and a slightly romantic reading of the score. A relaxed crop for the softer side of competitive behavior.",
  },
  "4dc8e8fd-eafa-43ff-969a-3d5c617901fc": {
    ...curatedImages("love-cherries-oversized-tee"),
    category: "Tees",
    productType: "Oversized tee",
    capsule: "Love Cherries",
    sortRank: 200,
    featuredColor: "Ecru",
    featuredSize: "M",
    story: "The Love Cherries mark on a roomy midweight tee, cut for dropped shoulders and the very long walk from court to lunch.",
  },
  "68696c87-2369-44aa-a0d5-be79fc162ae4": {
    ...curatedImages("love-cherries-oversized-tee-2"),
    category: "Tees",
    productType: "Oversized tee",
    capsule: "Love Cherries",
    sortRank: 210,
    featuredColor: "White",
    featuredSize: "M",
    story: "Love Cherries in crisp white: a second oversized cut for clean summer light, loose shoulders and affection expressed through the score.",
  },
  "d16cddbe-56e5-4258-9237-ec8b4af2d22d": {
    ...curatedImages("love-cherries-magsafe-case"),
    category: "Accessories",
    productType: "MagSafe case",
    capsule: "Love Cherries",
    sortRank: 220,
    featuredColor: "Glossy",
    featuredSize: "iPhone 17 Pro Max",
    story: "The tennis-ball cherry mark composed around the camera on a warm ivory field. A glossy protective case for supported iPhone models.",
  },
  "016f8881-3755-42e9-a551-db711defea07": {
    ...curatedImages("tennis-is-my-rest-day-tee-dtfx"),
    category: "Tees",
    productType: "Heavyweight tee",
    capsule: "Repeat Players",
    sortRank: 230,
    featuredColor: "Butter",
    featuredSize: "M",
    story: "Recovery, according to repeat players: back on court with the racquet in reach. Heavyweight cotton and a straight-faced illustrated alibi.",
  },
  "fa963175-0030-4e47-b20d-f7d680768433": {
    ...curatedImages("emotional-support-racquet-oversized-tee"),
    category: "Tees",
    productType: "Oversized tee",
    capsule: "Repeat Players",
    sortRank: 240,
    featuredColor: "Ecru",
    featuredSize: "M",
    story: "For the racquet that comes to dinner, the beach and at least one wedding. The full resort illustration sits across the back.",
  },
};
