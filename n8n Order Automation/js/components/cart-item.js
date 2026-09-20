import { CONFIG } from '../config.js';

export function renderCartItem(cartEntry) {
  const { item, quantity } = cartEntry;
  const lineTotal = (item.price * quantity).toFixed(2);
  const unitPrice = item.price.toFixed(2);
  
  return `
    <div class="cart-item" data-item-id="${item.id}">
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__unit-price">${CONFIG.CURRENCY_SYMBOL}${unitPrice} each</div>
      </div>
      <div class="cart-item__controls">
        <button class="cart-item__qty-btn" data-action="cart-decrease" data-id="${item.id}">−</button>
        <span class="cart-item__qty">${quantity}</span>
        <button class="cart-item__qty-btn" data-action="cart-increase" data-id="${item.id}">+</button>
      </div>
      <div class="cart-item__price">${CONFIG.CURRENCY_SYMBOL}${lineTotal}</div>
      <button class="cart-item__remove" data-action="cart-remove" data-id="${item.id}" title="Remove">✕</button>
    </div>
  `;
}
