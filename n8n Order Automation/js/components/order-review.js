import { getCart, getCustomerInfo, getCartTotal, setView, clearCart, setOrderResult, setIsSubmitting, getCurrentView } from '../state.js';
import { submitOrder } from '../api.js';
import { CONFIG } from '../config.js';

export function render(container) {
  container.innerHTML = `
    <div class="page-overlay" id="review-overlay">
      <div class="page-overlay__container">
        <button class="page-overlay__back" data-action="back-to-checkout">← Back to Checkout</button>
        <h2 style="font-family:var(--font-heading);font-size:1.75rem;margin-bottom:24px">Order Summary</h2>
        
        <div class="review-section">
          <h3 class="review-section__title">Order Items</h3>
          <div id="review-items-list"></div>
          <div class="review-total">
            <span>Total</span>
            <span class="review-total__price">$0.00</span>
          </div>
        </div>

        <div class="review-section">
          <h3 class="review-section__title">Customer</h3>
          <div class="review-info">
            <div class="review-info__row"><span>Name</span><span id="review-name"></span></div>
            <div class="review-info__row"><span>Phone</span><span id="review-phone"></span></div>
          </div>
        </div>

        <div class="review-section" id="review-delivery-section">
          <h3 class="review-section__title" id="review-order-type">Delivery</h3>
          <div class="review-info">
            <div class="review-info__row" id="review-address-row"><span>Address</span><span id="review-address"></span></div>
          </div>
        </div>

        <div class="error-card" id="review-error-card" style="display:none;margin-top:20px">
          <div class="error-card__icon">⚠️</div>
          <h3 class="error-card__title" id="review-error-title"></h3>
          <p class="error-card__message" id="review-error-msg"></p>
        </div>

        <button class="btn btn--primary btn--full" id="confirm-order-btn" data-action="confirm-order" style="margin-top:24px">Confirm Order</button>
      </div>
    </div>
  `;

  document.addEventListener('view-changed', () => {
    const view = getCurrentView();
    if (view === 'review') {
      populateReviewData();
      show();
    } else {
      hide();
    }
  });

  container.querySelector('#confirm-order-btn').addEventListener('click', async (e) => {
    const btn = e.currentTarget || e.target.closest('#confirm-order-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner" style="width:18px;height:18px;border-width:2px"></span> Sending to restaurant...';
    setIsSubmitting(true);
    
    const cart = getCart();
    const customerInfo = getCustomerInfo();
    const total = getCartTotal();

    // Hide previous errors
    const errorCard = document.getElementById('review-error-card');
    errorCard.style.display = 'none';

    try {
      // Send to n8n — ALL validation happens there
      const response = await submitOrder({ cart, customerInfo, total });
      
      if (response.success) {
        // n8n validated OK → order saved to Google Sheets → email sent
        setIsSubmitting(false);
        setOrderResult(response);
        clearCart();
        setView('confirmation');
      } else {
        setIsSubmitting(false);
        handleN8nError(response, btn);
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error('[Order] Error:', error);
      showReviewError('Connection Error', "Couldn't reach the restaurant. Please try again.");
      btn.disabled = false;
      btn.textContent = 'Confirm Order';
    } finally {
    }
  });
}

function handleN8nError(response, btn) {
  const { error, message, field } = response;

  // Field-level errors → go back to checkout and highlight the field
  if (field === 'phone' || field === 'name' || field === 'address') {
    // Navigate back to checkout
    setView('checkout');
    // Dispatch event so checkout.js highlights the right field
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('checkout-field-error', {
        detail: { field, message }
      }));
    }, 100);
    btn.disabled = false;
    btn.textContent = 'Confirm Order';
    return;
  }

  // Cart/item errors → show on review page
  if (error === 'ITEM_OUT_OF_STOCK') {
    showReviewError('Item Unavailable', message || 'An item is out of stock. Please update your cart.');
  } else if (error === 'EMPTY_CART') {
    showReviewError('Cart Empty', message || 'Your cart is empty.');
    setTimeout(() => setView('menu'), 2000);
  } else {
    showReviewError('Order Error', message || 'Something went wrong. Please try again.');
  }

  btn.disabled = false;
  btn.textContent = 'Confirm Order';
}

function showReviewError(title, message) {
  const errorCard = document.getElementById('review-error-card');
  if (errorCard) {
    errorCard.style.display = 'block';
    document.getElementById('review-error-title').textContent = title;
    document.getElementById('review-error-msg').textContent = message;
  }
}

function populateReviewData() {
  const container = document.getElementById('review-overlay');
  if (!container) return;
  
  const cart = getCart();
  const customerInfo = getCustomerInfo();
  const total = getCartTotal();

  // Reset state
  const errorCard = document.getElementById('review-error-card');
  if (errorCard) errorCard.style.display = 'none';
  const confirmBtn = document.getElementById('confirm-order-btn');
  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirm Order';
  }

  const itemsList = container.querySelector('#review-items-list');
  itemsList.innerHTML = cart.map(c => `
    <div class="review-item">
      <span>
        <span class="review-item__name">${c.item.name}</span>
        <span class="review-item__qty">× ${c.quantity}</span>
      </span>
      <span class="review-item__price">${CONFIG.CURRENCY_SYMBOL}${(c.item.price * c.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  container.querySelector('.review-total__price').textContent = `${CONFIG.CURRENCY_SYMBOL}${total.toFixed(2)}`;
  container.querySelector('#review-name').textContent = customerInfo.name;
  container.querySelector('#review-phone').textContent = customerInfo.phone;
  
  const deliverySection = container.querySelector('#review-delivery-section');
  const orderTypeTitle = container.querySelector('#review-order-type');
  
  if (customerInfo.orderType === 'delivery') {
    orderTypeTitle.textContent = 'Delivery';
    deliverySection.querySelector('.review-info').innerHTML = `
      <div class="review-info__row"><span>Address</span><span>${customerInfo.address}</span></div>
    `;
    deliverySection.style.display = 'block';
  } else {
    orderTypeTitle.textContent = 'Pickup';
    deliverySection.querySelector('.review-info').innerHTML = `
      <div class="review-info__row"><span>Location</span><span>Pick up at restaurant</span></div>
    `;
    deliverySection.style.display = 'block';
  }
}

export function show() {
  const overlay = document.getElementById('review-overlay');
  if (overlay) overlay.classList.add('active');
}

export function hide() {
  const overlay = document.getElementById('review-overlay');
  if (overlay) overlay.classList.remove('active');
}
