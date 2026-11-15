const fs = require('node:fs');
const source = fs.readFileSync('index.html', 'utf8');
const pages = [['menu','Menu'], ['about','About Us'], ['location','Location'], ['contact','Contact Us']];
for (const [id, label] of pages) {
  const section = source.match(new RegExp(`<section\\b[^>]*\\bid="${id}"[\\s\\S]*?</section>`));
  if (!section) throw new Error(`Missing section: ${id}`);
  const url = `https://www.chaigallery.in/${id}.html`;
  let head = source.slice(0, source.indexOf('</head>'));
  head = head.replace(/<title>.*?<\/title>/, `<title>${label} | Chai Gallery, Hari Nagar</title>`)
    .replaceAll('https://www.chaigallery.in/"', `${url}"`);
  head += '<style>.menu-artwork-frame{max-height:none;overflow:visible}.menu-filter,.menu-zoom-controls{display:none}.section{padding-top:40px}</style>';
  let content = section[0].replaceAll('data-reveal', '').replaceAll('href="#menu"', 'href="/menu.html"');
  if (id === 'menu') content = content.replace('<div class="menu-board" data-menu-grid aria-live="polite"></div>', '<p>Browse our current menu and prices in the complete artwork below. Visit Chai Gallery in Hari Nagar to confirm availability.</p>');
  fs.writeFileSync(`${id}.html`, `${head}</head><body><header style="padding:24px"><a href="/">Chai Gallery — Home</a><nav aria-label="Pages">${pages.map(([slug,name]) => `<a style="margin-right:20px" href="/${slug}.html">${name}</a>`).join('')}</nav></header><main>${content}</main><footer style="padding:24px"><a href="/">Visit the full Chai Gallery website</a></footer></body></html>`);
}
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['', ...pages.map(([id])=>`${id}.html`)].map(path=>`<url><loc>https://www.chaigallery.in/${path}</loc></url>`).join('')}</urlset>\n`);
