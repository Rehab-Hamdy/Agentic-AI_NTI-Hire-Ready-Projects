import { addToCart } from '../state.js';
import { CONFIG } from '../config.js';

let currentItem = null;
let currentQuantity = 1;

export function render(container) {
  container.innerHTML = `
    <div class="modal-overlay" id="item-modal-overlay">
      <div class="item-modal" style="position:relative">
        <button class="item-modal__close" data-action="close-modal">✕</button>
        <img class="item-modal__image" src="" alt="">
        <div class="item-modal__body">
          <h2 class="item-modal__name"></h2>
          <p class="item-modal__desc"></p>
          <div class="item-modal__price">${CONFIG.CURRENCY_SYMBOL}0</div>
          <div class="qty-selector">
            <button class="qty-selector__btn" data-action="qty-decrease">−</button>
            <span class="qty-selector__value">1</span>
            <button class="qty-selector__btn" data-action="qty-increase">+</button>
          </div>
          <p class="item-modal__subtotal">Subtotal: <span>${CONFIG.CURRENCY_SYMBOL}0</span></p>
          <button class="btn btn--primary btn--full" data-action="add-to-cart">Add to Cart</button>
        </div>
      </div>
    </div>
  `;

  const overlay = container.querySelector('#item-modal-overlay');
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  overlay.querySelector('[data-action="close-modal"]').addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
  });

  overlay.querySelector('[data-action="qty-decrease"]').addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentQuantity > 1) {
      currentQuantity--;
      updateDisplay();
    }
  });

  overlay.querySelector('[data-action="qty-increase"]').addEventListener('click', (e) => {
    e.stopPropagation();
    currentQuantity++;
    updateDisplay();
  });

  overlay.querySelector('[data-action="add-to-cart"]').addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentItem) {
      addToCart(currentItem, currentQuantity);
      closeModal();
      showToast(`${currentItem.name} × ${currentQuantity} added to cart`);
    }
  });

  document.addEventListener('open-item-modal', (e) => {
    openModal(e.detail.item);
  });
}

function updateDisplay() {
  const modal = document.querySelector('.item-modal');
  if (modal && currentItem) {
    modal.querySelector('.qty-selector__value').textContent = currentQuantity;
    const subtotal = currentItem.price * currentQuantity;
    modal.querySelector('.item-modal__subtotal span').textContent = CONFIG.CURRENCY_SYMBOL + subtotal.toFixed(2);
  }
}

export function openModal(item) {
  currentItem = item;
  currentQuantity = 1;
  const overlay = document.getElementById('item-modal-overlay');
  const modal = overlay.querySelector('.item-modal');
  
  modal.querySelector('.item-modal__image').src = item.image;
  modal.querySelector('.item-modal__image').alt = item.name;
  modal.querySelector('.item-modal__name').textContent = item.name;
  modal.querySelector('.item-modal__desc').textContent = item.description;
  modal.querySelector('.item-modal__price').textContent = CONFIG.CURRENCY_SYMBOL + item.price.toFixed(2);
  
  updateDisplay();
  
  overlay.classList.add('active');
  document.body.classList.add('no-scroll');
}

export function closeModal() {
  const overlay = document.getElementById('item-modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }
  currentItem = null;
}

function showToast(message) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `<span style="margin-right:8px">✓</span> ${message}`;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: var(--bg-card);
    color: var(--success);
    padding: 14px 24px;
    border-radius: var(--radius-md);
    z-index: 9999;
    font-weight: 600;
    font-size: 0.95rem;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--success-bg);
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
  `;
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
