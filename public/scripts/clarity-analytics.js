const consentEvent = "rh:consent-changed";
const commerceEvent = "rh:commerce";

const callClarity = (...args) => {
  window.clarity?.(...args);
};

const syncConsent = (consent) => {
  const analyticsAllowed = consent?.analytics === true;
  callClarity("consentv2", {
    ad_Storage: "denied",
    analytics_Storage: analyticsAllowed ? "granted" : "denied",
  });
  callClarity("set", "measurement_mode", analyticsAllowed ? "cookie_backed" : "cookieless");
};

const pageType = (() => {
  const path = window.location.pathname;
  if (path.startsWith("/products/")) return "product";
  if (path === "/shop") return "shop";
  if (path === "/") return "home";
  if (path === "/journal" || path.startsWith("/journal/")) return "editorial";
  return "service";
})();

callClarity("set", "page_type", pageType);
syncConsent(window.RacquetHabitConsent?.get());

window.addEventListener(consentEvent, ({ detail }) => {
  syncConsent(detail?.consent);
});

window.addEventListener(commerceEvent, ({ detail }) => {
  const event = String(detail?.event || "");
  if (!event) return;

  callClarity("event", event);
  callClarity("set", "commerce_event", event);

  if (event === "begin_checkout") {
    callClarity("upgrade", "begin_checkout");
  }
});
