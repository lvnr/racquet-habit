# Higgsfield Prompt Pack — Ready-to-Paste Generation Recipes

Organized by workflow. Model choices reflect Higgsfield's July 2026 lineup. Every prompt maps to a concept ID (P# file 05, V# file 06, S# file 07) so generated output drops straight into the calendar.

## §0 Reusable blocks

**STYLE BLOCK (append to image prompts unless noted):**
> sunlit Mediterranean tennis club, warm stone architecture, clay court tones, striped canvas textiles, championship ivory and deep court green palette with rare service-red accents, natural film grain, tactile fabric texture, editorial fashion photography, hard summer light with true shadows

**NEGATIVE BLOCK (add where the model accepts negatives / as "avoid" instruction):**
> no neon, no gradients, no glassmorphism, no crossed racquets or crowns or laurels, no distressed faux-vintage, no teal cinematic grade, no plastic skin, no extra fingers, no deformed hands, no watermark, not stock-photo generic

**PRODUCT FIDELITY LINE (whenever a real design appears):**
> Preserve the garment graphic, lettering, and colors exactly as in the reference image — do not redraw, restyle, or morph the print.

**Reference assets** live in the repo: `design/brand-fixed/products/*/**-design.png` (flat designs) and `*-editorial.png` (approved photography look). Upload once, save as **Elements** so they work across Nano Banana Pro, Seedream, GPT Image 2, Seedance 2.0, and Kling 3.0.

---

## §A One-time setup (do this before generating)

1. **Brand kit (Marketing Studio):** point it at racquethabit.com — it scrapes logo, colors, fonts, tone. Verify: green `#103C2C`, ivory `#F3EBD8`, red `#B83D34`, yellow `#D7E63D`; playful set: paper `#F7F1E5`, red `#D2402A`, yellow `#F2C14B`, sky `#A8CDE2`, cobalt `#1F6BB0`.
2. **Elements:** save as reusable references — 6 tee designs (capsule), 4 caps, 4 drinkware, the RH monogram, the handwritten HABIT lockup, 2–3 editorial frames (for style).
3. **Soul ID — create two recurring "members"** (your consistent AI cast for UGC-style content; Soul ID works with Soul 2.0 + Soul Cinema only — elsewhere use their saved Element portraits):
   - Generate a portrait batch first (Soul 2.0, ~12–16 images, varied angles/expressions, consistent person description), then train Soul ID on the batch (5–20 images, ~5 min).
   - **Member 01 "Ani"** batch prompt: `portrait of a woman in her late 20s, olive skin, dark brown hair in a low ponytail, warm confident smile, light freckles, natural makeup, wearing a cream tennis tee, tennis club background, natural daylight, photorealistic, varied angle` + NEGATIVE BLOCK
   - **Member 02 "Marc"** batch prompt: `portrait of a man in his early 30s, Mediterranean features, short dark curly hair, light stubble, relaxed friendly expression, wearing an ivory crewneck, sunlit tennis clubhouse background, photorealistic, varied angle` + NEGATIVE BLOCK
   - Disclosure: content with these characters gets the AI toggles on Meta/TikTok (file 07 §8).

---

## §B Product-faithful stills — Nano Banana Pro (+ Banana Placement for fixes)

*Nano Banana Pro prompt order: subject → setting → lighting → mood → instructions. Attach the design PNG (and garment editorial if available) as references. 4:5 for feed, 2:3 for Pinterest, 4K quality for ads.*

**B1 — Tee on model, courtside (any capsule tee):**
> A relaxed young woman wearing the exact oversized t-shirt from the reference, standing at a clay-court net post, one hand on the net cord, racquet loose in the other, candid mid-smile looking off-camera. Late-afternoon sun, long shadows, warm stone wall behind. [PRODUCT FIDELITY LINE] [STYLE BLOCK] 4:5.

**B2 — Back-print hero (the capsule designs are back-led):**
> A man photographed from behind, three-quarter turn, wearing the exact t-shirt from the reference with the full back print visible and flat (minimal folds across the graphic), standing on a sunlit hard court, looking over his shoulder toward an off-frame rally. [PRODUCT FIDELITY LINE] [STYLE BLOCK] 4:5.

**B3 — Cap product portrait:**
> The exact cap from the reference resting on a folded ivory towel on a clubhouse bench, tennis ball beside it, embroidery crisp and legible, shallow depth of field, single warm sidelight. [PRODUCT FIDELITY LINE] [STYLE BLOCK] 1:1 and 2:3 crops.

