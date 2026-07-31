import { createId } from "/scripts/runtime-utils.js";

const cartKey = "rh-cart-v1";
const checkoutOrigin = "https://racquethabit.com";
const sessionKey = "rh-session-id-v1";
const gaClientKey = "rh-ga-client-id-v1";
const gaSessionKey = "rh-ga-session-id-v1";
const cartImageMap = (() => {
  try {
    return JSON.parse(document.querySelector("#cart-image-data")?.textContent || "{}");
  } catch {
    return {};
  }
})();

const analyticsItem = (item, quantity = item.quantity) => ({
  item_id: item.productId || item.variantId,
  item_name: item.name,
  affiliation: "Racquet Habit",
  item_brand: "Racquet Habit",
  item_category: item.category || "",
  item_category2: item.productType || "",
  item_category3: item.capsule || "",
  item_variant: item.variant || "",
  price: Number(item.price || 0),
  quantity,
});

const trackCartEvent = (event, items, options) => {
  const value = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  window.RacquetHabitAnalytics?.track(event, {
    currency: "USD",
    value,
    items: items.map((item) => analyticsItem(item)),
  }, options);
};

const readCookie = (name) => document.cookie
  .split("; ")
  .find((cookie) => cookie.startsWith(`${name}=`))
  ?.split("=")
  .slice(1)
  .join("=");

const decodedCookie = (name) => {
  const value = readCookie(name);
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const storedGaClientId = () => {
  const gaCookie = decodedCookie("_ga");
  const cookieParts = gaCookie.split(".");
  const cookieClientId = cookieParts.length >= 4 ? cookieParts.slice(-2).join(".") : "";
  if (cookieClientId) {
    localStorage.setItem(gaClientKey, cookieClientId);
    return cookieClientId;
  }
  const saved = localStorage.getItem(gaClientKey);
  if (saved) return saved;
  const random = crypto.getRandomValues(new Uint32Array(1))[0];
  const created = `${random}.${Math.floor(Date.now() / 1000)}`;
  localStorage.setItem(gaClientKey, created);
  return created;
};

const storedGaSessionId = () => {
  const saved = sessionStorage.getItem(gaSessionKey);
  if (saved) return saved;
  const created = String(Math.floor(Date.now() / 1000));
  sessionStorage.setItem(gaSessionKey, created);
  return created;
};

const getGoogleIdentifier = (field) => new Promise((resolve) => {
  const measurementId = document.documentElement.dataset.gaMeasurementId;
  if (!measurementId || typeof window.gtag !== "function") return resolve("");
  let settled = false;
  const timer = window.setTimeout(() => {
    settled = true;
    resolve("");
  }, 400);
  window.gtag("get", measurementId, field, (value) => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timer);
    resolve(String(value || ""));
  });
});

const checkoutIdentifiers = async () => {
  const [googleClientId, googleSessionId] = await Promise.all([
    getGoogleIdentifier("client_id"),
    getGoogleIdentifier("session_id"),
  ]);
  const gaClientId = googleClientId || storedGaClientId();
  const gaSessionId = googleSessionId || storedGaSessionId();
  localStorage.setItem(gaClientKey, gaClientId);
  sessionStorage.setItem(gaSessionKey, gaSessionId);
  return Object.fromEntries(Object.entries({
    _ga: decodedCookie("_ga"),
    _fbp: decodedCookie("_fbp"),
    _fbc: decodedCookie("_fbc"),
    FPID: decodedCookie("FPID"),
    ga_client_id: gaClientId.slice(0, 256),
    ga_session_id: gaSessionId.slice(0, 256),
    ttp: decodedCookie("_ttp").slice(0, 256),
  }).filter(([, value]) => Boolean(value)));
};

