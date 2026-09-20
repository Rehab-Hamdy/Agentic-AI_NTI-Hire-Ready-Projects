import { getCartCount } from '../state.js';

export function render(container) {
  container.innerHTML = `
    <div class="header__logo">
      <span class="logo-icon">🍽️</span>
      <span>Flavour House</span>
    </div>
    <nav class="header__nav">
      <button class="header__nav-link" data-action="scroll-menu">Menu</button>
      <button class="header__cart-btn" data-action="toggle-mobile-cart">
        🛒 Cart
        <span class="header__cart-badge" data-count="0">0</span>
      </button>
    </nav>
  `;

  document.addEventListener('cart-updated', updateCartBadge);
  updateCartBadge();
}

export function updateCartBadge() {
  const badge = document.querySelector('.header__cart-badge');
  if (badge) {
    const count = getCartCount();
    badge.textContent = count;
    badge.dataset.count = count;
  }
}
