let cart = [];
let currentView = 'menu';
let customerInfo = { name: '', phone: '', orderType: '', address: '' };
let orderResult = null;
let isSubmitting = false;

function dispatchCartUpdated() {
  document.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart } }));
}

export function getCart() {
  return cart;
}

export function addToCart(menuItem, quantity) {
  const existing = cart.find(entry => entry.item.id === menuItem.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ item: menuItem, quantity });
  }
  dispatchCartUpdated();
}

export function updateCartItemQuantity(itemId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(itemId);
    return;
  }
  const existing = cart.find(entry => entry.item.id === itemId);
  if (existing) {
    existing.quantity = newQuantity;
    dispatchCartUpdated();
  }
}

export function removeFromCart(itemId) {
  cart = cart.filter(entry => entry.item.id !== itemId);
  dispatchCartUpdated();
}

export function getCartTotal() {
  const total = cart.reduce((sum, entry) => sum + (entry.item.price * entry.quantity), 0);
  return Math.round(total * 100) / 100;
}

export function getCartCount() {
  return cart.reduce((sum, entry) => sum + entry.quantity, 0);
}

export function clearCart() {
  cart = [];
  dispatchCartUpdated();
}

export function getCustomerInfo() {
  return customerInfo;
}

export function setCustomerInfo(info) {
  customerInfo = { ...customerInfo, ...info };
}

export function getOrderResult() {
  return orderResult;
}

export function setOrderResult(result) {
  orderResult = result;
  document.dispatchEvent(new CustomEvent('order-result-changed', { detail: { orderResult } }));
}

export function getCurrentView() {
  return currentView;
}

export function setView(viewName) {
  currentView = viewName;
  document.dispatchEvent(new CustomEvent('view-changed', { detail: { view: viewName } }));
}

export function getIsSubmitting() {
  return isSubmitting;
}

export function setIsSubmitting(bool) {
  isSubmitting = bool;
  document.dispatchEvent(new CustomEvent('is-submitting-changed', { detail: { isSubmitting } }));
}