**B4 — Drinkware in scene:**
> The exact bottle from the reference standing on a linen-covered courtside table next to an ice bucket of tennis balls and a sliced lemon, condensation on the metal, baseline and net soft in the background. [PRODUCT FIDELITY LINE] [STYLE BLOCK] 2:3.

**B5 — Flat-lay kit (P7):**
> Overhead flat-lay on a striped beach towel laid on clay: the exact tote, cap, and bottle from the references arranged with a racquet, three tennis balls, cherries in a glass bowl, a paperback, and sunglasses; hard noon sun, crisp shadows. Keep every product's print exactly as referenced. [STYLE BLOCK] 2:3 and 4:5.

**Fix pass — Banana Placement (when a print drifts):** brush the print area → attach the design PNG → prompt: `apply the reference graphic to the shirt, follow the fabric folds, keep lettering sharp and unbroken, soft natural contact shadow`.

**Colorway/variant volume (fresh Pinterest pins):** re-run B1–B4 changing only scene/time-of-day words ("golden hour" → "bright morning" → "overcast soft light") — each output is a "fresh pin" for the same product URL.

---

## §C Editorial campaign stills (P1–P12) — Soul 2.0 (presets) or Nano Banana Pro (when product must be exact)

*Soul 2.0 wants SHORT prompts + a preset; use soul_id for Ani/Marc. If a real design must appear, switch to §B recipes instead.*

- **P1 Long Lunch (hero — NB Pro, multi-ref with tee + bottle):**
  > A linen-covered lunch table set directly on the baseline of a clay court: carafe of water, sliced citrus, galvanized ice bucket filled with tennis balls and one bottle from the reference, two wooden-look racquets resting like cutlery; three friends mid-conversation, one wearing the exact tee from the reference; overhead summer sun, hard shadows. [PRODUCT FIDELITY LINE] [STYLE BLOCK] 16:9 + 4:5.
- **P2 Tennis Lunch Tennis (Soul 2.0, preset: Warm Ambient):** `man at a courtside café table wearing a service-red tennis tee, schedule card propped against a glass, fork and tennis ball on the same plate, midday sun, candid laughter` *(then B2 pass for exact print)*
- **P3 Rest Day (Soul 2.0, preset: Warm Ambient):** `woman horizontal on a striped lounger beside a tennis net, cap over her eyes, racquet held on her chest like a book, butter-yellow tee, drowsy summer afternoon`
- **P4 Out of Office (Soul 2.0, preset: Editorial Street Style):** `leather briefcase and laptop abandoned at a tennis net post, suit jacket draped over the net cord, man walking away toward the baseline in an ivory tee and navy cap, not looking back, long late-afternoon shadows`
- **P5 Night Court (Soul 2.0, preset: Subtle Flash):** `two players on a floodlit hard court at night, moths in the light beams, deep green and burgundy tees, chain-link fence, direct flash energy, caught mid-laugh`
- **P6 Serve Chilled still life (NB Pro):** `museum-grade still life: galvanized ice bucket with tennis balls buried in crushed ice like champagne, one lemon wheel, heavy condensation, ivory seamless background, single hard key light, razor-sharp product focus` [STYLE BLOCK] 1:1 + 2:3.
- **P8 Locker Room (NB Pro, multi-ref):** `ivory metal lockers, one door open revealing tennis tees hung in palette order from the references, a cap on the hook and a bottle on the shelf, small printed cards numbering them 01–04, warm practical light` [PRODUCT FIDELITY LINE]
- **P9 Ball Has Plans (Soul 2.0, preset: Editorial Street Style):** `man in a cobalt-blue tennis tee loading a canvas weekender and a racquet bag into a vintage car trunk at a sun-washed stone doorway, boarding-pass card tucked into the racquet strings, cypress trees, dry summer light`
- **P10 Love Cherries (Soul 2.0, preset: Y2K Studio or Warm Ambient):** `two women laughing in pale-pink and ivory tennis tees against a rose-tinted clay backdrop, glass bowl of cherries that are tiny tennis balls on a pedestal, playful surreal editorial`
- **P11 Small Print macro (NB Pro):** `extreme macro photograph of embroidered lettering on garment cotton, individual stitches and fabric weave visible, shallow depth of field, warm raking light` *(attach the relevant design ref; repeat for underbrim, care label, bottle markers)*
- **P12 Yerevan Home Court (Soul 2.0, preset: Warm Ambient):** `two friends with racquets walking past pink tuff-stone architecture toward a public tennis court, mountain light, late afternoon, warm dusty tones, candid documentary feel`

