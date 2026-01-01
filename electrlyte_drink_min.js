document.addEventListener("DOMContentLoaded", () => {
  const bundleRadios = document.querySelectorAll("[data-bundle-option]");
  const flavorWrappers = document.querySelectorAll("[data-flavor-item]");
  const giftSection = document.querySelector("[data-gift-section]");
  const subscriptionCheckBox = document.querySelector("#auto_refill");
  const mainATC = document.querySelector("[data-main-atc-btn]");
  const remainingQtyText = mainATC.querySelector(".atc-qty-remaining");
  const atcText = mainATC.querySelector(".atc-text");
  const priceAtc = mainATC.querySelector("[data-price-atc]");
  const comparePriceAtc = mainATC.querySelector("[data-compare-price-atc]");

  const mainIdInput = document.querySelector("#main_id input[name='id']");
  const sellingPlanInput = document.querySelector("#selling_plan_input");
  const quantityInput = document.querySelector("#quantity_input");
  const pfATCBtn = document.getElementById("pf-atc-btn");

  let bundleQuantity = getSelectedBundleQty();
  let totalSelectedQty = 0;

  initialize();

  /* ---------------------------------------------------------
    INITIAL SETUP 
  --------------------------------------------------------- */
  function initialize() {
    attachBundleListeners();
    attachVariantListeners();
    manipulatePrice();

    /* NEW: Added subscription listener */
    attachSubscriptionListener();

    /* NEW: Added ATC event listener */
    attachATCListener();

    updateUI();
  }

  /* ---------------------------------------------------------
    BUNDLE LISTENERS
  --------------------------------------------------------- */
  function getSelectedBundleQty() {
    const checked = document.querySelector("[data-bundle-option]:checked");
    return Number(checked?.value || 2);
  }

  function attachBundleListeners() {
    bundleRadios.forEach(radio => {
      radio.addEventListener("change", () => {

        const newBundleQty = Number(radio.value);

        // Update new product's variant id
        updateIDs(radio);

        // When user manually selects a bundle → reset variants 
        resetAllVariants();

        bundleQuantity = newBundleQty;
        updateTotals();
        updateUI();
      });
    });
  }

  /* ---------------------------------------------------------
    VARIANT QTY HANDLING
  --------------------------------------------------------- */
  function attachVariantListeners() {
    flavorWrappers.forEach(wrapper => {
      const addBtn = wrapper.querySelector("[data-variant-add]");
      const qtyInput = wrapper.querySelector("[data-variant-qty]");
      const incBtn = wrapper.querySelector("[data-variant-increase]");
      const decBtn = wrapper.querySelector("[data-variant-decrease]");

      addBtn.addEventListener("click", () => {
        qtyInput.value = 1;
        updateTotals();
        updateUI();
      });

      incBtn.addEventListener("click", () => {
        qtyInput.value = Number(qtyInput.value) + 1;
        updateTotals();
        updateUI();
      });

      decBtn.addEventListener("click", () => {
        qtyInput.value = Math.max(0, Number(qtyInput.value) - 1);
        updateTotals();
        updateUI();
      });
    });
  }
  
  /* ---------------------------------------------------------
    UPDATE TOTALS, switch upper bundle if selected qty exceeds
  --------------------------------------------------------- */
  function updateTotals() {
    totalSelectedQty = [...document.querySelectorAll("[data-variant-qty]")]
      .reduce((sum, input) => sum + Number(input.value), 0);

    // if (totalSelectedQty > 3) resetAll();

    if (totalSelectedQty > bundleQuantity && totalSelectedQty <= 3) {
      bundleQuantity = totalSelectedQty;
      bundleRadios.forEach(r => (r.checked = Number(r.value) === bundleQuantity));

      // Update new product's variant id
      const selectedRadio = document.querySelector('[data-bundle-option]:checked');
      updateIDs(selectedRadio);
    }
  }

  /* ---------------------------------------------------------
    UPDATE NEW VARIANT AND SUBSCRIPTION'S ID
  --------------------------------------------------------- */
  function updateIDs(radio) {
    // Update new product's variant id
    if(!radio) {
      const radio = document.querySelector('[data-bundle-option]:checked');
    }

    const variantIds = JSON.parse(radio.dataset.variants); // array of ids

    flavorWrappers.forEach(wrapper => {
      const i = parseInt(wrapper.dataset.variantIndex);
      const newId = variantIds[i];

      wrapper.dataset.variantId = newId;
    })

    // Update new subscription id
    const subscriptionId = radio.dataset.subscriptionId; 
    subscriptionCheckBox.dataset.sellingPlanId = subscriptionId;
  }


  /* ---------------------------------------------------------
    UPDATE UI
  --------------------------------------------------------- */
  function updateUI() {

    // Flavor qty UI
    flavorWrappers.forEach(wrapper => {
      const qtyInput = wrapper.querySelector("[data-variant-qty]");
      const addBtn = wrapper.querySelector("[data-variant-add]");
      const qtyPicker = wrapper.querySelector(".qty-picker");

      if (Number(qtyInput.value) > 0) {
        addBtn.style.display = "none";
        qtyPicker.style.display = "flex";
      } else {
        addBtn.style.display = "block";
        qtyPicker.style.display = "none";
      }
    });

    // ATC enable
    if (totalSelectedQty >= bundleQuantity) {
      atcText.style.display = "block";
      remainingQtyText.style.display = "none";
      mainATC?.removeAttribute("disabled");
      
    } else {
      mainATC?.setAttribute("disabled", "disabled");
      atcText.style.display = "none";
      remainingQtyText.style.display = "inline-block";
      const remQty = remainingQtyText.querySelector("#rem_qty");
      const remQtyS = remainingQtyText.querySelector("#rem_qty_s");

      remQty.textContent = bundleQuantity - totalSelectedQty;
      remQtyS.style.display = bundleQuantity - totalSelectedQty > 1 ? "inline" : "none";
    }

    // ATC Price update
    if(totalSelectedQty > 3) {
      mainpulateButtonPrice();
    }
    else if(subscriptionCheckBox.checked) {
      const subComPrice = document.querySelector("[data-bundle-option]:checked").dataset.bundleSubComPrice;
      const subPrice = document.querySelector("[data-bundle-option]:checked").dataset.bundleSubPrice;
      comparePriceAtc.textContent = subComPrice;
      priceAtc.textContent = subPrice;
    }
    else {
      const comPrice = document.querySelector("[data-bundle-option]:checked").dataset.bundleComparePrice;
      const price = document.querySelector("[data-bundle-option]:checked").dataset.bundlePrice;
      comparePriceAtc.textContent = comPrice;
      priceAtc.textContent = price;
    }

    updateGifts();
  }

  /* ---------------------------------------------------------
    PRICE FORMATTING FUNCTION
  --------------------------------------------------------- */
  function formatPrice(input, formatString) {
    // Step 1: Normalize the input number
    let num = typeof input === 'string' ? parseFloat(input.replace(',', '.')) : input;
    if (isNaN(num)) return '';

    // Step 2: Use passed formatString or fallback to DOM
    if (!formatString) {
      let el = document.querySelector('[data-price-format]');
      if (el) formatString = el.dataset.priceFormat;
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

  function parseCurrency(str) {
    if (!str) return 0;

    // Step 1: Remove currency symbols and spaces
    str = str.replace(/[^\d.,]/g, "");

    // Step 2: Determine last separator as decimal
    let lastDot = str.lastIndexOf(".");
    let lastComma = str.lastIndexOf(",");

    let decimalSeparator = "";
    if (lastDot > lastComma) decimalSeparator = ".";
    else if (lastComma > lastDot) decimalSeparator = ",";
    
    // Step 3: Remove all other separators
    if (decimalSeparator === ".") str = str.replace(/,/g, "");
    else if (decimalSeparator === ",") str = str.replace(/\./g, "").replace(",", ".");

    // Step 4: Convert to float
    let num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  }


  /* ---------------------------------------------------------
    PRICE MANIPULATION FUNCTION
  --------------------------------------------------------- */
  function manipulatePrice() {
    const subscription = document.querySelector("#auto_refill");
    const labelEl = document.querySelectorAll("[data-bundle-label]");

    if (!labelEl || !subscription) return;

    labelEl.forEach(label => {

      // Raw price string (formatted)
      const basePriceString = label.dataset.price;
      const subPriceString = label.dataset.subscriptionPrice;
      const discountMultiplier = parseFloat(label.querySelector("input").dataset.discountMultiplier);

      // Convert to float
      let baseValue = parseCurrency(basePriceString);
      if (isNaN(baseValue)) return;
      let subValue = parseCurrency(subPriceString);
      if (isNaN(subValue)) return;

      // Bundle quantity
      let qty = parseInt(label.querySelector("input").value, 10);
      if(totalSelectedQty > 3)
        qty = totalSelectedQty;

      if (subscription.checked) {
        const bundleSubEachValue = subValue;
        const bundleSubTotalValue = bundleSubEachValue * qty;
        const bundleSubComTotalValue = bundleSubEachValue * qty / discountMultiplier;

        const formattedPrice = formatPrice(bundleSubEachValue, subPriceString);
        const formattedSubTotal = formatPrice(bundleSubTotalValue, subPriceString);
        const formattedSubComTotal = formatPrice(bundleSubComTotalValue, basePriceString);

        label.querySelector(".checkout__size-price").innerHTML = `${formattedPrice} / each`;
        const input = label.querySelector("input");
        input.dataset.bundlePrice = formattedSubTotal;
        input.dataset.bundleComparePrice = formattedSubComTotal;

        if(input.checked) {
          priceAtc.textContent = formattedSubTotal;
          comparePriceAtc.textContent = formattedSubComTotal;
        }

      } else {
        const bundleEachValue = baseValue;
        const bundleTotalValue = bundleEachValue * qty;
        const bundleComTotalValue = bundleEachValue * qty / discountMultiplier;

        const formatted = formatPrice(bundleEachValue, subPriceString);
        const formattedBundle = formatPrice(bundleTotalValue, subPriceString);
        const formattedCom = formatPrice(bundleComTotalValue, basePriceString);

        label.querySelector(".checkout__size-price").innerHTML = `${formatted} / each`;
        const input = label.querySelector("input");
        input.dataset.bundlePrice = formattedBundle;
        input.dataset.bundleComparePrice = formattedCom;

        if(input.checked) {
          priceAtc.textContent = formattedBundle;
          comparePriceAtc.textContent = formattedCom;
        }
      }
    });
  }

  /* ---------------------------------------------------------
    ATC PRICE MANIPULATION FUNCTION
  --------------------------------------------------------- */
  function mainpulateButtonPrice() {
    const subscription = document.querySelector("#auto_refill");
    const label = document.querySelector("[data-bundle-label]:has([data-bundle-option]:checked)");

    if(!label) return;
    // Raw price string (formatted)
    const basePriceString = label.dataset.price;
    const subPriceString = label.dataset.subscriptionPrice;
    const discountMultiplier = parseFloat(label.querySelector("input").dataset.discountMultiplier);

    // Convert to float
    let baseValue = parseCurrency(basePriceString);
    if (isNaN(baseValue)) return;
    let subValue = parseCurrency(subPriceString);
    if (isNaN(subValue)) return;

    // Bundle quantity
    let qty = parseInt(label.querySelector("input").value, 10);
    if(totalSelectedQty > 3)
      qty = totalSelectedQty;

    if (subscription.checked) {
      const bundleSubEachValue = subValue;
      const bundleSubTotalValue = bundleSubEachValue * qty;
      const bundleSubComTotalValue = bundleSubEachValue * qty / discountMultiplier;

      const formattedSubTotal = formatPrice(bundleSubTotalValue, subPriceString);
      const formattedSubComTotal = formatPrice(bundleSubComTotalValue, basePriceString);

      priceAtc.textContent = formattedSubTotal;
      comparePriceAtc.textContent = formattedSubComTotal;

    } else {
      const bundleEachValue = baseValue;
      const bundleTotalValue = bundleEachValue * qty;
      const bundleComTotalValue = bundleEachValue * qty / discountMultiplier;

      const formattedBundle = formatPrice(bundleTotalValue, subPriceString);
      const formattedCom = formatPrice(bundleComTotalValue, basePriceString);

      priceAtc.textContent = formattedBundle;
      comparePriceAtc.textContent = formattedCom;
    }
  }


  /* ---------------------------------------------------------
    SUBSCRIPTION LOGIC (NEW)
    ONLY controls show/hide
  --------------------------------------------------------- */
  function attachSubscriptionListener() {
    if (!subscriptionCheckBox) return;

    subscriptionCheckBox.addEventListener("change", () => {
      updateGifts();
      manipulatePrice();
    });
  }

  /* ---------------------------------------------------------
      GIFT LOGIC (UPDATED)
      Unlock depends on bundle only
      Auto-select unlocked gifts if subscribed
  --------------------------------------------------------- */
  function updateGifts() {
    if (!giftSection) return;

    /* Subscription toggles ONLY visibility */
    giftSection.style.display = subscriptionCheckBox.checked ? "block" : "none";

    const giftItems = giftSection.querySelectorAll("[data-gift-item]");

    /* Unlock logic based solely on bundle qty */
    const unlockCount =
      bundleQuantity === 1 ? 2 :
      bundleQuantity === 2 ? 3 :
      giftItems.length;

    giftItems.forEach((item, index) => {
      const unlocked = index < unlockCount;

      /* Auto-select only unlocked gifts when subscribed */
      item.dataset.unlocked = unlocked ? "true" : "false";
    });

    if (subscriptionCheckBox.checked) {
      sellingPlanInput.value = subscriptionCheckBox.dataset.sellingPlanId;
    } else {
      sellingPlanInput.removeAttribute('value');
    }
  }

  /* ---------------------------------------------------------
      MAIN ATC LOGIC (NEW)
  --------------------------------------------------------- */
  function attachATCListener() {
    if (!mainATC) return;

    mainATC.addEventListener("click", (e) => {
      e.preventDefault();

      const loaderOverlay = mainATC.querySelector(".loading-overlay");
      loaderOverlay.classList.remove("loader-hidden");

      const formData = new FormData();
      let i = 0;

      /* -----------------------------------------------------
        STEP 1:
        Determine the first selected flavor (variant)
        and exclude it from the FormData list.
      ------------------------------------------------------*/

      const selectedFlavors = [...flavorWrappers].filter(wrapper => {
        const qty = Number(wrapper.querySelector("[data-variant-qty]").value);
        return qty > 0;
      });

      
      // First selected flavor (needed later)
      const firstSelected = selectedFlavors[0] || null;

      // All other flavors (starting from index 1)
      const remainingFlavors = selectedFlavors.slice(1);


      /* -----------------------------------------------------
        STEP 2:
        Add ONLY the remaining flavors to formData
        (your original logic kept)
      ------------------------------------------------------*/
      remainingFlavors.forEach(wrapper => {
        const qty = Number(wrapper.querySelector("[data-variant-qty]").value);

        if (qty > 0) {
          formData.append(`items[${i}][id]`, wrapper.dataset.variantId);
          formData.append(`items[${i}][quantity]`, qty);

          if (subscriptionCheckBox.checked) {
            formData.append(`items[${i}][selling_plan]`, subscriptionCheckBox.dataset.sellingPlanId);
          }

          i++;
        }
      });


      /* -----------------------------------------------------
        STEP 3:
        Add gifts if subscription is checked
      ------------------------------------------------------*/
      if (subscriptionCheckBox.checked) {
        const unlockedGifts = giftSection.querySelectorAll("[data-gift-item][data-unlocked='true']");

        unlockedGifts.forEach(gift => {
          formData.append(`items[${i}][id]`, gift.dataset.giftVariantId);
          formData.append(`items[${i}][quantity]`, 1);
          // formData.append(`items[${i}][selling_plan]`, gift.dataset.giftSellingId);
          i++;
        });
      }

      /* AJAX call */
      fetch("/cart/add.js", {
        method: "POST",
        body: formData,
      })
      .then(res => res.json())
      .then(data => {
        // console.log(data);
      })
      .catch(err => console.error(err))
      .finally(()=> {
        if (firstSelected) {
          const firstFlavorId = firstSelected.dataset.variantId;
          const firstFlavorQty = Number(firstSelected.querySelector("[data-variant-qty]").value);

          mainIdInput.value = firstFlavorId;
          quantityInput.value = firstFlavorQty;
          pfATCBtn.click();
        }
        setTimeout(() => {
          loaderOverlay.classList.add("loader-hidden");
        }, 1000);
      })
    });
  }

  /* ---------------------------------------------------------
      RESET
  --------------------------------------------------------- */

  function resetAllVariants() {
    totalSelectedQty = 0;

    document.querySelectorAll("[data-variant-qty]").forEach(input => {
      input.value = 0;
    });

    document.querySelectorAll("[data-variant-add]").forEach(btn => {
      btn.style.display = "block";
    });

    document.querySelectorAll(".qty-picker").forEach(picker => {
      picker.style.display = "none";
    });
  }

});