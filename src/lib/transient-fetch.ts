const transientHttpStatuses = new Set([408, 425, 429, 500, 502, 503, 504]);

export const fetchWithTransientRetry = async (
  input: string | URL,
  init: RequestInit,
  label: string,
  attempts = 3,
) => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(input, init);
      if (!transientHttpStatuses.has(response.status) || attempt === attempts) return response;
      await response.body?.cancel();
      console.warn(JSON.stringify({
        service: "commerce-ops",
        message: "Transient canary request failure; retrying",
        label,
        status: response.status,
        attempt,
      }));
    } catch (error) {
      lastError = error;
      if (attempt === attempts) throw error;
      console.warn(JSON.stringify({
        service: "commerce-ops",
        message: "Canary request failed; retrying",
        label,
        attempt,
        detail: error instanceof Error ? error.message : "Unknown fetch failure",
      }));
    }
    await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
  }
  throw lastError;
};
