// @ts-nocheck
class QuickviewProduct extends HTMLElement {
  constructor() {
    super();
    this.handleAddToCart = this.handleAddToCart.bind(this);
  }

  connectedCallback() {
    this.addButton = this.querySelector('[data-add-to-cart]');
    this.closeButtons = this.querySelectorAll('[data-quickview-close], .quickview_overlay');

    if (!this.addButton) {
      return;
    }

    this.addButton.addEventListener('click', this.handleAddToCart);
    this.closeButtons.forEach(button => {
      button.addEventListener('click', this.closeDrawer.bind(this));
    });
  }

  disconnectedCallback() {
    if (this.addButton) {
      this.addButton.removeEventListener('click', this.handleAddToCart);
    }
    this.closeButtons.forEach(button => {
      button.removeEventListener('click', this.closeDrawer.bind(this));
    })
  }

  openCartDrawer() {
    const drawerButton = document.querySelector('.cart-drawer .header-actions__action');
    setTimeout(() => {
      drawerButton?.click();
    }, 400);
  }

  closeDrawer() {
    document.querySelector('.quickview-sidebar').classList.remove('active');
    document.querySelector('.quickview_overlay').classList.remove('active');
    document.body.classList.remove('scroll_hidden');
    this.openCartDrawer();
  }

  handleAddToCart(event) {
    event.preventDefault();

    const variantId = this.addButton.dataset.variantId;
    const quantity = 1;

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        id: variantId,
        quantity: quantity
      })
    })
      .then(res => {
        return res.json();
      })
      .then(data => {
        this.addButton.innerHTML = 'Added to cart';
        this.rerenderCart();
      })
      .catch(() => {
        console.error("Failed to add item to cart.");
      });
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
        if (!cartDrawer) {
          return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data[sectionId];

        const newContent = tempDiv.querySelector('.cart-drawer__inner');
        if (!newContent) {
          return;
        }

        // Update the cart drawer content
        cartDrawer.innerHTML = newContent.innerHTML;
      })
      .catch(() => {
        console.error("Failed to update cart drawer.");
      })
      .finally(() => {
        this.closeDrawer();
      });
  }
}

if (!customElements.get('quickview-product')) {
customElements.define('quickview-product', QuickviewProduct);
}
