const root = document.documentElement;
const rate = Number(root.dataset.amdRate || 367);
const country = root.dataset.country || "";
const cartKey = "rh-cart-v1";
const currencyKey = "rh-currency-v1";

const formatPrice = (value, currency = root.dataset.currency || "USD") => {
  if (currency === "AMD") {
    const rounded = Math.round((Number(value) * rate) / 100) * 100;
    return new Intl.NumberFormat("hy-AM", { style: "currency", currency: "AMD", maximumFractionDigits: 0 }).format(rounded);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
};

const updatePrices = () => {
  const currencyLabel = root.dataset.currency === "AMD" ? "AMD ֏" : "USD $";
  document.querySelectorAll("[data-price-usd]").forEach((node) => {
    node.textContent = formatPrice(node.dataset.priceUsd);
  });
  document.querySelectorAll("[data-currency-label]").forEach((node) => {
    node.textContent = currencyLabel;
  });
  document.querySelectorAll("[data-currency-toggle]").forEach((button) => {
    button.setAttribute("aria-label", `Currency ${currencyLabel}. Toggle display currency`);
  });
};

const savedCurrency = localStorage.getItem(currencyKey);
if (savedCurrency === "AMD" || savedCurrency === "USD") root.dataset.currency = savedCurrency;
updatePrices();

document.querySelectorAll("[data-currency-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    root.dataset.currency = root.dataset.currency === "AMD" ? "USD" : "AMD";
    localStorage.setItem(currencyKey, root.dataset.currency);
    updatePrices();
    renderCart();
  });
});

const getCart = () => {
  try { return JSON.parse(localStorage.getItem(cartKey) || "[]"); }
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
  if (dialog && !dialog.open) dialog.showModal();
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
  if (existing) existing.quantity += 1;
  else cart.push({
    variantId,
    name: button.dataset.name,
    variant: button.dataset.variant || "Standard",
    price: Number(button.dataset.price || 0),
    image: button.dataset.image,
    quantity: 1,
  });
  setCart(cart);
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
    const products = cart.map((item) => `${item.variantId}:${item.quantity}`).join(",");
    const coupon = country === "AM" ? "&coupon=ARMENIA" : "";
    checkout.href = `https://racquet-habit-shop.fourthwall.com/cart/checkout?products=${encodeURIComponent(products)}&currency=USD${coupon}`;
  }
  const shipping = document.querySelector("[data-cart-shipping]");
  if (shipping) shipping.textContent = country === "AM" ? "Complimentary delivery across Armenia · applied automatically" : "International delivery calculated at checkout";
}

document.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-cart-remove]");
  const increase = event.target.closest("[data-cart-increase]");
  const decrease = event.target.closest("[data-cart-decrease]");
  if (!remove && !increase && !decrease) return;
  const variantId = (remove || increase || decrease).dataset.cartRemove || (increase || decrease).dataset.cartIncrease || decrease?.dataset.cartDecrease;
  const cart = getCart();
  const item = cart.find((entry) => entry.variantId === variantId);
  if (remove) return setCart(cart.filter((entry) => entry.variantId !== variantId));
  if (!item) return;
  item.quantity += increase ? 1 : -1;
  setCart(cart.filter((entry) => entry.quantity > 0));
});

document.querySelector("[data-cart-dialog]")?.addEventListener("click", (event) => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});

document.querySelectorAll(".mobile-nav a").forEach((link) => link.addEventListener("click", () => link.closest("details")?.removeAttribute("open")));

const header = document.querySelector("[data-site-header]");
let previousY = window.scrollY;
let headerFrame = 0;
window.addEventListener("scroll", () => {
  if (!header || headerFrame) return;
  headerFrame = window.requestAnimationFrame(() => {
    const currentY = window.scrollY;
    header.classList.toggle("site-header--compact", currentY > 28);
    header.classList.toggle("site-header--hidden", currentY > previousY && currentY > 180);
    previousY = currentY;
    headerFrame = 0;
  });
}, { passive: true });

renderCart();
