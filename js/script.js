import { menu } from "./catalog.js";

const favourites = [
  { id: "chai", title: "Adrak Elaichi Chai", note: "Warm, familiar and made for one more round." },
  { id: "pizza", title: "Monster King Pizza", note: "Big café comfort for a table full of cravings." },
  { id: "burgers", title: "Monster King Burger", note: "The hungry-person answer to a quick coffee plan." },
  { id: "cold-coffee", title: "Biscoff Royal", note: "Cold, creamy and exactly the break you needed." }
];

const escapeHTML = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function renderMenu(filter = "all") {
  const grid = document.querySelector("[data-menu-grid]");
  if (!grid) return;

  const visibleMenu = filter === "all" ? menu : menu.filter((category) => category.group === filter);
  grid.innerHTML = visibleMenu.map((category, index) => {
    const hasSizes = Array.isArray(category.sizeLabels);
    const rows = category.items.map((item, itemIndex) => {
      if (hasSizes) {
        return `
          <div class="menu-row has-sizes">
            <span class="menu-item-name">${escapeHTML(item.name)}</span>
            <span class="menu-dots" aria-hidden="true"></span>
            ${item.prices.map((price, sizeIndex) => `<button class="menu-price menu-add" type="button" data-product-id="${category.id}:${itemIndex}:${sizeIndex}" aria-label="Add ${escapeHTML(item.name)}, ${escapeHTML(category.sizeLabels[sizeIndex])}, ${escapeHTML(price)} to order">${escapeHTML(price)} <b>+</b></button>`).join("")}
          </div>`;
      }
      const canOrder = /^₹\d+$/.test(item.price);
      return `
        <div class="menu-row">
          <span class="menu-item-name">${escapeHTML(item.name)}</span>
          <span class="menu-dots" aria-hidden="true"></span>
          ${canOrder ? `<button class="menu-price menu-add" type="button" data-product-id="${category.id}:${itemIndex}:0" aria-label="Add ${escapeHTML(item.name)}, ${escapeHTML(item.price)} to order">${escapeHTML(item.price)} <b>+</b></button>` : `<span class="menu-price">${escapeHTML(item.price)}</span>`}
        </div>`;
    }).join("");

    const sizes = hasSizes
      ? `<div class="menu-sizes"><span></span>${category.sizeLabels.map((label) => `<span>${escapeHTML(label)}</span>`).join("")}</div>`
      : "";

    return `
      <article class="menu-card is-entering" data-group="${category.group}" aria-labelledby="${category.id}-title">
        <div class="menu-illustration" data-index="${String(index + 1).padStart(2, "0")}">
          <img src="assets/images/menu-art/${category.illustration}" width="220" height="220" loading="lazy" alt="Chalk-style menu artwork for ${escapeHTML(category.title)}">
        </div>
        <div class="menu-content">
          <header>
            <h3 id="${category.id}-title">${escapeHTML(category.title)}</h3>
            <span class="menu-type">${category.group === "food" ? "Quick bite" : "Beverage"}</span>
          </header>
          ${sizes}
          ${rows}
        </div>
      </article>`;
  }).join("");

  requestAnimationFrame(() => {
    grid.querySelectorAll(".is-entering").forEach((card, index) => {
      window.setTimeout(() => card.classList.remove("is-entering"), index * 32);
    });
  });
}

const cart = new Map();
const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const apiBase = String(window.CHAI_GALLERY_CONFIG?.apiBase || "").replace(/\/$/, "");

function productFromId(id) {
  const [categoryId, itemIndexText, variantIndexText] = String(id).split(":");
  const category = menu.find((entry) => entry.id === categoryId);
  const item = category?.items[Number(itemIndexText)];
  const variantIndex = Number(variantIndexText);
  if (!category || !item || !Number.isInteger(variantIndex)) return null;
  const rawPrice = Array.isArray(item.prices) ? item.prices[variantIndex] : item.price;
  const price = Number(String(rawPrice).replace(/[^0-9]/g, ""));
  if (!Number.isFinite(price) || price <= 0) return null;
  const variant = category.sizeLabels?.[variantIndex];
  return { id, name: item.name, category: category.title, variant, price };
}

function cartEntries() {
  return [...cart.entries()].map(([id, quantity]) => ({ ...productFromId(id), quantity })).filter((item) => item.id);
}

