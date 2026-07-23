const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const saveData = Boolean(navigator.connection?.saveData);

document.querySelectorAll("[data-card-gallery]").forEach((gallery) => {
  const track = gallery.querySelector("[data-gallery-track]");
  const slides = [...gallery.querySelectorAll("[data-gallery-track] > *")];
  const link = gallery.querySelector("[data-gallery-link]");
  const status = gallery.querySelector("[data-gallery-status]");
  const previous = gallery.querySelector("[data-gallery-prev]");
  const next = gallery.querySelector("[data-gallery-next]");
  if (!track || slides.length < 2) return;

  let index = 0;
  let visible = false;
  let manuallyPaused = false;
  let pointerStart = null;
  let dragged = false;

  const render = (nextIndex, manual = false) => {
    index = (nextIndex + slides.length) % slides.length;
    track.style.setProperty("--gallery-index", String(index));
    slides.forEach((slide, slideIndex) => {
      slide.setAttribute("aria-hidden", String(slideIndex !== index));
    });
    if (status) {
      status.textContent = `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    }
    if (manual) manuallyPaused = true;
  };

  previous?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    render(index - 1, true);
  });
  next?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    render(index + 1, true);
  });

  link?.addEventListener("pointermove", (event) => {
    if (!finePointer.matches) return;
    const bounds = link.getBoundingClientRect();
    const segment = Math.min(slides.length - 1, Math.floor(((event.clientX - bounds.left) / bounds.width) * slides.length));
    if (segment !== index) render(segment);
  });
  link?.addEventListener("pointerleave", () => {
    if (finePointer.matches) render(0);
  });

  link?.addEventListener("pointerdown", (event) => {
    if (finePointer.matches) return;
    pointerStart = { x: event.clientX, y: event.clientY };
    dragged = false;
  });
  link?.addEventListener("pointerup", (event) => {
    if (!pointerStart || finePointer.matches) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(deltaX) < 28 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    dragged = true;
    render(index + (deltaX < 0 ? 1 : -1), true);
  });
  link?.addEventListener("click", (event) => {
    if (!dragged) return;
    event.preventDefault();
    dragged = false;
  }, true);

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= 0.55;
  }, { threshold: [0, 0.55, 1] });
  observer.observe(gallery);

  window.setInterval(() => {
    if (
      !visible ||
      document.hidden ||
      finePointer.matches ||
      reducedMotion.matches ||
      saveData ||
      manuallyPaused
    ) return;
    render(index + 1);
  }, 2800);

  render(0);
});
