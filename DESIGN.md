---
name: Racquet Habit
description: New Court Classic commerce and editorial system
colors:
  centre-court-green: "#103C2C"
  championship-ivory: "#F3EBD8"
  tournament-navy: "#18283D"
  royal-trim: "#4E3265"
  service-red: "#B83D34"
  ball-yellow: "#D7E63D"
  chalk-white: "#FFFDF7"
  scoreboard-ink: "#1B1A17"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(3.25rem, 8vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.86
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Geist Variable, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 450
    lineHeight: 1.65
  utility:
    fontFamily: "Roboto Condensed Variable, Arial Narrow, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "0.1em"
rounded:
  none: "0"
  small: "4px"
spacing:
  page: "clamp(1rem, 3.4vw, 3.75rem)"
  section: "clamp(5rem, 10vw, 10rem)"
components:
  button-primary:
    backgroundColor: "{colors.centre-court-green}"
    textColor: "{colors.championship-ivory}"
    rounded: "{rounded.none}"
    padding: "16px 20px"
  button-reverse:
    backgroundColor: "{colors.championship-ivory}"
    textColor: "{colors.centre-court-green}"
    rounded: "{rounded.none}"
    padding: "16px 20px"
---

# Design System: Racquet Habit

## 1. Overview

**Creative North Star: "The Tournament Programme in Motion"**

The visual system combines championship formality with the lived texture of a
real match day: sun, cotton, felt, court paint, a bench, a bag, and the promise
of another set. Layouts are image-led and composed like campaign photography,
while commerce remains direct and familiar.

This is not fake heritage and not generic editorial minimalism. The approved
RH monogram, wordmark family, three-zone Society patch, service arc, court
illustrations, and physical-production artwork are the distinctive vocabulary.

**Key Characteristics:**

- Committed Centre Court Green and Championship Ivory fields.
- Sunlit, tactile photography with deliberate copy-safe space.
- High-contrast Roman typography paired with restrained utility type.
- Square edges, fine rules, no decorative shadows.
- Royal Trim, Service Red, and Ball Yellow used as rare sporting interruptions.

## 2. Colors

The palette is championship-derived but owned through strict proportion.

### Primary

- **Centre Court Green** (`#103C2C`): navigation, hero fields, marks, and the
  dominant brand surface.
- **Championship Ivory** (`#F3EBD8`): reverse type, garments, paper, and light
  commerce surfaces.

### Secondary

- **Royal Trim** (`#4E3265`): one controlled trim or editorial field.
- **Tournament Navy** (`#18283D`): occasional deep alternate, never the default.

### Tertiary

- **Service Red** (`#B83D34`): registration points and action interruption.
- **Ball Yellow** (`#D7E63D`): tiny impact accents and poster focal points.

### Neutral

- **Chalk White** (`#FFFDF7`): clean product and form surfaces.
- **Scoreboard Ink** (`#1B1A17`): long-form copy.

**The Rare Accent Rule.** Ordinary sections use green, ivory, and at most one
accent. Red and yellow should feel discovered, not distributed.

## 3. Typography

**Display Font:** Instrument Serif with Georgia fallback
**Body Font:** Geist Variable with Arial fallback
**Utility Font:** Roboto Condensed Variable with Arial Narrow fallback

**Character:** The display face supplies tournament authority; the sans keeps
shopping clear; condensed utility text behaves like genuine collection and
production metadata. Approved wordmarks are SVG artwork, never live-font
imitations.

### Hierarchy

- **Display** (400, `clamp(3.25rem, 8vw, 6rem)`, `0.86`): campaign statements.
- **Headline** (400, `clamp(2.5rem, 5vw, 4.75rem)`, `0.92`): section titles.
- **Title** (400, `clamp(1.5rem, 2.4vw, 2.4rem)`, `1`): product names.
- **Body** (450, `1rem`, `1.65`): prose, capped near 70 characters.
- **Label** (650, `0.7rem`, `0.1em`, uppercase): short production metadata only.

**The Vector Wordmark Rule.** Navigation, hero, packaging, and campaign lockups
use the approved outlined SVGs. Do not reconstruct `Habit` with a script font.

## 4. Elevation

The system is flat by default. Depth comes from photography, tonal fields,
overlap, and one-pixel rules. Shadows appear only when physically present in
campaign imagery or required for functional overlays.

**The Court-Surface Rule.** Interface panels never float decoratively above the
page. They divide, slide, or replace a surface.

## 5. Components

### Buttons

- **Shape:** square (`0` radius), minimum 44 px high.
- **Primary:** green field, ivory text, one-pixel green border.
- **Hover / Focus:** reverse the field; use a visible two-pixel focus outline.
- **Secondary:** transparent with a single underline or full border.

### Cards / Containers

- **Corner Style:** square.
- **Background:** image or tonal field, not nested white cards.
- **Shadow Strategy:** none.
- **Border:** one-pixel green rule only where structure requires it.
- **Internal Padding:** responsive and generous; product imagery remains primary.

### Inputs / Fields

- **Style:** square, one-pixel current-color border, ivory or white surface.
- **Focus:** two-pixel Service Red or Royal Trim outline with offset.
- **Error / Disabled:** plain-language status and sufficient contrast.

### Navigation

The header uses the approved horizontal SVG wordmark, direct commerce labels,
and a conventional `Bag (n)` control. Mobile navigation is full-width and
high-contrast, with no hidden novelty terminology.

### Service Arc

The approved two-stroke bounce trajectory is the signature transition device.
Use it once at meaningful changes of state or story, not as repeated wallpaper.

## 6. Do's and Don'ts

### Do:

- **Do** use real v3 photography and approved outlined assets.
- **Do** let one decisive visual composition dominate each section.
- **Do** keep price, availability, delivery, and bag actions immediately clear.
- **Do** retain generous negative space and readable body contrast.
- **Do** validate all layouts at mobile, tablet, and desktop widths.

### Don't:

- **Don't** use generic country-club templates or fake aristocratic heritage.
- **Don't** use nocturnal black luxury, crypto geometry, or clinical role-play.
- **Don't** use crossed racquets, crowns, laurels, shields, neon, gradients,
  glassmorphism, or distressed faux-vintage graphics.
- **Don't** use rounded SaaS cards, decorative wide shadows, or repeated
  numbered/uppercase section scaffolding.
- **Don't** imitate Wimbledon, Lacoste, Wilson, or Roland-Garros.
- **Don't** use generated product photography to promise a physical cut,
  material, or finish that has not been sampled.