function updateCartUI() {
  const entries = cartEntries();
  const count = entries.reduce((total, item) => total + item.quantity, 0);
  const subtotal = entries.reduce((total, item) => total + item.price * item.quantity, 0);
  const dock = document.querySelector(".cart-dock");
  document.querySelectorAll("[data-cart-count]").forEach((node) => { node.textContent = count; });
  if (dock) dock.hidden = count === 0;
  const summary = document.querySelector("[data-cart-summary]");
  if (summary) summary.textContent = count ? `${count} item${count === 1 ? "" : "s"} · ${currency.format(subtotal)}` : "Your cart is empty";
  const items = document.querySelector("[data-cart-items]");
  const empty = document.querySelector("[data-cart-empty]");
  const subtotalNode = document.querySelector("[data-subtotal]");
  const totalNode = document.querySelector("[data-total]");
  const deliveryNode = document.querySelector("[data-delivery]");
  const payButton = document.querySelector("[data-pay-button]");
  if (items) items.innerHTML = entries.map((item) => `<article class="cart-line"><div><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.category)}${item.variant ? ` · ${escapeHTML(item.variant)}` : ""}</small></div><div class="cart-line-controls"><button type="button" data-cart-change="${item.id}" data-delta="-1" aria-label="Remove one ${escapeHTML(item.name)}">−</button><span>${item.quantity}</span><button type="button" data-cart-change="${item.id}" data-delta="1" aria-label="Add one ${escapeHTML(item.name)}">+</button><b>${currency.format(item.price * item.quantity)}</b></div></article>`).join("");
  if (empty) empty.hidden = entries.length > 0;
  if (subtotalNode) subtotalNode.textContent = currency.format(subtotal);
  if (deliveryNode) deliveryNode.textContent = entries.length ? "Calculated from pincode" : "—";
  if (totalNode) totalNode.textContent = currency.format(subtotal);
  if (payButton) payButton.disabled = !entries.length || !apiBase;
}

function setCheckoutStatus(message, isError = false) {
  const status = document.querySelector("[data-checkout-status]");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("is-error", isError);
}

