function formatPrice(input, formatString) {
  // Step 1: Normalize the input number
  let num = typeof input === 'string' ? parseFloat(input.replace(',', '.')) : input;
  if (isNaN(num)) return '';

  // Step 2: Use passed formatString or fallback to DOM
  if (!formatString) {
    let el = document.querySelector('.quantity-break__option input');
    if (el) formatString = el.dataset.price;
    else return num.toFixed(2);
  }

  // Step 3: Extract currency symbol and style
  const match = formatString.match(/([^0-9.,]*)([\d.,]+)([^0-9.,]*)/);
  if (!match) return num.toFixed(2);

  const prefix = match[1]; // e.g. "$", "Tk ", "€"
  const originalNumber = match[2]; // e.g. "1,234.56" or "1.234,56"
  const suffix = match[3]; // e.g. "", " BDT", etc.

  // Step 4: Detect separator style
  const useCommaAsDecimal = originalNumber.includes(',') && originalNumber.indexOf(',') > originalNumber.indexOf('.');
  const decimalSeparator = useCommaAsDecimal ? ',' : '.';
  const thousandSeparator = useCommaAsDecimal ? '.' : ',';

  // Step 5: Format number with 2 decimals and thousands separator
  const parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator); // Add thousands sep
  const final = parts.join(decimalSeparator); // Add decimal sep

  // Step 6: Return combined
  return `${prefix}${final}${suffix}`;
}
