import { setView, setCustomerInfo, getCurrentView } from '../state.js';

export function render(container) {
  container.innerHTML = `
    <div class="page-overlay" id="checkout-overlay">
      <div class="page-overlay__container">
        <button class="page-overlay__back" data-action="back-to-menu">← Back to Menu</button>
        <div class="checkout-form">
          <h2 class="checkout-form__title">Checkout</h2>
          <p class="checkout-form__subtitle">Fill in your details. We'll validate everything when you confirm.</p>
          
          <div class="form-section">
            <h3 class="form-section__title">👤 Customer Information</h3>
            <div class="form-group">
              <label class="form-label" for="customer-name">Full Name</label>
              <input type="text" class="form-input" id="customer-name" placeholder="Enter your full name" autocomplete="name">
              <div class="form-error" id="name-error"></div>
            </div>
            <div class="form-group">
              <label class="form-label" for="customer-phone">Phone Number</label>
              <input type="tel" class="form-input" id="customer-phone" placeholder="01012345678" autocomplete="tel" maxlength="11">
              <div class="form-error" id="phone-error"></div>
              <div class="form-hint">Egyptian mobile number (e.g., 01012345678)</div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="form-section__title">📦 Order Type</h3>
            <div class="radio-group">
              <div class="radio-option">
                <input type="radio" name="order-type" id="order-pickup" value="pickup" checked>
                <label class="radio-option__label" for="order-pickup">
                  <span class="radio-option__icon">🏪</span>
                  <span class="radio-option__text">Pickup</span>
                  <span class="radio-option__desc">Pick up at restaurant</span>
                </label>
              </div>
              <div class="radio-option">
                <input type="radio" name="order-type" id="order-delivery" value="delivery">
                <label class="radio-option__label" for="order-delivery">
                  <span class="radio-option__icon">🚗</span>
                  <span class="radio-option__text">Delivery</span>
                  <span class="radio-option__desc">Deliver to your address</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-section" id="address-section" style="display:none">
            <h3 class="form-section__title">📍 Delivery Address</h3>
            <div class="form-group">
              <label class="form-label" for="customer-address">Address</label>
              <input type="text" class="form-input" id="customer-address" placeholder="Enter your delivery address" autocomplete="street-address">
              <div class="form-error" id="address-error"></div>
            </div>
          </div>

          <button class="btn btn--primary btn--full" id="review-order-btn" data-action="review-order">Review Order</button>
        </div>
      </div>
    </div>
  `;

  const deliveryRadio = container.querySelector('#order-delivery');
  const pickupRadio = container.querySelector('#order-pickup');
  const addressSection = container.querySelector('#address-section');

  deliveryRadio.addEventListener('change', () => {
    if (deliveryRadio.checked) addressSection.style.display = 'block';
  });

  pickupRadio.addEventListener('change', () => {
    if (pickupRadio.checked) addressSection.style.display = 'none';
  });

  const nameInput = container.querySelector('#customer-name');
  const phoneInput = container.querySelector('#customer-phone');
  const addressInput = container.querySelector('#customer-address');

  // Minimal UX checks only — real validation is done by n8n
  function basicCheck() {
    let ok = true;
    clearErrors();

    if (!nameInput.value.trim()) {
      showError(nameInput, 'name-error', 'Please enter your name.');
      ok = false;
    }
    if (!phoneInput.value.trim()) {
      showError(phoneInput, 'phone-error', 'Please enter your phone number.');
      ok = false;
    }
    if (deliveryRadio.checked && !addressInput.value.trim()) {
      showError(addressInput, 'address-error', 'Please enter your delivery address.');
      ok = false;
    }
    return ok;
  }

  function showError(input, errorId, message) {
    const errorEl = container.querySelector('#' + errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('active');
    }
    input.classList.add('form-input--error');
  }

  function clearErrors() {
    container.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
      el.classList.remove('active');
    });
    container.querySelectorAll('.form-input').forEach(el => {
      el.classList.remove('form-input--error');
    });
  }

  // Review button — basic checks, then go to review page
  const reviewBtn = container.querySelector('#review-order-btn');
  reviewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (basicCheck()) {
      setCustomerInfo({
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        orderType: deliveryRadio.checked ? 'delivery' : 'pickup',
        address: deliveryRadio.checked ? addressInput.value.trim() : ''
      });
      setView('review');
    }
  });

  // Listen for n8n validation errors routed back from the review page
  document.addEventListener('checkout-field-error', (e) => {
    const { field, message } = e.detail;
    clearErrors();
    if (field === 'phone') {
      showError(phoneInput, 'phone-error', message);
      phoneInput.focus();
    } else if (field === 'name') {
      showError(nameInput, 'name-error', message);
      nameInput.focus();
    } else if (field === 'address') {
      addressSection.style.display = 'block';
      showError(addressInput, 'address-error', message);
      addressInput.focus();
    }
  });

  // View management
  document.addEventListener('view-changed', () => {
    const view = getCurrentView();
    if (view === 'checkout') {
      show();
    } else {
      hide();
    }
  });
}

export function show() {
  const overlay = document.getElementById('checkout-overlay');
  if (overlay) overlay.classList.add('active');
}

export function hide() {
  const overlay = document.getElementById('checkout-overlay');
  if (overlay) overlay.classList.remove('active');
}
