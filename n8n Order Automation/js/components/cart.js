import { getCart, getCartCount, getCartTotal, setView } from '../state.js';
import { CONFIG } from '../config.js';
import { renderCartItem } from './cart-item.js';

export function renderCart(container) {
  container.innerHTML = `
    <div class="cart-sidebar" id="cart-sidebar">
      <div class="cart-sidebar__title">
        <span>Your Order</span>
        <span class="cart-sidebar__count">0 items</span>
      </div>
      <div class="cart-sidebar__empty">
        <div style="font-size:3rem;margin-bottom:12px">🛒</div>
        <p>Your cart is empty</p>
        <p style="font-size:0.85rem;margin-top:4px">Browse the menu and add some items!</p>
      </div>
      <div class="cart-sidebar__items" id="cart-items-list"></div>
      <div class="cart-summary">
        <div class="cart-summary__row">
          <span>Subtotal</span>
          <span class="cart-summary__subtotal">${CONFIG.CURRENCY_SYMBOL}0.00</span>
        </div>
        <div class="cart-summary__row cart-summary__row--total">
          <span>Total</span>
          <span class="cart-summary__total-price">${CONFIG.CURRENCY_SYMBOL}0.00</span>
        </div>
      </div>
      <button class="btn btn--primary btn--full" style="margin-top:16px" data-action="checkout" disabled>Checkout</button>
    </div>
  `;

  document.addEventListener('cart-updated', () => refreshCart(container));
  refreshCart(container);
}

export function renderMobileCartBtn(container) {
  container.innerHTML = `
    <button class="mobile-cart-btn" id="mobile-cart-btn" data-action="toggle-mobile-cart">
      🛒
      <span class="mobile-cart-btn__badge">0</span>
    </button>
    <div class="mobile-cart-panel" id="mobile-cart-panel">
      <div class="mobile-cart-panel__handle"></div>
      <div class="cart-sidebar" id="mobile-cart-sidebar-content"></div>
    </div>
  `;
  
  document.addEventListener('cart-updated', () => refreshMobileCart(container));
  refreshMobileCart(container);
}

export function refreshCart(container = document) {
  const sidebar = container.querySelector('#cart-sidebar');
  if (!sidebar) return;

  const cart = getCart();
  const count = getCartCount();
  const total = getCartTotal();

  sidebar.querySelector('.cart-sidebar__count').textContent = `${count} items`;
  
  const emptyView = sidebar.querySelector('.cart-sidebar__empty');
  const itemsView = sidebar.querySelector('.cart-sidebar__items');
  const summaryView = sidebar.querySelector('.cart-summary');
  const checkoutBtn = sidebar.querySelector('[data-action="checkout"]');

  if (count === 0) {
    emptyView.style.display = 'block';
    itemsView.style.display = 'none';
    summaryView.style.display = 'none';
    checkoutBtn.disabled = true;
  } else {
    emptyView.style.display = 'none';
    itemsView.style.display = 'block';
    summaryView.style.display = 'block';
    checkoutBtn.disabled = false;
    
    itemsView.innerHTML = cart.map(renderCartItem).join('');
    sidebar.querySelector('.cart-summary__subtotal').textContent = `${CONFIG.CURRENCY_SYMBOL}${total.toFixed(2)}`;
    sidebar.querySelector('.cart-summary__total-price').textContent = `${CONFIG.CURRENCY_SYMBOL}${total.toFixed(2)}`;
  }
}

export function refreshMobileCart(container = document) {
  const badge = container.querySelector('.mobile-cart-btn__badge');
  if (badge) {
    badge.textContent = getCartCount();
  }
  const panelContent = container.querySelector('#mobile-cart-sidebar-content');
  if (panelContent) {
    const cart = getCart();
    const count = getCartCount();
    const total = getCartTotal();
    
    panelContent.innerHTML = `
      <div class="cart-sidebar__title">
        <span>Your Order</span>
        <span class="cart-sidebar__count">${count} items</span>
      </div>
      ${count === 0 ? `
      <div class="cart-sidebar__empty">
        <div style="font-size:3rem;margin-bottom:12px">🛒</div>
        <p>Your cart is empty</p>
        <p style="font-size:0.85rem;margin-top:4px">Browse the menu and add some items!</p>
      </div>` : `
      <div class="cart-sidebar__items" id="mobile-cart-items-list">
        ${cart.map(renderCartItem).join('')}
      </div>
      <div class="cart-summary">
        <div class="cart-summary__row">
          <span>Subtotal</span>
          <span>${CONFIG.CURRENCY_SYMBOL}${total.toFixed(2)}</span>
        </div>
        <div class="cart-summary__row cart-summary__row--total">
          <span>Total</span>
          <span class="cart-summary__total-price">${CONFIG.CURRENCY_SYMBOL}${total.toFixed(2)}</span>
        </div>
      </div>
      <button class="btn btn--primary btn--full" style="margin-top:16px" data-action="checkout">Checkout</button>
      `}
    `;
  }
}