**Post-processing every ad/Pinterest asset:** upscale to 4K (Topaz) → Outpaint/Reframe for the 16:9 / 9:16 / 2:3 crop set.

---

## §D Video prompts — Seedance 2.0 (primary), Gemini Omni Flash (text-holding + edits), Kling 3.0 (human motion)

*i2v rule: feed the finished §B/§C still as `start_image`; the prompt describes ONLY motion + camera + atmosphere. Re-describing the garment invites morphing. Add: "do not morph or redraw the shirt graphic."*

**V1 Brand film (Seedance 2.0, 15s, 9:16, std, 1080p — generate in 3 passes and edit together, or one multi-shot pass):**
> Three shots, 15 seconds total, 9:16. @image1 is the first keyframe and style reference. Shot 1 (0–5s): slow dolly-in across a sunrise clay court toward a player mid-serve, long shadows, dust in the light, no cuts. Shot 2 (5–10s): match cut to a linen lunch table on the baseline, friends laughing, ice bucket of tennis balls, camera drifts right in a gentle arc. Shot 3 (10–15s): whip-pan to a floodlit night court, slow-motion forehand, fabric and hair moving. Photorealistic, 35mm film quality, professional color grading, no 3D, no cartoon. Audio: no music, raw SFX only — ball bounce, racket strings, table murmur, night insects.

**V3 Capsule drop film (Seedance 2.0, 12s, 9:16, start_image = P8 locker still):**
> One continuous shot, 12 seconds, 9:16. @image is the first keyframe. Locker doors open one by one in rhythm revealing folded tennis tees, a cap, and a bottle; camera pushes in slowly then tilts down to a printed card on the bench. Crisp practical lighting, photorealistic, do not morph or redraw any garment graphics. Audio: metal latch clicks, soft cloth sounds, one ball bounce at the end. NO MUSIC.

**V5 Day arc (Seedance 2.0, 15s multi-shot):** three numbered shots — morning rally wide, lunch table slow push, dusk rally silhouette; same audio doctrine.

**V13 ASMR (Seedance 2.0 Mini for drafts → 2.0 std final, 10s macro loops ×4):**
> Macro shot, 10 seconds. @image is the keyframe. Ice cubes shift and crack over tennis balls in a metal bucket, one ball rotates slowly, condensation beads run. Locked-off camera, no cuts. Audio: raw ASMR — ice crack, metal ring, no voice, NO MUSIC.

**V14 Night transition (Kling 3.0, 10s, motion-heavy):**
> A player tosses a ball at golden hour; at the exact peak of the toss the scene cuts to the same court at night under floodlights, the swing completes in slow motion, deep green tee, moths in the beams. Natural human motion, no cuts besides the single match cut, photorealistic.

**V16 "It started at love" (Gemini Omni Flash — it holds line-art and text best, 10s, refs: love-seam design PNG + P1 still):**
> @design is a drawn ball-flight line. The line animates as if hand-drawn across the scene from @scene: it loops over the lunch table, bounces twice, and settles onto the back of a cream tee as the printed graphic. Keep the design's lettering and colors exactly. Camera static, subtle parallax. Warm daylight.

**Higgsfield preset shortcut:** the **"FINAL SERVE"** preset (mid-2000s broadcast tennis final, match-point crowd eruption) — feed a B2 back-print still for an instant spectacle clip; great for Open-season content (V20).

**Editing pass (Gemini Omni Flash, one instruction per pass):** `remove the background people` → `make the light golden hour` → `slow the last second by 50%`.

---

## §E UGC & talking content — Marketing Studio + Soul ID

**Marketing Studio recipes (no prompt engineering needed — pick mode, attach product + avatar + setting):**

| Concept | Mode | Product | Avatar | Setting / hook |
|---|---|---|---|---|
| V7 unboxing | Unboxing ASMR | capsule tee + cap | Ani | "sunlit kitchen table, morning light"; hook: package slides into frame |
| V25 try-on | UGC Virtual Try-On | 3 tees | Ani / Marc | "bright bedroom mirror, phone camera feel" |
| V26 testimonial | Selfie Testimonial | Emotional Support tee | Marc | script below |
| V27 TikTok-made-me | UGC | any | Ani | "courtside bench, handheld" |

