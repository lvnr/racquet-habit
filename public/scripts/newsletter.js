document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
  const status = form.querySelector("[data-newsletter-status]");
  const button = form.querySelector("button[type='submit']");
  const startedAt = form.querySelector("[name='startedAt']");
  if (startedAt) startedAt.value = String(Date.now());

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!(form instanceof HTMLFormElement) || !(button instanceof HTMLButtonElement)) return;

    button.disabled = true;
    button.textContent = "Serving…";
    if (status) status.textContent = "";

    const data = new FormData(form);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          company: data.get("company"),
          startedAt: data.get("startedAt"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Please try again.");

      form.reset();
      if (status) status.textContent = "Check your inbox to confirm your place on the court list.";
      window.RacquetHabitAnalytics?.track("sign_up", { method: "footer_court_notes" });
    } catch (error) {
      if (status) status.textContent = error instanceof Error ? error.message : "Please try again.";
    } finally {
      button.disabled = false;
      button.textContent = "Join court notes";
      if (startedAt) startedAt.value = String(Date.now());
    }
  });
});
