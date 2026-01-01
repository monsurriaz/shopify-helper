// Show sticky add to cart bar on scroll when main add to cart button is out of view

document.addEventListener('DOMContentLoaded', () => {
  const mainAddToCartBtn = document.querySelector('[data-sticky-atc-listener]'),
  stickyBar = document.querySelector('.product__sticky-atc');

  if (stickyBar) {
    document.addEventListener('scroll', () => {
      let bottomPos = mainAddToCartBtn.getBoundingClientRect().top - 0;
      if (bottomPos < 0) {
        stickyBar.classList.add('visible');
      } else {
        if (stickyBar.classList.contains('visible')) {
          stickyBar.classList.remove('visible');
        }
      }
    });
  }
});