**V26 script (12s):**
> "I bought the Emotional Support Racquet shirt as a joke. It is no longer a joke. It's my personality now — read the care label. They put jokes *in the care label*."

**V2 founder story (if not filming yourself — better: film yourself):** AI Talking Avatar / Lipsync Studio on a Soul 2.0 portrait, or record your own VO and drive Sync Lipsync 3. Script beats: Yerevan origin → "the hours around play" → small print philosophy → "the Society is open."

**UGC still variants (Soul 2.0 + soul_id, presets Old Smartphone / Subtle Flash):**
> `mirror selfie in [tee from reference], phone visible, cluttered real bedroom, casual pose, flash on` — reads authentically non-professional; run through §B fix pass if the print drifts. These become carousel "member photos."

*All §E output: AI-disclosure toggles ON when published or run as ads.*

---

## §F Graphics & templates — Recraft V4.1 (text-to-image only; lock brand colors)

*Use `vector` for marks/type art, `utility` for clean mockup-style product shots, `standard` for illustrations. Always pass the palette.*

- **S5 Scoreboard graphic (vector):** `classic tennis scoreboard panel, flat vector, text "SLEEP 0 — TENNIS 6" in condensed capitals, small caption "A DIFFICULT HABIT TO BREAK", minimal, two-color` + colors `["#103C2C","#F3EBD8"]`
- **Quote/type cards for pins & carousels (vector):** `editorial typographic poster, elegant high-contrast serif, text "LONG LUNCH. LATE MATCH." centered on cream ground, thin baseline rule, small monogram placeholder at foot` + colors `["#103C2C","#F3EBD8","#B83D34"]`, background `#F3EBD8` → repeat for "ONE MORE SET." / "COURT. LUNCH. COURT." / "IT STARTED AT LOVE."
- **Clubhouse sticker sheet (vector):** `sticker sheet of playful tennis club badges: rotated oval badge reading "GOOD PEOPLE ONLY", round stamp "SERVED DAILY", arrow tab "ONE MORE SET", hand-drawn racquet and ball doodles, bold flat vector, slight paper offset feel` + playful palette `["#17402E","#D2402A","#F2C14B","#A8CDE2","#1F6BB0","#F7F1E5"]`
- **Pinterest board covers (utility_vector):** `minimal cover tile, cream ground, centered small serif title "TENNIS GIFTS", thin green border rule` (repeat per board)
- **Story highlight icons (vector):** `set of minimal single-line icons on cream circles: tennis racquet, lunch plate with ball, envelope with seal, ice bucket, magnifying glass over small text, delivery truck` + colors `["#103C2C","#F3EBD8"]`
- **S1 ad frame (utility):** `clean e-commerce ad layout: centered garment mockup area on solid deep green field, generous margins, single caption line in small serif italic at bottom, tiny monogram top corner, flat, no shadows` → composite the real design PNG over it in an editor (never let a model retype your artwork).

*Anything Recraft generates with lettering: treat as concept art; keep real wordmarks/designs as the repo SVG/PNG overlays. (Brand rule — generated lettering is never production lettering.)*

---

## §G Production discipline

- **Iterate cheap, finalize expensive:** drafts on Nano Banana 2 / Seedance Mini / Kling Turbo; finals on NB Pro / Seedance 2.0 std / Veo 3.1; upscale only finals. A focused weekly session: ~30 stills + 4–6 videos ≈ 400–700 credits.
- **Consistency kit:** reuse the SAME reference images across every job (drift-killer); one reference type first, add more only if needed.
- **Naming:** save outputs as `P1-hero-4x5-v2.png`, `V3-drop-9x16-final.mp4` — matches the calendar IDs and the repo's conventions; commit selects back to `marketing/assets/` (or `design/`) so the library stays versioned.
- **Weekly batch order:** §B products (fidelity work while fresh) → §C scenes → §D animate best stills → §E one UGC set → §F graphics fill → upscale/reframe → schedule.
- **Never ship:** mangled prints (one Banana Placement pass, then re-roll), six-fingered hands, invented product details (colorways/materials that don't exist in the shop), unlabeled AI humans in ads.
