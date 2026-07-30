# Racquet Habit product-photography workflow

This is the repeatable workflow behind the approved premium catalog and editorial imagery.

## The core idea

Use image generation as a controlled wardrobe/product edit, not as a request to recreate an art direction.

- The product reference is authoritative for garment color, cut, construction, artwork, scale, placement, spelling, and material.
- The editorial reference is the edit target. Preserve the same people, location, pose, camera, lighting, composition, grain, grading, and emotional tone.
- Permit only tiny natural variations: a few moved hairs, a 1–2 degree head turn, a fractional walking step, or a camera move of a few centimeters.
- Explicitly prohibit beautification, scene regeneration, invented props, glossy campaign polish, fake bokeh, HDR, and plastic skin/fabric.
- Ask for facial repair only when the reference contains an artifact, while locking identity, age, and expression.

This wording produces a much better result than asking for a new image “in the style of” a reference. The latter causes the generator to average the reference into generic fashion imagery.

## Catalog photographs

Catalog images use a separate identity-preserving product-mockup prompt:

1. Supply the exact front or back product image first.
2. Supply one approved premium catalog photograph second as lighting and restraint reference only.
3. Lock every product fact in the prompt.
4. Ask for a warm dove/off-white seamless sweep, one very large feathered light, restrained negative fill, slow shadow falloff, protected whites, visible cotton microtexture, and fine organic grain.
5. Prohibit mannequin, hanger, props, hard cutout edges, HDR, CGI gloss, and artwork changes.

Front and back should be generated separately. This gives the model fewer conflicting facts and substantially improves graphic fidelity.

## Editorial photographs

1. Put the editorial edit target first.
2. Add the relevant exact product references after it.
3. Enumerate everything that is locked in the edit target.
4. Describe the smallest possible wardrobe edit.
5. If the image contains multiple products, supply every product reference and enumerate each replacement separately.
6. Ask for the same photograph “one frame later,” not a new campaign image.

## Quality-control checklist

- Compare every word, monogram, object, color, and print proportion against the product reference.
- Inspect faces, ears, hands, fingers, racquets, garment hems, collar ribs, and hanger geometry at full resolution.
- Reject any image that loses the original reference’s composition, grain, color science, or emotional character.
- Catalog white garments must remain visibly separate from the background without becoming gray or yellow.
- Keep high-resolution PNG masters. Export stripped WebP files at quality 88 for the storefront.
- For absolute pixel-perfect microtype, composite the original production artwork onto the generated garment before final export; generation alone can subtly mutate very small lettering.

## Storage convention

- `assets/product-photography/<product-slug>/references/`: exact product references
- `assets/product-photography/<product-slug>/masters/`: approved full-resolution PNG masters
- `assets/product-photography/<product-slug>/manifest.json`: provenance and output map
- `public/images/products/curated/<product-slug>/`: optimized storefront WebP files
- `docs/product-photography-prompts.md`: prompt library

Older raw generations from the July 24 production run are mirrored locally at:

`design/brand-fixed/production/product-photography-masters-2026-07-24/`

That directory is intentionally ignored by Git because it is a 143 MB working archive. The selected optimized versions remain tracked under `public/images/products/curated/`.
