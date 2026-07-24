const analyticsEventName = "rh:commerce";
const currentPageEvents = new Map();
const attributionKey = "rh-attribution-v1";
const attributionParameters = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "ttclid",
  "epik",
];

const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const readStoredAttribution = () => {
  try {
    return JSON.parse(localStorage.getItem(attributionKey) || "{}");
  } catch {
    return {};
  }
};

const captureAttribution = () => {
  const search = new URLSearchParams(window.location.search);
  const incoming = Object.fromEntries(
    attributionParameters
      .map((parameter) => [parameter, search.get(parameter)])
      .filter(([, value]) => Boolean(value)),
  );
  if (!Object.keys(incoming).length) return readStoredAttribution();
  const attribution = {
    ...incoming,
    landing_page: `${window.location.pathname}${window.location.search}`,
    captured_at: new Date().toISOString(),
  };
  localStorage.setItem(attributionKey, JSON.stringify(attribution));
  return attribution;
};

const itemFromElement = (element, index = 0) => {
  if (!(element instanceof HTMLElement)) return null;
  return {
    item_id: element.dataset.itemId || "",
    item_name: element.dataset.itemName || "",
    affiliation: "Racquet Habit",
    index,
    item_brand: "Racquet Habit",
    item_category: element.dataset.itemCategory || "",
    item_category2: element.dataset.itemType || "",
    item_category3: element.dataset.itemCapsule || "",
    item_variant: element.dataset.itemVariant || "",
    price: number(element.dataset.itemPrice),
    quantity: number(element.dataset.itemQuantity) || 1,
  };
};

const compactItem = (item) => Object.fromEntries(
  Object.entries(item).filter(([, value]) => value !== "" && value !== undefined && value !== null),
);

const track = (event, parameters = {}) => {
  const event_id = crypto.randomUUID();
  const payload = {
    ...parameters,
    items: Array.isArray(parameters.items) ? parameters.items.map(compactItem) : parameters.items,
  };
  if (window.RacquetHabitConsent?.canUse("analytics") && typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  } else if (event === "view_item" || event === "view_item_list") {
    currentPageEvents.set(event, payload);
  }
  window.dispatchEvent(new CustomEvent(analyticsEventName, {
    detail: { event, event_id, parameters: payload },
  }));
  return event_id;
};

window.addEventListener("rh:consent-changed", ({ detail }) => {
  if (!detail.consent.analytics || detail.previous.analytics) return;
  currentPageEvents.forEach((payload, event) => {
    window.gtag?.("event", event, payload);
  });
  currentPageEvents.clear();
});

const listFromElement = (list) => {
  const visibleItems = [...list.querySelectorAll("[data-commerce-item]")]
    .filter((item) => !item.hidden && item.getClientRects().length > 0);
  const items = visibleItems
    .map((item, index) => itemFromElement(item, index))
    .filter(Boolean)
    .map((item) => ({
      ...item,
      item_list_id: list.dataset.itemListId || "",
      item_list_name: list.dataset.itemListName || "",
    }));
  return {
    item_list_id: list.dataset.itemListId || "",
    item_list_name: list.dataset.itemListName || "",
    items,
  };
};

const trackVisibleLists = (scope = document) => {
  scope.querySelectorAll("[data-commerce-list]").forEach((list) => {
    const payload = listFromElement(list);
    if (payload.items.length) track("view_item_list", payload);
  });
};

captureAttribution();

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-commerce-item] a[href*='/products/']");
  if (!link) return;
  const itemElement = link.closest("[data-commerce-item]");
  const list = itemElement?.closest("[data-commerce-list]");
  const item = itemFromElement(itemElement);
  if (!item) return;
  track("select_item", {
    item_list_id: list?.dataset.itemListId || "",
    item_list_name: list?.dataset.itemListName || "",
    items: [{
      ...item,
      item_list_id: list?.dataset.itemListId || "",
      item_list_name: list?.dataset.itemListName || "",
    }],
  });
});

const productDetail = document.querySelector("[data-product-detail][data-commerce-item]");
if (productDetail) {
  const item = itemFromElement(productDetail);
  if (item) {
    track("view_item", {
      currency: "USD",
      value: item.price,
      items: [item],
    });
  }
}

trackVisibleLists();

window.RacquetHabitAnalytics = {
  eventName: analyticsEventName,
  track,
  itemFromElement,
  trackVisibleLists,
  getAttribution: readStoredAttribution,
};
