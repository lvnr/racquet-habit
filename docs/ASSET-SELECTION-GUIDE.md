# Racquet Habit — asset selection and launch guide

This is the founder-facing map of what was generated, what is selected, how it
is used, and what still requires specialist or physical production work.

## The short version

The active creative direction is **New Court Classic**:

- championship ivory, centre-court green and restrained royal trim;
- high-contrast editorial typography and the approved serif RH monogram;
- sunlit, social tennis photography rather than dark performance imagery;
- technical-human court illustration and screen-print graphics;
- dry humour in the small print, not in every interface label.

The complete raster comparison is:

`design/brand-v3/review/raster-asset-selection-01.png`

The complete identity proof is:

`design/brand-v3/review/brand-asset-review-04.png`

The complete Collection 01 artwork proof is:

`design/brand-v3/merch-selected/collection-01-production-artwork-proof.png`

## 1. Campaign heroes

### A — Sunlit Sideline

File:
`design/brand-v3/concepts/campaign-hero/hero-a-sunlit-sideline.png`

Strengths: immediate tennis context, elegant championship whites, close human
presence, strong portrait crop.

Best use: mobile homepage, social crop, launch announcement.

Limitation: less architectural and less distinctive as a desktop masthead.

Decision: **selected as the mobile hero**.

### B — Between Sets

File:
`design/brand-v3/concepts/campaign-hero/hero-b-between-sets.png`

Strengths: social warmth, balanced male/female representation, credible
post-match mood, generous green field.

Best use: Society page, editorial modules, email and lookbook.

Limitation: not enough quiet left-side space for the primary homepage lockup.

Decision: **selected as the secondary campaign image**.

### C — Clubhouse Threshold

File:
`design/brand-v3/concepts/campaign-hero/hero-c-clubhouse-threshold.png`

Strengths: strongest fashion-commerce composition, excellent left copy zone,
owned ivory/green architecture, court bag treated as a premium object.

Best use: desktop homepage, Open Graph crop, launch campaign masthead.

Decision: **primary campaign hero**.

## 2. Court still lifes

### A — Service Box Grid

File:
`design/brand-v3/concepts/court-still-life/still-life-a-service-box-grid.png`

Strengths: precise inventory-like composition, clear object count, strong court
geometry, excellent square crop.

Best use: homepage object story, collection overview, press kit.

Decision: **primary still life**.

### B — Bench After Play

File:
`design/brand-v3/concepts/court-still-life/still-life-b-bench-after-play.png`

Strengths: tactile and lived-in; useful counterpoint to the formal identity.

Best use: product detail storytelling, journal, social carousel.

Decision: **secondary still life**.

### C — Club Table

File:
`design/brand-v3/concepts/court-still-life/still-life-c-club-table.png`

Strengths: warm hospitality world and collaboration potential.

Limitation: less recognizably tennis-led and easier to mistake for general
lifestyle branding.

Decision: archive as a future coffee-collaboration reference.

## 3. Tournament posters

### A — Impact

File:
`design/brand-v3/concepts/tournament-poster/poster-a-impact.png`

Strengths: simplest silhouette, strongest scale, excellent four-colour
screen-print logic, clear type-safe zones.

Best use: homepage Journal card, campaign poster, tee and tote inspiration.

Decision: **primary Collection 01 poster**.

### B — Rally Sequence

File:
`design/brand-v3/concepts/tournament-poster/poster-b-rally-sequence.png`

Strengths: narrative motion and useful modular fragments.

Limitation: busier and less iconic at small size.

Decision: archive for future social motion or a multi-panel editorial story.

### C — String Tension

File:
`design/brand-v3/concepts/tournament-poster/poster-c-string-tension.png`

Strengths: most expressive and fashion-forward; strong garment potential.

Best use: limited poster, back print or second collection graphic.

Decision: **selected secondary poster**.

## 4. Packaging concepts

### A — Tournament Desk

File:
`design/brand-v3/concepts/packaging/packaging-a-tournament-desk.png`

Strengths: coherent complete system, plausible uncoated materials, disciplined
identity zones, strong sunlight.

Best use: supplier brief and homepage packaging story.

