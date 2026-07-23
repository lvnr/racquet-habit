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
  const dots = [...gallery.querySelectorAll("[data-gallery-dot]")];
  const dotsLabel = gallery.querySelector("[data-gallery-dots]");
  if (!track || slides.length < 2) return;

  let index = 0;
  let visible = false;
  let manuallyPaused = false;
  let pointerStart = null;
  let pointerId = null;
  let dragged = false;
  let suppressClick = false;

  const render = (nextIndex, manual = false) => {
    index = (nextIndex + slides.length) % slides.length;
    track.style.setProperty("--gallery-index", String(index));
    track.style.setProperty("--gallery-offset", `${index * -100}%`);
    track.style.removeProperty("--gallery-drag");
    gallery.classList.remove("is-dragging");
    slides.forEach((slide, slideIndex) => {
      slide.setAttribute("aria-hidden", String(slideIndex !== index));
    });
    dots.forEach((dot, dotIndex) => {
      dot.setAttribute("aria-current", String(dotIndex === index));
    });
    dotsLabel?.setAttribute("aria-label", `Image ${index + 1} of ${slides.length}`);
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
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      render(dotIndex, true);
    });
  });

  link?.addEventListener("pointermove", (event) => {
    if (finePointer.matches) {
      const bounds = link.getBoundingClientRect();
      const segment = Math.min(slides.length - 1, Math.floor(((event.clientX - bounds.left) / bounds.width) * slides.length));
      if (segment !== index) render(segment);
      return;
    }
    if (!pointerStart || event.pointerId !== pointerId) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    if (!dragged && Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
      dragged = true;
      gallery.classList.add("is-dragging");
    }
    if (!dragged) return;
    event.preventDefault();
    const atBeginning = index === 0 && deltaX > 0;
    const atEnd = index === slides.length - 1 && deltaX < 0;
    const dragDistance = atBeginning || atEnd ? deltaX * .32 : deltaX;
    track.style.setProperty("--gallery-drag", `${dragDistance}px`);
  });
  link?.addEventListener("pointerleave", () => {
    if (finePointer.matches) render(0);
  });

  link?.addEventListener("pointerdown", (event) => {
    if (finePointer.matches || !event.isPrimary) return;
    pointerStart = { x: event.clientX, y: event.clientY, time: performance.now() };
    pointerId = event.pointerId;
    dragged = false;
    link.setPointerCapture?.(event.pointerId);
  });
  link?.addEventListener("pointerup", (event) => {
    if (!pointerStart || finePointer.matches || event.pointerId !== pointerId) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    const elapsed = Math.max(1, performance.now() - pointerStart.time);
    const velocity = Math.abs(deltaX) / elapsed;
    const movedHorizontally = dragged && Math.abs(deltaX) > Math.abs(deltaY);
    pointerStart = null;
    pointerId = null;
    link.releasePointerCapture?.(event.pointerId);
    if (!movedHorizontally) {
      track.style.removeProperty("--gallery-drag");
      gallery.classList.remove("is-dragging");
      return;
    }
    suppressClick = true;
    if (Math.abs(deltaX) >= 42 || velocity >= .35) {
      render(index + (deltaX < 0 ? 1 : -1), true);
    } else {
      render(index, true);
    }
  });
  link?.addEventListener("pointercancel", () => {
    pointerStart = null;
    pointerId = null;
    track.style.removeProperty("--gallery-drag");
    gallery.classList.remove("is-dragging");
  });
  link?.addEventListener("click", (event) => {
    if (!suppressClick) return;
    event.preventDefault();
    suppressClick = false;
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
