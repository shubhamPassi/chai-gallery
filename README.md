# Chai Gallery — Static Website

A responsive Chai Gallery website for Hari Nagar, West Delhi. The website itself uses plain HTML, CSS and JavaScript; online orders use the accompanying Cloudflare Worker so payment secrets remain private.

## Project structure

```text
chai-gallery/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── catalog.js
│   └── script.js
├── worker/
│   ├── src/index.js
│   ├── schema.sql
│   └── wrangler.toml
├── assets/
│   ├── images/
│   │   ├── chai-gallery-logo.png
│   │   ├── social-preview.svg
│   │   └── menu-art/
│   │       ├── hero-chai.png
│   │       ├── hot-coffee.png
│   │       ├── cold-coffee.png
│   │       ├── shake.png
│   │       ├── mojito.png
│   │       ├── burger.png
│   │       ├── sandwich.png
│   │       ├── sub-sandwich.png
│   │       ├── pizza.png
│   │       ├── pasta.png
│   │       ├── maggi.png
│   │       ├── garlic-bread.png
│   │       ├── fries.png
│   │       └── full-menu.png
│   ├── illustrations/
│   │   ├── chai.svg
│   │   ├── hot-coffee.svg
│   │   ├── cold-coffee.svg
│   │   ├── shake.svg
│   │   ├── mojito.svg
│   │   ├── burger.svg
│   │   ├── sandwich.svg
│   │   ├── sub-sandwich.svg
│   │   ├── pizza.svg
│   │   ├── pasta.svg
│   │   ├── maggi.svg
│   │   ├── garlic-bread.svg
│   │   └── fries.svg
│   └── textures/
│       └── README.md
└── README.md
```

## Run locally

The simplest option is to open `index.html` directly in a browser. For a local web server (recommended):

```powershell
cd "D:\practice\chai gallery\chai-gallery"
python -m http.server 8080
```

Then visit `http://localhost:8080`.

If a server is already running in the wrong folder, press `Ctrl+C` before running the commands above.

## Change menu items or prices

Open `js/script.js`. All categories are in the `menu` array near the top of the file.

Single-price item:

```js
{ name: "Hot Coffee", price: "₹50" }
```

Two-size item:

```js
{ name: "Adrak", prices: ["₹30", "₹45"] }
```

The current menu data has been matched to the supplied four-panel chalkboard menu artwork. Prices are in Indian rupees.

## Replace illustrations

Replace a file in `assets/images/menu-art/` with your own file using the same filename, or update the `illustration` value for that category in `js/script.js`.

Recommended export settings:

- Optimized transparent PNG or chalkboard-background PNG
- Square or near-square artboard
- Keep the original aspect ratio; the site uses `object-fit: contain`
- Aim for under 500 KB per PNG where possible

## Add address, phone, hours, and links

The Google Maps directions link and coordinates have already been added from:

```text
https://maps.app.goo.gl/oTxASr8ygmc5eHVb9
```

The public Maps page did not expose a reliable phone number or opening-hours source during setup. Add those only after verifying them on Google Maps or with the cafe.

The official Instagram link has also been added:

```text
https://www.instagram.com/chai_gallery_official/
```

Also update the JSON-LD block in `<head>` when a verified street address, phone number, URL, and opening hours are available.

## Design system

The reusable design tokens are at the top of `css/style.css`:

- Colors: `--board`, `--chalk`, `--muted`, `--accent`
- Typography: `--font-display`, `--font-body`, `--font-hand`
- Spacing: `--space-1` through `--space-7`
- Borders: `--border-thin`, `--line`
- Image sizing: menu artwork, favourite cards, and original menu preview
- Buttons, headings, and menu rows are reusable component classes

## Deploy

This folder can be deployed without a build command.

### GitHub Pages

Push the contents of `chai-gallery/` to a repository, then enable Pages from the repository settings and select the branch/root folder.

### Netlify

Drag the `chai-gallery/` folder into Netlify Drop, or connect the repository. Leave the build command empty and set the publish directory to `chai-gallery` if it lives inside a larger repository.

### Cloudflare Pages

Connect the repository, choose no framework, leave the build command empty, and set the output directory to `chai-gallery` (or `/` if this is the repository root).

### Vercel

Import the repository, select “Other” as the framework preset, leave the build command empty, and use `chai-gallery` as the root directory if needed.

## Online orders and Razorpay payments (development)

The `dev` branch is the safe staging version. It is configured for `https://dev.chaigallery.in`, which is served by the existing Cloudflare Worker named `chai-gallery-dev`, and expects its order API at `https://api.dev.chaigallery.in`.

The checkout securely sends only product IDs and quantities to the API. The Cloudflare Worker recalculates menu prices, validates the delivery postcode, creates the Razorpay order, verifies the payment signature and checks Razorpay reports the payment as captured before marking the Supabase order as paid. Never put the Razorpay key secret or Supabase service-role key in this website.

### One-time setup

1. Create a Supabase project, open its SQL editor, and run [`worker/schema.sql`](worker/schema.sql).
2. In Razorpay, create **Test Mode** API keys for development.
3. The existing `chai-gallery-dev` Worker already serves `dev.chaigallery.in`. Do not create a Cloudflare Pages project. The GitHub workflow deploys the website assets directly to that Worker.
4. Deploy the separate order API from `worker/` using `npx wrangler deploy --env dev`, then add the custom domain `api.dev.chaigallery.in`. Create a proxied DNS record for `api` when Cloudflare asks for it.
5. Set the four development Worker secrets. Run each command from `worker/`; do not commit the values:

   ```powershell
   npx wrangler secret put RAZORPAY_KEY_ID --env dev
   npx wrangler secret put RAZORPAY_KEY_SECRET --env dev
   npx wrangler secret put SUPABASE_URL --env dev
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env dev
   ```

6. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub Actions secrets. The API token needs **Account → Workers Scripts → Edit** permission. The included workflow deploys both the development site and development API whenever `dev` is pushed.

Before accepting live payments, replace the Razorpay test keys with live keys, set the final delivery zones in [`worker/src/index.js`](worker/src/index.js), and configure Razorpay webhooks (`payment.captured`, `payment.failed`, and `order.paid`) to a protected backend endpoint.

## Before launch

- Confirm all menu prices and availability.
- Add the verified full street address, opening hours, and phone number.
- Replace or optimize `assets/images/menu-art/full-menu.png` if page weight becomes a concern.
- Test the deployed URL on an iPhone and Android device.
