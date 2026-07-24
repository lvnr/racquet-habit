import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedOrigins = new Set([
  "https://racquethabit.com",
  "https://www.racquethabit.com",
  "http://localhost:4321",
  "http://127.0.0.1:4321",
]);

export const POST: APIRoute = async ({ request }) => {
  const origin = request.headers.get("origin");
  if (origin && !allowedOrigins.has(origin)) {
    return Response.json({ error: "Invalid origin." }, { status: 403 });
  }

  let input: {
    email?: unknown;
    company?: unknown;
    startedAt?: unknown;
  };

  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // A filled honeypot is treated as success so automated submissions learn nothing.
  if (typeof input.company === "string" && input.company.trim()) {
    return Response.json({ ok: true }, { status: 202 });
  }

  const startedAt = Number(input.startedAt);
  const elapsed = Date.now() - startedAt;
  if (!Number.isFinite(startedAt) || elapsed < 700 || elapsed > 86_400_000) {
    return Response.json({ error: "Please refresh and try again." }, { status: 400 });
  }

  const email = String(input.email || "").trim().toLowerCase();
  if (email.length > 254 || !emailPattern.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  const apiKey = runtimeEnv.BREVO_API_KEY;
  const listId = Number(runtimeEnv.BREVO_LIST_ID);
  const templateId = Number(runtimeEnv.BREVO_DOI_TEMPLATE_ID);
  if (!apiKey || !Number.isInteger(listId) || !Number.isInteger(templateId)) {
    console.error("[newsletter] Brevo is not configured");
    return Response.json({ error: "Court Notes is temporarily unavailable." }, { status: 503 });
  }

  const response = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      email,
      includeListIds: [listId],
      templateId,
      redirectionUrl: "https://racquethabit.com/newsletter-confirmed",
    }),
  });

  if (response.ok) {
    return Response.json(
      { ok: true },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Brevo's DOI endpoint only creates new contacts. If the address already
  // exists, preserve its current subscription preference and add it to Court
  // Notes only when it is already allowed to receive marketing email.
  if (response.status === 400 || response.status === 409) {
    const rejection = (await response.clone().json().catch(() => null)) as {
      code?: unknown;
      message?: unknown;
    } | null;
    console.warn(
      "[newsletter] DOI request rejected",
      response.status,
      String(rejection?.code || "unknown"),
      String(rejection?.message || "unknown"),
    );

    const contactResponse = await fetch(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
      { headers: { "api-key": apiKey } },
    );

    if (contactResponse.ok) {
      const contact = (await contactResponse.json()) as {
        emailBlacklisted?: boolean;
        listIds?: number[];
      };

      if (!contact.emailBlacklisted && !contact.listIds?.includes(listId)) {
        const listResponse = await fetch(
          `https://api.brevo.com/v3/contacts/lists/${listId}/contacts/add`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-key": apiKey,
            },
            body: JSON.stringify({ emails: [email] }),
          },
        );

        if (!listResponse.ok) {
          console.error("[newsletter] Existing contact list update failed", listResponse.status);
        }
      }
    } else {
      console.error("[newsletter] Existing contact lookup failed", contactResponse.status);
    }

    return Response.json(
      { ok: true },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  }

  console.error("[newsletter] Brevo request failed", response.status);
  return Response.json(
    { error: "Court Notes is temporarily unavailable." },
    { status: 502, headers: { "Cache-Control": "no-store" } },
  );
};
