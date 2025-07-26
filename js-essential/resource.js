// get int value from string
let floatValue = parseFloat(string.replace(/[^0-9.]/g, ''));

// set section's height or width as global css variable. this type of small code can be used inside each section.
document.documentElement.style.setProperty(
  '--announcement-bar-height', 
  `${document.getElementById('shopify-section-{{ section.id }}').clientHeight.toFixed(2)}px`
);
