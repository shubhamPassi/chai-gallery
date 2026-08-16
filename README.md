# Chai Gallery — Static Website

A responsive, production-ready single-page website for Chai Gallery in Hari Nagar, West Delhi. It uses plain HTML, CSS, and JavaScript, so no build step or backend is required.

## Project structure

```text
chai-gallery/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
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
cd "D:\practice\chai gallery menu\chai-gallery"
python -m http.server 8080
```

Then visit `http://localhost:8080`.

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

## Before launch

- Confirm all menu prices and availability.
- Add the verified full street address, opening hours, and phone number.
- Replace or optimize `assets/images/menu-art/full-menu.png` if page weight becomes a concern.
- Test the deployed URL on an iPhone and Android device.
