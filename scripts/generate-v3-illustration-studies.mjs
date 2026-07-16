import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "design", "brand-v3", "illustration-studies");
const GREEN = "#103C2C";
const IVORY = "#F3EBD8";
const PURPLE = "#4E3265";

await fs.mkdir(outDir, { recursive: true });

const common = `fill="none" stroke="${GREEN}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"`;
const fine = `fill="none" stroke="${GREEN}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"`;
const accent = `fill="none" stroke="${PURPLE}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`;

function svg(title, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="${title}">
  <title>${title}</title>
  ${content}
</svg>\n`;
}

const objects = [
  {
    id: "chair",
    title: "Umpire chair",
    art: svg("Racquet Habit umpire chair illustration", `
      <path ${common} d="M165 430 L212 202 L318 202 L355 430 M194 328 H338 M205 278 H329 M216 229 H321"/>
      <path ${common} d="M206 204 L201 137 Q201 106 233 106 H326 Q352 106 352 133 V205"/>
      <path ${common} d="M215 147 H339 M221 204 L228 147 M337 204 L334 147"/>
      <path ${fine} d="M181 428 H145 M338 428 H378 M247 204 V429 M289 204 V429"/>
      <path ${accent} d="M208 353 H343"/>
    `),
  },
  {
    id: "scoreboard",
    title: "Flip scoreboard",
    art: svg("Racquet Habit flip scoreboard illustration", `
      <rect ${common} x="74" y="82" width="364" height="330" rx="10"/>
      <path ${common} d="M74 145 H438 M256 145 V412 M100 183 H226 M286 183 H412"/>
      <rect ${fine} x="105" y="215" width="116" height="132" rx="5"/>
      <rect ${fine} x="291" y="215" width="116" height="132" rx="5"/>
      <path ${fine} d="M105 281 H221 M291 281 H407"/>
      <path ${common} d="M143 244 Q178 218 197 250 Q207 273 180 289 Q145 308 132 334 H202"/>
      <path ${common} d="M372 226 L320 301 H390 M370 227 V334"/>
      <circle cx="114" cy="115" r="8" fill="${PURPLE}"/><circle cx="398" cy="115" r="8" fill="${PURPLE}"/>
    `),
  },
  {
    id: "racquet",
    title: "Classic racquet",
    art: svg("Racquet Habit classic racquet illustration", `
      <path ${common} d="M261 77 C163 77 111 157 127 241 C138 302 183 330 238 322 C292 315 344 271 363 203 C383 128 348 77 261 77 Z"/>
      <path ${common} d="M220 320 L247 357 L279 327 M247 357 L209 442 M247 357 L287 442"/>
      <path ${fine} d="M201 435 L273 464 M210 414 L282 443 M219 393 L291 422 M227 372 L299 401"/>
      <g ${fine} opacity=".9">
        <path d="M151 135 C205 182 271 228 337 269 M136 177 C193 218 257 262 316 297 M130 222 C181 252 230 282 282 315"/>
        <path d="M317 98 C283 171 243 244 190 311 M277 81 C247 160 207 237 159 285 M352 128 C320 200 282 268 238 322"/>
      </g>
      <circle cx="382" cy="304" r="23" ${accent}/>
      <path ${accent} d="M361 309 C369 298 377 295 391 294 C400 293 406 289 410 283"/>
    `),
  },
  {
    id: "ball-can",
    title: "Ball can",
    art: svg("Racquet Habit ball can illustration", `
      <ellipse ${common} cx="260" cy="147" rx="104" ry="34"/>
      <path ${common} d="M156 147 V387 C156 411 203 431 260 431 C317 431 364 411 364 387 V147"/>
      <path ${fine} d="M156 370 C156 394 203 414 260 414 C317 414 364 394 364 370"/>
      <path ${common} d="M176 205 H344 M176 315 H344"/>
      <circle ${common} cx="220" cy="112" r="45"/><circle ${common} cx="292" cy="101" r="45"/>
      <path ${fine} d="M183 121 C202 104 215 103 242 102 M264 111 C283 92 301 90 326 95"/>
      <path ${accent} d="M157 260 H363"/>
    `),
  },
  {
    id: "bench",
    title: "Court bench",
    art: svg("Racquet Habit court bench illustration", `
      <path ${common} d="M84 184 H426 L401 271 H106 Z M111 271 H397 L420 320 H91 Z"/>
      <path ${fine} d="M116 209 H412 M109 238 H404 M119 292 H408"/>
      <path ${common} d="M126 320 L104 422 M386 320 L409 422 M84 422 H143 M372 422 H431"/>
      <path ${common} d="M249 184 C237 227 232 275 239 320 H324 C313 275 314 229 329 184"/>
      <path ${accent} d="M255 213 H324 M249 244 H319"/>
    `),
  },
  {
    id: "net-post",
    title: "Net post",
    art: svg("Racquet Habit net post illustration", `
      <path ${common} d="M92 130 V420 M420 132 V420 M70 421 H115 M398 421 H443"/>
      <path ${common} d="M92 156 C185 145 321 145 420 157 V344 C313 333 192 333 92 345 Z"/>
      <g ${fine} opacity=".88">
        <path d="M132 153 V341 M174 150 V338 M216 148 V336 M258 148 V335 M300 148 V336 M342 150 V338 M384 153 V342"/>
        <path d="M93 197 C190 188 319 188 420 198 M93 239 C194 231 320 231 420 240 M93 282 C196 273 320 274 420 283 M93 323 C199 314 316 315 420 324"/>
      </g>
      <circle ${common} cx="447" cy="211" r="25"/><path ${common} d="M447 236 V278 L467 295"/>
      <path ${accent} d="M93 157 C192 146 322 146 419 158"/>
    `),
  },
  {
    id: "towel",
    title: "Court towel",
    art: svg("Racquet Habit folded court towel illustration", `
      <path ${common} d="M129 100 H356 L385 410 H158 Z"/>
      <path ${fine} d="M150 132 H358 M153 165 H361 M171 376 H381"/>
      <path ${accent} d="M165 312 H376 M168 340 H379"/>
      <path ${common} d="M221 213 C221 172 253 151 292 157 C332 164 342 205 329 240 C317 272 286 290 254 281 C233 275 221 254 221 232 Z"/>
      <path ${fine} d="M245 180 C258 202 277 222 307 240 M227 213 C253 231 278 248 313 263 M302 166 C286 202 267 238 245 274"/>
    `),
  },
  {
    id: "court-bag",
    title: "Court bag",
    art: svg("Racquet Habit structured court bag illustration", `
      <path ${common} d="M93 188 Q93 158 124 158 H389 Q419 158 419 188 L444 403 H68 Z"/>
      <path ${common} d="M170 158 C173 89 217 73 257 73 C297 73 341 89 344 158"/>
      <path ${fine} d="M196 158 C198 111 224 97 257 97 C290 97 316 111 318 158"/>
      <path ${common} d="M126 218 H386 L405 363 H108 Z"/>
      <path ${fine} d="M257 218 V363 M127 255 H390"/>
      <path ${accent} d="M107 363 H406"/>
      <path ${fine} d="M141 287 C180 313 223 324 257 324 C294 324 340 312 376 286"/>
    `),
  },
];

const renders = [];
for (const object of objects) {
  await fs.writeFile(path.join(outDir, `illustration-${object.id}.svg`), object.art);
  const png = await sharp(Buffer.from(object.art)).resize(520, 520).png().toBuffer();
  await fs.writeFile(path.join(outDir, `illustration-${object.id}.png`), png);
  renders.push({ ...object, png });
}

const label = (text, number) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="760" height="90">
  <rect width="760" height="90" fill="${IVORY}"/>
  <text x="24" y="34" font-family="Arial, sans-serif" font-size="16" letter-spacing="4" fill="${PURPLE}">0${number + 1}</text>
  <text x="24" y="66" font-family="Arial, sans-serif" font-size="22" letter-spacing="3" fill="${GREEN}">${text.toUpperCase()}</text>
</svg>`);

const composites = [];
for (let index = 0; index < renders.length; index += 1) {
  const row = Math.floor(index / 4);
  const column = index % 4;
  const left = 72 + column * 440;
  const top = 150 + row * 620;
  composites.push({ input: renders[index].png, left, top });
  composites.push({ input: label(renders[index].title, index), left: left + 16, top: top + 500 });
}

const board = await sharp({
  create: { width: 1920, height: 1440, channels: 4, background: IVORY },
})
  .composite([
    {
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="140">
        <rect width="1920" height="140" fill="${GREEN}"/>
        <text x="72" y="62" font-family="Georgia, serif" font-size="42" fill="${IVORY}">Court Objects / Illustration Study</text>
        <text x="72" y="102" font-family="Arial, sans-serif" font-size="16" letter-spacing="4" fill="${IVORY}">RACQUET HABIT · NEW COURT CLASSIC · V1 VECTOR CALIBRATION</text>
      </svg>`),
      left: 0,
      top: 0,
    },
    ...composites,
  ])
  .png()
  .toBuffer();

await fs.writeFile(path.join(outDir, "illustration-study-board.png"), board);
console.log("Generated Racquet Habit court-object illustration studies.");
