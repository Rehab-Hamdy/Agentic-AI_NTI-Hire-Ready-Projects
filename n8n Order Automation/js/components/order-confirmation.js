import { getCurrentView, getOrderResult, getIsSubmitting } from '../state.js';
import { CONFIG } from '../config.js';

export function render(container) {
  container.innerHTML = `
    <div class="page-overlay" id="confirmation-overlay">
      <div class="page-overlay__container" id="confirmation-content">
      </div>
    </div>
  `;

  document.addEventListener('view-changed', updateView);
  document.addEventListener('order-result-changed', updateView);
  document.addEventListener('is-submitting-changed', updateView);
}

function updateView() {
  const view = getCurrentView();
  if (view === 'confirmation') {
    renderContent();
    show();
  } else {
    hide();
  }
}

function renderContent() {
  const container = document.getElementById('confirmation-content');
  if (!container) return;

  const isSubmitting = getIsSubmitting();
  const result = getOrderResult();

  if (isSubmitting) {
    container.innerHTML = `
      <div class="loading-overlay">
        <div class="loading-spinner" style="width:48px;height:48px;border-width:4px"></div>
        <p class="loading-overlay__text">Placing your order...</p>
      </div>
    `;
    return;
  }

  if (result && result.success) {
    container.innerHTML = `
      <div class="order-confirmation" style="text-align: center; padding: 24px 16px;">
        <div class="confirmation__icon" style="color:var(--success); font-size: 3.5rem; margin-bottom: 16px;">✓</div>
        <h2 class="confirmation__title" style="font-family:var(--font-heading); font-size: 1.8rem; margin-bottom: 12px;">Order Placed Successfully!</h2>
        <p class="confirmation__message" style="color:var(--text-muted); font-size: 1rem; line-height: 1.6; margin-bottom: 24px;">
          Your order has been received and is being prepared by our kitchen.
        </p>
        <button class="btn btn--primary" data-action="new-order" style="margin-top:16px">Place New Order</button>
      </div>
    `;
  } else if (result && !result.success) {
    container.innerHTML = `
      <div class="order-confirmation">
        <div class="error-card">
          <div class="error-card__icon">❌</div>
          <h3 class="error-card__title">Order Failed</h3>
          <p class="error-card__message">${result.message || 'Something went wrong. Please try again.'}</p>
          <button class="btn btn--primary" data-action="new-order">Try Again</button>
        </div>
      </div>
    `;
  }
}

export function show() {
  const overlay = document.getElementById('confirmation-overlay');
  if (overlay) overlay.classList.add('active');
}

export function hide() {
  const overlay = document.getElementById('confirmation-overlay');
  if (overlay) overlay.classList.remove('active');
}