const decorateCheckoutUrl = (checkout) => {
  checkout.searchParams.set("currency", "USD");
  checkout.searchParams.set("cart_origin", checkoutOrigin);

  const attribution = window.RacquetHabitAnalytics?.getAttribution?.() || {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_content", "utm_term", "gclid", "fbclid", "ttclid", "epik"].forEach((parameter) => {
    if (attribution[parameter]) checkout.searchParams.set(parameter, attribution[parameter]);
  });
  ["_ga", "_fbp", "_fbc", "FPID"].forEach((cookieName) => {
    const value = readCookie(cookieName);
    if (value) checkout.searchParams.set(cookieName, value);
  });
  return checkout.toString();
};

const buildCheckoutUrl = (cart) => {
  const checkout = new URL("https://checkout.racquethabit.com/cart/checkout");
  checkout.searchParams.set("products", cart.map((item) => `${item.variantId}:${item.quantity}`).join(","));
  return decorateCheckoutUrl(checkout);
};

const sessionId = (() => {
  const saved = localStorage.getItem(sessionKey);
  if (saved) return saved;
  const created = createId();
  localStorage.setItem(sessionKey, created);
  return created;
})();

const createCheckout = async (cart) => {
  const consent = window.RacquetHabitConsent?.get?.() || {};
  const attribution = window.RacquetHabitAnalytics?.getAttribution?.() || {};
  const identifiers = await checkoutIdentifiers();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6000);
  let response;
  try {
    response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        items: cart.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
        consent,
        attribution,
        identifiers,
        sessionId,
      }),
    });
  } finally {
    window.clearTimeout(timeout);
  }
  if (!response.ok) throw new Error(`Checkout request failed: ${response.status}`);
  const result = await response.json();
  if (!result.url) throw new Error("Checkout URL missing");
  return result.url;
};

const formatPrice = (value) => new Intl.NumberFormat(
  "en-US",
  { style: "currency", currency: "USD" },
).format(Number(value));

const updatePrices = () => {
  document.querySelectorAll("[data-price-usd]").forEach((node) => {
    node.textContent = formatPrice(node.dataset.priceUsd);
  });
};

updatePrices();

const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(cartKey) || "[]").map((item) => ({
      ...item,
      image: cartImageMap[item.productId] || item.image,
    }));
  }
  catch { return []; }
};

const setCart = (cart) => {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  renderCart();
};

const toast = (message) => {
  const node = document.querySelector("[data-toast]");
  if (!node) return;
  node.textContent = message;
  node.classList.add("visible");
  window.clearTimeout(window.__rhToast);
  window.__rhToast = window.setTimeout(() => node.classList.remove("visible"), 2600);
};

const openCart = () => {
  const dialog = document.querySelector("[data-cart-dialog]");
  if (dialog && !dialog.open) {
    dialog.showModal();
    const cart = getCart();
    if (cart.length) trackCartEvent("view_cart", cart);
  }
};

document.querySelectorAll("[data-cart-open]").forEach((button) => button.addEventListener("click", openCart));

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-to-cart]");
  if (!button) return;
  if (button.disabled || button.dataset.comingSoon === "true") {
    toast("This piece is coming soon.");
    return;
  }
  const variantId = button.dataset.variantId;
  if (!variantId || variantId.startsWith("preview-")) {
    toast("This preview will open for ordering shortly.");
    return;
  }
  const cart = getCart();
  const existing = cart.find((item) => item.variantId === variantId);
  if (existing) {
    existing.quantity += 1;
    existing.productId ||= button.dataset.productId || variantId;
    existing.category ||= button.dataset.category || "";
    existing.productType ||= button.dataset.productType || "";
    existing.capsule ||= button.dataset.capsule || "";
  }
  else cart.push({
    variantId,
    productId: button.dataset.productId || variantId,
    name: button.dataset.name,
    variant: button.dataset.variant || "Standard",
    price: Number(button.dataset.price || 0),
    image: button.dataset.image,
    category: button.dataset.category || "",
    productType: button.dataset.productType || "",
    capsule: button.dataset.capsule || "",
    quantity: 1,
  });
  setCart(cart);
  trackCartEvent("add_to_cart", [{
    variantId,
    productId: button.dataset.productId || variantId,
    name: button.dataset.name,
    variant: button.dataset.variant || "Standard",
    price: Number(button.dataset.price || 0),
    category: button.dataset.category || "",
    productType: button.dataset.productType || "",
    capsule: button.dataset.capsule || "",
    quantity: 1,
  }]);
  toast(`${button.dataset.name} added to your bag.`);
  openCart();
});

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
})[character]);

