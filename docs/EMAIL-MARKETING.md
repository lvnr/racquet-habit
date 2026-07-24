# Court Notes email system

## Production architecture

- The footer form posts first-party to `POST /api/newsletter` on
  `racquethabit.com`.
- The Cloudflare Worker validates origin, timing, a honeypot field and the email
  shape before calling Brevo.
- Brevo's double-opt-in endpoint sends template `1`; only a confirmed address is
  added to the `Court Notes` list (`3`).
- The subscriber is returned to `/newsletter-confirmed` after using Brevo's
  confirmation link.
- The Brevo API key is a Cloudflare Worker secret named `BREVO_API_KEY`. It must
  never be committed to the repository or exposed to browser code.

## Brevo account

- Sender: `Court Notes <court@send.racquethabit.com>`
- Sending domain: `send.racquethabit.com`
- Branded tracking domain: `mail.send.racquethabit.com`
- Contact list: `Court Notes` (`3`)
- Templates:
  - `1` — Court Notes: Confirm your place (double opt-in)
  - `2` — Court Notes: Welcome to the club
  - `3` — Court Notes: Riviera Match Annual drop

Source-controlled email HTML lives in `email-templates/`. Images used by the
templates live in `public/email/` and use absolute HTTPS URLs.

## Launch checks

1. `BREVO_API_KEY` appears in `wrangler secret list`.
2. Templates `1`, `2`, and `3` are active in Brevo; template `1` is designated
   for double opt-in and contains `{{ params.DOIurl }}`.
3. Submit a new controlled test address from the production footer.
4. Confirm the initial response is HTTP `202` and no address appears in the
   active list before the confirmation link is used.
5. Confirm the email, verify the browser returns to
   `https://racquethabit.com/newsletter-confirmed`, and verify the contact is now
   in list `3`.
6. Verify unsubscribe and preference links from a test send before scheduling a
   campaign.

## Operating rules

- Import only contacts with documented marketing permission.
- Keep double opt-in enabled for website signups.
- Use Brevo's unsubscribe and preference placeholders in every marketing email.
- Send campaigns from the authenticated subdomain and include UTM parameters on
  site links.
- Use template `2` as the first message in a post-confirmation automation.
- Treat deliverability, bounce, complaint and unsubscribe status as suppression
  signals; do not re-add suppressed contacts manually.
