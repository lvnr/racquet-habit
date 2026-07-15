"""Responsive storefront smoke test and screenshot capture."""

from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = "http://localhost:4321"
OUTPUT = Path("/tmp/rh-visual")


def load_all_images(page):
    page.evaluate(
        """async () => {
          document.documentElement.style.scrollBehavior = 'auto';
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 80));
          }
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          await new Promise((resolve) => setTimeout(resolve, 250));
        }"""
    )


def capture(page, route, filename, full_page=False):
    print(f"capturing {filename}", flush=True)
    page.goto(f"{BASE_URL}{route}", wait_until="networkidle")
    load_all_images(page)
    page.screenshot(path=OUTPUT / filename, full_page=full_page)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    issues = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)

        for label, viewport in (
            ("desktop", {"width": 1440, "height": 1000}),
            ("mobile", {"width": 390, "height": 844}),
        ):
            context = browser.new_context(viewport=viewport)
            print(f"starting {label}", flush=True)
            page = context.new_page()
            page.on("pageerror", lambda error, label=label: issues.append(f"{label} page error: {error}"))
            page.on(
                "console",
                lambda message, label=label: issues.append(f"{label} console {message.type}: {message.text}")
                if message.type == "error"
                else None,
            )

            capture(page, "/", f"home-{label}.png")
            page.locator(".editorial-feature").screenshot(path=OUTPUT / f"still-life-{label}.png")
            page.locator(".journal-teaser").screenshot(path=OUTPUT / f"poster-{label}.png")
            capture(page, "/shop", f"shop-{label}.png")

            first_product = page.locator("[data-product-card] h3 a").first
            if first_product.count():
                product_href = first_product.get_attribute("href")
                page.goto(f"{BASE_URL}{product_href}", wait_until="networkidle")
                print(f"opened product on {label}", flush=True)
                load_all_images(page)
                page.screenshot(path=OUTPUT / f"product-{label}.png", full_page=False)

                add_button = page.locator("[data-add-to-cart]")
                if not add_button.count():
                    issues.append(f"{label} product has no add-to-cart control")

            if label == "mobile":
                page.goto(BASE_URL, wait_until="networkidle")
                menu = page.locator(".mobile-nav summary")
                if not menu.is_visible():
                    issues.append("mobile navigation trigger is not visible")
                else:
                    menu.click()
                    page.locator(".mobile-nav__panel").wait_for(state="visible")
                    page.screenshot(path=OUTPUT / "menu-mobile.png", full_page=False)

            image_states = page.locator("img").evaluate_all(
                """(images) => images.map((image) => ({
                  src: image.currentSrc || image.src,
                  loaded: image.complete && image.naturalWidth > 0
                }))"""
            )
            for image in image_states:
                if not image["loaded"]:
                    issues.append(f"{label} image failed: {image['src']}")

            context.close()

        browser.close()

    if issues:
        print("Visual smoke test issues:")
        for issue in sorted(set(issues)):
            print(f"- {issue}")
        raise SystemExit(1)

    print(f"Visual smoke test passed. Screenshots: {OUTPUT}")


if __name__ == "__main__":
    main()