function renderCart() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((node) => node.textContent = String(count));
  document.querySelectorAll("[data-cart-open]").forEach((button) => {
    button.setAttribute("aria-label", `Bag (${count}). Open shopping bag`);
  });
  const items = document.querySelector("[data-cart-items]");
  const empty = document.querySelector("[data-cart-empty]");
  const summary = document.querySelector("[data-cart-summary]");
  if (!items || !empty || !summary) return;
  empty.hidden = cart.length > 0;
  summary.hidden = cart.length === 0;
  items.innerHTML = cart.map((item) => `
    <article class="cart-line" data-cart-line="${escapeHtml(item.variantId)}">
      <img src="${escapeHtml(item.image)}" alt="" />
      <div class="cart-line__copy">
        <button type="button" class="cart-line__remove" data-cart-remove="${escapeHtml(item.variantId)}" aria-label="Remove ${escapeHtml(item.name)}">Remove</button>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.variant)}</p>
        <div class="cart-line__actions">
          <div class="quantity-control">
            <button type="button" data-cart-decrease="${escapeHtml(item.variantId)}" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-cart-increase="${escapeHtml(item.variantId)}" aria-label="Increase quantity">+</button>
          </div>
          <strong>${formatPrice(item.price * item.quantity)}</strong>
        </div>
      </div>
    </article>
  `).join("");
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalNode = document.querySelector("[data-cart-total]");
  if (totalNode) totalNode.textContent = formatPrice(total);
  const checkout = document.querySelector("[data-cart-checkout]");
  if (checkout) {
    checkout.href = buildCheckoutUrl(cart);
  }
  const shipping = document.querySelector("[data-cart-shipping]");
  if (shipping) {
    const freeShippingThreshold = 150;
    shipping.textContent = total >= freeShippingThreshold
      ? "Free standard shipping unlocked · confirmed at checkout"
      : `${formatPrice(freeShippingThreshold - total)} away from free standard shipping`;
  }
}

document.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-cart-remove]");
  const increase = event.target.closest("[data-cart-increase]");
  const decrease = event.target.closest("[data-cart-decrease]");
  if (!remove && !increase && !decrease) return;
  const variantId = (remove || increase || decrease).dataset.cartRemove || (increase || decrease).dataset.cartIncrease || decrease?.dataset.cartDecrease;
  const cart = getCart();
  const item = cart.find((entry) => entry.variantId === variantId);
  if (remove && item) {
    trackCartEvent("remove_from_cart", [{ ...item }]);
    return setCart(cart.filter((entry) => entry.variantId !== variantId));
  }
  if (!item) return;
  if (increase) trackCartEvent("add_to_cart", [{ ...item, quantity: 1 }]);
  if (decrease) trackCartEvent("remove_from_cart", [{ ...item, quantity: 1 }]);
  item.quantity += increase ? 1 : -1;
  setCart(cart.filter((entry) => entry.quantity > 0));
});

