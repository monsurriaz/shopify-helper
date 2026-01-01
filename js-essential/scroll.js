// Scroll to a specific section smoothly and center it in the viewport

const button = document.querySelector('[data-sticky-atc-btn]');
button.addEventListener('click', () => {
  const productForm = document.querySelector('form[action="/cart/add"]');
  if (productForm) {
    productForm.scrollIntoView({ behavior: 'smooth', block: 'center' });  // Scroll to product form smoothly and center it in the viewport
  }
});