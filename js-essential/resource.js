// get int value from string
let floatValue = parseFloat(string.replace(/[^0-9.]/g, ''));

// set section's height or width as global css variable. this type of small code can be used inside each section.
document.documentElement.style.setProperty(
  '--announcement-bar-height', 
  `${document.getElementById('shopify-section-{{ section.id }}').clientHeight.toFixed(2)}px`
);

// target multiple elements but different classes/attributes
document.querySelectorAll('.class1, .class2, [data-attribute="value"]')
.forEach((el) => {
  el.addEventListener('click', () => {
    // do something
  });
});

// get the closest parent element with a specific class
let closestElement = document.querySelector('.child-element').closest('.parent-class');

// get the first element with a specific class 
let firstElement = document.querySelector('.specific-class');

// get the last element with a specific class
let allElements = document.querySelectorAll('.specific-class');
let lastElement = allElements[allElements.length - 1];


