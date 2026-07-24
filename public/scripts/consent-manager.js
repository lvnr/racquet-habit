const storageKey = "rh-consent-v1";
const consentEvent = "rh:consent-changed";
const root = document.documentElement;
const globalPrivacyControl = navigator.globalPrivacyControl === true;

const emptyConsent = Object.freeze({
  version: 1,
  decided: false,
  analytics: false,
  marketing: false,
});

const read = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    return saved?.version === 1 ? { ...emptyConsent, ...saved } : { ...emptyConsent };
  } catch {
    return { ...emptyConsent };
  }
};

let current = read();
if (globalPrivacyControl) current.marketing = false;
let googleLoaded = false;

const loadScript = (src, id) => new Promise((resolve, reject) => {
  const existing = document.getElementById(id);
  if (existing) {
    if (existing.dataset.loaded === "true") resolve(existing);
    else existing.addEventListener("load", () => resolve(existing), { once: true });
    return;
  }
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  script.addEventListener("load", () => {
    script.dataset.loaded = "true";
    resolve(script);
  }, { once: true });
  script.addEventListener("error", reject, { once: true });
  document.head.append(script);
});

const updateGoogleConsent = (choice) => {
  window.gtag?.("consent", "update", {
    analytics_storage: choice.analytics ? "granted" : "denied",
    ad_storage: choice.marketing ? "granted" : "denied",
    ad_user_data: choice.marketing ? "granted" : "denied",
    ad_personalization: choice.marketing ? "granted" : "denied",
  });
  window.gtag?.("set", "allow_google_signals", Boolean(choice.marketing));
};

const loadGoogleAnalytics = () => {
  if (!current.analytics || googleLoaded) return;
  const measurementId = root.dataset.gaMeasurementId;
  if (!measurementId) return;
  googleLoaded = true;
  window.gtag?.("js", new Date());
  window.gtag?.("config", measurementId, {
    allow_google_signals: current.marketing,
    linker: {
      domains: ["racquethabit.com", "checkout.racquethabit.com"],
      accept_incoming: true,
    },
  });
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`, "rh-google-tag")
    .catch(() => { googleLoaded = false; });
};

const apply = (choice, { persist = true } = {}) => {
  const previous = current;
  current = {
    version: 1,
    decided: true,
    analytics: Boolean(choice.analytics),
    marketing: globalPrivacyControl ? false : Boolean(choice.marketing),
    updatedAt: new Date().toISOString(),
  };
  if (persist) localStorage.setItem(storageKey, JSON.stringify(current));
  updateGoogleConsent(current);
  loadGoogleAnalytics();
  window.dispatchEvent(new CustomEvent(consentEvent, {
    detail: { consent: { ...current }, previous: { ...previous } },
  }));
};

const panel = document.querySelector("[data-consent-panel]");
const summary = panel?.querySelector("[data-consent-summary]");
const form = panel?.querySelector("[data-consent-form]");
const analyticsInput = panel?.querySelector("[data-consent-analytics]");
const marketingInput = panel?.querySelector("[data-consent-marketing]");
const gpcNotice = panel?.querySelector("[data-consent-gpc]");

if (globalPrivacyControl) {
  if (marketingInput) marketingInput.disabled = true;
  if (gpcNotice) gpcNotice.hidden = false;
}

const showSummary = () => {
  if (!panel || !summary || !form) return;
  panel.hidden = false;
  summary.hidden = false;
  form.hidden = true;
};

const showForm = () => {
  if (!panel || !summary || !form) return;
  panel.hidden = false;
  summary.hidden = true;
  form.hidden = false;
  if (analyticsInput) analyticsInput.checked = current.analytics;
  if (marketingInput) marketingInput.checked = current.marketing;
  form.querySelector("input:not(:disabled)")?.focus();
};

const hide = () => {
  if (panel) panel.hidden = true;
};

panel?.querySelector("[data-consent-accept]")?.addEventListener("click", () => {
  apply({ analytics: true, marketing: !globalPrivacyControl });
  hide();
});

panel?.querySelector("[data-consent-reject]")?.addEventListener("click", () => {
  apply({ analytics: false, marketing: false });
  hide();
});

panel?.querySelector("[data-consent-customize]")?.addEventListener("click", showForm);
panel?.querySelector("[data-consent-close]")?.addEventListener("click", () => {
  if (current.decided) hide();
  else showSummary();
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  apply({
    analytics: Boolean(analyticsInput?.checked),
    marketing: Boolean(marketingInput?.checked),
  });
  hide();
});

document.querySelectorAll("[data-consent-settings]").forEach((button) => {
  button.addEventListener("click", showForm);
});

window.RacquetHabitConsent = {
  eventName: consentEvent,
  get: () => ({ ...current }),
  canUse: (category) => Boolean(current[category]),
  open: showForm,
  apply,
};

updateGoogleConsent(current);
loadGoogleAnalytics();
if (!current.decided) showSummary();
window.dispatchEvent(new CustomEvent("rh:consent-ready", { detail: { consent: { ...current } } }));
