# Racquet Habit — v3 asset integration map

The v3 New Court Classic library is the active production system. Raster
concepts remain archived as untouched source files; selected derivatives and
reconstructed vectors are the only files used by the storefront and Fourthwall.

| Final asset | Repository destination | Website use | Merchandise use |
| --- | --- | --- | --- |
| Editorial wordmark | `public/brand-v3/logo-primary-editorial.svg` | Hero and editorial intermissions | Tee back, towel, packaging |
| Horizontal wordmark | `public/brand-v3/logo-primary-horizontal.svg` | Header and footer | Labels and small print |
| RH monogram | `public/brand-v3/logo-rh-monogram.svg` | Favicon and micro marks | Embroidery and drinkware |
| Embroidery monogram | `public/brand-v3/logo-rh-monogram-embroidery.svg` | — | 12–25 mm stitching |
| Society patch | `public/brand-v3/logo-society-patch.svg` | Society section | Cap, tote, tee back |
| Racquet flourish | `public/brand-v3/logo-racquet-flourish.svg` | Collection statement | Last Set tee |
| Bounce mark | `public/brand-v3/mark-bounce.svg` | Form and divider accent | Bartacks and stickers |
| Pattern system | `public/brand-v3/patterns/pattern-*.svg` | Section framing | Towel, tissue, linings |
| Object illustrations | `public/brand-v3/illustrations/illustration-*.svg` | Shop, 404, Society | Packaging and inserts |
| Campaign hero | `public/images/v3/final/campaign-hero.*` | Homepage hero | Campaign only |
| Mobile campaign hero | `public/images/v3/final/campaign-hero-mobile.*` | Mobile homepage hero | Campaign only |
| Between Sets campaign | `public/images/v3/final/campaign-between-sets.*` | Society/editorial story | Campaign only |
| Court still life | `public/images/v3/final/court-still-life.*` | Homepage objects story | Campaign only |
| Editorial still life | `public/images/v3/final/court-still-life-editorial.*` | Secondary editorial use | Campaign only |
| Tournament poster | `public/images/v3/final/tournament-poster.*` | Journal/collection | Poster tee reference |
| String Tension poster | `public/images/v3/final/tournament-poster-string-tension.*` | Secondary poster and tee direction | Poster tee reference |
| Packaging concept | `public/images/v3/final/packaging-tournament-desk.*` | Homepage packaging story | Supplier art-direction reference |
| Open Graph crop | `public/images/v3/final/og-racquet-habit.jpg` | Social previews | — |
| Apparel art masters | `public/merch-v3/apparel-*.png` | Product imagery reference | Fourthwall print files |
| Accessory art masters | `public/merch-v3/accessory-*.png` | Product imagery reference | Fourthwall print files |
| Coffee/drink art | `public/merch-v3/hospitality-*.png` | Collaboration previews | Supplier print files |

## Current production state

1. Favicon, navigation signature, hero wordmark and social image use v3.
2. Homepage campaign, still-life, poster and packaging sections use the selected
   raster masters.
3. Shop, Society, cart and 404 illustrations use the v3 court-object family.
4. Fourthwall uses fitted files from `public/merch-v3/fourthwall/`.
5. The superseded dark Fourthwall demo products are archived.
6. Local responsive and image-load regression checks are recorded under
   `design/brand-v3/site-qa/`.

## Future image-generation coordination

- Run only one image generation at a time across the account.
- Before sending a prompt, confirm that no other ChatGPT thread shows
  `Generating image`, `Thinking`, or a stop button.
- Use the isolated Racquet Habit browser window so another project cannot
  receive a prompt or lose its composer contents.
- Keep prompts on one line and verify their opening and closing phrases before
  pressing Return.
- Download and review a result locally before starting the next refinement.
