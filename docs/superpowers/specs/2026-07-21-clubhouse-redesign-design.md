# Racquet Habit — Playful Clubhouse Redesign

Date: 2026-07-21
Source of truth: `design/brand-fixed/website-concepts/04-playful-clubhouse-*.png`,
`design/brand-fixed/identity/identity-main-handmade-club.png`,
`design/brand-fixed/products/playful-capsule-completion/`.

## Thesis

The site becomes the digital clubhouse of a fictional-but-real tennis club:
warm paper, saturated club colors, big friendly display type, hand-painted
brand lettering, stickers and badges, numbered product cards, and food.
The joke ("court, lunch, court") is carried by structure, not decoration.
Nothing should read as a generic ecommerce template: no white void, no
thin gray borders, no interchangeable hero.

## Identity

- Primary lockup: `RACQUET` in deep-green display caps + `Habit` in red
  paint-stroke script overlapping it, traced to vector from
  `identity-main-handmade-club.png`.
- Secondary mark: the oval RH racquet monogram (green), traced to vector;
  used as favicon, footer stamp, sticker.
- The `Habit` script gets a GSAP paint-on reveal (mask strokes drawn
  progressively) on first load, and the underline scribble animates on
  section entries.

## Palette (sampled from concepts)

| Token | Hex | Use |
|---|---|---|
| paper | `#F7F1E5` | page background |
| paper-warm | `#F1E7D6` | alt panels, footer lockers |
| green | `#17402E` | display type, footer bar, buttons |
| green-deep | `#0F2F21` | hover, hero button |
| red | `#D2402A` | script accents, CTA band, price pills |
| yellow | `#F2C14B` | announcement bar, step cards, stickers |
| yellow-soft | `#F6DA8C` | product card panels |
| sky | `#A8CDE2` | product card panels, badges |
| cobalt | `#1F6BB0` | display type accent, sticker, locker |
| ball | `#D8DE4F` | tennis-ball accent only |
| ink | `#1C2420` | body text on paper |

Color pacing: paper is the default field; every viewport gets exactly one
saturated moment (hero photo, card row, red band, locker footer).

## Typography

- Display: **Anton** (Google) — condensed heavy caps, tight leading,
  used for COURT. LUNCH. COURT.-style stacked headlines, section titles,
  big CTAs. Letter-spacing slightly open (0.01em), never tracking-tight.
- Script accent: **Yellowtail** — "pick your ritual", sticker phrases.
- Serif: **Instrument Serif** — product-print echoes, small plaques,
  editorial pull lines.
- UI/body: **Geist** — paragraphs, buttons, forms.
- Labels: **Roboto Condensed** — uppercase meta, eyebrows, receipts.

## Layout system

Shared parts:
- Yellow announcement bar: RH mark + FREE DELIVERY ACROSS ARMENIA (AMD/
  currency toggle lives here).
- Cream sticky header: lockup left, nav center (Collection / The Society /
  Journal / Delivery), dark-green pill `BAG (0)` right.
- Sticker vocabulary: rotated oval badges with white keyline + arrow
  (category links), round "GOOD PEOPLE ONLY" / "SERVED DAILY" stamps.
- Cards: 20–24px radius panels in yellow-soft/sky/red/green, big numeral
  01–04, product cutout, dot swatches, circular arrow button.
- Footer: five locker-door columns (red register card, yellow SHOP,
  cobalt SOCIETY, cream HELP, green monogram) over a green bar with the
  full lockup + Yerevan · Armenia.

### Home
1. Hero: split — left cream with stacked COURT./LUNCH./COURT. in
   green/red/cobalt + red scribble underline, sub copy, green pill CTA;
   right: equipment-cabinet photo (cropped from hero concept) with
   floating oval sticker links (TEES, CAPS, BOTTLES).
2. PICK YOUR RITUAL (green display + red script overlay) → 4 numbered
   product cards → green pill "SHOP THE WHOLE CLUBHOUSE".
3. MADE FOR THE CLUBHOUSE: two photos (lunch table, courtside), love-letter
   copy, MEET THE SOCIETY link, GOOD PEOPLE ONLY stamp.
4. HOW TO FORM A HABIT: 01 PLAY / 02 LUNCH / 03 PLAY AGAIN cards
   (yellow/sky/red) with drawn SVG icons and arrows.
5. ORDER ANOTHER SET. red band: serving-window photo (cropped from CTA
   concept), receipt graphic, stickers, CTA.
6. Locker footer.

### Shop
Display header + colored filter pills (All / Tees / Caps / Drinkware),
cards on rotating panel colors with numerals; count as receipt line.

### Product
Colored panel gallery (per-product panel color), Anton name, serif
subline, price in red pill, red ADD TO BAG pill, receipt-style accordion
(The piece / Material / Delivery), related "same shelf" row.

### Society (our-habit)
After-the-rally hero photo, editorial copy, three club-rule cards,
shadow-rally interlude image, join CTA.

### Journal, Delivery, 404
Same system; delivery = 3 scorecard cards; 404 = "OUT." + ball-collage
image + return CTA.

## Catalog (hard-coded until Fourthwall is populated)

14 products from `playful-capsule-completion`, each with design + editorial
image, category Tees / Caps / Drinkware:

Tees $38: Serve Chilled · Emotional Support Racquet · One More Racquet
Should Fix It · Rest Day · Tennis Lunch Tennis · The Ball Has Plans.
Caps $32: Emotional Support Racquet · One More Racquet · On Court /
Out of Office · Tennis Lunch Tennis.
Drinkware $28–36: Serve Chilled Bottle · Court-Side Hydration Bottle ·
Out of Office Tumbler · Tennis Water Tennis Bottle.

Fourthwall live-merge stays in `lib/catalog.ts`; checkout unchanged.

## Motion

- GSAP (npm) loaded on demand; all animation behind
  `prefers-reduced-motion` guard.
- Habit paint-on at hero; sticker pop-in (scale+rotate spring) on scroll
  entry; card lift on hover; marquee on red band; underline scribbles
  draw in on section entry.

## Out of scope

- No production deploy, no Fourthwall catalog mutation.
- Adobe Fonts not needed (Google set covers the concept).

## Implementation order

asset pipeline → logo vectors → fonts/base → design system + shared
components → catalog → home → shop/product → secondary pages → GSAP →
visual QA loop (desktop + mobile screenshots per page) → check/build.
