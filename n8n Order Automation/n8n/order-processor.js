// ============================================
// FLAVOUR HOUSE - ORDER PROCESSING (n8n Code Node)
// ALL validation + order processing happens here.
// The website only collects data — this is the authority.
// ============================================

const MENU = [
  { id: 1, name: "Classic Burger", price: 8, available: true },
  { id: 2, name: "Margherita Pizza", price: 12, available: true },
  { id: 3, name: "French Fries", price: 4, available: true },
  { id: 4, name: "Chicken Meal", price: 10, available: true },
  { id: 5, name: "Caesar Salad", price: 7, available: true },
  { id: 6, name: "Pasta", price: 9, available: true }
];

function fail(error, message, field) {
  return [{ json: { success: false, error, message, field: field || null } }];
}

try {
  // --- Parse incoming webhook data ---
  const input = $input.first().json;
  let body = input;
  if (input && input.body !== undefined) {
    body = input.body;
  }
  if (typeof body === "string") {
    body = JSON.parse(body);
  }

  // --- Validate request structure ---
  if (!body || typeof body !== "object") {
    return fail("INVALID_ORDER", "Invalid request received.");
  }
  if (!body.customer || typeof body.customer !== "object") {
    return fail("INVALID_ORDER", "Missing customer information.", "name");
  }

  const { customer, items, order_type } = body;

  // ============================
  // VALIDATION (all in n8n)
  // ============================

  // 1. Customer name
  if (!customer.name || typeof customer.name !== "string" || customer.name.trim().length < 2) {
    return fail("VALIDATION_ERROR", "Full name is required (minimum 2 characters).", "name");
  }

  // 2. Phone number (Egyptian mobile: 010, 011, 012, 015 + 8 digits)
  const cleanPhone = (customer.phone || "").toString().replace(/[\s\-\(\)]/g, "");
  if (!/^01[0125]\d{8}$/.test(cleanPhone)) {
    return fail("INVALID_PHONE", "Invalid phone number. Enter a valid Egyptian mobile (e.g. 01012345678).", "phone");
  }

  // 3. Order type
  if (!order_type || !["pickup", "delivery"].includes(order_type)) {
    return fail("VALIDATION_ERROR", "Please select Pickup or Delivery.", "order_type");
  }

  // 4. Delivery address
  if (order_type === "delivery" && (!customer.address || customer.address.trim().length < 5)) {
    return fail("VALIDATION_ERROR", "Delivery address is required (minimum 5 characters).", "address");
  }

  // 5. Cart items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return fail("EMPTY_CART", "Your cart is empty. Add items before ordering.", "cart");
  }

  // ============================
  // ITEM VALIDATION & TOTAL
  // ============================
  let total = 0;
  const validatedItems = [];

  for (const item of items) {
    const menuItem = MENU.find(function(m) { return m.id === item.item_id; });

    if (!menuItem) {
      return fail("INVALID_ITEM", "Item #" + item.item_id + " was not found in our menu.", "cart");
    }

    if (!menuItem.available) {
      return fail("ITEM_OUT_OF_STOCK", menuItem.name + " is currently out of stock.", "cart");
    }

    const qty = parseInt(item.quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return fail("VALIDATION_ERROR", "Invalid quantity for " + menuItem.name + ".", "cart");
    }

    const lineTotal = menuItem.price * qty;
    total += lineTotal;
    validatedItems.push({
      name: menuItem.name,
      quantity: qty,
      unit_price: menuItem.price,
      line_total: lineTotal
    });
  }

  // ============================
  // GENERATE ORDER ID
  // ============================
  const now = new Date();
  function pad(n) { return String(n).padStart(2, "0"); }
  const dateStr = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
  const hex = Math.random().toString(16).substring(2, 6).toUpperCase();
  const orderId = "ORD-" + dateStr + "-" + hex;

  // ============================
  // FORMAT FOR STORAGE & EMAIL
  // ============================
  const itemsText = validatedItems.map(function(i) {
    return i.quantity + "x " + i.name + " ($" + i.line_total.toFixed(2) + ")";
  }).join("\n");

  const totalQty = validatedItems.reduce(function(s, i) { return s + i.quantity; }, 0);
  const estimatedTime = Math.min(20 + totalQty * 5, 60);

  const dateFormatted = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) + " " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());

  // Return ALL data needed by Google Sheets, Email, and Frontend
  return [{
    json: {
      success: true,
      order_id: orderId,
      total: total,
      status: "received",
      estimated_time: estimatedTime,
      customer_name: customer.name.trim(),
      customer_phone: cleanPhone,
      order_type: order_type,
      address: order_type === "delivery" ? customer.address.trim() : "N/A (Pickup)",
      items_text: itemsText,
      date: dateFormatted
    }
  }];

} catch (err) {
  return fail("SERVER_ERROR", "Internal server error: " + err.message);
}
