import { createId } from "/scripts/runtime-utils.js";

const root = document.documentElement;
const commerceEvent = "rh:commerce";
const loaded = { meta: false, tiktok: false, pinterest: false };
let currentProductView = null;
let sentProductViewId = "";

const items = (parameters) => Array.isArray(parameters?.items) ? parameters.items : [];
const eventId = (detail) => detail.event_id || detail.eventId || createId();
const totalQuantity = (parameters) => items(parameters)
  .reduce((sum, item) => sum + Number(item.quantity || 1), 0);

const metaPayload = (parameters) => ({
  content_ids: items(parameters).map((item) => String(item.item_id || "")).filter(Boolean),
  content_name: items(parameters)[0]?.item_name,
  content_category: items(parameters)[0]?.item_category,
  content_type: "product",
  contents: items(parameters).map((item) => ({
    id: String(item.item_id || ""),
    quantity: Number(item.quantity || 1),
    item_price: Number(item.price || 0),
  })),
  currency: parameters.currency || "USD",
  value: Number(parameters.value || 0),
});

const tiktokPayload = (parameters) => ({
  content_id: String(items(parameters)[0]?.item_id || ""),
  content_ids: items(parameters).map((item) => String(item.item_id || "")).filter(Boolean),
  content_name: items(parameters)[0]?.item_name,
  content_category: items(parameters)[0]?.item_category,
  content_type: "product",
  contents: items(parameters).map((item) => ({
    content_id: String(item.item_id || ""),
    content_name: item.item_name,
    content_type: "product",
    quantity: Number(item.quantity || 1),
    price: Number(item.price || 0),
  })),
  currency: parameters.currency || "USD",
  value: Number(parameters.value || 0),
  quantity: totalQuantity(parameters),
});

const pinterestPayload = (parameters, id) => ({
  event_id: id,
  value: Number(parameters.value || 0),
  order_quantity: totalQuantity(parameters),
  currency: parameters.currency || "USD",
  line_items: items(parameters).map((item) => ({
    product_name: item.item_name,
    product_id: String(item.item_id || ""),
    product_category: item.item_category,
    product_variant_id: item.item_variant,
    product_variant: item.item_variant,
    product_price: Number(item.price || 0),
    product_quantity: Number(item.quantity || 1),
    product_brand: item.item_brand || "Racquet Habit",
  })),
});

const initializeMeta = () => {
  const pixelId = root.dataset.metaPixelId;
  if (!pixelId) return;
  if (loaded.meta) {
    window.fbq?.("consent", "grant");
    return;
  }
  loaded.meta = true;
  ((f, b, e, v, n, t, s) => {
    if (f.fbq) return;
    n = f.fbq = function fbq() { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  window.fbq("init", pixelId);
  window.fbq("consent", "grant");
  window.fbq("track", "PageView", {}, { eventID: createId() });
};

const initializeTikTok = () => {
  const pixelId = root.dataset.tiktokPixelId;
  if (!pixelId) return;
  if (loaded.tiktok) {
    window.ttq?.grantConsent?.();
    return;
  }
  loaded.tiktok = true;
  ((w, d, t) => {
    w.TiktokAnalyticsObject = t;
    const ttq = w[t] = w[t] || [];
    ttq.methods = [
      "page", "track", "identify", "instances", "debug", "on", "off", "once",
      "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent",
      "revokeConsent", "grantConsent",
    ];
    ttq.setAndDefer = (target, method) => {
      target[method] = function deferred() { target.push([method].concat([].slice.call(arguments, 0))); };
    };
    for (const method of ttq.methods) ttq.setAndDefer(ttq, method);
    ttq.instance = (id) => {
      const instance = ttq._i[id] || [];
      for (const method of ttq.methods) ttq.setAndDefer(instance, method);
      return instance;
    };
    ttq.load = (id) => {
      const src = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[id] = [];
      ttq._i[id]._u = src;
      ttq._t = ttq._t || {};
      ttq._t[id] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[id] = {};
      const script = d.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = `${src}?sdkid=${encodeURIComponent(id)}&lib=${encodeURIComponent(t)}`;
      const first = d.getElementsByTagName("script")[0];
      first.parentNode.insertBefore(script, first);
    };
    ttq.load(pixelId);
    ttq.grantConsent();
    ttq.page();
  })(window, document, "ttq");
};

const initializePinterest = () => {
  const tagId = root.dataset.pinterestTagId;
  if (!tagId) return;
  if (loaded.pinterest) {
    window.pintrk?.("setconsent", true);
    return;
  }
  loaded.pinterest = true;
  ((src) => {
    if (window.pintrk) return;
    window.pintrk = function pintrk() {
      window.pintrk.queue.push(Array.prototype.slice.call(arguments));
    };
    window.pintrk.queue = [];
    window.pintrk.version = "3.0";
    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    document.head.append(script);
  })("https://s.pinimg.com/ct/core.js");
  window.pintrk("load", tagId);
  window.pintrk("setconsent", true);
  window.pintrk("page");
};

const initialize = () => {
  if (!window.RacquetHabitConsent?.canUse("marketing")) return;
  initializeMeta();
  initializeTikTok();
  initializePinterest();
};

const revoke = () => {
  if (loaded.meta) window.fbq?.("consent", "revoke");
  if (loaded.tiktok) window.ttq?.revokeConsent?.();
  if (loaded.pinterest) window.pintrk?.("setconsent", false);
};

const mappings = {
  view_item: { meta: "ViewContent", tiktok: "ViewContent", pinterest: "pagevisit" },
  add_to_cart: { meta: "AddToCart", tiktok: "AddToCart", pinterest: "addtocart" },
  // Fire InitiateCheckout at the site handoff. Fourthwall did not emit this
  // event during the launch audit, leaving Meta with a false zero-step funnel.
  begin_checkout: { meta: "InitiateCheckout", tiktok: "InitiateCheckout", pinterest: "initiatecheckout" },
};

const sendCommerceEvent = (detail) => {
  const names = mappings[detail.event];
  if (!names) return;
  const id = eventId(detail);
  if (loaded.meta && names.meta) {
    window.fbq?.("track", names.meta, metaPayload(detail.parameters), { eventID: id });
  }
  if (loaded.tiktok && names.tiktok) {
    window.ttq?.track?.(names.tiktok, {
      ...tiktokPayload(detail.parameters),
      event_id: id,
    });
  }
  if (loaded.pinterest && names.pinterest) {
    window.pintrk?.("track", names.pinterest, pinterestPayload(detail.parameters, id));
  }
  if (detail.event === "view_item") sentProductViewId = id;
};

window.addEventListener(commerceEvent, ({ detail }) => {
  if (detail.event === "view_item") currentProductView = detail;
  if (!window.RacquetHabitConsent?.canUse("marketing")) return;
  initialize();
  sendCommerceEvent(detail);
});

window.addEventListener("rh:consent-ready", initialize);
window.addEventListener("rh:consent-changed", ({ detail }) => {
  if (detail.consent.marketing) {
    initialize();
    if (!detail.previous.marketing && currentProductView && currentProductView.event_id !== sentProductViewId) {
      sendCommerceEvent(currentProductView);
    }
  } else revoke();
});

initialize();
