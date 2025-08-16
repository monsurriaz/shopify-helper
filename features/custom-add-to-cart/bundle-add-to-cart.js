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
    this.initQtyChoice(); 
    this.initAtcClick();
    this.initializeGroups();
  }

  disconnectedCallback() {
    // cleanup if needed later (optional)
    this.atcButton?.removeEventListener('click', this.handleAtcClick);
  }

  // -------------------
  // Helpers
  // -------------------

  initQtyChoice() {
    const qtyChoiceInputs = document.querySelectorAll('#product-quantity-choice input');
    const group2 = document.querySelector('.custom-variant-picker .variant-picker__form[data-group="2"]');

    qtyChoiceInputs.forEach(input => {
      input.addEventListener('change', () => {
        if (input.checked && input.value === "2") {
          group2.style.display = 'block';
        } else if (input.checked && input.value === "1") {
          group2.style.display = 'none';
        }
      });
    });
  }

  initializeGroups() {
    const qtyChoiceInputs = document.querySelectorAll('#product-quantity-choice input');
    const group2 = document.querySelector('.custom-variant-picker .variant-picker__form[data-group="2"]');

    qtyChoiceInputs.forEach(input => {
      if (input.checked && input.value === "2") {
        group2.style.display = 'block';
      } else if (input.checked && input.value === "1") {
        group2.style.display = 'none';
      }
    });
  }

  getSelectedOptions(groupNumber) {
    const group = document.querySelector(`.variant-picker__form[data-group="${groupNumber}"]`);
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

    // Get selected option and variant IDs
    const qtyChoice = document.querySelector('#product-quantity-choice input:checked').value;
    let itemsToAdd = [];

    // Group 1
    const opts1 = this.getSelectedOptions(1);
    const variantId1 = this.findVariantIdByTitle(opts1);
    if (!variantId1) {
      alert('Please select all options for Product 1');
      return;
    }
    itemsToAdd.push({ id: variantId1, quantity: 1 });

    // Group 2 if needed
    if (qtyChoice === "2") {
      const opts2 = this.getSelectedOptions(2);
      const variantId2 = this.findVariantIdByTitle(opts2);
      if (!variantId2) {
        alert('Please select all options for Product 2');
        return;
      }
      itemsToAdd.push({ id: variantId2, quantity: 1 });
    }

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
        document.querySelector('.cart-drawer__dialog').classList.remove('cart-drawer--empty');
        this.openCartDrawer();
      });
  }
}

// Register once
if (!customElements.get('custom-add-to-cart')) {
  customElements.define('custom-add-to-cart', CustomAddToCart);
}
