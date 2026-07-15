# Racquet Habit

The custom storefront for **Racquet Habit — Tennis Addicts Society**. Built with Astro and deployed as a Cloudflare Worker; product data and checkout are powered by Fourthwall.

## Local development

Requirements: Node.js 22.12 or newer and a Fourthwall Storefront API token.

```sh
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

The storefront runs at `http://localhost:4321`. Add `?country=AM` locally to preview the Armenia experience and AMD display.

## Environment

```dotenv
FOURTHWALL_STOREFRONT_TOKEN="storefront-token"
FOURTHWALL_API_USERNAME="platform-api-username"
FOURTHWALL_API_PASSWORD="platform-api-password"
```

Only `FOURTHWALL_STOREFRONT_TOKEN` is required by the production Worker. The Platform API credentials are used by `scripts/setup-fourthwall.mjs` to provision products and should remain local.

## Useful commands

```sh
npm run check       # Astro and TypeScript validation
npm run build       # production build
npm run assets      # regenerate raster masters and social assets from source art
npm run typegen     # regenerate Cloudflare binding types
npm run deploy      # build and deploy with Wrangler
```

`node scripts/setup-fourthwall.mjs` provisions the initial Fourthwall collection. Its local state file is deliberately ignored by Git.

## Store architecture

- Astro 7 server rendering with the Cloudflare adapter
- Cloudflare custom domains: `racquethabit.com` and `www.racquethabit.com`
- Fourthwall Storefront API for live products, images, variants, prices, and availability
- Fourthwall direct-checkout URLs generated from the local bag
- Armenia detected at the edge through Cloudflare country metadata
- AMD prices shown as an approximate localized display; checkout settles in USD
- `ARMENIA` is automatically applied for Armenia checkout and provides free shipping

Fourthwall calculates shipping rates for print-on-demand products. It does not expose a fixed international shipping override for these products, so international delivery is calculated at checkout rather than forced to $25.

## Brand assets

Editable SVG source lives in `public/brand/`:

- `monogram.svg` — compact RH Habit Loop
- `seal.svg` — institutional society seal
- `print-habit-loop.svg` — light-on-dark product print master
- `print-society-seal.svg` — product seal print master
- `print-lattice.svg` — ornamental racquet-string pattern

The current campaign image is in `public/images/hero-night-court.png`, with optimized AVIF/WebP versions generated for the storefront.

For the work that should be commissioned before a full commercial launch, see [EXTERNAL-DESIGN-BRIEF.md](./EXTERNAL-DESIGN-BRIEF.md).

## Deployment

The Worker configuration is in `wrangler.jsonc`. The Storefront API token is stored as an encrypted Worker secret:

```sh
npx wrangler secret put FOURTHWALL_STOREFRONT_TOKEN
npm run deploy
```

Never commit `.dev.vars`, `.env*`, `.fourthwall-state.json`, or Wrangler state.
