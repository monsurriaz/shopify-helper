/**
 * @file cart-upsell.js
 * @description This script defines a custom HTML element that enhances the shopping experience by allowing users to add products to their cart and dynamically update the cart drawer without needing to refresh the page. It listens for click events on buttons that trigger adding products to the cart, sends a request to the server, and updates the cart drawer with the latest cart contents.
 * @version 1.0.0
 * @author Monsur Rahman Riaz
 * @license Free to use, but please do not remove this comment.
 */

// @ts-nocheck
class CustomCartUpsell extends HTMLElement {
  constructor() {
    super();
    this.handleAddToCart = this.handleAddToCart.bind(this);
  }
  
  connectedCallback() {
    this.addButtons = this.querySelectorAll('[data-add-to-cart]');
    this.addButtons.forEach(btn => {
      btn.addEventListener('click', this.handleAddToCart);
    });

    this.initSwiper();
  }

  disconnectedCallback() {
    this.addButtons.forEach(btn => {
      btn.removeEventListener('click', this.handleAddToCart);
    });
  }
  
  handleAddToCart(event) {
    event.preventDefault();
    const item = event.currentTarget.closest('.sd-product-single-slide');
    item.querySelector('.loading-overlay').classList.remove('loader-hidden');

    const variantId = event.currentTarget.dataset.variantId;
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
      .then(res => res.json())
      .then(data => {
        item.querySelector('.loading-overlay').classList.add('loader-hidden');
        this.rerenderCart();
      })
      .catch(() => {
        console.error("Failed to add item to cart.");
      });
  }

  rerenderCart() {
    const sectionId = document.querySelector('#header-component').dataset.sectionId;

    // dynamically fetch the cart drawer section
    fetch(`/?sections=${sectionId}`)
      .then(response => response.json())
      .then(data => {
        const cartDrawerInner = document.querySelector('.cart-drawer__inner');
        if (!cartDrawerInner) {
          return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data[sectionId];

        const newContent = tempDiv.querySelector('.cart-drawer__inner');
        if (!newContent) {
          return;
        }

        cartDrawerInner.innerHTML = newContent.innerHTML;
        
        // Swiper might be replaced with new content, so re-init
        this.initSwiper();
      })
      .catch(() => {
        console.error("Failed to update cart drawer.");
      });
  }

  // Sometimes swiper may not be initialized properly due to cart drawer rerendering. that time we need to use mutation observer to reinitialize swiper but in a place where code is not rerendered.
  initSwiper() {
    if (typeof Swiper === 'undefined') {
      console.error("Swiper is not loaded.");
      return;
    }
    
    const sliderEl = this.querySelector('.cart-upsell__slider');
    if (!sliderEl) return;

    // destroy old Swiper instance if exists
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }

    // initialize new Swiper instance
    this.swiper = new Swiper(sliderEl, {
      slidesPerView: 'auto',
      spaceBetween: 4,
      scrollbar: { 
        el: this.querySelector('.cart-upsell__scrollbar'), 
        draggable: true, 
        snapOnRelease: true 
      },
      navigation: { 
        nextEl: this.querySelector('.swiper-button-next'), 
        prevEl: this.querySelector('.swiper-button-prev') 
      }
    });
  }
}

if (!customElements.get('custom-cart-upsell')) {
  customElements.define('custom-cart-upsell', CustomCartUpsell);
}
