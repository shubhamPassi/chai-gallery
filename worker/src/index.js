import { menu } from "../../js/catalog.js";

const MAX_ITEM_QUANTITY = 10;
const DELIVERY_ZONES = {
  "110018": { fee: 20, label: "Nearby delivery · ₹20" },
  "110027": { fee: 30, label: "Standard delivery · ₹30" },
  "110046": { fee: 30, label: "Standard delivery · ₹30" },
  "110058": { fee: 20, label: "Nearby delivery · ₹20" },
  "110064": { fee: 20, label: "Nearby delivery · ₹20" }
};

const products = new Map();
for (const category of menu) {
  category.items.forEach((item, itemIndex) => {
    const prices = item.prices || [item.price];
    prices.forEach((price, variantIndex) => {
      const amount = Number(String(price).replace(/[^0-9]/g, ""));
      if (Number.isFinite(amount) && amount > 0) {
        const id = `${category.id}:${itemIndex}:${variantIndex}`;
        products.set(id, { id, name: item.name, category: category.title, variant: category.sizeLabels?.[variantIndex] || null, amount });
      }
    });
  });
}

const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...headers } });

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = String(env.ALLOWED_ORIGINS || "https://www.chaigallery.in,https://chaigallery.in").split(",").map((value) => value.trim());
  return allowed.includes(origin) ? { "Access-Control-Allow-Origin": origin, Vary: "Origin", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" } : {};
}

function validCustomer(customer) {
  if (!customer || typeof customer !== "object") return false;
  return [customer.name, customer.address].every((value) => typeof value === "string" && value.trim().length > 1)
    && /^\d{10}$/.test(String(customer.phone || ""))
    && /^\d{6}$/.test(String(customer.pincode || ""));
}

function calculateItems(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 25) throw new Error("Your cart is empty or invalid.");
  const consolidated = new Map();
  for (const line of items) {
    const product = products.get(line?.id);
    const quantity = Number(line?.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QUANTITY) throw new Error("One or more menu items are invalid.");
    consolidated.set(product.id, (consolidated.get(product.id) || 0) + quantity);
  }
  const lines = [...consolidated].map(([id, quantity]) => {
    if (quantity > MAX_ITEM_QUANTITY) throw new Error("Maximum 10 of each item per order.");
    const product = products.get(id);
    return { ...product, quantity, lineTotal: product.amount * quantity };
  });
  return { lines, subtotal: lines.reduce((sum, line) => sum + line.lineTotal, 0) };
}

function basicAuth(keyId, secret) {
  return `Basic ${btoa(`${keyId}:${secret}`)}`;
}

async function razorpay(path, env, init = {}) {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, { ...init, headers: { Authorization: basicAuth(env.RAZORPAY_KEY_ID, env.RAZORPAY_KEY_SECRET), "Content-Type": "application/json", ...(init.headers || {}) } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.description || "Payment gateway request failed.");
  return body;
}

async function supabase(path, env, init = {}) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation", ...(init.headers || {}) } });
  if (!response.ok) throw new Error("Order record could not be saved.");
  return response.status === 204 ? null : response.json();
}

async function hmacHex(value, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function equalHex(left, right) {
  if (typeof left !== "string" || typeof right !== "string" || left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (!Object.keys(cors).length) return json({ error: "This website is not permitted to use the order API." }, 403);
    if (request.method !== "POST") return json({ error: "Not found." }, 404, cors);
    try {
      if (request.url.endsWith("/create-order")) {
        const { items, customer } = await request.json();
        if (!validCustomer(customer)) return json({ error: "Please complete your name, 10-digit mobile number, address and pincode." }, 400, cors);
        const delivery = DELIVERY_ZONES[String(customer.pincode)];
        if (!delivery) return json({ error: "Sorry, home delivery is not available at this pincode yet." }, 400, cors);
        const { lines, subtotal } = calculateItems(items);
        const orderNumber = `CG${Date.now().toString().slice(-7)}`;
        const receipt = `cg_${crypto.randomUUID().replaceAll("-", "").slice(0, 30)}`;
        const amount = (subtotal + delivery.fee) * 100;
        const razorpayOrder = await razorpay("/orders", env, { method: "POST", body: JSON.stringify({ amount, currency: "INR", receipt, notes: { order_number: orderNumber, pincode: customer.pincode } }) });
        await supabase("orders", env, { method: "POST", body: JSON.stringify({ order_number: orderNumber, razorpay_order_id: razorpayOrder.id, receipt, status: "pending_payment", customer_name: customer.name.trim(), customer_phone: customer.phone, delivery_address: customer.address.trim(), landmark: String(customer.landmark || "").trim() || null, pincode: customer.pincode, instructions: String(customer.instructions || "").trim() || null, items: lines, subtotal, delivery_fee: delivery.fee, total: subtotal + delivery.fee }) });
        return json({ keyId: env.RAZORPAY_KEY_ID, orderId: razorpayOrder.id, amount, deliveryFee: delivery.fee, deliveryLabel: delivery.label }, 200, cors);
      }
      if (request.url.endsWith("/verify-payment")) {
        const payment = await request.json();
        const { razorpay_payment_id: paymentId, razorpay_order_id: orderId, razorpay_signature: signature } = payment;
        if (![paymentId, orderId, signature].every((value) => typeof value === "string")) return json({ error: "Invalid payment verification response." }, 400, cors);
        const generated = await hmacHex(`${orderId}|${paymentId}`, env.RAZORPAY_KEY_SECRET);
        if (!equalHex(generated, signature)) return json({ error: "Payment signature could not be verified. Your order was not confirmed." }, 400, cors);
        const paidPayment = await razorpay(`/payments/${encodeURIComponent(paymentId)}`, env);
        if (paidPayment.order_id !== orderId || paidPayment.status !== "captured") return json({ error: "Payment is not captured yet. Please do not place the order again; contact the cafe if you were charged." }, 409, cors);
        const updated = await supabase(`orders?razorpay_order_id=eq.${encodeURIComponent(orderId)}&status=eq.pending_payment`, env, { method: "PATCH", body: JSON.stringify({ status: "paid", razorpay_payment_id: paymentId, paid_at: new Date().toISOString() }) });
        const record = updated?.[0];
        if (!record) return json({ error: "We could not confirm this order. Please contact the cafe with your payment ID." }, 409, cors);
        return json({ orderNumber: record.order_number }, 200, cors);
      }
      return json({ error: "Not found." }, 404, cors);
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Order service is unavailable." }, 500, cors);
    }
  }
};
