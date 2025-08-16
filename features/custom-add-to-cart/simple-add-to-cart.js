// @ts-nocheck
class CustomAddToCart extends HTMLElement {
  constructor() {
    super();
    // hold references (better than re-querying every time)
    this.atcButton = this.querySelector('[data-atc-button]'); // ✅ scoped to inside custom element
    this.productData = JSON.parse(document.querySelector('#product-data').textContent); // ✅ from outside
  }

  connectedCallback() {
    // Setup events
    this.initAtcClick();
  }

  disconnectedCallback() {
    // cleanup if needed later (optional)
    this.atcButton?.removeEventListener('click', this.handleAtcClick);
  }

  // variant should have variants value as input and type radio
  getSelectedOptions() {
    const group = document.querySelector(`.variant-picker__form`);
    const fieldsets = group.querySelectorAll('fieldset');
    let selected = [];

    fieldsets.forEach(fieldset => {
      const checked = fieldset.querySelector('input:checked');
      if (checked) selected.push(checked.value.trim());
    });
    return selected;
  }

  findVariantIdByTitle(optionsArray) {
    const title = optionsArray.join(' / ');
    const variant = this.productData.variants.find(v => v.title === title);
    return variant ? variant.id : null;
  }

  rerenderCart() {
    // get the original section id so that we can get schema settings
    const sectionId = document.querySelector('#header-component').dataset.sectionId;
    
    fetch(`/?sections=${sectionId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Cart fetch failed with ${res.status}`);
        return res.json();
      })
      .then(data => {
        const cartDrawer = document.querySelector('.cart-drawer__inner');
        if (!cartDrawer) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data[sectionId];

        const newContent = tempDiv.querySelector('.cart-drawer__inner');
        if (!newContent) return;

        cartDrawer.innerHTML = newContent.innerHTML;
      })
      .catch(() => {
        console.error("Failed to update cart drawer.");
      });
  }

  openCartDrawer() {
    const drawerButton = document.querySelector('.cart-drawer .header-actions__action');
    // if no upsell is enabled, then open the cart drawer.
    if (this.atcButton.getAttribute('skip-upsell-drawer') === 'true') {
      setTimeout(() => {
        drawerButton?.click();
      }, 500);
    }
  }

  // -------------------
  // Main ATC click
  // -------------------

  initAtcClick() {
    this.atcButton.addEventListener('click', (e) => this.handleAtcClick(e));
  }

  handleAtcClick(e) {
    e.preventDefault();

    // Show loading overlay
    this.atcButton.querySelector('.loading-overlay').classList.remove('loader-hidden');

    let itemsToAdd = [];

    const opts = this.getSelectedOptions();
    const variantId1 = this.findVariantIdByTitle(opts);
    if (!variantId1) {
      alert('Please select all options for Product 1');
      return;
    }
    itemsToAdd.push({ id: variantId1, quantity: 1 });

    // Send to cart in one request
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsToAdd })
    })
      .then(res => res.json())
      .then(data => {
        // Hide loading overlay
        this.atcButton.querySelector('.loading-overlay').classList.add('loader-hidden');
        this.atcButton.classList.add('atc-added');
        this.rerenderCart();
      })
      .catch(err => console.error('Error adding to cart:', err))
      .finally(() => {
        setTimeout(() => {
          this.atcButton.classList.remove('atc-added');
        }, 1000);
        // Optional: you can manually remove cart-drawer--empty class if any.
        document.querySelector('.cart-drawer__dialog').classList.remove('cart-drawer--empty');
        this.openCartDrawer();
      });
  }
}

if (!customElements.get('custom-add-to-cart')) {
  customElements.define('custom-add-to-cart', CustomAddToCart);
}
