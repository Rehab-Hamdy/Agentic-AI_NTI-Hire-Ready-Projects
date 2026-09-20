import { getMenu } from '../menu-data.js';
import { CONFIG } from '../config.js';

export function render(container) {
  const menuItems = getMenu();
  const menuHtml = menuItems.map(item => `
    <article class="menu-card${!item.available ? ' menu-card--unavailable' : ''}" data-item-id="${item.id}" data-available="${item.available}">
      <div class="menu-card__image-wrap">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <span class="menu-card__badge ${item.available ? 'menu-card__badge--available' : 'menu-card__badge--unavailable'}">${item.available ? 'Available' : 'Sold Out'}</span>
      </div>
      <div class="menu-card__content">
        <h3 class="menu-card__name">${item.name}</h3>
        <p class="menu-card__desc">${item.description}</p>
        <div class="menu-card__footer">
          <span class="menu-card__price">${CONFIG.CURRENCY_SYMBOL}${item.price.toFixed(2)}</span>
          <span class="menu-card__add-hint">${item.available ? 'Add to order →' : ''}</span>
        </div>
      </div>
    </article>
  `).join('');

  container.innerHTML = `
    <section class="hero" id="hero-section">
      <h1>Order Your Favourite Food</h1>
      <p class="hero__subtitle">Fresh ingredients, crafted with care, delivered to your door.</p>
    </section>
    <section id="menu-section">
      <div class="menu-grid">
        ${menuHtml}
      </div>
    </section>
  `;

  const cards = container.querySelectorAll('.menu-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const isAvailable = card.dataset.available === 'true';
      if (isAvailable) {
        const id = parseInt(card.dataset.itemId, 10);
        const item = menuItems.find(i => i.id === id);
        if (item) {
          document.dispatchEvent(new CustomEvent('open-item-modal', { detail: { item } }));
        }
      }
    });
  });
}