document.querySelector("[data-cart-checkout]")?.addEventListener("click", async (event) => {
  const cart = getCart();
  if (!cart.length) return;
  event.preventDefault();
  const checkout = event.currentTarget;
  if (checkout.dataset.loading === "true") return;
  checkout.dataset.loading = "true";
  checkout.setAttribute("aria-busy", "true");
  checkout.textContent = "Opening secure checkout…";
  trackCartEvent("checkout_click", cart);
  trackCartEvent("begin_checkout", cart);
  try {
    const checkoutUrl = await createCheckout(cart);
    trackCartEvent("checkout_api_success", cart);
    trackCartEvent("checkout_redirect", cart);
    window.location.assign(checkoutUrl);
  } catch (error) {
    console.error("[checkout] Falling back to direct checkout", error);
    trackCartEvent("checkout_api_error", cart);
    trackCartEvent("checkout_fallback", cart);
    window.location.assign(buildCheckoutUrl(cart));
  }
});

document.querySelector("[data-cart-dialog]")?.addEventListener("click", (event) => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});

document.querySelectorAll(".mobile-nav a").forEach((link) => link.addEventListener("click", () => link.closest("details")?.removeAttribute("open")));

const updateCardPagination = (gallery) => {
  const card = gallery.closest("[data-product-card]");
  const pagination = card?.querySelector("[data-card-pagination]");
  if (!pagination) return;
  const slides = [...gallery.querySelectorAll("[data-card-slide]")]
    .sort((a, b) => a.offsetLeft - b.offsetLeft);
  const current = slides.reduce((nearest, slide, index) => {
    const distance = Math.abs(slide.offsetLeft - gallery.scrollLeft);
    return distance < nearest.distance ? { index, distance } : nearest;
  }, { index: 0, distance: Number.POSITIVE_INFINITY }).index;
  [...pagination.children].forEach((dot, index) => dot.classList.toggle("active", index === current));
};

document.querySelectorAll("[data-card-gallery]").forEach((gallery) => {
  let galleryFrame = 0;
  let pointerStart = 0;
  let pointerMoved = false;
  gallery.addEventListener("scroll", () => {
    if (galleryFrame) return;
    galleryFrame = window.requestAnimationFrame(() => {
      updateCardPagination(gallery);
      galleryFrame = 0;
    });
  }, { passive: true });
  gallery.addEventListener("pointerdown", (event) => {
    pointerStart = event.clientX;
    pointerMoved = false;
  }, { passive: true });
  gallery.addEventListener("pointermove", (event) => {
    if (Math.abs(event.clientX - pointerStart) > 8) pointerMoved = true;
  }, { passive: true });
  gallery.closest("a")?.addEventListener("click", (event) => {
    if (pointerMoved) {
      event.preventDefault();
      pointerMoved = false;
    }
  });
  updateCardPagination(gallery);
});

document.querySelectorAll("[data-card-color-option]").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest("[data-product-card]");
    const gallery = card?.querySelector("[data-card-gallery]");
    const front = card?.querySelector("[data-card-front]");
    const back = card?.querySelector("[data-card-back]");
    const colorLabel = card?.querySelector("[data-card-color-label]");
    card?.querySelectorAll("[data-card-color-option]").forEach((option) => {
      const active = option === button;
      option.classList.toggle("active", active);
      option.setAttribute("aria-pressed", String(active));
    });
    if (front && button.dataset.front) front.src = button.dataset.front;
    if (back && button.dataset.back) back.src = button.dataset.back;
    if (colorLabel && button.dataset.color) colorLabel.textContent = button.dataset.color;
    if (gallery) {
      gallery.scrollLeft = 0;
      window.requestAnimationFrame(() => updateCardPagination(gallery));
    }
  });
});

const header = document.querySelector("[data-site-header]");
let previousY = window.scrollY;
let headerFrame = 0;
window.addEventListener("scroll", () => {
  if (!header || headerFrame) return;
  headerFrame = window.requestAnimationFrame(() => {
    const currentY = window.scrollY;
    const headerHidden = currentY > previousY && currentY > 180;
    header.classList.toggle("site-header--compact", currentY > 28);
    header.classList.toggle("site-header--hidden", headerHidden);
    document.documentElement.classList.toggle("site-header-hidden", headerHidden);
    previousY = currentY;
    headerFrame = 0;
  });
}, { passive: true });

renderCart();
