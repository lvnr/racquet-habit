# Priority UGC Ad Prompt Pack

**Prepared:** July 29, 2026  
**Purpose:** Sales-first synthetic creator ads for seven priority products, with a credit-efficient validation plan for Seedance 2.0 and Cinema Studio 3.5.

This is not a seven-video spending instruction. It is a staged slate: validate the three highest-priority ideas at 720p, inspect the performances and product fidelity, then spend on 1080p finals and the next products.

## Priority products

1. [Racquets, Sunshine & Something Bubbly Oversized Tee](https://racquethabit.com/products/racquets-sunshine-something-bubbly-oversized-tee)
2. [Tennis Is My Rest Day Tee](https://racquethabit.com/products/tennis-is-my-rest-day-tee-dtfx)
3. [Night Court RH Monogram Tee](https://racquethabit.com/products/racquet-habit-night-court-rh-monogram-tee)
4. [Racquet Habit Minimal Black Crop Top](https://racquethabit.com/products/racquet-habit-minimal-black-crop-top)
5. [Love Cherries Oversized Tee](https://racquethabit.com/products/love-cherries-oversized-tee)
6. [Serve Chilled Tumbler](https://racquethabit.com/products/serve-chilled-tumbler)
7. [Court-Side Hydration Travel Mug With a Handle](https://racquethabit.com/products/court-side-hydration-travel-mug-with-a-handle)

## Recommendation

Use the remaining **176 Higgsfield credits** for these three pilots:

| Priority | Product | Pilot model | Pilot | Current preflight cost |
|---:|---|---|---|---:|
| 1 | Racquets, Sunshine & Something Bubbly Oversized Tee | Seedance 2.0 Standard | 8s · 720p · native audio | 36 |
| 2 | Tennis Is My Rest Day Tee | Seedance 2.0 Standard | 8s · 720p · native audio | 36 |
| 3 | Night Court RH Monogram Tee | Cinema Studio · Video 3.0 engine | 8s · 720p · native audio | 40 |
|  | **First-pass total** |  |  | **112** |
|  | **Credits retained** |  | one Standard/Cinema retry plus safety margin | **64** |

Costs are the live Higgsfield preflight results on July 29, 2026 and can change.

Do not buy more credits before reviewing those three. If at least two work:

- **Add 300 credits** to finish the three priority winners at 1080p, test two more concepts, and preserve a modest retry allowance.
- **Add 500 credits** to finish the three priority winners, test all four remaining products, promote the best two of those to 1080p, and retain roughly one additional retry.

The extra 200 credits are not for more random variants. They buy enough margin to reject an uncanny performance instead of accepting it because the account is empty.

## Production method

Every concept uses the same economical hybrid:

1. **Create a fictional house creator keyframe with native GPT Image.** Use Pinterest/editorial material only for camera, light, energy, palette, and styling—not a real person's identity. The creator must be newly invented and non-identifiable.
2. **Make the garment/product correct in the keyframe.** Use the real front and back catalog images and the existing Higgsfield product Element. For front/back garments, prepare one front keyframe and one back-reveal keyframe.
3. **Spend Higgsfield credits on performance and motion.** The actor's reaction, turn, gesture, pace, dialogue, and camera imperfection are the valuable generated parts.
4. **Use exact catalog pixels for difficult macro inserts.** The intricate back designs and drinkware copy may be inserted for 8–18 frames in Remotion if the generated version is not exact.
5. **Add hook, captions, price, CTA, and disclosure in post.** Do not ask the video model to generate overlay text.

### Existing Higgsfield product Elements

Attach the matching Element and assign it the product role shown below:

| Product | Element |
|---|---|
| Sunshine Bubbly tee | `@sunshine-bubbly-tee` |
| Tennis Is My Rest Day tee | `@tennis-rest-day-tee` |
| Night Court tee | `@night-court-monogram-tee` |
| Minimal Black crop | `@racquet-habit-black-crop` |
| Love Cherries tee | `@love-cherries-tee-ecru` |
| Serve Chilled tumbler | `@serve-chilled-tumbler` |
| Court-Side Hydration mug | `@court-side-travel-mug` |

Use `@creator` below as the label for the fictional creator keyframe/Element. Do not substitute a Pinterest person or an unrelated real person's photograph. Ani may appear only when the ad is intentionally presented as founder content, not as an anonymous customer reaction.

## Global generation rules

Use these rules in every job:

- One fictional creator; an optional second voice remains off camera.
- One product only. Do not make the model juggle several product Elements in a UGC ad.
- Start with the person/action, then environment/light, then camera, then mood.
- Keep spoken lines short, interruptible, and conversational. Include a half-beat, breath, glance, or spontaneous laugh rather than theatrical amazement.
- Preserve the exact garment color, cut, front placement, back placement, and artwork. Never mirror the art, move back art to the chest, swap garments, invent lettering, or turn a crop into an oversized tee.
- Garment art must remain locked to the fabric plane and follow folds naturally without swimming, warping, vanishing, or reappearing.
- Product vessels must retain their exact shape, lid, handle, color, and print placement.
- No packaging or unboxing; Fourthwall packaging is not established as brand truth.
- No claims about shipping, softness, cooling time, durability, fit, or personal purchase history.
- No generated subtitles, captions, logos, watermarks, prices, or end cards.
- If a racquet appears, it is a contemporary graphite racquet—not a wooden vintage racquet.
- Hands, eyes, teeth, lip sync, product art, and front/back continuity are hard rejection gates.
- For source footage, leave the last 0.5–0.8 seconds visually calm enough for a post-produced CTA.

### Shared Seedance reference declaration

Place this at the top of each Seedance prompt after attaching the files:

```text
REFERENCE ROLES
@creator is a newly invented fictional house creator and the identity/wardrobe continuity reference.
@product is the attached Racquet Habit product Element and absolute product truth.
@front_keyframe is the approved front view and opening composition.
@back_keyframe is the approved back view and reveal composition when provided.
Any style reference controls only photographic energy, light, palette, framing, and camera behavior. It must not transfer a person's identity, face, clothing, text, logos, or scene contents.
```

### Shared Cinema Studio 3.5 baseline

Unless a concept overrides it:

- **Aspect / duration:** 9:16 · exactly 8 seconds
- **Palette:** Naturalistic Clean
- **MoveSet:** Documentary Snap
- **Lighting:** Window or Soft Cross
- **Camera:** Clean Digital
- **Lens:** Clinical Sharp
- **Focal length:** 35mm
- **Aperture:** f/4
- **Audio:** native synchronized audio
- **Pilot:** 720p
- **Final:** 1080p only after approval

These settings keep the image intentional while preserving believable creator-camera texture. The prompt controls performance; the panel settings control visual logic.

---

## U01 — “Turn Around”

**Product:** Racquets, Sunshine & Something Bubbly Oversized Tee  
**Sales mechanism:** The modest front creates curiosity; the intricate back earns the genuine “I want this” reaction.  
**Primary hook added in post:** `WAIT FOR THE BACK.`  
**CTA:** `Shop the Sunshine Bubbly tee`

### Performance script

| Time | Picture | Native dialogue/audio |
|---|---|---|
| 0.0–1.4 | Creator casually frames the small front mark in a phone mirror shot. | Friend, off camera: “Wait—turn around.” |
| 1.4–4.8 | A fast, natural turn lands in a steady three-quarter/back view. The back design fills the center of frame and remains readable. | Room tone and fabric movement. Friend takes a half-beat: “No. Stop. That’s the back?” |
| 4.8–7.3 | Camera takes one involuntary step closer. Creator looks over her shoulder and laughs. | Friend: “I need that shirt.” Creator: “I know.” |
| 7.3–8.0 | Hold the back artwork without dialogue. | Small laugh and room tone. |

The off-camera friend should sound surprised but not perform a commercial. The half-beat after the reveal is the emotional proof.

### Seedance 2.0 prompt

```text
3 shots / exactly 8 seconds / vertical 9:16 / synchronized native dialogue and room sound.

REFERENCE ROLES
@creator is a newly invented fictional house creator and the identity/wardrobe continuity reference.
@product is @sunshine-bubbly-tee and absolute product truth.
@front_keyframe is the approved front view and opening phone-mirror composition.
@back_keyframe is the approved full back-art reveal.
Any style reference controls only photographic energy, light, palette, framing, and camera behavior. It must not transfer a person's identity, face, clothing, text, logos, or scene contents.

Shot 1, 0.0–1.4s: a believable creator phone video in a bright private-club changing area, casually imperfect handheld framing. The creator wears the exact white oversized Sunshine Bubbly tee from @product, correct small front mark, relaxed posture. An off-camera female friend says, “Wait—turn around.”

Shot 2, 1.4–4.8s: cut on motion as the creator turns once, naturally and quickly, then lands in the exact @back_keyframe orientation. The complete intricate back artwork is centered, large, undistorted, and held steady. The friend is silent for a short involuntary half-beat, then says with quiet disbelief, “No. Stop. That’s the back?”

Shot 3, 4.8–8.0s: the handheld camera takes one spontaneous step closer. The creator looks back over one shoulder, gives a small genuine laugh. Friend says, “I need that shirt.” Creator answers, “I know.” Hold the product back calmly for the final 0.7 seconds.

Audio: natural room tone, subtle fabric rustle, close phone-mic dialogue, one real laugh; no music, no announcer voice, no commercial sound design.

Camera: contemporary phone camera, tiny focus correction and auto-exposure response, mild handheld imperfection, no aggressive shake, no beauty filter.

Product continuity is mandatory: exact white oversized silhouette; exact small front placement; exact complete back design only on the anatomical back; no mirroring, redrawing, invented text, morphing, disappearing details, or design transfer to the chest. Natural anatomy, hands, eyes, teeth, and lip sync. No generated captions or graphics.
```

### Cinema Studio 3.5 version

**Settings**

- Genre: Comedy
- Palette: Naturalistic Clean
- MoveSet: Documentary Snap
- Lighting: Window
- Camera: Clean Digital
- Lens: Clinical Sharp
- Focal length: 35mm
- Aperture: f/4

**Prompt**

```text
Exactly 8 seconds, vertical 9:16, three concise creator-style shots with synchronized natural dialogue. In a bright, restrained private-club changing area, a newly invented fictional creator wears the exact @sunshine-bubbly-tee. Begin with an imperfect handheld phone-mirror view of the small front mark. At 0.8 seconds an off-camera female friend says, “Wait—turn around.” Cut on the creator's natural turn and land in a controlled three-quarter back view by 2.0 seconds. Hold the complete intricate back artwork large and clear. Give the friend a real half-beat of silence before she says, “No. Stop. That’s the back?” The camera involuntarily steps closer. The creator looks over her shoulder and gives a small, unforced laugh. The friend says, “I need that shirt.” Creator answers, “I know.” End on a stable back-art frame.

Treat @sunshine-bubbly-tee as immutable product truth. Preserve the exact white oversized cut, front mark, and complete back artwork in the correct anatomical locations. No artwork swimming, mirroring, retyping, vanishing, or moving to the front. Natural phone-mic room tone and fabric movement; no music, captions, packaging, announcer, beauty filter, or synthetic commercial performance.
```

**Reject if:** the entire back is not shown, the actor overacts, the back art changes, or the camera never gives the design a clean hold.

---

## U02 — “Rest Day”

**Product:** Tennis Is My Rest Day Tee  
**Sales mechanism:** A compact joke makes the large front design the punchline.  
**Primary hook added in post:** `REST DAY, APPARENTLY.`  
**CTA:** `Shop Tennis Is My Rest Day`

### Performance script

| Time | Picture | Native dialogue/audio |
|---|---|---|
| 0.0–1.7 | Creator sits on a court bench, catching her breath in the exact tee. | Friend, off camera: “I thought today was your rest day.” |
| 1.7–4.4 | Creator looks down, points once to the front design, then looks at camera. | Creator, completely straight: “It is.” |
| 4.4–7.3 | Smash cut: she is already jogging back onto court, laughing. Front design stays visible for the first beat. | Shoe squeak, a ball hit, friend laughing. |
| 7.3–8.0 | Quick calm bench/racquet detail with tee still in frame. | Court ambience. |

### Seedance 2.0 prompt

```text
3 shots / exactly 8 seconds / vertical 9:16 / synchronized native dialogue and court ambience.

REFERENCE ROLES
@creator is a newly invented fictional house creator and the identity/wardrobe continuity reference.
@product is @tennis-rest-day-tee and absolute product truth.
@front_keyframe is the approved seated front view with the complete large front design.
Any style reference controls only photographic energy, light, palette, framing, and camera behavior; never identity or clothing.

Shot 1, 0.0–1.7s: believable handheld phone footage at a real outdoor hard court. The creator sits on a bench after a rally, breathing normally, wearing the exact butter-colored Tennis Is My Rest Day heavyweight tee. The complete large front design is visible. An off-camera friend asks, amused, “I thought today was your rest day.”

Shot 2, 1.7–4.4s: the creator glances down at the front artwork, points to it once, looks back into camera, and answers completely straight, “It is.” Hold long enough for the joke and product to register.

Shot 3, 4.4–8.0s: a sharp cut on a shoe squeak; the same creator is already jogging back toward the baseline with a contemporary graphite racquet. She gives one spontaneous laugh. Keep garment color, loose fit, and art consistent. End with a calm half-second court/tee detail.

Audio: close phone microphone, natural breath, shoe squeak, one ball impact, distant court ambience, off-camera laugh. No music or announcer.

Camera: contemporary phone, lightly imperfect handheld, natural daylight, small autofocus correction, no glossy beauty treatment.

Exact product fidelity: butter garment, large complete front graphic in the correct chest position, small back mark only on the back. Never mirror, rewrite, replace, move, or erase the design. No crop transformation, no wardrobe change, no vintage wooden racquet, no captions or generated graphics.
```

### Cinema Studio 3.5 version

**Settings**

- Genre: Comedy
- Palette: Naturalistic Clean
- MoveSet: Documentary Snap
- Lighting: Soft Cross
- Camera: Clean Digital
- Lens: Clinical Sharp
- Focal length: 35mm
- Aperture: f/4

**Prompt**

```text
Exactly 8 seconds, vertical 9:16, a dry, energetic creator ad on a sunlit hard court. A newly invented fictional creator sits on a bench in the exact @tennis-rest-day-tee, catching a normal breath, while the large front artwork stays clearly visible. An off-camera friend asks, “I thought today was your rest day.” The creator glances down, points once at the design, meets the camera, and answers with deadpan certainty, “It is.” Smash cut on a shoe squeak to the same creator already jogging back toward the baseline with a contemporary graphite racquet, laughing once. Finish on a brief steady product-and-court detail.

Keep the butter tee, oversized silhouette, exact front graphic, and small back mark immutable and anatomically correct through every cut. The joke must feel caught, not rehearsed. Natural breath, court ambience, shoe squeak, a single ball hit, and off-camera laughter. No music, captions, announcer, beauty filter, wardrobe morph, invented lettering, or wooden racquet.
```

**Reject if:** the line delivery is theatrical, the front art cannot be read as one stable design, or the tee changes cut/color across the smash cut.

---

## U03 — “Night Shift”

**Product:** Night Court RH Monogram Tee  
**Sales mechanism:** An aspirational night-court ritual gives the navy/gold product a world and a reason to exist.  
**Primary hook added in post:** `9:47 PM. STILL PLAYING.`  
**CTA:** `Shop the Night Court tee`

### Performance script

| Time | Picture | Native dialogue/audio |
|---|---|---|
| 0.0–1.7 | Breathless close phone shot under floodlights; small front monogram visible. | Creator: “We booked one hour.” |
| 1.7–4.6 | Whip-pan to court, then back as she turns and shows the large circular back art. | Two ball hits, shoes, floodlight hum. |
| 4.6–7.3 | Looking over her shoulder, she starts back toward court. | Creator: “Anyway—night-shift uniform.” |
| 7.3–8.0 | Back design under lights, then one clean impact sound. | Ball impact. |

Do not generate a readable digital time inside the footage. Add the `9:47 PM` hook in Remotion.

### Seedance 2.0 prompt

```text
3 shots / exactly 8 seconds / vertical 9:16 / synchronized native dialogue and night-court ambience.

REFERENCE ROLES
@creator is a newly invented fictional house creator and identity continuity reference.
@product is @night-court-monogram-tee and absolute product truth.
@front_keyframe is the approved navy front-monogram view.
@back_keyframe is the approved large circular back-art view under floodlights.
Any style reference controls only night lighting, palette, framing, and kinetic camera behavior; never identity, clothing, logos, or contents.

Shot 1, 0.0–1.7s: close handheld phone footage beside a floodlit hard court at night. The creator is lightly breathless after a rally, wearing the exact navy Night Court tee. The small RH front monogram is visible. She says directly and naturally, “We booked one hour.”

Shot 2, 1.7–4.6s: a fast but controlled whip-pan shows one live rally beat, then catches the creator turning into the exact @back_keyframe orientation. The full circular Racquet Habit back artwork is centered and stable beneath the floodlights.

Shot 3, 4.6–8.0s: she looks over one shoulder and starts walking back onto court, saying, “Anyway—night-shift uniform.” Hold the back design through the final beat and end on one clean tennis impact.

Audio: authentic night-court sound, distant rally, shoe squeak, subtle breath, light wind and floodlight hum, close phone-mic dialogue. No music.

Camera: energetic creator phone capture, deliberate whip-pan, natural motion blur, accurate skin texture, practical floodlights, no neon fantasy lighting.

Product truth is immutable: deep navy heavyweight tee, exact small front monogram, exact large circular back art only on the anatomical back, no mirroring, missing lettering, design transfer, or tee morphing. Contemporary graphite racquets only. No generated time display, captions, watermarks, or end card.
```

### Cinema Studio 3.5 version

**Settings**

- Genre: Drama
- Palette: Naturalistic Clean
- MoveSet: Documentary Snap
- Lighting: Practicals
- Camera: Fine Film
- Lens: Clinical Sharp
- Focal length: 35mm
- Aperture: f/4

**Prompt**

```text
Exactly 8 seconds, vertical 9:16, three fast night-court creator shots with synchronized audio. Under real hard-court floodlights, a newly invented fictional creator in the exact @night-court-monogram-tee holds a phone close after a rally, lightly breathless, small RH front monogram visible, and says, “We booked one hour.” A quick controlled whip-pan catches two live tennis impacts and returns as she turns, revealing the complete large circular back artwork. Let the art hold clearly under practical light. She looks over her shoulder and starts back toward the baseline, saying with an amused breath, “Anyway—night-shift uniform.” End on the back design and one clean ball impact.

The mood is elite after-hours ritual captured by a friend, not a glossy music video. Practical floodlights, credible exposure roll-off, restrained film texture, natural breath, shoes, ball hits, and distant court sound. Preserve the exact deep navy tee, front monogram, back artwork, garment cut, and anatomical placement. No neon fantasy, generated clock text, music, captions, wooden racquet, artwork morphing, or wardrobe change.
```

**Reject if:** the navy becomes black, the gold/light artwork disappears in shadow, the back design changes, or the whip-pan produces a body/product warp.

---

## U04 — “Quiet Front”

**Product:** Racquet Habit Minimal Black Crop Top  
**Sales mechanism:** A calm front and loud back create a fast expectation reversal.  
**Primary hook added in post:** `QUIET FRONT. LOUD BACK.`  
**CTA:** `Shop the Minimal Black crop`

### Performance script

| Time | Picture | Native dialogue/audio |
|---|---|---|
| 0.0–2.0 | Mirror/phone view of the restrained front line. | Creator: “Looks minimal, right?” |
| 2.0–5.2 | One fast turn reveals the full back graphic. | Friend, off camera: “Oh. Never mind.” |
| 5.2–7.4 | Creator looks back, half-smiles. | Creator: “Exactly.” |
| 7.4–8.0 | Stable back-detail hold. | Room tone. |

### Seedance 2.0 prompt

```text
3 shots / exactly 8 seconds / vertical 9:16 / synchronized native dialogue and natural room tone.

REFERENCE ROLES
@creator is a newly invented fictional house creator and identity/wardrobe continuity reference.
@product is @racquet-habit-black-crop and absolute product truth.
@front_keyframe is the approved natural-color crop front with the small “Just tennis… nothing personal” line.
@back_keyframe is the approved complete large back graphic.
Any style reference controls only light, palette, framing, and camera behavior.

Shot 1, 0.0–2.0s: believable handheld phone-mirror footage in a restrained cream-and-stone club corridor. The creator wears the exact natural Racquet Habit crop top, with the small front line in its correct position. She asks with a small knowing smile, “Looks minimal, right?”

Shot 2, 2.0–5.2s: cut on one quick natural turn into the exact @back_keyframe. The complete back graphic is centered and stable. An off-camera friend responds, dry and genuinely surprised, “Oh. Never mind.”

Shot 3, 5.2–8.0s: creator glances over her shoulder and says, “Exactly.” Hold the back design for the final 0.6 seconds.

Audio: intimate phone microphone, room tone, fabric movement, tiny spontaneous breath or laugh. No music.

Product fidelity: exact natural/off-white cropped silhouette, exact small front line, exact large back artwork only on the anatomical back. No black garment substitution, no oversized-tee transformation, no mirrored or invented typography, no swimming print, no captions or generated graphics. Natural face, hands, shoulders, and turn.
```

### Cinema Studio 3.5 version

**Settings:** shared baseline, with Genre `Comedy`, Lighting `Window`.

**Prompt**

```text
Exactly 8 seconds, vertical 9:16, a dry creator-style reveal in a restrained cream-and-stone club corridor. A newly invented fictional creator in the exact @racquet-habit-black-crop begins in a lightly imperfect phone-mirror frame and asks, “Looks minimal, right?” Keep the small front line in its exact position. Cut on one natural turn to a stable full back view showing the complete large graphic. An off-camera friend says, “Oh. Never mind.” The creator looks over one shoulder, half-smiles, and answers, “Exactly.” End on a clean product hold.

The reaction is understated and caught between friends. Preserve the exact natural crop, front line, back art, cut, color, and anatomical placement. No garment change, print movement, mirrored lettering, invented copy, music, captions, packaging, beauty filter, or glossy runway performance.
```

**Reject if:** the product becomes a black garment because of its name, the crop becomes an oversized tee, or front/back art swaps sides.

---

## U05 — “The Back Is the Plot”

**Product:** Love Cherries Oversized Tee  
**Sales mechanism:** Two connected copy/design discoveries reward the turn and make the product easy to retell.  
**Primary hook added in post:** `THE BACK IS THE PLOT.`  
**CTA:** `Shop Love Cherries`

### Performance script

| Time | Picture | Native dialogue/audio |
|---|---|---|
| 0.0–2.0 | Ecru front and small RH/“It started at love” placement. | Creator: “The front says, ‘It started at love.’” |
| 2.0–5.2 | Turn to exact tennis-ball cherries back. | Friend, off camera: “Wait—tennis-ball cherries?” |
| 5.2–7.4 | Creator looks back and laughs. | Friend: “I need it.” Creator: “Exactly.” |
| 7.4–8.0 | Back-art hold. | Room tone. |

### Seedance 2.0 prompt

```text
3 shots / exactly 8 seconds / vertical 9:16 / synchronized native dialogue and room sound.

REFERENCE ROLES
@creator is a newly invented fictional house creator and identity/wardrobe continuity reference.
@product is @love-cherries-tee-ecru and absolute product truth.
@front_keyframe is the approved ecru oversized front view.
@back_keyframe is the approved complete tennis-ball cherries back design.
Any style reference controls only photographic energy, palette, light, framing, and camera behavior.

Shot 1, 0.0–2.0s: handheld phone footage near a sunlit club patio. The creator wears the exact ecru Love Cherries oversized tee. The small front RH and “IT STARTED AT LOVE.” placement are correct. She says conversationally, “The front says, ‘It started at love.’”

Shot 2, 2.0–5.2s: cut on a quick natural turn to the exact @back_keyframe. Hold the complete tennis-ball cherries artwork centered. An off-camera friend interrupts with genuine discovery: “Wait—tennis-ball cherries?”

Shot 3, 5.2–8.0s: the creator looks back and gives one real laugh. Friend says, “I need it.” Creator replies, “Exactly.” Finish with a clean back-art hold.

Audio: natural patio/club ambience, fabric movement, close phone-mic voices, one spontaneous laugh. No music or announcer.

Preserve the exact ecru oversized tee, front mark and phrase, full back cherries design, print scale, and anatomical placement. The back must remain the back even when the creator looks toward camera. No crop transformation, design transfer, mirroring, retyping, disappearing racquet/cherries, captions, or generated graphics.
```

### Cinema Studio 3.5 version

**Settings:** shared baseline, with Genre `Comedy`, Lighting `Window`.

**Prompt**

```text
Exactly 8 seconds, vertical 9:16, a bright creator-style discovery beside a sunlit private-club patio. A newly invented fictional creator wears the exact @love-cherries-tee-ecru. Begin with the ecru oversized front and its correct small RH/“IT STARTED AT LOVE.” treatment while she says, “The front says, ‘It started at love.’” Cut on her quick natural turn to a controlled back view. Hold the complete tennis-ball cherries artwork. An off-camera friend interrupts, genuinely delighted: “Wait—tennis-ball cherries?” The creator looks over her shoulder and laughs. Friend says, “I need it.” Creator answers, “Exactly.” End on the stable back art.

Preserve the exact ecru color, oversized cut, front copy placement, and complete back artwork in the correct anatomical locations. No front/back swap, crop morph, invented text, missing cherries/racquet details, music, subtitles, packaging, or overacted commercial delivery.
```

**Reject if:** the model faces camera while the back graphic is somehow still on her chest, the back art loses the racquet/cherries relationship, or the ecru tee becomes white.

---

## U06 — “Tennis Ball on Ice”

**Product:** Serve Chilled Tumbler  
**Sales mechanism:** A real micro-discovery turns the ice-cube/tennis-ball design into a memorable product detail.  
**Primary hook added in post:** `THE DETAIL GOT ME.`  
**CTA:** `Shop Serve Chilled`

### Performance script

| Time | Picture | Native dialogue/audio |
|---|---|---|
| 0.0–1.5 | Creator reaches for the exact tumbler beside the court. | Creator: “Wait.” |
| 1.5–4.6 | Close product reveal; creator traces beside—not over—the design. | Creator: “The tennis ball is literally inside an ice cube.” |
| 4.6–7.2 | Return to her reaction; she reads/recognizes the name. | Creator: “Serve chilled. Whoever made this gets it.” |
| 7.2–8.0 | Small laugh; exact catalog macro may replace this generated shot. | Lid movement, court ambience. |

Do not claim that the tumbler keeps drinks cold for a particular duration. Use a catalog-backed macro insert if the printed design or words are not exact.

### Seedance 2.0 prompt

```text
3 shots / exactly 8 seconds / vertical 9:16 / synchronized native dialogue and court-side ambience.

REFERENCE ROLES
@creator is a newly invented fictional house creator and identity continuity reference.
@product is @serve-chilled-tumbler and absolute product truth.
@product_keyframe is the approved exact white Serve Chilled tumbler macro with the tennis-ball-in-ice-cube art facing camera.
Any style reference controls only light, palette, framing, energy, and camera behavior.

Shot 1, 0.0–1.5s: believable phone footage beside a bright hard court. The creator reaches naturally for the exact white Serve Chilled 20-ounce tumbler, notices the printed detail, and says, “Wait.”

Shot 2, 1.5–4.6s: a quick handheld push-in to the exact @product_keyframe angle. The vessel, lid, ice-cube graphic, tennis ball, and “SERVE CHILLED” treatment remain stable and correct. Her finger traces beside the artwork without covering it. She says with genuine discovery, “The tennis ball is literally inside an ice cube.”

Shot 3, 4.6–8.0s: return to her face and product in one frame. She says, amused, “Serve chilled. Whoever made this gets it,” then gives a small real laugh. End with the design facing camera.

Audio: close phone microphone, subtle court ambience, lid/finger contact, one small laugh. No music, pouring fantasy, ice explosion, or announcer.

Product fidelity is mandatory: exact white tumbler proportions, lid, printed art, colors, and placement. No handle, no travel-mug transformation, no redrawn tennis ball, no invented label, no deformed cylinder, no text morph, no captions or generated graphics. Natural hand contact and finger count.
```

### Cinema Studio 3.5 version

**Settings**

- Genre: Comedy
- Palette: Naturalistic Clean
- MoveSet: Intimate Observer
- Lighting: Soft Cross
- Camera: Clean Digital
- Lens: Extreme Macro
- Focal length: 50mm
- Aperture: f/4

**Prompt**

```text
Exactly 8 seconds, vertical 9:16, an intimate creator discovery beside a bright hard court. A newly invented fictional creator reaches for the exact @serve-chilled-tumbler and says, “Wait.” Move into one clean macro of the actual tennis-ball-inside-an-ice-cube design, with the white vessel, lid, artwork, and “SERVE CHILLED” treatment stable and facing camera. Her fingertip traces beside the design without covering it as she says, “The tennis ball is literally inside an ice cube.” Return to a close two-shot of her face and the tumbler. She smiles and says, “Serve chilled. Whoever made this gets it.” End on a small laugh and a stable product angle.

Keep the product completely immutable: exact white 20-ounce tumbler, no handle, exact lid, art, colors, proportions, and print placement. Natural hand anatomy and contact. No false cold-retention claim, liquid spectacle, text mutation, music, captions, packaging, announcer, or glossy product-commercial voice.
```

**Reject if:** the tumbler develops a handle, the ice cube/tennis ball is redrawn incorrectly, the copy mutates, or fingers occlude the only clean reveal.

**Preferred post-production rescue:** replace the 1.5–4.6s macro with a 0.6–1.0s animated crop of the exact catalog front, using a subtle 102–108% push-in and matching handheld displacement.

---

## U07 — “Questionable Territory”

**Product:** Court-Side Hydration Travel Mug With a Handle  
**Sales mechanism:** The printed match-stage scale is a relatable joke and a product feature without requiring an invented performance claim.  
**Primary hook added in post:** `QUESTIONABLE TERRITORY.`  
**CTA:** `Shop Court-Side Hydration`

### Performance script

| Time | Picture | Native dialogue/audio |
|---|---|---|
| 0.0–1.5 | Creator picks up exact handled travel mug. | Creator: “Why does my bottle have a match schedule?” |
| 1.5–5.5 | Exact back scale macro, ideally catalog pixels in post. | Creator, reading quickly: “Warm-up, first set, one more set… questionable territory.” |
| 5.5–7.4 | Return to creator, mug front visible. | Creator: “Accurate.” |
| 7.4–8.0 | Stable product hold. | Court ambience. |

The generated actor performance and the exact catalog insert can be assembled as one ad. This is safer than asking a video model to preserve six lines of tiny copy during a moving handheld shot.

### Seedance 2.0 prompt

```text
3 shots / exactly 8 seconds / vertical 9:16 / synchronized native dialogue and court-side ambience.

REFERENCE ROLES
@creator is a newly invented fictional house creator and identity continuity reference.
@product is @court-side-travel-mug and absolute product truth.
@front_keyframe is the approved white handled mug front with the Court-Side Hydration treatment.
@back_keyframe is the approved exact printed match-stage scale.
Any style reference controls only light, palette, framing, energy, and camera behavior.

Shot 1, 0.0–1.5s: believable phone footage at a court-side bench. The creator picks up the exact white 40-ounce handled Court-Side Hydration travel mug, looks at its reverse side, and asks, “Why does my bottle have a match schedule?”

Shot 2, 1.5–5.5s: a quick controlled push-in to the exact @back_keyframe angle. Keep the vessel, handle, lid, and scale fixed while her voice reads with growing amusement, “Warm-up, first set, one more set… questionable territory.”

Shot 3, 5.5–8.0s: return to the creator with the correct front treatment facing camera. She looks up and says simply, “Accurate.” Hold the product for the last 0.6 seconds.

Audio: close phone microphone, quiet court ambience, natural object handling, restrained amusement. No music or announcer.

Product fidelity: exact white 40-ounce vessel, handle, lid, front design, back scale, proportions, and print placement. Never transform it into the handleless Serve Chilled tumbler. No invented labels, warped lines, changing handle side, deformed fingers, captions, or generated graphics. Do not make hydration-performance claims.
```

### Cinema Studio 3.5 version

**Settings**

- Genre: Comedy
- Palette: Naturalistic Clean
- MoveSet: Intimate Observer
- Lighting: Soft Cross
- Camera: Clean Digital
- Lens: Extreme Macro
- Focal length: 50mm
- Aperture: f/4

**Prompt**

```text
Exactly 8 seconds, vertical 9:16, a restrained creator reaction at a court-side bench. A newly invented fictional creator picks up the exact @court-side-travel-mug, notices the printed scale, and asks, “Why does my bottle have a match schedule?” Make one controlled move to the exact back-scale view as her voice reads quickly, “Warm-up, first set, one more set… questionable territory.” Return to her with the correct front treatment facing camera. She looks up, amused, and says, “Accurate.” End on a stable product hold.

The exact @court-side-travel-mug is immutable: white 40-ounce handled vessel, exact lid, handle, front treatment, back scale, proportions, and print placement. Natural hand contact. No handleless tumbler transformation, invented copy, rotating handle, false hydration claim, music, captions, packaging, announcer, or exaggerated reaction.
```

**Reject if:** it becomes the Serve Chilled tumbler, the handle switches sides between frames, or the tiny copy is presented as readable but incorrect.

**Preferred post-production rescue:** use the generated performance from 0.0–1.5s and 5.5–8.0s, but replace the middle with an animated crop of the exact catalog back. Keep the creator's generated voice over the insert.

---

## Testing matrix

Do not generate multiple visual variants before the first performance is reviewed. For each approved concept, make post-production variants from the same clean master:

| Variant | Change | What it tests |
|---|---|---|
| A | Product-specific hook from this document | Curiosity/design discovery |
| B | Dialogue cold-open with no first-frame overlay | Whether authentic speech stops the scroll |
| C | Exact product macro in first 0.5s, then creator | Product-first conversion intent |

Keep the body footage, sound, CTA, landing page, and audience identical. Change only the opening treatment. Do not use a 6-second version merely because ad platforms accept it; shorten only when the concept remains emotionally complete and the normal-speed audio still works.

## Approval gates

Review the 720p pilot at normal speed, muted, and frame-by-frame:

1. **First second:** Does a face, question, or design detail stop the scroll?
2. **Performance:** Does the reaction include a believable pause or interruption rather than wide-eyed acting?
3. **Product:** Are color, cut, front/back orientation, typography, and art correct?
4. **Continuity:** Does the same garment/product survive every cut without morphing?
5. **Audio:** Are dialogue, mouth movement, ambience, and edit rhythm synchronized?
6. **Sales clarity:** Can a cold viewer identify the product and why it is desirable without reading the caption?
7. **Post rescue:** Can one incorrect macro be replaced with catalog pixels without breaking the performance?

Only a pilot that passes 2, 3, 4, and 6 is eligible for a 1080p final. A beautiful performance with the wrong product is not a near-pass.

## Recommended generation order

1. U01 Sunshine Bubbly — Seedance 2.0 Standard, 8s, 720p, audio.
2. Inspect before spending again. If performance is good but a single product hold is wrong, repair with a catalog insert instead of regenerating.
3. U02 Rest Day — Seedance 2.0 Standard, 8s, 720p, audio.
4. U03 Night Shift — Cinema Studio, 8s, 720p, audio.
5. Use the retained 64 credits for the best-informed single retry, not automatically on U01.
6. Decide whether to add 300 or 500 credits only after comparing the three pilots.
7. Continue U04–U07 in priority order; promote winners to 1080p, then build the hook/CTA variants in Remotion.
