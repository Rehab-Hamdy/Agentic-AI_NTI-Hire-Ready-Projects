import { render as renderHeader } from './components/header.js';
import { render as renderMenu } from './components/menu.js';
import { render as renderItemModal } from './components/menu-item-modal.js';
import { renderCart, renderMobileCartBtn } from './components/cart.js';
import { render as renderCheckout } from './components/checkout.js';
import { render as renderOrderReview } from './components/order-review.js';
import { render as renderOrderConfirmation } from './components/order-confirmation.js';
import { getCart, updateCartItemQuantity, removeFromCart, clearCart, setView, getCurrentView } from './state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Render header
  const appHeader = document.getElementById('app-header');
  appHeader.classList.add('header');
  renderHeader(appHeader);

  // Render menu
  const menuContainer = document.getElementById('menu-container');
  renderMenu(menuContainer);

  // Render desktop cart sidebar
  const cartSidebarContainer = document.getElementById('cart-sidebar-container');
  renderCart(cartSidebarContainer);

  // Render mobile cart button + panel
  const mobileCartContainer = document.getElementById('mobile-cart-container');
  renderMobileCartBtn(mobileCartContainer);

  // Render item modal in its own container
  const itemModalContainer = document.getElementById('item-modal-container');
  renderItemModal(itemModalContainer);

  // Render page overlays
  const overlaysContainer = document.getElementById('overlays-container');

  const checkoutContainer = document.createElement('div');
  renderCheckout(checkoutContainer);
  overlaysContainer.appendChild(checkoutContainer);

  const reviewContainer = document.createElement('div');
  renderOrderReview(reviewContainer);
  overlaysContainer.appendChild(reviewContainer);

  const confirmationContainer = document.createElement('div');
  renderOrderConfirmation(confirmationContainer);
  overlaysContainer.appendChild(confirmationContainer);

  // Global event delegation for data-action buttons
  document.body.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    
    const action = actionBtn.dataset.action;
    
    // Navigation actions
    if (action === 'scroll-menu') {
      const menuSection = document.getElementById('menu-section');
      if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (action === 'toggle-mobile-cart') {
      const panel = document.getElementById('mobile-cart-panel');
      if (panel) {
        panel.classList.toggle('active');
        document.body.classList.toggle('no-scroll', panel.classList.contains('active'));
      }
    }

    if (action === 'checkout') {
      // Close mobile cart panel if open
      const panel = document.getElementById('mobile-cart-panel');
      if (panel) {
        panel.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
      setView('checkout');
    }

    if (action === 'back-to-menu') {
      setView('menu');
    }

    if (action === 'back-to-checkout') {
      setView('checkout');
    }

    if (action === 'new-order') {
      clearCart();
      setView('menu');
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Cart item actions — use parseInt since IDs are numbers
    if (action === 'cart-increase' || action === 'cart-decrease' || action === 'cart-remove') {
      const id = parseInt(actionBtn.dataset.id, 10);
      const cart = getCart();
      const entry = cart.find(c => c.item.id === id);
      if (!entry) return;

      if (action === 'cart-increase') {
        updateCartItemQuantity(id, entry.quantity + 1);
      } else if (action === 'cart-decrease') {
        if (entry.quantity > 1) {
          updateCartItemQuantity(id, entry.quantity - 1);
        } else {
          removeFromCart(id);
        }
      } else if (action === 'cart-remove') {
        removeFromCart(id);
      }
    }
  });

  // Handle keyboard: close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('item-modal-overlay');
      if (modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
      const panel = document.getElementById('mobile-cart-panel');
      if (panel && panel.classList.contains('active')) {
        panel.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    }
  });
});
