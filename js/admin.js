import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const config = window.CHAI_GALLERY_ADMIN_CONFIG || {};
const loginPanel = document.querySelector("[data-admin-login]");
const dashboard = document.querySelector("[data-admin-dashboard]");
const loginForm = document.querySelector("[data-admin-login-form]");
const loginMessage = document.querySelector("[data-admin-login-message]");
const dashboardMessage = document.querySelector("[data-admin-dashboard-message]");
const ordersRoot = document.querySelector("[data-admin-orders]");
const filters = document.querySelector("[data-order-filters]");
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const allowedStatuses = ["paid", "preparing", "out_for_delivery", "completed", "cancelled"];
let supabase;
let allOrders = [];
let currentFilter = "active";

const escapeHTML = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const setMessage = (node, message, isError = false) => { node.textContent = message; node.classList.toggle("is-error", isError); };
const statusLabel = (value) => String(value || "").replaceAll("_", " ");

function visibleOrders() {
  if (currentFilter === "all") return allOrders;
  if (currentFilter === "active") return allOrders.filter((order) => ["paid", "preparing", "out_for_delivery"].includes(order.status));
  return allOrders.filter((order) => order.status === currentFilter);
}

function renderOrders() {
  const orders = visibleOrders();
  if (!orders.length) { ordersRoot.innerHTML = '<p class="admin-empty">No matching orders yet.</p>'; return; }
  ordersRoot.innerHTML = orders.map((order) => {
    const items = Array.isArray(order.items) ? order.items.map((item) => `<li>${escapeHTML(item.name)}${item.variant ? ` (${escapeHTML(item.variant)})` : ""} <span>× ${item.quantity}</span></li>`).join("") : "";
    const created = new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    return `<article class="admin-order"><header><div><span class="order-number">${escapeHTML(order.order_number)}</span><time datetime="${escapeHTML(order.created_at)}">${escapeHTML(created)}</time></div><span class="order-status status-${escapeHTML(order.status)}">${escapeHTML(statusLabel(order.status))}</span></header><div class="admin-order-grid"><section><h2>${escapeHTML(order.customer_name)}</h2><p><a href="tel:${escapeHTML(order.customer_phone)}">${escapeHTML(order.customer_phone)}</a><br>${escapeHTML(order.delivery_address)}${order.landmark ? `<br>Landmark: ${escapeHTML(order.landmark)}` : ""}<br>Pincode: ${escapeHTML(order.pincode)}</p>${order.instructions ? `<p class="order-note">${escapeHTML(order.instructions)}</p>` : ""}</section><section><ul class="admin-items">${items}</ul><dl><div><dt>Food</dt><dd>${money.format(order.subtotal)}</dd></div><div><dt>Delivery</dt><dd>${money.format(order.delivery_fee)}</dd></div><div class="admin-total"><dt>Total paid</dt><dd>${money.format(order.total)}</dd></div></dl></section></div><footer><label>Order status <select data-order-status data-order-id="${order.id}">${allowedStatuses.map((status) => `<option value="${status}"${status === order.status ? " selected" : ""}>${escapeHTML(statusLabel(status))}</option>`).join("")}</select></label></footer></article>`;
  }).join("");
}

async function getSession() { return (await supabase.auth.getSession()).data.session; }

async function loadOrders() {
  const session = await getSession();
  if (!session) return showLogin();
  setMessage(dashboardMessage, "Refreshing orders…");
  const response = await fetch(`${config.apiBase.replace(/\/$/, "")}/admin/orders`, { headers: { Authorization: `Bearer ${session.access_token}` } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not load orders.");
  allOrders = data.orders || [];
  renderOrders();
  setMessage(dashboardMessage, `${allOrders.length} order${allOrders.length === 1 ? "" : "s"} loaded.`);
}

function showLogin() { loginPanel.hidden = false; dashboard.hidden = true; }
function showDashboard() { loginPanel.hidden = true; dashboard.hidden = false; }

async function start() {
  if (!config.supabaseUrl || !config.supabasePublishableKey) { setMessage(loginMessage, "Admin setup is incomplete. Add the Supabase public configuration first.", true); return; }
  supabase = createClient(config.supabaseUrl, config.supabasePublishableKey);
  if (await getSession()) { showDashboard(); try { await loadOrders(); } catch (error) { setMessage(dashboardMessage, error.message, true); } }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabase) return;
  const button = loginForm.querySelector("button"); button.disabled = true; setMessage(loginMessage, "Signing in…");
  const fields = new FormData(loginForm);
  const { error } = await supabase.auth.signInWithPassword({ email: fields.get("email"), password: fields.get("password") });
  button.disabled = false;
  if (error) { setMessage(loginMessage, error.message, true); return; }
  loginForm.reset(); showDashboard();
  try { await loadOrders(); } catch (loadError) { setMessage(dashboardMessage, loadError.message, true); }
});

document.querySelector("[data-admin-signout]").addEventListener("click", async () => { if (supabase) await supabase.auth.signOut(); allOrders = []; showLogin(); setMessage(loginMessage, "Signed out."); });
document.querySelector("[data-admin-refresh]").addEventListener("click", async () => { try { await loadOrders(); } catch (error) { setMessage(dashboardMessage, error.message, true); } });
filters.addEventListener("click", (event) => { const button = event.target.closest("[data-order-filter]"); if (!button) return; currentFilter = button.dataset.orderFilter; filters.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button)); renderOrders(); });
ordersRoot.addEventListener("change", async (event) => {
  const select = event.target.closest("[data-order-status]"); if (!select) return;
  const session = await getSession(); if (!session) return showLogin();
  select.disabled = true; setMessage(dashboardMessage, "Updating order…");
  try {
    const response = await fetch(`${config.apiBase.replace(/\/$/, "")}/admin/orders/${select.dataset.orderId}/status`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ status: select.value }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not update the order.");
    allOrders = allOrders.map((order) => order.id === data.order.id ? data.order : order); renderOrders(); setMessage(dashboardMessage, "Order updated.");
  } catch (error) { setMessage(dashboardMessage, error.message, true); select.disabled = false; }
});

start();