Decision: **primary packaging direction**.

### B — Club Equipment Room

File:
`design/brand-v3/concepts/packaging/packaging-b-club-equipment-room.png`

Strengths: functional and warehouse-aware.

Best use: kraft mailer, inventory label and fulfillment-room details.

Decision: retain as a secondary material reference only.

### C — Post-match Hospitality

File:
`design/brand-v3/concepts/packaging/packaging-c-post-match-hospitality.png`

Strengths: useful for coffee and beverage collaboration styling.

Limitation: drifts toward cosmetics, wine and general hospitality.

Decision: do not use as the master packaging system.

## 5. Identity assets

Active public files:

- `public/brand-v3/logo-primary-editorial.svg`
- `public/brand-v3/logo-primary-horizontal.svg`
- `public/brand-v3/logo-rh-monogram.svg`
- `public/brand-v3/logo-rh-monogram-embroidery.svg`
- `public/brand-v3/logo-society-patch.svg`
- `public/brand-v3/logo-racquet-flourish.svg`
- `public/brand-v3/mark-bounce.svg`

The RH monogram is founder-approved and should not be replaced with the earlier
geometric studies. The current wordmark is a strong production candidate, but a
specialist letterer should make the final optical pass before high-volume
physical manufacturing.

## 6. Pattern and illustration assets

Patterns:

- championship stripe;
- string grid;
- court frame;
- ball-seam arcs;
- dash field.

Location: `public/brand-v3/patterns/`

Court-object illustrations:

- umpire chair;
- scoreboard;
- racquet;
- ball can;
- bench;
- net;
- towel;
- court bag.

Location: `public/brand-v3/illustrations/`

These are one-colour vectors and may be recoloured only with approved palette
tokens.

## 7. Collection 01 production artwork

Outlined vectors:

`public/merch-v3/vectors/`

High-resolution PNG masters:

`public/merch-v3/`

Fourthwall-fitted upload files:

`public/merch-v3/fourthwall/`

The live Fourthwall demo catalog now uses the v3 fitted art on:

- natural/ecru/white Society Tee;
- khaki/white/dark-green Member Cap;
- green-interior One More Set Mug;
- white Court Tumbler;
- white Habit Flask;
- oyster Society Carryall.

The superseded dark demo products are archived.

## 8. Website incorporation

Homepage:

- Hero C on desktop and Hero A on mobile.
- Still life A in the object story.
- Between Sets in the Society editorial section.
- Impact poster in Journal.
- Tournament Desk in the packaging story.

Shop and product pages:

- Fourthwall’s real rendered product images are used for the six live demos.
- Local artwork previews remain for towel, coffee, seasonal drink and other
  not-yet-produced concepts.
- Approximate AMD prices display for Armenian visitors; checkout settles in USD.
- The `ARMENIA` free-shipping promotion is applied automatically for requests
  identified as Armenian.

## 9. How to change a selection

Untouched source files remain under `design/brand-v3/concepts/`. To switch a
campaign selection:

1. change the source mapping in `scripts/prepare-v3-raster-assets.mjs`;
2. run `npm run assets:v3-raster`;
3. run the visual QA script;
4. inspect desktop and mobile captures under `design/brand-v3/site-qa/`;
5. deploy only after the crop works with real interface copy.

Never overwrite the concept originals.

## 10. What must still be external for a top-tier physical launch

Do not replace these with more AI generation:

- final wordmark optical lettering by a specialist;
- embroidery digitizing and real sew-outs at 15 mm and 22 mm;
- exact supplier tech packs, print placements, bleeds and dielines;
- coffee/drink ingredients, allergens, nutrition, barcode and legal label copy;
- physical colour strike-offs and garment samples;
- owned photography of the exact finished products;
- trademark clearance and font licensing.

## 11. Fourthwall shipping constraint

Fourthwall calculates shipping dynamically for its made-to-order catalog. The
store can automatically apply free shipping to Armenian visitors through the
`ARMENIA` promotion, but Fourthwall does not expose a supported way to force all
international destinations to a single USD 25 rate for these fulfilled
products. Keep the checkout copy honest until fulfillment moves to a system
with custom shipping-rate control.