function initOrdering() {
  const dialog = document.querySelector("[data-order-dialog]");
  const form = document.querySelector("[data-checkout-form]");
  if (!dialog || !form) return;
  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-product-id]");
    if (addButton) {
      const id = addButton.dataset.productId;
      if (productFromId(id)) cart.set(id, (cart.get(id) || 0) + 1);
      updateCartUI();
      return;
    }
    const cartChange = event.target.closest("[data-cart-change]");
    if (cartChange) {
      const id = cartChange.dataset.cartChange;
      const next = (cart.get(id) || 0) + Number(cartChange.dataset.delta);
      if (next > 0) cart.set(id, next); else cart.delete(id);
      updateCartUI();
      return;
    }
    if (event.target.closest("[data-open-cart]")) {
      dialog.showModal();
      if (!apiBase) setCheckoutStatus("Online payments are being configured. Please try again soon.", true);
    }
    if (event.target.closest("[data-close-cart]")) dialog.close();
  });
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!apiBase || !cart.size) return;
    const payButton = form.querySelector("[data-pay-button]");
    const formData = new FormData(form);
    const customer = Object.fromEntries(formData.entries());
    payButton.disabled = true;
    setCheckoutStatus("Checking delivery and preparing secure payment…");
    try {
      const response = await fetch(`${apiBase}/create-order`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cartEntries().map(({ id, quantity }) => ({ id, quantity })), customer }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to start payment.");
      if (!window.Razorpay) throw new Error("Payment service did not load. Please try again.");
      const checkout = new window.Razorpay({ key: data.keyId, amount: data.amount, currency: "INR", name: "Chai Gallery", description: `Food order · ${data.deliveryLabel}`, order_id: data.orderId, prefill: { name: customer.name, contact: customer.phone }, theme: { color: "#d98a3a" }, handler: async (payment) => {
        setCheckoutStatus("Verifying your payment…");
        const verified = await fetch(`${apiBase}/verify-payment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payment) });
        const result = await verified.json();
        if (!verified.ok) throw new Error(result.error || "Payment verification failed.");
        cart.clear(); updateCartUI(); form.reset();
        setCheckoutStatus(`Order ${result.orderNumber} confirmed. We’ll start preparing it shortly.`);
      }, modal: { ondismiss: () => { payButton.disabled = false; setCheckoutStatus("Payment cancelled. Your cart is still saved."); } } });
      checkout.open();
    } catch (error) {
      setCheckoutStatus(error.message || "Something went wrong. Please try again.", true);
      payButton.disabled = false;
    }
  });
  updateCartUI();
}

function renderFavourites() {
  const grid = document.querySelector("[data-favourites]");
  if (!grid) return;
  grid.innerHTML = favourites.map((favourite, index) => {
    const category = menu.find((item) => item.id === favourite.id);
    return `
      <article class="favourite-card">
        <span class="favourite-card-number">FAVOURITE / ${String(index + 1).padStart(2, "0")}</span>
        <img src="assets/images/menu-art/${category.illustration}" width="280" height="250" loading="lazy" alt="Chalk-style artwork for ${escapeHTML(favourite.title)}">
        <div>
          <h3>${escapeHTML(favourite.title)}</h3>
          <p>${escapeHTML(favourite.note)}</p>
        </div>
      </article>`;
  }).join("");
}

function initNavigation() {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (!header || !toggle || !nav) return;

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    nav.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => {
    const willOpen = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(willOpen));
    toggle.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
    nav.classList.toggle("is-open", willOpen);
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
  window.addEventListener("scroll", () => header.classList.toggle("is-scrolled", window.scrollY > 24), { passive: true });
}

function initMenuFilter() {
  const filter = document.querySelector("[data-menu-filter]");
  if (!filter) return;
  filter.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    filter.querySelectorAll("button").forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    renderMenu(button.dataset.filter);
  });
}

function initReveal() {
  const elements = document.querySelectorAll("[data-reveal]");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -35px" });
  elements.forEach((element) => observer.observe(element));
}

function initActiveNavigation() {
  const links = [...document.querySelectorAll(".primary-nav a")];
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-35% 0px -58%", threshold: 0 });
  sections.forEach((section) => observer.observe(section));
}

function initDisabledLinks() {
  document.querySelectorAll('a[aria-disabled="true"]').forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });
}

function initMenuZoom() {
  const viewer = document.querySelector("[data-menu-zoom]");
  if (!viewer) return;

  const frame = viewer.querySelector(".menu-artwork-frame");
  const image = viewer.querySelector("[data-zoom-image]");
  const zoomIn = viewer.querySelector("[data-zoom-in]");
  const zoomOut = viewer.querySelector("[data-zoom-out]");
  const zoomReset = viewer.querySelector("[data-zoom-reset]");
  const zoomLevel = viewer.querySelector("[data-zoom-level]");
  if (!frame || !image || !zoomIn || !zoomOut || !zoomReset || !zoomLevel) return;

  let zoom = 1;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let scrollStartX = 0;
  let scrollStartY = 0;

  const setZoom = (nextZoom) => {
    zoom = Math.min(2.6, Math.max(1, Number(nextZoom.toFixed(2))));
    image.style.setProperty("--menu-zoom-width", `${zoom * 100}%`);
    zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
    frame.classList.toggle("is-zoomed", zoom > 1);
    zoomOut.disabled = zoom <= 1;
    zoomReset.disabled = zoom <= 1;
    zoomIn.disabled = zoom >= 2.6;
  };

  const zoomFromCenter = (amount) => {
    const before = zoom;
    const centerX = frame.scrollLeft + frame.clientWidth / 2;
    const centerY = frame.scrollTop + frame.clientHeight / 2;
    setZoom(zoom + amount);
    const ratio = zoom / before;
    frame.scrollLeft = centerX * ratio - frame.clientWidth / 2;
    frame.scrollTop = centerY * ratio - frame.clientHeight / 2;
  };

  zoomIn.addEventListener("click", () => zoomFromCenter(0.2));
  zoomOut.addEventListener("click", () => zoomFromCenter(-0.2));
  zoomReset.addEventListener("click", () => {
    setZoom(1);
    frame.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  });

  frame.addEventListener("wheel", (event) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    zoomFromCenter(event.deltaY < 0 ? 0.14 : -0.14);
  }, { passive: false });

  frame.addEventListener("pointerdown", (event) => {
    if (zoom <= 1) return;
    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    scrollStartX = frame.scrollLeft;
    scrollStartY = frame.scrollTop;
    frame.setPointerCapture(event.pointerId);
  });

  frame.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    frame.scrollLeft = scrollStartX - (event.clientX - dragStartX);
    frame.scrollTop = scrollStartY - (event.clientY - dragStartY);
  });

  frame.addEventListener("pointerup", () => { isDragging = false; });
  frame.addEventListener("pointercancel", () => { isDragging = false; });
  setZoom(1);
}

renderMenu();
renderFavourites();
initNavigation();
initMenuFilter();
initReveal();
initActiveNavigation();
initDisabledLinks();
initMenuZoom();
initOrdering();
document.querySelector("[data-year]").textContent = new Date().getFullYear();
