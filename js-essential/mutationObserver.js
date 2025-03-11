/* 
  #Problem:
  Dynamic DOM updates in web applications often lead to the loss of event listeners on certain elements. This issue occurs because when parts of the DOM are regenerated (e.g., via AJAX or client-side rendering), the original elements are replaced with new ones, and previously attached event listeners are removed.

  For example, if an interactive button is re-rendered as part of a dynamic cart drawer update, any event listeners attached to it before the DOM update will no longer work.

  #Solution:
  To address this issue, a MutationObserver was implemented. The MutationObserver monitors the parent container of the dynamically updated elements and reattaches the necessary event listeners whenever changes are detected in the DOM.

  By using this approach:
  - Event listeners are dynamically rebound to the regenerated DOM elements.
  - The solution works universally for any dynamic content updates in a specific container.
*/ 

document.addEventListener("DOMContentLoaded", () => {
  const parentContainer = document.getElementById("dynamicContainer"); // Replace with your dynamic element's parent ID, if the content of cart drawer is dynamic then it will be the wrapper element of cart drawer

  // Function to bind event listeners
  function bindEventListeners() {
    const targetElements = parentContainer.querySelectorAll(".dynamicElement"); // Replace with your target elements' class
    targetElements.forEach((element) => {
      element.addEventListener("click", () => {
        console.log("Dynamic Element Clicked");
      });
    });
  }

  // Initial binding
  bindEventListeners();

  // Observe changes in the parent container's DOM
  const observer = new MutationObserver(() => {
    bindEventListeners(); // Rebind when changes are detected
  });

  observer.observe(parentContainer, { childList: true, subtree: true });
});

